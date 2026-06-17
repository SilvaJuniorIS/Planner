# Process Planner

MVP local para gestao visual da vida dos processos administrativos. A aplicacao roda direto no navegador, salva os dados em `LocalStorage` e pode ser publicada no GitHub Pages.

## Recursos da V1

- Cadastro, edicao e exclusao de processos.
- Kanban por etapa: Entrada, Analisar, Criar documentos, Revisar, Devolver e Concluir.
- Controle de prazo, prioridade, secretaria, responsavel, destino e documentos.
- Historico de movimentacoes com data, status, destino, finalidade e observacao.
- Filtros por texto, status, prioridade e documento.
- Indicadores de processos na mesa, atrasados, urgentes e concluidos.
- Importacao e exportacao de backup em JSON.

## Como usar

Abra `index.html` no navegador.

Os dados ficam salvos apenas no navegador usado. Para backup ou migracao, use **Exportar JSON** e depois **Importar JSON**.

## Estrutura

- `index.html`: estrutura da interface.
- `styles.css`: estilos responsivos.
- `app.js`: regras da aplicacao, persistencia e renderizacao.
- `INSTRUCOES_CODEX.md`: contexto do produto e proximos passos.

## Publicacao no GitHub Pages

1. Envie estes arquivos para a raiz de um repositorio.
2. Ative o GitHub Pages em `Settings > Pages`.
3. Selecione a branch principal e a pasta raiz.

## Proximos passos sugeridos

- Adicionar exportacao CSV.
- Adicionar impressao de relatorio.
- Criar modo PWA offline.
- Adicionar painel dedicado de prazos.
- Evoluir para React/Next.js, FastAPI, PostgreSQL e Supabase na V2.
