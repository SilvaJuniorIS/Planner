# Pacote Piloto AtlasFlow

## Objetivo

Implantar o AtlasFlow em uso controlado para validar a rotina real de acompanhamento de processos administrativos.

## Escopo Do Piloto

- Controle de processos por usuario.
- Kanban operacional.
- Historico por processo.
- Prazos, atrasados e urgentes.
- Relatorios gerenciais.
- Cotas e documentos padronizados.
- Backup e restore local.

## Ambientes

| Ambiente | URL padrao | API | Uso |
|---|---|---|---|
| Producao | `http://IP-DO-SERVIDOR:8123` | `http://IP-DO-SERVIDOR:8000` | Uso dos usuarios |
| Homologacao | `http://IP-DO-SERVIDOR:8124` | `http://IP-DO-SERVIDOR:8001` | Testes antes de publicar |

## Perfis

- Administrador: gerencia usuarios, senhas e visualiza consolidado.
- Operador: trabalha na propria mesa.
- Visitante / Consulta: visualiza sem alterar processos.

## Regra De Senhas

Nesta fase, senha obrigatoria geral ainda nao esta ativada. Usuarios sem senha definida entram com senha em branco. Depois que o administrador define uma senha, esse usuario deixa de entrar em branco.

## Rotina Do Piloto

1. Fazer backup no inicio do dia.
2. Registrar novas entradas.
3. Movimentar processos que mudaram de etapa.
4. Revisar atrasados e proximos vencimentos.
5. Gerar cotas quando houver devolucao, encaminhamento ou saneamento.
6. Exportar relatorio ao fim do dia, se necessario.

## Criterios De Sucesso

- Usuarios conseguem localizar processos rapidamente.
- Processos atrasados ficam visiveis.
- Historico mostra a vida do processo.
- Relatorios ajudam reunioes e cobrancas internas.
- Backup e restore dao seguranca para operacao.

## Fora Do Escopo Do Piloto

- Assinatura digital.
- Integracoes com sistemas externos.
- SaaS multi-prefeitura.
- IA documental em producao.
- Workflow juridico complexo.
