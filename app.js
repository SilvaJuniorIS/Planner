const STORAGE_KEY = "process_planner_v1";

const statuses = [
  ["entrada", "Entrada"],
  ["analisar", "Analisar"],
  ["criar", "Criar documentos"],
  ["revisar", "Revisar"],
  ["devolver", "Devolver"],
  ["concluido", "Concluir"],
];

const docs = ["DFD", "ETP", "TR", "Edital", "Anexos", "Pesquisa de mercado"];

const state = {
  processes: [],
  view: "list",
};

const els = {
  kanban: document.querySelector("#kanban"),
  processList: document.querySelector("#processList"),
  historyList: document.querySelector("#historyList"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  docFilter: document.querySelector("#docFilter"),
  processDialog: document.querySelector("#processDialog"),
  processForm: document.querySelector("#processForm"),
  moveDialog: document.querySelector("#moveDialog"),
  moveForm: document.querySelector("#moveForm"),
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function seedData() {
  return [
    {
      id: uid(),
      number: "707/2026",
      year: "2026",
      subject: "Manutencao preventiva e corretiva da frota municipal",
      secretary: "Secretaria de Administracao",
      owner: "Setor de Compras",
      priority: "urgente",
      arrivalDate: todayISO(),
      fromSector: "Secretaria requisitante",
      purpose: "Analisar documentos iniciais",
      deadline: addDays(3),
      status: "analisar",
      exitDate: "",
      toSector: "",
      exitPurpose: "",
      docs: ["ETP", "TR", "Pesquisa de mercado"],
      notes: "Conferir coerencia entre ETP, TR, pesquisa e estimativa.",
      history: [
        {
          date: todayISO(),
          action: "Entrada registrada",
          status: "analisar",
          to: "Setor de Compras",
          purpose: "Analise inicial",
          notes: "Processo recebido para saneamento documental.",
        },
      ],
    },
    {
      id: uid(),
      number: "919/2026",
      year: "2026",
      subject: "Aquisicao de plaquetas patrimoniais metalicas",
      secretary: "Patrimonio",
      owner: "Setor de Compras",
      priority: "normal",
      arrivalDate: addDays(-1),
      fromSector: "Patrimonio",
      purpose: "Criar TR",
      deadline: addDays(7),
      status: "criar",
      exitDate: "",
      toSector: "",
      exitPurpose: "",
      docs: ["DFD", "ETP", "TR"],
      notes: "Definir especificacoes, sequencia numerica e criterios de entrega.",
      history: [
        {
          date: addDays(-1),
          action: "Entrada registrada",
          status: "criar",
          to: "Setor de Compras",
          purpose: "Producao documental",
          notes: "Processo cadastrado para elaboracao de TR.",
        },
      ],
    },
  ];
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.processes = seedData();
    persist();
    return;
  }

  try {
    state.processes = JSON.parse(raw);
  } catch {
    state.processes = seedData();
    persist();
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.processes));
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function labelForStatus(status) {
  return statuses.find(([key]) => key === status)?.[1] || status;
}

function formatDate(value) {
  if (!value) return "Sem data";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function isLate(process) {
  return process.deadline && process.status !== "concluido" && process.deadline < todayISO();
}

function filteredProcesses() {
  const search = els.searchInput.value.trim().toLowerCase();
  const status = els.statusFilter.value;
  const priority = els.priorityFilter.value;
  const doc = els.docFilter.value;

  return state.processes
    .filter((process) => {
      const haystack = [
        process.number,
        process.year,
        process.subject,
        process.secretary,
        process.owner,
        process.fromSector,
        process.toSector,
        process.notes,
      ].join(" ").toLowerCase();

      return !search || haystack.includes(search);
    })
    .filter((process) => !status || process.status === status)
    .filter((process) => !priority || process.priority === priority)
    .filter((process) => !doc || process.docs?.includes(doc))
    .sort((a, b) => (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31"));
}

function renderMetrics() {
  document.querySelector("#metricOpen").textContent = state.processes.filter((p) => p.status !== "concluido").length;
  document.querySelector("#metricLate").textContent = state.processes.filter(isLate).length;
  document.querySelector("#metricUrgent").textContent = state.processes.filter((p) => p.priority === "urgente" && p.status !== "concluido").length;
  document.querySelector("#metricDone").textContent = state.processes.filter((p) => p.status === "concluido").length;
}

function processTags(process) {
  return `
    <span class="tag status-${escapeHTML(process.status)}">${escapeHTML(labelForStatus(process.status))}</span>
    ${process.priority === "urgente" ? '<span class="tag urgent">Urgente</span>' : '<span class="tag">Normal</span>'}
    ${isLate(process) ? '<span class="tag late">Atrasado</span>' : ""}
    <span class="tag">Prazo: ${formatDate(process.deadline)}</span>
    ${process.secretary ? `<span class="tag">${escapeHTML(process.secretary)}</span>` : ""}
  `;
}

function renderKanban() {
  const filtered = filteredProcesses();
  els.kanban.innerHTML = statuses.map(([key, label]) => {
    const items = filtered.filter((process) => process.status === key);
    return `
      <section class="kanban-column">
        <div class="column-title">
          <span>${escapeHTML(label)}</span>
          <span class="counter">${items.length}</span>
        </div>
        ${items.length ? items.map((process) => `
          <article class="process-mini" data-edit="${process.id}">
            <strong>${escapeHTML(process.number || "Sem numero")}</strong>
            <small>${escapeHTML(process.subject)}</small>
            <div class="row-meta">${processTags(process)}</div>
          </article>
        `).join("") : '<div class="empty">Sem processos.</div>'}
      </section>
    `;
  }).join("");
}

function renderList() {
  const filtered = filteredProcesses();

  if (!filtered.length) {
    els.processList.innerHTML = '<div class="empty">Nenhum processo encontrado com os filtros atuais.</div>';
    return;
  }

  els.processList.innerHTML = filtered.map((process) => `
    <article class="process-row">
      <div>
        <strong>${escapeHTML(process.number || "Sem numero")} - ${escapeHTML(process.subject)}</strong>
        <p>${escapeHTML(process.notes || "Sem observacoes registradas.")}</p>
        <div class="row-meta">${processTags(process)}</div>
        <div class="docs-list">${(process.docs || []).map((doc) => `<span class="tag">${escapeHTML(doc)}</span>`).join("")}</div>
      </div>
      <div class="row-actions">
        <button type="button" data-move="${process.id}">Movimentar</button>
        <button type="button" data-edit="${process.id}">Editar</button>
        <button type="button" class="danger" data-delete="${process.id}">Excluir</button>
      </div>
    </article>
  `).join("");
}

function renderHistory() {
  const events = state.processes
    .flatMap((process) => (process.history || []).map((event) => ({ ...event, process })))
    .sort((a, b) => `${b.date}`.localeCompare(`${a.date}`));

  if (!events.length) {
    els.historyList.innerHTML = '<div class="empty">Nenhuma movimentacao registrada.</div>';
    return;
  }

  els.historyList.innerHTML = events.map((event) => `
    <article class="history-item">
      <small>${formatDate(event.date)} | ${escapeHTML(event.process.number)} | ${escapeHTML(labelForStatus(event.status))}</small>
      <strong>${escapeHTML(event.action || "Movimentacao registrada")}</strong>
      <p>${escapeHTML(event.process.subject)}</p>
      <p>${event.to ? `Destino: ${escapeHTML(event.to)}. ` : ""}${event.purpose ? `Finalidade: ${escapeHTML(event.purpose)}. ` : ""}${escapeHTML(event.notes || "")}</p>
    </article>
  `).join("");
}

function renderAll() {
  renderMetrics();
  renderKanban();
  renderList();
  renderHistory();
}

function fillSelects() {
  const statusOptions = ['<option value="">Todos</option>', ...statuses.map(([key, label]) => `<option value="${key}">${label}</option>`)];
  els.statusFilter.innerHTML = statusOptions.join("");
  els.docFilter.innerHTML = ['<option value="">Todos</option>', ...docs.map((doc) => `<option>${doc}</option>`)].join("");
  els.processForm.elements.status.innerHTML = statuses.map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
  els.moveForm.elements.status.innerHTML = statuses.map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
}

function openProcessDialog(process = null) {
  els.processForm.reset();
  document.querySelector("#dialogTitle").textContent = process ? "Editar processo" : "Novo processo";
  els.processForm.elements.id.value = process?.id || "";
  els.processForm.elements.arrivalDate.value = process?.arrivalDate || todayISO();
  els.processForm.elements.year.value = process?.year || new Date().getFullYear();
  els.processForm.elements.status.value = process?.status || "entrada";
  els.processForm.elements.priority.value = process?.priority || "normal";

  if (process) {
    for (const [key, value] of Object.entries(process)) {
      if (key === "docs" || key === "history") continue;
      if (els.processForm.elements[key]) els.processForm.elements[key].value = value || "";
    }

    els.processForm.querySelectorAll('[name="docs"]').forEach((input) => {
      input.checked = process.docs?.includes(input.value);
    });
  }

  els.processDialog.showModal();
}

function closeDialog(dialog) {
  dialog.close();
}

function formDataToProcess(form, existing = null) {
  const data = new FormData(form);
  const status = data.get("status");
  const arrivalDate = data.get("arrivalDate") || todayISO();
  const process = {
    id: data.get("id") || uid(),
    number: data.get("number").trim(),
    year: data.get("year").trim(),
    subject: data.get("subject").trim(),
    secretary: data.get("secretary").trim(),
    owner: data.get("owner").trim(),
    priority: data.get("priority"),
    arrivalDate,
    fromSector: data.get("fromSector").trim(),
    purpose: data.get("purpose").trim(),
    deadline: data.get("deadline"),
    status,
    exitDate: data.get("exitDate"),
    toSector: data.get("toSector").trim(),
    exitPurpose: data.get("exitPurpose").trim(),
    docs: data.getAll("docs"),
    notes: data.get("notes").trim(),
    history: existing?.history || [],
  };

  if (!existing) {
    process.history.push({
      date: arrivalDate,
      action: "Entrada registrada",
      status,
      to: process.owner || "Mesa atual",
      purpose: process.purpose || "Cadastro inicial",
      notes: "Processo cadastrado no Process Planner.",
    });
  } else if (existing.status !== status) {
    process.history.push({
      date: todayISO(),
      action: "Status alterado",
      status,
      to: process.toSector,
      purpose: process.exitPurpose || process.purpose,
      notes: "Alteracao feita pela edicao do cadastro.",
    });
  }

  return process;
}

function saveProcess(event) {
  event.preventDefault();
  const id = els.processForm.elements.id.value;
  const existing = state.processes.find((process) => process.id === id);
  const process = formDataToProcess(els.processForm, existing);

  if (existing) {
    state.processes = state.processes.map((item) => item.id === process.id ? process : item);
  } else {
    state.processes.push(process);
  }

  persist();
  closeDialog(els.processDialog);
  renderAll();
}

function openMoveDialog(id) {
  const process = state.processes.find((item) => item.id === id);
  if (!process) return;

  els.moveForm.reset();
  els.moveForm.elements.id.value = id;
  els.moveForm.elements.status.value = process.status;
  els.moveForm.elements.date.value = todayISO();
  els.moveDialog.showModal();
}

function saveMovement(event) {
  event.preventDefault();
  const data = new FormData(els.moveForm);
  const id = data.get("id");
  const process = state.processes.find((item) => item.id === id);
  if (!process) return;

  process.status = data.get("status");
  process.history = process.history || [];
  process.history.push({
    date: data.get("date") || todayISO(),
    action: "Movimentacao registrada",
    status: process.status,
    to: data.get("to").trim(),
    purpose: data.get("purpose").trim(),
    notes: data.get("notes").trim(),
  });

  if (["concluido", "devolver"].includes(process.status)) {
    process.exitDate = data.get("date") || todayISO();
    process.toSector = data.get("to").trim();
    process.exitPurpose = data.get("purpose").trim();
  }

  persist();
  closeDialog(els.moveDialog);
  renderAll();
}

function deleteProcess(id) {
  const process = state.processes.find((item) => item.id === id);
  if (!process) return;
  if (!confirm(`Excluir o processo ${process.number || "sem numero"}?`)) return;

  state.processes = state.processes.filter((item) => item.id !== id);
  persist();
  renderAll();
}

function addQuickProcess(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const number = data.get("number").trim();
  const subject = data.get("subject").trim();

  if (!number && !subject) {
    alert("Informe ao menos o numero ou o objeto.");
    return;
  }

  const process = {
    id: uid(),
    number,
    year: new Date().getFullYear().toString(),
    subject,
    secretary: data.get("secretary").trim(),
    owner: "Mesa atual",
    priority: data.get("priority"),
    arrivalDate: todayISO(),
    fromSector: data.get("secretary").trim(),
    purpose: "Entrada para analise",
    deadline: data.get("deadline"),
    status: "entrada",
    exitDate: "",
    toSector: "",
    exitPurpose: "",
    docs: [],
    notes: "",
    history: [
      {
        date: todayISO(),
        action: "Entrada rapida registrada",
        status: "entrada",
        to: "Mesa atual",
        purpose: "Triagem",
        notes: "Cadastro rapido criado no painel lateral.",
      },
    ],
  };

  state.processes.push(process);
  persist();
  event.currentTarget.reset();
  renderAll();
}

function exportData() {
  const payload = {
    app: "Process Planner",
    version: 1,
    exportedAt: new Date().toISOString(),
    processes: state.processes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `process-planner-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const processes = Array.isArray(parsed) ? parsed : parsed.processes;
      if (!Array.isArray(processes)) throw new Error("Formato invalido");
      state.processes = processes;
      persist();
      renderAll();
      alert("Importacao concluida.");
    } catch {
      alert("Nao foi possivel importar este JSON.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  document.querySelector("#newProcessBtn").addEventListener("click", () => openProcessDialog());
  document.querySelector("#closeProcessDialog").addEventListener("click", () => closeDialog(els.processDialog));
  document.querySelector("#cancelProcessBtn").addEventListener("click", () => closeDialog(els.processDialog));
  document.querySelector("#closeMoveDialog").addEventListener("click", () => closeDialog(els.moveDialog));
  document.querySelector("#cancelMoveBtn").addEventListener("click", () => closeDialog(els.moveDialog));
  document.querySelector("#quickForm").addEventListener("submit", addQuickProcess);
  document.querySelector("#exportBtn").addEventListener("click", exportData);
  document.querySelector("#importInput").addEventListener("change", importData);
  els.processForm.addEventListener("submit", saveProcess);
  els.moveForm.addEventListener("submit", saveMovement);

  [els.searchInput, els.statusFilter, els.priorityFilter, els.docFilter].forEach((input) => {
    input.addEventListener("input", renderAll);
    input.addEventListener("change", renderAll);
  });

  document.querySelector("#clearFiltersBtn").addEventListener("click", () => {
    els.searchInput.value = "";
    els.statusFilter.value = "";
    els.priorityFilter.value = "";
    els.docFilter.value = "";
    renderAll();
  });

  document.body.addEventListener("click", (event) => {
    const editId = event.target.closest("[data-edit]")?.dataset.edit;
    const moveId = event.target.closest("[data-move]")?.dataset.move;
    const deleteId = event.target.closest("[data-delete]")?.dataset.delete;

    if (editId) openProcessDialog(state.processes.find((process) => process.id === editId));
    if (moveId) openMoveDialog(moveId);
    if (deleteId) deleteProcess(deleteId);
  });

  document.querySelector("#listTab").addEventListener("click", () => setView("list"));
  document.querySelector("#historyTab").addEventListener("click", () => setView("history"));
}

function setView(view) {
  state.view = view;
  els.processList.classList.toggle("hidden", view !== "list");
  els.historyList.classList.toggle("hidden", view !== "history");
  document.querySelector("#listTab").classList.toggle("active", view === "list");
  document.querySelector("#historyTab").classList.toggle("active", view === "history");
}

fillSelects();
bindEvents();
load();
renderAll();
