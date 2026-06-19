# AtlasFlow em Rede Local

Use este modo quando varios computadores da mesma rede precisarem acessar a mesma base.

## 1. Instalar dependencias

No computador principal:

```powershell
.\scripts\install_rede.bat
```

## 2. Iniciar em modo rede

Execute:

```powershell
.\scripts\start_rede.ps1
```

O script abre:

- API em `http://IP-DA-MAQUINA:8000`
- Site em `http://IP-DA-MAQUINA:8123`

## 3. Acessar pelos outros computadores

Nos outros computadores da rede, abra no navegador:

```text
http://IP-DA-MAQUINA:8123
```

Exemplo:

```text
http://192.168.0.25:8123
```

## 4. Importante

Quando a API estiver online, o frontend usa a API automaticamente e todos acessam a mesma base SQLite.

Se a API nao estiver online, o frontend cai para o modo LocalStorage. Nesse modo, cada navegador tem sua propria base.

O banco de dados fica fora da pasta do codigo:

```text
data\atlasflow.sqlite3
```

Nao apague essa pasta. Atualizar arquivos do sistema nao deve substituir o banco.

## Backup dos dados

Para criar uma copia do banco:

```powershell
.\scripts\backup_dados.bat
```

Os backups ficam na pasta:

```text
backups
```

## 5. Firewall

Se os outros computadores nao conseguirem abrir, libere no Firewall do Windows:

- porta `8123` para o site;
- porta `8000` para a API.

## 6. Teste rapido

No computador principal, abra:

```text
http://localhost:8000/docs
```

Depois, em outro computador, abra:

```text
http://IP-DA-MAQUINA:8000/docs
```

Se a documentacao da API abrir, a rede esta enxergando o backend.
