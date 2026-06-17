const STORAGE_KEY = "atlasflow_v2";
const LEGACY_STORAGE_KEY = "process_planner_v1";
const RETURN_REASONS_KEY = "atlasflow_return_reasons_v1";

const statuses = [
  ["entrada", "Entrada"],
  ["analisar", "Analisar"],
  ["criar", "Criar documentos"],
  ["revisar", "Revisar"],
  ["devolver", "Devolver"],
  ["concluido", "Concluir"],
];

const docs = ["DFD", "ETP", "TR", "Edital", "Anexos", "Pesquisa de mercado"];

const defaultReturnReasons = [
  "Ausencia ou inconsistencia no Documento de Formalizacao da Demanda (DFD).",
  "Necessidade de complementar ou revisar o Estudo Tecnico Preliminar (ETP).",
  "Termo de Referencia com especificacoes insuficientes ou divergentes.",
  "Pesquisa de mercado ausente, vencida ou sem demonstracao da metodologia utilizada.",
  "Ausencia de justificativa para quantitativos, lotes ou escolha da solucao.",
  "Divergencia entre objeto, documentos de planejamento e documentos anexos.",
  "Necessidade de saneamento documental antes do prosseguimento.",
];

const state = {
  users: [],
  currentUserId: "",
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
  userSelect: document.querySelector("#userSelect"),
  activeUserName: document.querySelector("#activeUserName"),
  activeUserMeta: document.querySelector("#activeUserMeta"),
  processDialog: document.querySelector("#processDialog"),
  processForm: document.querySelector("#processForm"),
  moveDialog: document.querySelector("#moveDialog"),
  moveForm: document.querySelector("#moveForm"),
  userDialog: document.querySelector("#userDialog"),
  userForm: document.querySelector("#userForm"),
  cotaDialog: document.querySelector("#cotaDialog"),
  cotaForm: document.querySelector("#cotaForm"),
  cotaReasons: document.querySelector("#cotaReasons"),
  cotaOutput: document.querySelector("#cotaOutput"),
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

function simplePasswordHash(password) {
  if (!password) return "";
  let hash = 0;
  for (let index = 0; index < password.length; index += 1) {
    hash = ((hash << 5) - hash) + password.charCodeAt(index);
    hash |= 0;
  }
  return `local:${Math.abs(hash).toString(16)}`;
}

function defaultUsers() {
  return [
    {
      id: "user-compras",
      name: "Israel Junior",
      email: "israel.junior@prefeitura.local",
      department: "Compras",
      role: "Administrador",
      passwordEnabled: false,
      passwordHash: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-juridico",
      name: "Visitante",
      email: "visitante@prefeitura.local",
      department: "Visitante",
      role: "Consulta",
      passwordEnabled: false,
      passwordHash: "",
      createdAt: new Date().toISOString(),
    },
  ];
}

function normalizeUser(user) {
  const defaults = {
    passwordEnabled: false,
    passwordHash: "",
    createdAt: new Date().toISOString(),
  };
  const normalized = { ...defaults, ...user };

  if (normalized.id === "user-compras") {
    normalized.name = "Israel Junior";
    normalized.email = normalized.email === "compras@prefeitura.local" ? "israel.junior@prefeitura.local" : normalized.email;
    normalized.role = normalized.role === "Operador" ? "Administrador" : normalized.role;
  }

  if (normalized.id === "user-juridico") {
    normalized.name = "Visitante";
    normalized.email = normalized.email === "juridico@prefeitura.local" ? "visitante@prefeitura.local" : normalized.email;
    normalized.department = normalized.department === "Juridico" ? "Visitante" : normalized.department;
    normalized.role = normalized.role === "Revisor" ? "Consulta" : normalized.role;
  }

  return normalized;
}

function seedData(userId = "user-compras") {
  return [
    {
      id: uid(),
      userId,
      number: "707/2026",
      year: "2026",
      subject: "Manutencao preventiva e corretiva da frota municipal",
      secretary: "Secretaria de Administracao",
      owner: "Israel Junior",
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
          to: "Israel Junior",
          purpose: "Analise inicial",
          notes: "Processo recebido para saneamento documental.",
        },
      ],
    },
    {
      id: uid(),
      userId,
      number: "919/2026",
      year: "2026",
      subject: "Aquisicao de plaquetas patrimoniais metalicas",
      secretary: "Patrimonio",
      owner: "Israel Junior",
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
          to: "Israel Junior",
          purpose: "Producao documental",
          notes: "Processo cadastrado para elaboracao de TR.",
        },
      ],
    },
  ];
}

function normalizeProcess(process, userId) {
  return {
    ...process,
    userId: process.userId || userId,
    docs: Array.isArray(process.docs) ? process.docs : [],
    history: Array.isArray(process.history) ? process.history : [],
  };
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      state.users = Array.isArray(parsed.users) && parsed.users.length ? parsed.users.map(normalizeUser) : defaultUsers();
      state.currentUserId = parsed.currentUserId || state.users[0].id;
      state.processes = Array.isArray(parsed.processes)
        ? parsed.processes.map((process) => normalizeProcess(process, state.currentUserId))
        : seedData(state.currentUserId);
      ensureCurrentUser();
      persist();
      return;
    } catch {
      resetToSeed();
      return;
    }
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    try {
      const users = defaultUsers();
      const processes = JSON.parse(legacy);
      state.users = users.map(normalizeUser);
      state.currentUserId = users[0].id;
      state.processes = Array.isArray(processes)
        ? processes.map((process) => normalizeProcess(process, users[0].id))
        : seedData(users[0].id);
      persist();
      return;
    } catch {
      resetToSeed();
      return;
    }
  }

  resetToSeed();
}

function resetToSeed() {
  state.users = defaultUsers();
  state.currentUserId = state.users[0].id;
  state.processes = seedData(state.currentUserId);
  persist();
}

function ensureCurrentUser() {
  if (!state.users.length) state.users = defaultUsers();
  state.users = state.users.map(normalizeUser);
  if (!state.users.some((user) => user.id === state.currentUserId)) {
    state.currentUserId = state.users[0].id;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    app: "AtlasFlow",
    version: 2,
    users: state.users,
    currentUserId: state.currentUserId,
    processes: state.processes,
  }));
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

function currentUser() {
  ensureCurrentUser();
  return state.users.find((user) => user.id === state.currentUserId);
}

function currentUserProcesses() {
  return state.processes.filter((process) => process.userId === state.currentUserId);
}

function loadReturnReasons() {
  try {
    const saved = JSON.parse(localStorage.getItem(RETURN_REASONS_KEY) || "[]");
    return Array.isArray(saved) && saved.length ? saved : defaultReturnReasons;
  } catch {
    return defaultReturnReasons;
  }
}

function saveReturnReasons(reasons) {
  const clean = reasons
    .map((reason) => reason.trim())
    .filter(Boolean);
  localStorage.setItem(RETURN_REASONS_KEY, JSON.stringify(clean.length ? clean : defaultReturnReasons));
}

function isLate(process) {
  return process.deadline && process.status !== "concluido" && process.deadline < todayISO();
}

function filteredProcesses() {
  const search = els.searchInput.value.trim().toLowerCase();
  const status = els.statusFilter.value;
  const priority = els.priorityFilter.value;
  const doc = els.docFilter.value;

  return currentUserProcesses()
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

function renderUsers() {
  els.userSelect.innerHTML = state.users
    .map((user) => `<option value="${escapeHTML(user.id)}">${escapeHTML(user.name)}</option>`)
    .join("");
  els.userSelect.value = state.currentUserId;

  const user = currentUser();
  els.activeUserName.textContent = user?.name || "Usuario";
  els.activeUserMeta.textContent = [user?.department, user?.role, user?.email].filter(Boolean).join(" | ") || "Base individual";
}

function renderMetrics() {
  const processes = currentUserProcesses();
  document.querySelector("#metricOpen").textContent = processes.filter((p) => p.status !== "concluido").length;
  document.querySelector("#metricLate").textContent = processes.filter(isLate).length;
  document.querySelector("#metricUrgent").textContent = processes.filter((p) => p.priority === "urgente" && p.status !== "concluido").length;
  document.querySelector("#metricDone").textContent = processes.filter((p) => p.status === "concluido").length;
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
    els.processList.innerHTML = '<div class="empty">Nenhum processo encontrado para este usuario e filtros atuais.</div>';
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
        <button type="button" data-cota="${process.id}">Cota</button>
        <button type="button" data-move="${process.id}">Movimentar</button>
        <button type="button" data-edit="${process.id}">Editar</button>
        <button type="button" class="danger" data-delete="${process.id}">Excluir</button>
      </div>
    </article>
  `).join("");
}

function renderHistory() {
  const events = currentUserProcesses()
    .flatMap((process) => (process.history || []).map((event) => ({ ...event, process })))
    .sort((a, b) => `${b.date}`.localeCompare(`${a.date}`));

  if (!events.length) {
    els.historyList.innerHTML = '<div class="empty">Nenhuma movimentacao registrada para este usuario.</div>';
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
  renderUsers();
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
  els.processForm.elements.owner.value = process?.owner || currentUser()?.name || "";

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
    userId: existing?.userId || state.currentUserId,
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
      to: process.owner || currentUser()?.name || "Mesa atual",
      purpose: process.purpose || "Cadastro inicial",
      notes: "Processo cadastrado no AtlasFlow.",
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
  const existing = state.processes.find((process) => process.id === id && process.userId === state.currentUserId);
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
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
  if (!process) return;

  els.moveForm.reset();
  els.moveForm.elements.id.value = id;
  els.moveForm.elements.status.value = process.status;
  els.moveForm.elements.date.value = todayISO();
  els.moveDialog.showModal();
}

function openCotaDialog(id) {
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
  if (!process) return;

  els.cotaForm.reset();
  els.cotaForm.elements.id.value = id;
  els.cotaForm.elements.destination.value = process.fromSector || process.secretary || "";
  els.cotaForm.elements.date.value = todayISO();
  els.cotaForm.elements.signer.value = currentUser()?.name || process.owner || "";
  els.cotaForm.elements.reasonsText.value = loadReturnReasons().join("\n");
  renderCotaReasons();
  updateCotaPreview();
  els.cotaDialog.showModal();
}

function renderCotaReasons() {
  const reasons = loadReturnReasons();
  els.cotaReasons.innerHTML = reasons.map((reason, index) => `
    <label class="reason-option">
      <input type="checkbox" name="selectedReasons" value="${index}" checked />
      <span>${escapeHTML(reason)}</span>
    </label>
  `).join("");
}

function selectedCotaReasons() {
  const reasons = loadReturnReasons();
  return Array.from(els.cotaForm.querySelectorAll('[name="selectedReasons"]:checked'))
    .map((input) => reasons[Number(input.value)])
    .filter(Boolean);
}

function buildCotaText(process, selectedReasons, data) {
  const processNumber = [process.number, process.year].filter(Boolean).join("/");
  const docsList = (process.docs || []).length ? process.docs.join(", ") : "Nao informado";
  const deadline = process.deadline ? formatDate(process.deadline) : "Sem prazo informado";
  const arrival = process.arrivalDate ? formatDate(process.arrivalDate) : "Sem data informada";
  const reasonsText = selectedReasons.length
    ? selectedReasons.map((reason, index) => `${index + 1}. ${reason}`).join("\n")
    : "1. Necessidade de saneamento documental antes do prosseguimento.";

  return [
    "COTA DE DEVOLUCAO",
    "",
    `Processo: ${processNumber || "Nao informado"}`,
    `Objeto: ${process.subject || "Nao informado"}`,
    `Secretaria/Setor: ${process.secretary || "Nao informado"}`,
    `Origem: ${process.fromSector || "Nao informado"}`,
    `Responsavel atual: ${process.owner || currentUser()?.name || "Nao informado"}`,
    `Data de chegada: ${arrival}`,
    `Prazo interno: ${deadline}`,
    `Documentos relacionados: ${docsList}`,
    "",
    `Ao setor ${data.destination || "competente"},`,
    "",
    "Encaminho o presente processo para devolucao/saneamento, considerando a necessidade de ajustes antes do prosseguimento da instrucao processual.",
    "",
    "Motivos da devolucao:",
    reasonsText,
    "",
    data.extraNotes ? `Observacoes complementares:\n${data.extraNotes}` : "",
    "",
    "Apos as correcoes, o processo podera retornar para nova analise e continuidade do fluxo administrativo.",
    "",
    `${data.city || "Local"}, ${formatDate(data.date || todayISO())}.`,
    "",
    data.signer || currentUser()?.name || "Responsavel",
  ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n");
}

function updateCotaPreview() {
  const id = els.cotaForm.elements.id.value;
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
  if (!process) return;

  const data = {
    destination: els.cotaForm.elements.destination.value.trim(),
    city: els.cotaForm.elements.city.value.trim(),
    date: els.cotaForm.elements.date.value || todayISO(),
    signer: els.cotaForm.elements.signer.value.trim(),
    extraNotes: els.cotaForm.elements.extraNotes.value.trim(),
  };
  els.cotaOutput.value = buildCotaText(process, selectedCotaReasons(), data);
}

async function copyCotaText() {
  els.cotaOutput.select();
  els.cotaOutput.setSelectionRange(0, els.cotaOutput.value.length);
  try {
    await navigator.clipboard.writeText(els.cotaOutput.value);
    alert("Cota copiada para a area de transferencia.");
  } catch {
    document.execCommand("copy");
    alert("Cota copiada.");
  }
}

function saveMovement(event) {
  event.preventDefault();
  const data = new FormData(els.moveForm);
  const id = data.get("id");
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
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
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
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

  const user = currentUser();
  const process = {
    id: uid(),
    userId: state.currentUserId,
    number,
    year: new Date().getFullYear().toString(),
    subject,
    secretary: data.get("secretary").trim(),
    owner: user?.name || "Mesa atual",
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
        to: user?.name || "Mesa atual",
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

function saveUser(event) {
  event.preventDefault();
  const data = new FormData(els.userForm);
  const name = data.get("name").trim();
  if (!name) {
    alert("Informe o nome do usuario.");
    return;
  }

  const user = {
    id: uid(),
    name,
    email: data.get("email").trim(),
    department: data.get("department").trim(),
    role: data.get("role").trim() || "Operador",
    passwordEnabled: Boolean(data.get("password")),
    passwordHash: simplePasswordHash(data.get("password")),
    createdAt: new Date().toISOString(),
  };

  state.users.push(user);
  state.currentUserId = user.id;
  persist();
  els.userForm.reset();
  closeDialog(els.userDialog);
  renderAll();
}

function exportData() {
  const payload = {
    app: "AtlasFlow",
    version: 2,
    exportedAt: new Date().toISOString(),
    users: state.users,
    currentUserId: state.currentUserId,
    processes: state.processes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `atlasflow-${todayISO()}.json`;
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
      if (Array.isArray(parsed)) {
        state.users = defaultUsers();
        state.currentUserId = state.users[0].id;
        state.processes = parsed.map((process) => normalizeProcess(process, state.currentUserId));
      } else {
        const users = Array.isArray(parsed.users) && parsed.users.length ? parsed.users : defaultUsers();
        const currentUserId = parsed.currentUserId || users[0].id;
        const processes = Array.isArray(parsed.processes) ? parsed.processes : [];
        state.users = users;
        state.currentUserId = currentUserId;
        state.processes = processes.map((process) => normalizeProcess(process, currentUserId));
      }
      ensureCurrentUser();
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
  document.querySelector("#newUserBtn").addEventListener("click", () => els.userDialog.showModal());
  document.querySelector("#closeProcessDialog").addEventListener("click", () => closeDialog(els.processDialog));
  document.querySelector("#cancelProcessBtn").addEventListener("click", () => closeDialog(els.processDialog));
  document.querySelector("#closeMoveDialog").addEventListener("click", () => closeDialog(els.moveDialog));
  document.querySelector("#cancelMoveBtn").addEventListener("click", () => closeDialog(els.moveDialog));
  document.querySelector("#closeUserDialog").addEventListener("click", () => closeDialog(els.userDialog));
  document.querySelector("#cancelUserBtn").addEventListener("click", () => closeDialog(els.userDialog));
  document.querySelector("#closeCotaDialog").addEventListener("click", () => closeDialog(els.cotaDialog));
  document.querySelector("#cancelCotaBtn").addEventListener("click", () => closeDialog(els.cotaDialog));
  document.querySelector("#saveReasonsBtn").addEventListener("click", () => {
    saveReturnReasons(els.cotaForm.elements.reasonsText.value.split("\n"));
    renderCotaReasons();
    updateCotaPreview();
  });
  document.querySelector("#copyCotaBtn").addEventListener("click", copyCotaText);
  els.cotaForm.addEventListener("input", updateCotaPreview);
  els.cotaReasons.addEventListener("change", updateCotaPreview);
  document.querySelector("#quickForm").addEventListener("submit", addQuickProcess);
  document.querySelector("#exportBtn").addEventListener("click", exportData);
  document.querySelector("#importInput").addEventListener("change", importData);
  els.processForm.addEventListener("submit", saveProcess);
  els.moveForm.addEventListener("submit", saveMovement);
  els.userForm.addEventListener("submit", saveUser);

  els.userSelect.addEventListener("change", () => {
    state.currentUserId = els.userSelect.value;
    persist();
    renderAll();
  });

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
    const cotaId = event.target.closest("[data-cota]")?.dataset.cota;
    const deleteId = event.target.closest("[data-delete]")?.dataset.delete;

    if (cotaId) openCotaDialog(cotaId);
    if (editId) openProcessDialog(state.processes.find((process) => process.id === editId && process.userId === state.currentUserId));
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
