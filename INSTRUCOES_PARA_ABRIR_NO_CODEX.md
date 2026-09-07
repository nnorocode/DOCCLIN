# Gest V2 - pacote para Codex

Esta pasta contem os arquivos necessarios para outra pessoa abrir o projeto no Codex e continuar as alteracoes.

## Como abrir

1. Descompacte a pasta em um local do computador.
2. Abra o Codex nessa pasta.
3. No terminal, rode:

```bash
npm install
npm run dev
```

## Validacao

Antes de enviar novas alteracoes, rode:

```bash
npm run build
```

## Observacao

Este pacote nao inclui `node_modules`, builds gerados, cache local, `.git` ou arquivos temporarios. Eles podem ser recriados com `npm install` e `npm run build`.
