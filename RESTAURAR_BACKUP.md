# Restaurar Backup Do AtlasFlow

Use este procedimento somente quando precisar voltar a base para um ponto anterior.

## Antes De Restaurar

1. Avise os usuarios para sairem do sistema.
2. Pare a API do ambiente que sera restaurado.
3. Confirme se esta no ambiente certo:
   - Producao: `C:\Planner`
   - Homologacao: `C:\Planner_Homolog`

## Restaurar Producao

Na pasta `C:\Planner`:

```bat
scripts\restaurar_backup.bat
```

O script lista os backups em:

```text
C:\Planner\data\backups
```

Antes de substituir o banco, ele cria uma copia automatica do banco atual com o prefixo `pre_restore`.

## Restaurar Homologacao

Na pasta `C:\Planner_Homolog`:

```bat
scripts\restaurar_backup.bat homolog
```

O script lista os backups em:

```text
C:\Planner_Homolog\data\backups
```

## Depois De Restaurar

1. Reinicie a API.
2. Abra o sistema.
3. Clique em `Atualizar`.
4. Se necessario, use `Ctrl+F5` no navegador.
5. Confira usuarios, processos e historico.

## Regra De Ouro

Nunca apague a pasta `data`. Atualizacoes de sistema devem trocar arquivos de codigo, mas preservar o banco.
