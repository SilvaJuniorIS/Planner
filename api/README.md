# AtlasFlow API

API FastAPI para a V2 do AtlasFlow, com separacao de processos por usuario e persistencia em SQLite.

## Rodar localmente

```bash
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

Depois acesse:

```text
http://localhost:8000/docs
```

## Endpoints principais

- `GET /health`
- `GET /api/users`
- `POST /api/users`
- `POST /api/auth/login`
- `GET /api/users/{user_id}/processes`
- `POST /api/users/{user_id}/processes`
- `GET /api/processes/{process_id}`
- `PUT /api/processes/{process_id}`
- `DELETE /api/processes/{process_id}`
- `POST /api/processes/{process_id}/movements`
- `GET /api/users/{user_id}/history`

## Modelo de separacao por usuario

Cada processo possui `user_id`. As consultas por usuario retornam somente processos e historico vinculados a esse usuario.

Nesta fase ainda nao existe autenticacao real. A separacao e operacional e prepara o caminho para login, permissoes e multi-prefeitura.

## Senhas

O cadastro de usuario ja aceita o campo `password`. Quando informado, a API salva `password_hash` e `password_salt`, sem expor esses campos nas respostas.

O endpoint `POST /api/auth/login` valida a senha e retorna um token simples para preparar a futura camada de autenticacao. A protecao completa por token ainda sera implementada nas proximas fases.
