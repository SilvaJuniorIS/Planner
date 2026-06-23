# Checklist De Implantacao Piloto

## Antes Da Implantacao

- [ ] Definir maquina servidor.
- [ ] Confirmar IP da maquina servidor.
- [ ] Instalar Python.
- [ ] Instalar dependencias com `scripts\install_rede.bat`.
- [ ] Liberar portas `8123` e `8000` no Firewall.
- [ ] Criar backup da base atual.
- [ ] Conferir usuarios iniciais.
- [ ] Definir quem sera administrador.

## Subir Sistema

- [ ] Executar `scripts\start_rede.ps1`.
- [ ] Abrir `http://localhost:8000/health`.
- [ ] Abrir `http://localhost:8123`.
- [ ] Testar acesso por outro computador da rede.
- [ ] Entrar como administrador.
- [ ] Entrar como operador.
- [ ] Entrar como visitante/consulta, se houver.

## Validar Funcionalidades

- [ ] Cadastrar processo.
- [ ] Editar processo.
- [ ] Movimentar processo.
- [ ] Conferir historico do processo.
- [ ] Gerar cota.
- [ ] Exportar PDF/DOCX.
- [ ] Conferir relatorio executivo.
- [ ] Exportar CSV.
- [ ] Criar backup com `scripts\backup_dados.bat`.

## Plano De Contingencia

- [ ] Localizar backups em `data\backups`.
- [ ] Confirmar existencia do script `scripts\restaurar_backup.bat`.
- [ ] Saber parar e reiniciar a API.
- [ ] Registrar responsavel por suporte no piloto.

## Apos A Primeira Semana

- [ ] Revisar dificuldades dos usuarios.
- [ ] Ajustar nomes de status, se necessario.
- [ ] Revisar modelos de cotas.
- [ ] Confirmar se senha obrigatoria deve ser ativada.
- [ ] Listar melhorias para V2.
