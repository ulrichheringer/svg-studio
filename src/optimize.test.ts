import { describe, expect, it } from "vitest";
import { optimizeSvg, safeSvgForPreview } from "./optimize";

describe("SVG optimizer", () => {
  it("removes comments and redundant spacing while preserving SVG markup", () => {
    const result = optimizeSvg('<svg xmlns="http://www.w3.org/2000/svg"> <!-- note --> <path d="M0 0"/> </svg>');
    expect(result.svg).not.toContain("note");
    expect(result.svg).toContain("<path");
    expect(result.optimizedBytes).toBeLessThan(result.originalBytes);
  });

  it("strips scripts, event handlers, and external resource links", () => {
    const result = optimizeSvg('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><image href="https://example.org/a.png" onerror="x"/><use href="#local"/></svg>');
    expect(result.svg).not.toContain("<script");
    expect(result.svg).not.toContain("onload");
    expect(result.svg).not.toContain("https://");
    expect(result.svg).toContain('href="#local"');
    expect(result.removedElements).toBe(1);
    expect(result.removedAttributes).toBeGreaterThanOrEqual(3);
  });

  it("rejects non-SVG and DOCTYPE input before previewing", () => {
    expect(() => safeSvgForPreview("<html/>")).toThrow("SVG válido");
    expect(() => optimizeSvg('<!DOCTYPE svg [<!ENTITY x "y">]><svg/>')).toThrow("DOCTYPE");
  });
});

