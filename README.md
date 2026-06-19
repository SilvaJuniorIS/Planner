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

## Uso em rede local

Para varios computadores usarem a mesma base, rode o site e a API no computador principal:

```powershell
.\scripts\install_rede.bat
.\scripts\start_rede.ps1
```

Depois acesse nos demais computadores:

```text
http://IP-DA-MAQUINA:8123
```

Quando a API estiver online, o frontend usa `http://IP-DA-MAQUINA:8000` automaticamente. Se a API nao responder, o sistema volta ao modo LocalStorage.

O banco compartilhado fica em `data/atlasflow.sqlite3`, fora da pasta `api`, para nao ser sobrescrito durante ajustes no codigo.

Ao usar **Importar JSON** com a API online, a importacao e gravada no banco compartilhado do servidor.

Mais detalhes em `scripts/README_REDE.md`.

## Homologacao

Use a homologacao para testar novas funcionalidades sem afetar os usuarios da producao.

Criar ou atualizar ambiente:

```bat
scripts\criar_homologacao.bat
```

Iniciar homologacao:

```powershell
C:\Planner_Homolog\scripts\start_homolog.ps1
```

Enderecos:

```text
Site: http://IP-DA-MAQUINA:8124
API:  http://IP-DA-MAQUINA:8001/docs
Banco: C:\Planner_Homolog\data\atlasflow_homolog.sqlite3
```

Publicar homologacao em producao, preservando o banco real:

```bat
C:\Planner_Homolog\scripts\deploy_producao.bat
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
- `scripts/start_rede.ps1`: inicializacao do site e da API em rede local.
- `scripts/install_rede.bat`: instalador das dependencias no Windows.
- `scripts/backup_dados.bat`: backup manual do banco SQLite.
- `scripts/README_REDE.md`: guia de uso em rede.
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
