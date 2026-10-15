# svg-studio

Editor local para colar/importar um SVG, comparar antes e depois, ver o tamanho e exportar o resultado. Não envia o arquivo para um servidor.

## Executar

Requer Node.js 20.19 ou superior. Rode **npm install** e **npm run dev**. Cole ou importe o arquivo, selecione **Otimizar SVG** e exporte o resultado. **npm test** cobre compactação, segurança e validação; **npm run build** gera dist/.

O otimizador remove comentários e grupos vazios, compacta espaços entre tags e remove scripts, eventos, embeds e referências externas. Revise o desenho após exportar, pois SVGs com links externos são simplificados intencionalmente.
