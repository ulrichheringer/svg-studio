import { useMemo, useState } from "react";
import { optimizeSvg, safeSvgForPreview, svgDataUrl, type OptimizedSvg } from "./optimize";

const example = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">',
  '  <!-- brand mark -->',
  '  <g fill="#4d7041">',
  '    <circle cx="38" cy="40" r="26" />',
  '    <path d="M73 20h30v10H83v10h17v9H83v11h21v10H73z" />',
  '  </g>',
  '</svg>',
].join("\n");

function bytes(value: number) {
  return value < 1024 ? value + " B" : (value / 1024).toFixed(2) + " KB";
}

export default function App() {
  const [source, setSource] = useState(example);
  const [result, setResult] = useState<OptimizedSvg | null>(null);
  const [error, setError] = useState("");

  const beforePreview = useMemo(() => {
    try { return svgDataUrl(safeSvgForPreview(source)); } catch { return ""; }
  }, [source]);

  function runOptimization() {
    try {
      const optimized = optimizeSvg(source);
      setResult(optimized);
      setError("");
    } catch (reason) {
      setResult(null);
      setError(reason instanceof Error ? reason.message : "SVG inválido.");
    }
  }

  async function load(file?: File) {
    if (!file) return;
    setSource(await file.text());
    setResult(null);
    setError("");
  }

  function exportSvg() {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "optimized.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const savings = result && result.originalBytes
    ? Math.max(0, Math.round((1 - result.optimizedBytes / result.originalBytes) * 100))
    : 0;

  return <main className="app">
    <header className="nav"><a className="brand" href="./"><span className="brand-mark">S</span> svg-studio</a><span>SVG local · otimização com segurança</span></header>
    <section className="hero"><p className="eyebrow">VETOR EM FOCO <span>·</span> EDITOR SVG</p><h1>Menos ruído.<br /><em>Mesmo desenho.</em></h1><p>Cole ou importe um SVG, veja o que mudou e exporte o arquivo otimizado.</p></section>
    <div className="workspace">
      <section className="editor panel"><div className="panel-head"><div><span className="step">01</span><strong>Markup SVG</strong></div><label className="import-button">Importar<input type="file" accept=".svg,image/svg+xml" onChange={(event) => void load(event.target.files?.[0])} /></label></div>
        <textarea aria-label="Código SVG" spellCheck={false} value={source} onChange={(event) => { setSource(event.target.value); setResult(null); setError(""); }} />
        <div className="editor-foot"><span>{bytes(new TextEncoder().encode(source).byteLength)} · sem upload</span><button className="optimize" onClick={runOptimization}>Otimizar SVG <span aria-hidden="true">→</span></button></div>
        {error && <p className="error" role="alert">{error}</p>}
      </section>
      <section className="results">
        <div className="panel preview-card"><div className="panel-head"><div><span className="step">02</span><strong>Comparação visual</strong></div><span className="preview-state">{result ? "Atualizada" : "Aguardando otimização"}</span></div>
          <div className="preview-grid">
            <div><div className="preview-head"><span>ORIGINAL</span><small>{bytes(new TextEncoder().encode(source).byteLength)}</small></div><div className="canvas">{beforePreview ? <img src={beforePreview} alt="Pré-visualização original do SVG" /> : <span className="placeholder">SVG inválido</span>}</div></div>
            <div><div className="preview-head"><span>OTIMIZADO</span><small>{result ? bytes(result.optimizedBytes) : "—"}</small></div><div className="canvas">{result ? <img src={svgDataUrl(result.svg)} alt="Pré-visualização do SVG otimizado" /> : <span className="placeholder">Execute a otimização</span>}</div></div>
          </div>
          {result ? <div className="metrics"><div><strong>{savings}%</strong><span>redução</span></div><div><strong>{bytes(result.originalBytes)} → {bytes(result.optimizedBytes)}</strong><span>tamanho do arquivo</span></div><div><strong>{result.removedElements + result.removedAttributes}</strong><span>itens inseguros removidos</span></div><button onClick={exportSvg}>Exportar .svg ↓</button></div> :
            <div className="result-empty">A otimização remove comentários e grupos vazios, compacta espaços e descarta conteúdo ativo ou referências externas.</div>}
        </div>
      </section>
    </div>
    <footer>O SVG é processado localmente no navegador. Conteúdo ativo e referências externas são removidos do resultado.</footer>
  </main>;
}

