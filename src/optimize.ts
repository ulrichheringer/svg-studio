export interface OptimizedSvg {
  svg: string;
  originalBytes: number;
  optimizedBytes: number;
  removedElements: number;
  removedAttributes: number;
}

const blockedElements = new Set(["script", "foreignobject", "iframe", "object", "embed"]);

function validateDocument(source: string, parser: DOMParser): Document {
  if (/<!DOCTYPE/i.test(source)) throw new Error("Remova o DOCTYPE antes de otimizar o SVG.");
  const document = parser.parseFromString(source, "image/svg+xml");
  if (document.documentElement.localName.toLowerCase() === "parsererror" ||
      document.querySelector("parsererror") || document.documentElement.localName.toLowerCase() !== "svg") {
    throw new Error("O arquivo precisa conter um SVG válido.");
  }
  return document;
}

function sanitize(document: Document): { removedElements: number; removedAttributes: number } {
  let removedElements = 0;
  let removedAttributes = 0;
  const elements = Array.from(document.querySelectorAll("*"));
  for (const element of elements) {
    if (!element.isConnected) continue;
    if (blockedElements.has(element.localName.toLowerCase())) {
      element.remove();
      removedElements += 1;
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      const unsafeEvent = name.startsWith("on");
      const unsafeHref = (name === "href" || name === "xlink:href") && value !== "" && !value.startsWith("#");
      const unsafeStyle = (name === "style" || name === "fill" || name === "stroke" || name === "filter") &&
        /url\(\s*(['"]?)(?!#)[^)]*\1\s*\)/i.test(value);
      if (unsafeEvent || unsafeHref || unsafeStyle) {
        element.removeAttribute(attribute.name);
        removedAttributes += 1;
      }
    }
    if (element.localName.toLowerCase() === "style" &&
        /@import|url\(\s*(['"]?)(?!#)/i.test(element.textContent ?? "")) {
      element.remove();
      removedElements += 1;
    }
  }
  return { removedElements, removedAttributes };
}

function removeCommentsAndEmptyGroups(document: Document) {
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((node) => node.parentNode?.removeChild(node));
  const whitespace = document.createTreeWalker(document, NodeFilter.SHOW_TEXT);
  const blankNodes: Node[] = [];
  while (whitespace.nextNode()) {
    const node = whitespace.currentNode;
    const parent = node.parentElement;
    const preservesTextSpacing = parent?.closest("text, tspan, textPath, title, desc, style, script, textarea") ||
      parent?.getAttribute("xml:space") === "preserve" ||
      Boolean(parent?.closest('[xml\\:space="preserve"]'));
    if (!node.textContent?.trim() && !preservesTextSpacing) blankNodes.push(node);
  }
  blankNodes.forEach((node) => node.parentNode?.removeChild(node));
  const groups = Array.from(document.querySelectorAll("g")).reverse();
  groups.forEach((group) => {
    if (group.childNodes.length === 0) group.remove();
  });
}

export function safeSvgForPreview(source: string, parser = new DOMParser()): string {
  const document = validateDocument(source, parser);
  sanitize(document);
  if (!document.documentElement.hasAttribute("xmlns")) {
    document.documentElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  return new XMLSerializer().serializeToString(document);
}

export function optimizeSvg(source: string, parser = new DOMParser()): OptimizedSvg {
  const document = validateDocument(source, parser);
  const removed = sanitize(document);
  if (!document.documentElement.hasAttribute("xmlns")) {
    document.documentElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  removeCommentsAndEmptyGroups(document);
  const optimized = new XMLSerializer().serializeToString(document)
    .replace(/^\s*<\?xml[^?]*\?>\s*/i, "")
    .trim();
  const originalBytes = new TextEncoder().encode(source).byteLength;
  const optimizedBytes = new TextEncoder().encode(optimized).byteLength;
  return { svg: optimized, originalBytes, optimizedBytes, ...removed };
}

export function svgDataUrl(source: string): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
}

