# AtlasFlow

MVP para gestao visual da vida dos processos administrativos. O projeto nasceu como Process Planner, mas passa a usar o nome **AtlasFlow**, mais adequado para um produto SaaS de fluxo operacional, rastreabilidade e gestao administrativa.

## Recursos atuais

- Cadastro, edicao e exclusao de processos.
- Usuarios locais, com processos separados por usuario.
- Kanban por etapa: Entrada, Analisar, Criar documentos, Revisar, Devolver e Concluir.
- Controle de prazo, prioridade, secretaria, responsavel, destino e documentos.
- Historico de movimentacoes por usuario.
- Filtros por texto, status, prioridade e documento.
- Indicadores de processos na mesa, atrasados, urgentes e concluidos.
- Importacao e exportacao de backup em JSON.
- Manual ilustrado em HTML.
- API FastAPI com SQLite para evolucao web.

## Como usar o MVP local

Abra `index.html` no navegador.

Os dados ficam salvos apenas no navegador usado. Para backup ou migracao, use **Exportar JSON** e depois **Importar JSON**.

## Usuarios

O MVP local possui um seletor de usuario no topo da tela. Cada processo cadastrado fica vinculado ao usuario ativo.

Use **Novo usuario** para criar uma nova mesa, pessoa ou setor. Ao alternar o usuario ativo, o kanban, os indicadores, a lista e o historico passam a exibir somente os processos daquele usuario.

## API

A API fica na pasta `api`.

Para rodar:

```bash
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

Documentacao interativa:

```text
http://localhost:8000/docs
```

## Estrutura

- `index.html`: interface local.
- `styles.css`: estilos do app local.
- `app.js`: regras da aplicacao local, usuarios, persistencia e renderizacao.
- `manual.html`: manual ilustrado.
- `manual.css`: estilos do manual.
- `MANUAL_USUARIO.md`: manual em Markdown.
- `api/main.py`: API FastAPI.
- `api/README.md`: instrucoes da API.
- `requirements.txt`: dependencias da API.
- `INSTRUCOES_CODEX.md`: contexto do produto e proximos passos.

## Publicacao no GitHub Pages

1. Envie estes arquivos para a raiz de um repositorio.
2. Ative o GitHub Pages em `Settings > Pages`.
3. Selecione a branch principal e a pasta raiz.

## Proximos passos sugeridos

- Integrar o frontend local com a API.
- Adicionar login real.
- Criar permissoes por perfil.
- Criar multi-secretaria e multi-prefeitura.
- Adicionar exportacao CSV.
- Adicionar painel dedicado de prazos.
- Evoluir para React/Next.js, FastAPI, PostgreSQL e Supabase.
