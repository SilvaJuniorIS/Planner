# Transferir Projetos AtlasNex Para O Notebook

Este guia copia os projetos principais do computador atual para uma pasta de destino, como pendrive, HD externo ou compartilhamento de rede.

## Projetos incluidos

- `C:\Planner`
- `C:\Projeto_Hermes_Premium`
- `C:\Projeto_Icaro`
- `C:\ProjetoArgos`
- `C:\FiscalBot`

## Como exportar

No PowerShell ou Prompt, dentro da pasta do Planner:

```bat
scripts\exportar_projetos_atlasnex.bat E:\AtlasNex_Backup
```

Troque `E:\AtlasNex_Backup` pela letra do pendrive, HD externo ou pasta de rede.

Exemplo com pasta de rede:

```bat
scripts\exportar_projetos_atlasnex.bat \\NOME-DO-NOTEBOOK\Compartilhado\AtlasNex_Backup
```

## O que o script copia

Ele copia código, documentos, bancos locais, arquivos de configuração e materiais comerciais.

Ele não copia pastas pesadas que devem ser recriadas no notebook:

- `.git`
- `venv`, `.venv`, `__venv`
- `node_modules`
- caches de Python/testes

## Depois no notebook

1. Copie a pasta exportada para `C:\`.
2. Instale Python, Node.js, Git e Docker Desktop.
3. Em cada projeto, siga o `README.md`.
4. Recrie os ambientes virtuais Python.
5. Reinstale dependências frontend com `npm install` quando houver frontend.
6. Confira os arquivos `.env` antes de iniciar APIs ou Docker.

## Observacao importante

Para manter historico Git completo no notebook, o melhor caminho e tambem subir cada projeto para GitHub. A copia por script e ideal para levar o estado local completo, incluindo bancos e documentos.
