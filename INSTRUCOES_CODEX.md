# Instrucoes para evolucao do Process Planner

## Produto

Process Planner e uma plataforma simples e visual para acompanhar a vida dos processos administrativos. O foco da V1 e validar rapidamente o fluxo operacional com um produto local em HTML, CSS e JavaScript puro.

## Principio de produto

O sistema deve responder rapidamente:

- onde o processo esta;
- com quem esta;
- por que esta ali;
- o que precisa;
- ha quanto tempo esta parado;
- qual o proximo passo;
- quando saiu;
- para onde foi.

## MVP obrigatorio

- Cadastro de processo.
- Edicao de processo.
- Exclusao de processo.
- Kanban.
- Historico.
- Filtros.
- Prazos.
- Exportacao e importacao JSON.
- Persistencia em LocalStorage.
- Layout responsivo.
- Compatibilidade com GitHub Pages.

## Modelo base

```ts
type Process = {
  id: string;
  number: string;
  year: string;
  subject: string;
  secretary: string;
  owner: string;
  priority: "normal" | "urgente";
  arrivalDate: string;
  fromSector: string;
  purpose: string;
  deadline: string;
  status: "entrada" | "analisar" | "criar" | "revisar" | "devolver" | "concluido";
  exitDate: string;
  toSector: string;
  exitPurpose: string;
  docs: string[];
  notes: string;
  history: ProcessHistory[];
}

type ProcessHistory = {
  date: string;
  action: string;
  status: string;
  to: string;
  purpose: string;
  notes: string;
}
```

## Roadmap

1. V1: controle local.
2. V2: sistema web.
3. V3: multiusuario.
4. V4: relatorios inteligentes.
5. V5: IA para analise documental.
