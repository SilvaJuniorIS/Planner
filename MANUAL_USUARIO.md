# Manual do Usuario - Process Planner

## 1. Apresentacao

O Process Planner e uma aplicacao local para controlar a vida dos processos administrativos que chegam a uma mesa, setor ou equipe.

Ele foi pensado para ajudar setores de compras, licitacoes, patrimonio, juridico administrativo, controladoria, gabinete e secretarias a responder rapidamente:

- onde esta o processo;
- com quem esta;
- por que esta ali;
- qual o proximo passo;
- quais documentos estao envolvidos;
- qual o prazo;
- se esta atrasado;
- quando saiu;
- para onde saiu;
- qual historico de movimentacoes existe.

A versao atual funciona diretamente no navegador, sem servidor e sem banco de dados externo. Os dados ficam salvos no proprio navegador por meio de LocalStorage.

## 2. Como Abrir o Sistema

### Uso local

1. Abra a pasta do projeto.
2. Clique duas vezes no arquivo `index.html`.
3. O sistema sera aberto no navegador padrao.

### Uso por servidor local

Se preferir abrir por um endereco local, execute um servidor simples na pasta do projeto e acesse pelo navegador.

Exemplo:

```bash
python -m http.server 8123
```

Depois acesse:

```text
http://localhost:8123
```

### GitHub Pages

O sistema tambem pode ser publicado no GitHub Pages. Nesse caso, qualquer pessoa com acesso ao link podera abrir a pagina. Os dados continuarao salvos no navegador de cada usuario.

## 3. Tela Inicial

A tela inicial possui quatro areas principais:

1. Cabecalho com acoes principais.
2. Indicadores da operacao.
3. Kanban operacional.
4. Lista de processos e historico.

## 4. Acoes do Cabecalho

### Novo processo

Abre o formulario completo para cadastrar um novo processo.

Use essa opcao quando quiser preencher todos os dados de identificacao, controle, prazo, documentos e observacoes.

### Exportar JSON

Gera um arquivo de backup com todos os processos cadastrados.

Use essa opcao para:

- fazer backup;
- transferir dados para outro computador;
- guardar uma copia antes de grandes alteracoes;
- enviar a base para outra pessoa analisar.

### Importar JSON

Permite carregar um arquivo exportado anteriormente.

A importacao substitui a base atual do navegador pelo conteudo do arquivo importado.

Antes de importar uma base, recomenda-se exportar a base atual como backup.

## 5. Indicadores

Na parte superior da tela aparecem os principais indicadores.

### Na mesa

Mostra a quantidade de processos que ainda nao foram concluidos.

### Atrasados

Mostra quantos processos possuem prazo vencido e ainda nao foram concluidos.

### Urgentes

Mostra quantos processos estao marcados como prioridade urgente.

### Concluidos

Mostra quantos processos ja foram finalizados ou enviados para fora da mesa.

## 6. Filtros

Os filtros ajudam a localizar rapidamente processos especificos.

### Busca

Permite buscar por:

- numero do processo;
- ano;
- objeto;
- secretaria;
- responsavel;
- origem;
- destino;
- observacoes.

### Status

Filtra os processos pela etapa atual:

- Entrada;
- Analisar;
- Criar documentos;
- Revisar;
- Devolver;
- Concluir.

### Prioridade

Filtra por:

- Normal;
- Urgente.

### Documento

Filtra processos que possuem determinado documento relacionado:

- DFD;
- ETP;
- TR;
- Edital;
- Anexos;
- Pesquisa de mercado.

### Limpar

Remove todos os filtros e volta a exibir todos os processos.

## 7. Kanban Operacional

O kanban mostra os processos separados por etapa.

As colunas disponiveis sao:

### Entrada

Processos recem-chegados, ainda em triagem inicial.

### Analisar

Processos aguardando leitura, conferencia, saneamento ou decisao.

### Criar documentos

Processos que exigem producao documental, como:

- DFD;
- ETP;
- TR;
- Edital;
- anexos;
- pesquisa de mercado;
- justificativas;
- revisoes de minuta.

### Revisar

Processos que precisam de nova conferencia antes de seguir.

### Devolver

Processos que precisam retornar para outro setor, geralmente para correcao, complementacao ou esclarecimento.

### Concluir

Processos finalizados ou encaminhados para a proxima etapa fora da mesa atual.

## 8. Cadastro Rapido

O painel de entrada rapida permite registrar um processo com poucos dados.

Campos disponiveis:

- Numero;
- Objeto;
- Secretaria;
- Prazo;
- Prioridade.

Use o cadastro rapido quando o processo chegou agora e voce ainda nao tem tempo de preencher todos os detalhes.

Depois, clique em **Editar** no processo para completar o cadastro.

## 9. Cadastro Completo de Processo

Para cadastrar um processo completo, clique em **Novo processo**.

### Campos de identificacao

#### Numero

Informe o numero do processo.

Exemplo:

```text
707/2026
```

#### Ano

Informe o ano do processo.

Exemplo:

```text
2026
```

#### Objeto

Descreva o assunto principal do processo.

Exemplo:

```text
Contratacao de sistema SaaS para gestao de processos administrativos.
```

#### Secretaria

Informe a secretaria ou setor relacionado.

Exemplo:

```text
Secretaria Municipal de Administracao
```

#### Responsavel

Informe quem esta responsavel pelo processo naquele momento.

Exemplo:

```text
Setor de Compras
```

### Campos de controle

#### Data de chegada

Data em que o processo chegou a sua mesa ou setor.

#### Origem

Setor de onde o processo veio.

Exemplos:

- Gabinete;
- Secretaria requisitante;
- Juridico;
- Patrimonio;
- Controladoria.

#### Finalidade

Motivo pelo qual o processo chegou.

Exemplos:

- Analisar;
- Criar TR;
- Criar ETP;
- Revisar edital;
- Complementar instrucao;
- Responder apontamento;
- Devolver para correcao.

#### Prazo

Prazo interno para tratar o processo.

Se a data passar e o processo nao estiver concluido, ele entrara no indicador de atrasados.

#### Status

Etapa atual do processo:

- Entrada;
- Analisar;
- Criar documentos;
- Revisar;
- Devolver;
- Concluir.

#### Prioridade

Classificacao operacional:

- Normal;
- Urgente.

### Campos de saida

#### Data de saida

Data em que o processo saiu da sua mesa ou setor.

#### Destino

Para onde o processo foi encaminhado.

Exemplos:

- Juridico;
- Secretaria requisitante;
- Comissao de Licitacao;
- Gabinete;
- Controladoria.

#### Finalidade da saida

Motivo do encaminhamento.

Exemplos:

- assinatura;
- parecer juridico;
- correcao;
- publicacao;
- complementacao;
- homologacao.

### Documentos

Marque os documentos envolvidos no processo:

- DFD;
- ETP;
- TR;
- Edital;
- Anexos;
- Pesquisa de mercado.

### Observacoes e pendencias

Use este campo para registrar informacoes importantes, como:

- documentos faltantes;
- ajustes necessarios;
- duvidas;
- apontamentos;
- pendencias do setor requisitante;
- risco de atraso;
- observacoes sobre pesquisa de mercado;
- observacoes sobre TR, ETP ou edital.

## 10. Lista de Processos

A lista mostra todos os processos que correspondem aos filtros atuais.

Cada processo exibe:

- numero;
- objeto;
- observacoes;
- status;
- prioridade;
- prazo;
- secretaria;
- documentos envolvidos.

Em cada item da lista existem tres acoes:

### Movimentar

Registra uma nova movimentacao no historico e altera o status do processo.

### Editar

Abre o cadastro completo para alterar dados do processo.

### Excluir

Remove o processo da base local.

A exclusao e definitiva no navegador atual. Antes de excluir muitos dados, faca uma exportacao JSON.

## 11. Movimentacao de Processo

Clique em **Movimentar** para registrar uma nova etapa.

Campos da movimentacao:

### Data

Data em que a movimentacao ocorreu.

### Novo status

Nova etapa do processo.

### Destino

Setor, pessoa ou unidade para onde o processo foi encaminhado.

### Finalidade

Motivo da movimentacao.

Exemplos:

- correcao;
- parecer;
- assinatura;
- revisao;
- publicacao;
- complementacao de documentos.

### Observacao

Detalhe livre sobre a movimentacao.

Exemplo:

```text
Processo devolvido para ajustar quantitativos do TR e anexar nova pesquisa de mercado.
```

Ao salvar a movimentacao, o sistema:

- altera o status do processo;
- adiciona um registro no historico;
- atualiza kanban, lista e indicadores;
- registra saida quando o status for Devolver ou Concluir.

## 12. Historico

Clique na aba **Historico** para ver todas as movimentacoes registradas.

Cada item do historico mostra:

- data;
- numero do processo;
- status;
- acao;
- objeto;
- destino;
- finalidade;
- observacao.

O historico serve para preservar a rastreabilidade operacional do processo.

## 13. Prazos e Atrasos

O sistema considera um processo atrasado quando:

- possui prazo preenchido;
- a data do prazo ja passou;
- o status ainda nao e Concluir.

Processos atrasados aparecem no indicador **Atrasados** e recebem marcacao visual na lista e no kanban.

Boas praticas:

- sempre preencher prazo quando houver SLA interno;
- revisar processos atrasados no inicio do expediente;
- movimentar o processo sempre que sair da mesa;
- concluir processos finalizados para limpar a fila operacional.

## 14. Backup dos Dados

Como os dados ficam no navegador, e importante fazer backup periodicamente.

### Como exportar

1. Clique em **Exportar JSON**.
2. O navegador baixara um arquivo `.json`.
3. Guarde esse arquivo em local seguro.

Sugestao de nome de pasta:

```text
Backups Process Planner
```

### Quando exportar

Recomenda-se exportar:

- ao fim do expediente;
- antes de importar outra base;
- antes de limpar ou excluir dados;
- antes de trocar de computador;
- antes de atualizar a versao do sistema.

## 15. Restauracao ou Importacao

Para restaurar uma base:

1. Clique em **Importar JSON**.
2. Escolha o arquivo exportado anteriormente.
3. Confirme que os processos apareceram na tela.

Atencao: a importacao substitui a base atual do navegador.

## 16. Uso em Equipe

Na V1, o Process Planner e local. Isso significa que:

- cada navegador possui sua propria base;
- nao ha sincronizacao automatica entre computadores;
- nao ha login;
- nao ha permissao por usuario;
- nao ha banco de dados central.

Para uso em equipe nesta fase, escolha uma destas praticas:

### Uso individual

Cada pessoa controla apenas os processos da sua propria mesa.

### Base compartilhada por arquivo

Uma pessoa exporta o JSON e envia para outra importar.

Essa pratica exige cuidado, porque a importacao substitui a base local.

### Publicacao no GitHub Pages

Todos acessam o mesmo endereco, mas os dados continuam salvos individualmente no navegador de cada usuario.

## 17. Boas Praticas Operacionais

### Registre a entrada no mesmo dia

Evita perda de rastreabilidade e esquecimento de prazos.

### Use status simples

Nao tente representar todo o processo juridico ou administrativo no status. O status deve indicar a proxima acao operacional.

### Movimente sempre que mudar de etapa

Se saiu da mesa, registre.

Se voltou para revisar, registre.

Se foi devolvido, registre.

### Escreva observacoes objetivas

Prefira:

```text
Falta anexar pesquisa de mercado atualizada e ajustar justificativa do quantitativo.
```

Evite:

```text
Ver isso depois.
```

### Use prioridade urgente com criterio

Se tudo for urgente, nada sera urgente.

### Exporte backup com frequencia

Principalmente antes de alteracoes grandes.

## 18. Exemplos de Uso

### Exemplo 1: processo chegou para analise

1. Clique em **Novo processo**.
2. Preencha numero, objeto, secretaria e data de chegada.
3. Em status, selecione **Analisar**.
4. Em finalidade, informe `Analise inicial`.
5. Marque os documentos existentes.
6. Salve.

### Exemplo 2: processo precisa de TR

1. Cadastre ou edite o processo.
2. Em status, selecione **Criar documentos**.
3. Marque `TR`.
4. Em observacoes, descreva o que precisa ser elaborado.
5. Salve.

### Exemplo 3: processo devolvido para correcao

1. Na lista, clique em **Movimentar**.
2. Selecione o status **Devolver**.
3. Informe destino.
4. Informe finalidade, como `Correcao documental`.
5. Descreva a pendencia.
6. Salve.

### Exemplo 4: processo concluido

1. Na lista, clique em **Movimentar**.
2. Selecione o status **Concluir**.
3. Informe destino.
4. Informe finalidade, como `Encaminhado para parecer juridico`.
5. Salve.

## 19. Limitacoes da V1

A versao atual ainda nao possui:

- login;
- multiusuario em tempo real;
- banco de dados central;
- anexos de arquivos;
- assinatura digital;
- integracoes externas;
- permissoes por setor;
- relatorios avancados;
- inteligencia artificial.

Esses recursos fazem parte de evolucoes futuras do produto.

## 20. Solucao de Problemas

### Os dados sumiram

Possiveis causas:

- voce abriu em outro navegador;
- o cache/dados do site foram limpos;
- voce importou uma base vazia;
- esta usando outro computador.

Se tiver backup, use **Importar JSON** para restaurar.

### O processo nao aparece na lista

Verifique se ha filtros ativos.

Clique em **Limpar** para exibir todos os processos.

### O processo aparece como atrasado

Verifique o campo prazo.

Se o processo ja foi finalizado, movimente para **Concluir**.

### Nao consigo compartilhar os dados automaticamente

Na V1 isso e esperado. A base e local por navegador.

Use exportacao/importacao JSON ou aguarde a versao web multiusuario.

## 21. Recomendacao de Rotina Diaria

1. Abrir o Process Planner no inicio do expediente.
2. Conferir os indicadores.
3. Filtrar processos atrasados ou urgentes.
4. Atualizar movimentacoes pendentes.
5. Registrar novas entradas.
6. Encaminhar processos concluidos ou devolvidos.
7. Exportar backup no fim do dia.

## 22. Glossario

### DFD

Documento de Formalizacao da Demanda.

### ETP

Estudo Tecnico Preliminar.

### TR

Termo de Referencia.

### Edital

Instrumento convocatorio utilizado em processos licitatorios.

### SLA interno

Prazo operacional definido pelo setor para tratar uma demanda.

### Kanban

Quadro visual que organiza processos por etapa.

### LocalStorage

Recurso do navegador usado para salvar dados localmente no computador do usuario.

## 23. Resumo

O Process Planner foi criado para ser simples, visual e operacional.

Use o sistema para manter clareza sobre:

- entrada;
- analise;
- producao documental;
- revisao;
- devolucao;
- conclusao;
- prazos;
- historico.

Quanto mais consistente for o registro das movimentacoes, maior sera a rastreabilidade e menor sera a dependencia de memoria, papel, mensagens soltas ou planilhas paralelas.
