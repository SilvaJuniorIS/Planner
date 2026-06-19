# AtlasFlow - Timeline para MVP Comercial

## Ambiente

- Producao: `C:\Planner`
- Homologacao: `C:\Planner_Homolog`
- Banco de producao: `C:\Planner\data\atlasflow.sqlite3`
- Banco de homologacao: `C:\Planner_Homolog\data\atlasflow_homolog.sqlite3`

## Ciclo de trabalho seguro

1. Criar ou atualizar homologacao com `scripts\criar_homologacao.bat`.
2. Desenvolver e testar somente em `C:\Planner_Homolog`.
3. Validar com dados copiados da producao.
4. Fazer backup de producao.
5. Publicar com `scripts\deploy_producao.bat`.
6. Reiniciar API/site de producao.
7. Orientar usuarios a recarregar a pagina.

## Fase 1 - Produto vendavel local/rede

- Login real.
- Permissoes por perfil.
- Transferencia de processos entre usuarios.
- Painel de prazos.
- Relatorios basicos.
- Modelos de cotas/documentos.
- Backup e restauracao guiados.

## Fase 2 - Produto web

- Frontend em React/Next.js.
- API FastAPI estabilizada.
- PostgreSQL.
- Autenticacao por token.
- Deploy externo.

## Fase 3 - SaaS

- Multi-prefeitura.
- Multi-secretaria.
- Planos comerciais.
- Auditoria avancada.
- Relatorios gerenciais.
- IA documental.
