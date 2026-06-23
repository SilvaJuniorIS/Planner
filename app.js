const STORAGE_KEY = "atlasflow_v2";
const LEGACY_STORAGE_KEY = "process_planner_v1";
const RETURN_REASONS_KEY = "atlasflow_return_reasons_v1";
const DOCUMENT_TEMPLATES_KEY = "atlasflow_document_templates_v1";
const KANBAN_SETTINGS_KEY = "atlasflow_kanban_settings_v1";
const SESSION_USER_KEY = "atlasflow_session_user";
const SESSION_TOKEN_KEY = "atlasflow_session_token";

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

const documentModels = [
  ["devolucao", "Cota de devolucao"],
  ["encaminhamento", "Cota de encaminhamento"],
  ["juridico", "Cota para juridico"],
  ["saneamento", "Despacho de saneamento"],
];

const defaultDocumentTemplates = {
  devolucao: [
    "{{titulo}}",
    "",
    "Processo: {{processo}}",
    "Objeto: {{objeto}}",
    "Secretaria/Setor: {{secretaria}}",
    "Origem: {{origem}}",
    "Responsavel atual: {{responsavel}}",
    "Data de chegada: {{chegada}}",
    "Prazo interno: {{prazo}}",
    "Documentos relacionados: {{documentos}}",
    "",
    "Ao setor {{destino}},",
    "",
    "Apos analise preliminar dos autos, devolvemos o presente processo para saneamento das pendencias abaixo:",
    "",
    "{{motivos}}",
    "",
    "{{observacoes}}",
    "",
    "Apos o atendimento das providencias, encaminhar novamente para continuidade da analise.",
    "",
    "{{cidade}}, {{data}}.",
    "",
    "{{assinatura}}",
  ].join("\n"),
  encaminhamento: [
    "{{titulo}}",
    "",
    "Processo: {{processo}}",
    "Objeto: {{objeto}}",
    "Secretaria/Setor: {{secretaria}}",
    "Documentos relacionados: {{documentos}}",
    "",
    "Encaminho o presente processo ao setor {{destino}} para ciencia, analise e providencias cabiveis.",
    "",
    "Considerando o andamento registrado, solicita-se observar o prazo interno de {{prazo}} e registrar a movimentacao correspondente apos a conclusao da etapa.",
    "",
    "{{observacoes}}",
    "",
    "{{cidade}}, {{data}}.",
    "",
    "{{assinatura}}",
  ].join("\n"),
  juridico: [
    "{{titulo}}",
    "",
    "Processo: {{processo}}",
    "Objeto: {{objeto}}",
    "Secretaria/Setor: {{secretaria}}",
    "Origem: {{origem}}",
    "Documentos relacionados: {{documentos}}",
    "",
    "Encaminho os autos ao Juridico Administrativo para analise e manifestacao quanto aos aspectos legais do procedimento.",
    "",
    "Pontos de atencao identificados:",
    "",
    "{{motivos}}",
    "",
    "{{observacoes}}",
    "",
    "{{cidade}}, {{data}}.",
    "",
    "{{assinatura}}",
  ].join("\n"),
  saneamento: [
    "{{titulo}}",
    "",
    "Processo: {{processo}}",
    "Objeto: {{objeto}}",
    "Secretaria/Setor: {{secretaria}}",
    "",
    "Determino/solicito o saneamento dos autos antes do prosseguimento, com atencao aos seguintes pontos:",
    "",
    "{{motivos}}",
    "",
    "As providencias deverao ser registradas no historico do processo, com juntada dos documentos atualizados quando cabivel.",
    "",
    "{{observacoes}}",
    "",
    "{{cidade}}, {{data}}.",
    "",
    "{{assinatura}}",
  ].join("\n"),
};

const state = {
  users: [],
  currentUserId: "",
  processes: [],
  apiOnline: false,
  authToken: "",
  view: "list",
};

const els = {
  kanban: document.querySelector("#kanban"),
  processList: document.querySelector("#processList"),
  historyList: document.querySelector("#historyList"),
  operationHealth: document.querySelector("#operationHealth"),
  operationInsight: document.querySelector("#operationInsight"),
  metricAvgAge: document.querySelector("#metricAvgAge"),
  metricDueSoon: document.querySelector("#metricDueSoon"),
  metricCompletion: document.querySelector("#metricCompletion"),
  executiveReport: document.querySelector("#executiveReport"),
  bottleneckReport: document.querySelector("#bottleneckReport"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  docFilter: document.querySelector("#docFilter"),
  userSelect: document.querySelector("#userSelect"),
  activeUserName: document.querySelector("#activeUserName"),
  activeUserMeta: document.querySelector("#activeUserMeta"),
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUserSelect: document.querySelector("#loginUserSelect"),
  loginStatus: document.querySelector("#loginStatus"),
  refreshDataBtn: document.querySelector("#refreshDataBtn"),
  manageUsersBtn: document.querySelector("#manageUsersBtn"),
  newUserBtn: document.querySelector("#newUserBtn"),
  newProcessBtn: document.querySelector("#newProcessBtn"),
  quickForm: document.querySelector("#quickForm"),
  logoutBtn: document.querySelector("#logoutBtn"),
  manageUsersDialog: document.querySelector("#manageUsersDialog"),
  manageUsersList: document.querySelector("#manageUsersList"),
  kanbanSettingsDialog: document.querySelector("#kanbanSettingsDialog"),
  kanbanSettingsList: document.querySelector("#kanbanSettingsList"),
  processTimeline: document.querySelector("#processTimeline"),
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
  documentTypeSelect: document.querySelector("#documentTypeSelect"),
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

function apiBaseUrl() {
  const host = window.location.hostname;
  if (window.location.port === "8124") return `${window.location.protocol}//${host}:8001`;
  if (!host || host === "localhost" || host === "127.0.0.1") return "http://localhost:8000";
  return `${window.location.protocol}//${host}:8000`;
}

async function apiRequest(path, options = {}) {
  const authHeaders = state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {};
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro na API" }));
    throw new Error(error.detail || "Erro na API");
  }

  if (response.status === 204) return null;
  return response.json();
}

async function apiDownload(path, payload) {
  const authHeaders = state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {};
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro na API" }));
    throw new Error(error.detail || "Erro na API");
  }

  const disposition = response.headers.get("Content-Disposition") || "";
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] || payload.filename;
  return { filename, blob: await response.blob() };
}

function apiUserToLocal(user) {
  return normalizeUser({
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
    passwordEnabled: Boolean(user.password_enabled),
    createdAt: user.created_at,
  });
}

function apiHistoryToLocal(event) {
  return {
    date: event.date,
    action: event.action,
    status: event.status,
    to: event.to || event.to_sector || "",
    purpose: event.purpose || "",
    notes: event.notes || "",
  };
}

function apiProcessToLocal(process) {
  return normalizeProcess({
    id: process.id,
    userId: process.user_id,
    number: process.number,
    year: process.year,
    subject: process.subject,
    secretary: process.secretary,
    owner: process.owner,
    priority: process.priority,
    arrivalDate: process.arrival_date,
    fromSector: process.from_sector,
    purpose: process.purpose,
    deadline: process.deadline,
    status: process.status,
    exitDate: process.exit_date,
    toSector: process.to_sector,
    exitPurpose: process.exit_purpose,
    docs: process.docs || [],
    notes: process.notes,
    history: (process.history || []).map(apiHistoryToLocal),
  }, process.user_id);
}

function localProcessToApi(process) {
  return {
    number: process.number || "",
    year: process.year || "",
    subject: process.subject || "Sem objeto",
    secretary: process.secretary || "",
    owner: process.owner || "",
    priority: process.priority || "normal",
    arrival_date: process.arrivalDate || "",
    from_sector: process.fromSector || "",
    purpose: process.purpose || "",
    deadline: process.deadline || "",
    status: process.status || "entrada",
    exit_date: process.exitDate || "",
    to_sector: process.toSector || "",
    exit_purpose: process.exitPurpose || "",
    docs: process.docs || [],
    notes: process.notes || "",
  };
}

function storedSessionUserId() {
  return sessionStorage.getItem(SESSION_USER_KEY) || "";
}

function storedSessionToken() {
  return sessionStorage.getItem(SESSION_TOKEN_KEY) || "";
}

function setSession(userId, token) {
  state.currentUserId = userId;
  state.authToken = token;
  sessionStorage.setItem(SESSION_USER_KEY, userId);
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearSession() {
  state.authToken = "";
  sessionStorage.removeItem(SESSION_USER_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

function showLogin(message = "") {
  els.loginStatus.textContent = message || "Nesta fase, usuarios sem senha cadastrada entram com senha em branco.";
  els.loginScreen.classList.remove("hidden");
}

function hideLogin() {
  els.loginScreen.classList.add("hidden");
}

function renderLoginUsers() {
  els.loginUserSelect.innerHTML = state.users
    .map((user) => `<option value="${escapeHTML(user.id)}">${escapeHTML(user.name)}</option>`)
    .join("");
  els.loginUserSelect.value = state.currentUserId || state.users[0]?.id || "";
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

async function loadApiData() {
  try {
    const users = await apiRequest("/api/users");
    state.users = users.map(apiUserToLocal);
    const sessionUserId = storedSessionUserId();
    const sessionToken = storedSessionToken();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state.currentUserId = sessionUserId && state.users.some((user) => user.id === sessionUserId)
      ? sessionUserId
      : saved.currentUserId && state.users.some((user) => user.id === saved.currentUserId)
        ? saved.currentUserId
      : state.users[0]?.id || "";
    state.authToken = sessionToken;
    state.apiOnline = true;
    if (sessionToken) {
      try {
        await loadAllApiProcesses();
      } catch {
        clearSession();
        state.authToken = "";
        state.processes = [];
      }
    } else {
      state.processes = [];
    }
    persist();
    return true;
  } catch {
    state.apiOnline = false;
    return false;
  }
}

async function loadAllApiProcesses() {
  if (!state.apiOnline || !state.users.length) return;
  const visibleUsers = isAdminUser()
    ? state.users
    : state.users.filter((user) => user.id === state.currentUserId);
  const processGroups = await Promise.all(visibleUsers.map(async (user) => {
    const processes = await apiRequest(`/api/users/${user.id}/processes`);
    const detailed = await Promise.all(processes.map((process) => apiRequest(`/api/processes/${process.id}`)));
    return detailed.map(apiProcessToLocal);
  }));
  const visibleIds = new Set(visibleUsers.map((user) => user.id));
  state.processes = [
    ...state.processes.filter((process) => !visibleIds.has(process.userId)),
    ...processGroups.flat(),
  ];
}

async function loadApiProcesses() {
  if (!state.apiOnline || !state.currentUserId) return;
  const processes = await apiRequest(`/api/users/${state.currentUserId}/processes`);
  const detailed = await Promise.all(processes.map((process) => apiRequest(`/api/processes/${process.id}`)));
  const otherProcesses = state.processes.filter((process) => process.userId !== state.currentUserId);
  state.processes = [...otherProcesses, ...detailed.map(apiProcessToLocal)];
}

function loadLocalData() {
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

async function load() {
  const apiLoaded = await loadApiData();
  if (!apiLoaded) loadLocalData();
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
    mode: state.apiOnline ? "api" : "local",
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

function normalizeRole(role = "") {
  return String(role)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isAdminUser() {
  const user = currentUser();
  const role = normalizeRole(user?.role);
  return state.currentUserId === "user-compras" || role.includes("administrador") || role === "admin";
}

function isReadOnlyUser() {
  const role = normalizeRole(currentUser()?.role);
  return ["consulta", "visitante", "leitura", "somente leitura"].some((item) => role.includes(item));
}

function canEditProcesses() {
  return !isReadOnlyUser();
}

function canManageUsers() {
  return isAdminUser();
}

function processCountByUser() {
  return state.processes.reduce((acc, process) => {
    acc[process.userId] = (acc[process.userId] || 0) + 1;
    return acc;
  }, {});
}

function defaultKanbanSettings() {
  return {
    order: statuses.map(([key]) => key),
    hidden: [],
  };
}

function loadAllKanbanSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KANBAN_SETTINGS_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function normalizeKanbanSettings(settings = {}) {
  const validKeys = statuses.map(([key]) => key);
  const order = Array.isArray(settings.order)
    ? [...settings.order.filter((key) => validKeys.includes(key)), ...validKeys.filter((key) => !settings.order.includes(key))]
    : validKeys;
  const hidden = Array.isArray(settings.hidden)
    ? settings.hidden.filter((key) => validKeys.includes(key))
    : [];
  return { order, hidden };
}

function currentKanbanSettings() {
  const allSettings = loadAllKanbanSettings();
  return normalizeKanbanSettings(allSettings[state.currentUserId] || defaultKanbanSettings());
}

function saveCurrentKanbanSettings(settings) {
  const allSettings = loadAllKanbanSettings();
  allSettings[state.currentUserId] = normalizeKanbanSettings(settings);
  localStorage.setItem(KANBAN_SETTINGS_KEY, JSON.stringify(allSettings));
}

function visibleKanbanStatuses() {
  const settings = currentKanbanSettings();
  const statusMap = Object.fromEntries(statuses);
  return settings.order
    .filter((key) => !settings.hidden.includes(key))
    .map((key) => [key, statusMap[key]])
    .filter(([, label]) => Boolean(label));
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

function loadDocumentTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem(DOCUMENT_TEMPLATES_KEY) || "{}");
    return { ...defaultDocumentTemplates, ...(saved && typeof saved === "object" ? saved : {}) };
  } catch {
    return { ...defaultDocumentTemplates };
  }
}

function saveDocumentTemplate(type, template) {
  const templates = loadDocumentTemplates();
  templates[type] = template.trim() || defaultDocumentTemplates[type] || "";
  localStorage.setItem(DOCUMENT_TEMPLATES_KEY, JSON.stringify(templates));
}

function resetDocumentTemplate(type) {
  const templates = loadDocumentTemplates();
  templates[type] = defaultDocumentTemplates[type] || "";
  localStorage.setItem(DOCUMENT_TEMPLATES_KEY, JSON.stringify(templates));
  return templates[type];
}

function isLate(process) {
  return process.deadline && process.status !== "concluido" && process.deadline < todayISO();
}

function daysBetween(start, end = todayISO()) {
  if (!start) return 0;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  return Math.max(0, Math.round((endDate - startDate) / 86400000));
}

function daysUntil(date) {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  const current = new Date(`${todayISO()}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target - current) / 86400000);
}

function groupCount(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || "Nao informado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortedCountEntries(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function percent(part, total) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function reportProcesses() {
  return isAdminUser() ? state.processes : currentUserProcesses();
}

function userNameById(userId) {
  return state.users.find((user) => user.id === userId)?.name || "Usuario removido";
}

function averageOpenAge(processes) {
  const open = processes.filter((process) => process.status !== "concluido");
  if (!open.length) return 0;
  return Math.round(open.reduce((sum, process) => (
    sum + daysBetween(process.arrivalDate || process.createdAt?.slice(0, 10))
  ), 0) / open.length);
}

function processRiskScore(processes) {
  const open = processes.filter((process) => process.status !== "concluido");
  const late = open.filter(isLate);
  const urgent = open.filter((process) => process.priority === "urgente");
  const noDeadline = open.filter((process) => !process.deadline);
  if (!open.length) return "Sem processos em aberto";
  if (late.length >= 5 || late.length / open.length >= 0.35) return "Critico";
  if (late.length || urgent.length >= 3 || noDeadline.length >= 5) return "Atencao";
  return "Controlado";
}

function normalizeReportLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Nao informado";
  const cleaned = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bSECRETARIAD E\b/gi, "SECRETARIA DE")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const counts = processCountByUser();

  els.userSelect.innerHTML = state.users
    .map((user) => {
      const count = counts[user.id] || 0;
      return `<option value="${escapeHTML(user.id)}">${escapeHTML(user.name)} (${count})</option>`;
    })
    .join("");
  els.userSelect.value = state.currentUserId;

  const user = currentUser();
  els.activeUserName.textContent = user?.name || "Usuario";
  const mode = state.apiOnline ? `API em ${apiBaseUrl()}` : "LocalStorage";
  const currentCount = currentUserProcesses().length;
  const totalCount = state.processes.length;
  els.activeUserMeta.textContent = [
    [user?.department, user?.role, user?.email].filter(Boolean).join(" | "),
    `${currentCount} processo(s) deste usuario`,
    `${totalCount} no total carregado`,
    mode,
  ].filter(Boolean).join(" | ");
  els.manageUsersBtn.classList.toggle("hidden", !isAdminUser());
  els.newUserBtn.classList.toggle("hidden", !canManageUsers());
  els.newProcessBtn.classList.toggle("hidden", !canEditProcesses());
  els.quickForm.classList.toggle("hidden", !canEditProcesses());
  els.userSelect.disabled = state.apiOnline && Boolean(state.authToken) && !isAdminUser();
  els.logoutBtn.classList.toggle("hidden", !state.apiOnline);
}

function renderMetrics() {
  const processes = currentUserProcesses();
  const open = processes.filter((p) => p.status !== "concluido");
  const late = processes.filter(isLate);
  const urgent = processes.filter((p) => p.priority === "urgente" && p.status !== "concluido");
  const done = processes.filter((p) => p.status === "concluido");
  const dueSoon = open.filter((p) => {
    const days = daysUntil(p.deadline);
    return days !== null && days >= 0 && days <= 7;
  });
  const avgAge = open.length
    ? Math.round(open.reduce((sum, process) => sum + daysBetween(process.arrivalDate || process.createdAt?.slice(0, 10)), 0) / open.length)
    : 0;
  const lateRate = open.length ? late.length / open.length : 0;

  document.querySelector("#metricOpen").textContent = open.length;
  document.querySelector("#metricLate").textContent = late.length;
  document.querySelector("#metricUrgent").textContent = urgent.length;
  document.querySelector("#metricDone").textContent = done.length;
  els.metricAvgAge.textContent = `${avgAge} dia${avgAge === 1 ? "" : "s"}`;
  els.metricDueSoon.textContent = dueSoon.length;
  els.metricCompletion.textContent = percent(done.length, processes.length);

  if (!processes.length) {
    els.operationHealth.textContent = "Sem dados suficientes";
    els.operationInsight.textContent = "Cadastre processos para gerar leitura gerencial da mesa.";
  } else if (lateRate >= 0.35 || late.length >= 5) {
    els.operationHealth.textContent = "Atencao critica";
    els.operationInsight.textContent = `${late.length} processo(s) atrasado(s). Priorize prazos vencidos e redistribua gargalos.`;
  } else if (late.length || dueSoon.length >= 3) {
    els.operationHealth.textContent = "Monitorar prazos";
    els.operationInsight.textContent = `${dueSoon.length} processo(s) vencem em ate 7 dias. Acompanhe a fila diariamente.`;
  } else {
    els.operationHealth.textContent = "Operacao controlada";
    els.operationInsight.textContent = "Nao ha sinal critico de atraso na mesa atual.";
  }
}

function renderReports() {
  const processes = reportProcesses();
  const open = processes.filter((p) => p.status !== "concluido");
  const late = processes.filter(isLate);
  const done = processes.filter((p) => p.status === "concluido");
  const urgent = open.filter((process) => process.priority === "urgente");
  const noDeadline = open.filter((process) => !process.deadline);
  const dueSoon = open
    .map((process) => ({ process, days: daysUntil(process.deadline) }))
    .filter((item) => item.days !== null && item.days >= 0 && item.days <= 7)
    .sort((a, b) => a.days - b.days);
  const byStatus = sortedCountEntries(groupCount(processes, (process) => labelForStatus(process.status)));
  const bySecretary = sortedCountEntries(groupCount(processes, (process) => normalizeReportLabel(process.secretary)));
  const byUser = sortedCountEntries(groupCount(processes, (process) => userNameById(process.userId)));
  const avgAge = averageOpenAge(processes);
  const risk = processRiskScore(processes);
  const scope = isAdminUser() ? "Consolidado de todas as mesas carregadas" : `Mesa de ${currentUser()?.name || "usuario"}`;

  els.executiveReport.innerHTML = `
    <div class="report-scope">
      <span>Escopo do relatorio</span>
      <strong>${escapeHTML(scope)}</strong>
      <small>Atualizado em ${formatDate(todayISO())}</small>
    </div>
    <div class="report-kpis">
      <article><span>Total</span><strong>${processes.length}</strong></article>
      <article><span>Em aberto</span><strong>${open.length}</strong></article>
      <article><span>Atrasados</span><strong>${late.length}</strong></article>
      <article><span>Urgentes</span><strong>${urgent.length}</strong></article>
      <article><span>Sem prazo</span><strong>${noDeadline.length}</strong></article>
      <article><span>Conclusao</span><strong>${percent(done.length, processes.length)}</strong></article>
      <article><span>Idade media</span><strong>${avgAge}d</strong></article>
      <article><span>Risco</span><strong>${escapeHTML(risk)}</strong></article>
    </div>
    <div class="report-columns">
      <div>
        <h3>Por status</h3>
        ${renderCountList(byStatus)}
      </div>
      <div>
        <h3>Por secretaria</h3>
        ${renderCountList(bySecretary.slice(0, 8))}
      </div>
      ${isAdminUser() ? `
        <div>
          <h3>Por usuario</h3>
          ${renderCountList(byUser.slice(0, 8))}
        </div>
      ` : ""}
    </div>
  `;

  els.bottleneckReport.innerHTML = `
    <div class="deadline-list">
      <h3>Proximos prazos</h3>
      ${dueSoon.length ? dueSoon.slice(0, 5).map(({ process, days }) => `
        <article>
          <strong>${escapeHTML(process.number || "Sem numero")}</strong>
          <span>${escapeHTML(process.subject)}</span>
          <small>${days === 0 ? "Vence hoje" : `Vence em ${days} dia${days === 1 ? "" : "s"}`}</small>
        </article>
      `).join("") : '<div class="empty">Nenhum vencimento nos proximos 7 dias.</div>'}
    </div>
    <div class="deadline-list">
      <h3>Gargalos</h3>
      ${renderCountList(sortedCountEntries(groupCount(open, (process) => labelForStatus(process.status))).slice(0, 6))}
    </div>
    <div class="deadline-list">
      <h3>Vencidos</h3>
      ${late.length ? late.slice(0, 6).map((process) => `
        <article>
          <strong>${escapeHTML(process.number || "Sem numero")}</strong>
          <span>${escapeHTML(process.subject)}</span>
          <small>${escapeHTML(userNameById(process.userId))} | Prazo: ${formatDate(process.deadline)}</small>
        </article>
      `).join("") : '<div class="empty">Nenhum processo vencido.</div>'}
    </div>
    <div class="deadline-list">
      <h3>Sem prazo definido</h3>
      ${noDeadline.length ? noDeadline.slice(0, 6).map((process) => `
        <article>
          <strong>${escapeHTML(process.number || "Sem numero")}</strong>
          <span>${escapeHTML(process.subject)}</span>
          <small>${escapeHTML(userNameById(process.userId))} | ${escapeHTML(labelForStatus(process.status))}</small>
        </article>
      `).join("") : '<div class="empty">Todos os processos em aberto possuem prazo.</div>'}
    </div>
  `;
}

function renderCountList(entries) {
  if (!entries.length) return '<div class="empty">Sem dados para exibir.</div>';
  const max = Math.max(...entries.map(([, count]) => count), 1);
  return `
    <div class="count-list">
      ${entries.map(([label, count]) => `
        <div class="count-row">
          <div>
            <span>${escapeHTML(label)}</span>
            <strong>${count}</strong>
          </div>
          <i style="width: ${Math.max(8, Math.round((count / max) * 100))}%"></i>
        </div>
      `).join("")}
    </div>
  `;
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
  const visibleStatuses = visibleKanbanStatuses();
  const canEdit = canEditProcesses();
  if (!visibleStatuses.length) {
    els.kanban.innerHTML = '<div class="empty kanban-empty">Todas as colunas estao ocultas. Use Personalizar para restaurar o Kanban.</div>';
    return;
  }
  els.kanban.innerHTML = visibleStatuses.map(([key, label]) => {
    const items = filtered.filter((process) => process.status === key);
    return `
      <section class="kanban-column">
        <div class="column-title">
          <span>${escapeHTML(label)}</span>
          <span class="counter">${items.length}</span>
        </div>
        ${items.length ? items.map((process) => `
          <article class="process-mini" ${canEdit ? `data-edit="${process.id}"` : ""}>
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
  const canEdit = canEditProcesses();

  if (!filtered.length) {
    const user = currentUser();
    els.processList.innerHTML = `
      <div class="empty">
        Nenhum processo encontrado para ${escapeHTML(user?.name || "este usuario")}.
        ${state.processes.length ? "Os processos de outros usuarios continuam salvos; selecione outro usuario para visualiza-los." : "Cadastre a primeira entrada para iniciar a base."}
      </div>
    `;
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
        ${canEdit ? `
          <button type="button" data-move="${process.id}">Movimentar</button>
          <button type="button" data-edit="${process.id}">Editar</button>
          <button type="button" class="danger" data-delete="${process.id}">Excluir</button>
        ` : ""}
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
  renderReports();
  renderKanban();
  renderList();
  renderHistory();
}

function fillSelects() {
  const statusOptions = ['<option value="">Todos</option>', ...statuses.map(([key, label]) => `<option value="${key}">${label}</option>`)];
  els.statusFilter.innerHTML = statusOptions.join("");
  els.docFilter.innerHTML = ['<option value="">Todos</option>', ...docs.map((doc) => `<option>${doc}</option>`)].join("");
  els.documentTypeSelect.innerHTML = documentModels.map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
  els.processForm.elements.status.innerHTML = statuses.map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
  els.moveForm.elements.status.innerHTML = statuses.map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
}

function renderProcessTimeline(process) {
  const history = [...(process?.history || [])]
    .sort((a, b) => `${b.date || ""}`.localeCompare(`${a.date || ""}`));

  if (!history.length) {
    els.processTimeline.innerHTML = '<div class="empty process-timeline-empty">Nenhuma movimentacao registrada para este processo.</div>';
    return;
  }

  els.processTimeline.innerHTML = history.map((event) => `
    <article class="process-timeline-item">
      <small>${formatDate(event.date)} | ${escapeHTML(labelForStatus(event.status || process.status))}</small>
      <strong>${escapeHTML(event.action || "Movimentacao registrada")}</strong>
      <p>${event.to ? `Destino: ${escapeHTML(event.to)}. ` : ""}${event.purpose ? `Finalidade: ${escapeHTML(event.purpose)}. ` : ""}${escapeHTML(event.notes || "")}</p>
    </article>
  `).join("");
}

function openProcessDialog(process = null) {
  if (!canEditProcesses()) {
    alert("Seu perfil permite apenas consulta.");
    return;
  }
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

  renderProcessTimeline(process);
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

async function saveProcess(event) {
  event.preventDefault();
  if (!canEditProcesses()) {
    alert("Seu perfil permite apenas consulta.");
    return;
  }
  const id = els.processForm.elements.id.value;
  const existing = state.processes.find((process) => process.id === id && process.userId === state.currentUserId);
  const process = formDataToProcess(els.processForm, existing);

  try {
    if (state.apiOnline) {
      const payload = localProcessToApi(process);
      const saved = existing
        ? await apiRequest(`/api/processes/${process.id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiRequest(`/api/users/${state.currentUserId}/processes`, { method: "POST", body: JSON.stringify(payload) });
      const localSaved = apiProcessToLocal(saved);
      state.processes = existing
        ? state.processes.map((item) => item.id === localSaved.id ? localSaved : item)
        : [...state.processes, localSaved];
    } else if (existing) {
      state.processes = state.processes.map((item) => item.id === process.id ? process : item);
    } else {
      state.processes.push(process);
    }
  } catch (error) {
    alert(`Nao foi possivel salvar na API: ${error.message}`);
    return;
  }

  persist();
  closeDialog(els.processDialog);
  renderAll();
}

function openMoveDialog(id) {
  if (!canEditProcesses()) {
    alert("Seu perfil permite apenas consulta.");
    return;
  }
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
  els.cotaForm.elements.documentType.value = "devolucao";
  els.cotaForm.elements.destination.value = process.fromSector || process.secretary || "";
  els.cotaForm.elements.date.value = todayISO();
  els.cotaForm.elements.signer.value = currentUser()?.name || process.owner || "";
  els.cotaForm.elements.reasonsText.value = loadReturnReasons().join("\n");
  loadSelectedTemplate();
  renderCotaReasons();
  updateCotaPreview();
  els.cotaDialog.showModal();
}

function loadSelectedTemplate() {
  const type = els.cotaForm.elements.documentType.value || "devolucao";
  els.cotaForm.elements.templateText.value = loadDocumentTemplates()[type] || defaultDocumentTemplates[type] || "";
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

function documentTitle(type) {
  return (documentModels.find(([key]) => key === type)?.[1] || "Documento padronizado").toUpperCase();
}

function documentContext(process, selectedReasons, data) {
  const processNumber = [process.number, process.year].filter(Boolean).join("/");
  const docsList = (process.docs || []).length ? process.docs.join(", ") : "Nao informado";
  const deadline = process.deadline ? formatDate(process.deadline) : "Sem prazo informado";
  const arrival = process.arrivalDate ? formatDate(process.arrivalDate) : "Sem data informada";
  const reasonsText = selectedReasons.length
    ? selectedReasons.map((reason, index) => `${index + 1}. ${reason}`).join("\n")
    : "1. Necessidade de saneamento documental antes do prosseguimento.";

  return {
    titulo: documentTitle(data.type),
    processo: processNumber || "Nao informado",
    numero: process.number || "Nao informado",
    ano: process.year || "Nao informado",
    objeto: process.subject || "Nao informado",
    secretaria: process.secretary || "Nao informado",
    origem: process.fromSector || "Nao informado",
    destino: data.destination || "competente",
    responsavel: process.owner || currentUser()?.name || "Nao informado",
    chegada: arrival,
    prazo: deadline,
    status: labelForStatus(process.status),
    prioridade: process.priority === "urgente" ? "Urgente" : "Normal",
    documentos: docsList,
    motivos: reasonsText,
    observacoes: data.extraNotes ? `Observacoes complementares:\n${data.extraNotes}` : "",
    cidade: data.city || "Local",
    data: formatDate(data.date || todayISO()),
    assinatura: data.signer || currentUser()?.name || "Responsavel",
  };
}

function renderTemplate(template, context) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] ?? "");
}

function compactDocumentText(text) {
  return text
    .split("\n")
    .filter((line, index, lines) => line.trim() || lines[index - 1]?.trim())
    .join("\n")
    .trim();
}

function buildCotaText(process, selectedReasons, data) {
  const template = els.cotaForm.elements.templateText.value || defaultDocumentTemplates[data.type] || "";
  return compactDocumentText(renderTemplate(template, documentContext(process, selectedReasons, data)));
}

function updateCotaPreview() {
  const id = els.cotaForm.elements.id.value;
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
  if (!process) return;

  const data = {
    type: els.cotaForm.elements.documentType.value || "devolucao",
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
    alert("Texto copiado para a area de transferencia.");
  } catch {
    document.execCommand("copy");
    alert("Texto copiado.");
  }
}

function documentFileName(extension) {
  const id = els.cotaForm.elements.id.value;
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
  const type = els.cotaForm.elements.documentType.value || "documento";
  const number = (process?.number || "sem-numero").replace(/[^a-z0-9]+/gi, "-");
  return `atlasflow-${type}-${number}-${todayISO()}.${extension}`;
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  saveBlob(filename, blob);
}

function saveBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function documentExportPayload(extension) {
  const title = documentTitle(els.cotaForm.elements.documentType.value || "documento");
  return {
    title,
    text: els.cotaOutput.value,
    filename: documentFileName(extension).replace(/\.[^.]+$/, ""),
  };
}

async function exportDocumentWord() {
  if (state.apiOnline) {
    try {
      const result = await apiDownload("/api/documents/export/docx", documentExportPayload("docx"));
      saveBlob(result.filename, result.blob);
      return;
    } catch (error) {
      alert(`Nao foi possivel gerar DOCX pela API: ${error.message}. Gerando arquivo Word compativel.`);
    }
  }

  const title = documentTitle(els.cotaForm.elements.documentType.value || "documento");
  const body = escapeHTML(els.cotaOutput.value).replace(/\n/g, "<br>");
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHTML(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.45; color: #111827; }
          .document { max-width: 760px; margin: 0 auto; }
        </style>
      </head>
      <body><div class="document">${body}</div></body>
    </html>
  `;
  downloadBlob(documentFileName("doc"), html, "application/msword;charset=utf-8");
}

async function exportDocumentPdf() {
  if (state.apiOnline) {
    try {
      const result = await apiDownload("/api/documents/export/pdf", documentExportPayload("pdf"));
      saveBlob(result.filename, result.blob);
      return;
    } catch (error) {
      alert(`Nao foi possivel gerar PDF pela API: ${error.message}. Abrindo impressao do navegador.`);
    }
  }

  const title = documentTitle(els.cotaForm.elements.documentType.value || "documento");
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Permita pop-ups para abrir a impressao em PDF.");
    return;
  }
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHTML(title)}</title>
        <style>
          @page { margin: 22mm; }
          body { font-family: Arial, sans-serif; line-height: 1.45; color: #111827; white-space: pre-wrap; }
        </style>
      </head>
      <body>${escapeHTML(els.cotaOutput.value)}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function renderManageUsers() {
  const counts = processCountByUser();
  els.manageUsersList.innerHTML = state.users.map((user) => {
    const count = counts[user.id] || 0;
    const isSelf = user.id === state.currentUserId;
    const canDelete = isAdminUser() && !isSelf && count === 0;
    const reason = isSelf
      ? "Usuario ativo"
      : count > 0
        ? `${count} processo(s) vinculado(s)`
        : "Sem processos";

    return `
      <article class="manage-user-row">
        <div>
          <strong>${escapeHTML(user.name)}</strong>
          <span>${escapeHTML([user.department, user.role, user.email].filter(Boolean).join(" | ") || "Sem detalhes")}</span>
          <small>${user.passwordEnabled ? "Senha ativa" : "Sem senha definida"}</small>
          <small>${escapeHTML(reason)}</small>
        </div>
        <div class="manage-user-actions">
          <button type="button" data-password-user="${escapeHTML(user.id)}">Definir senha</button>
          <button type="button" data-clear-password-user="${escapeHTML(user.id)}" ${user.passwordEnabled ? "" : "disabled"}>Limpar senha</button>
          <button type="button" class="danger" data-delete-user="${escapeHTML(user.id)}" ${canDelete ? "" : "disabled"}>Excluir</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderKanbanSettings() {
  const settings = currentKanbanSettings();
  const statusMap = Object.fromEntries(statuses);
  els.kanbanSettingsList.innerHTML = settings.order.map((key, index) => {
    const hidden = settings.hidden.includes(key);
    return `
      <article class="kanban-setting-row">
        <label>
          <input type="checkbox" data-kanban-visible="${escapeHTML(key)}" ${hidden ? "" : "checked"} />
          <span>${escapeHTML(statusMap[key])}</span>
        </label>
        <div class="kanban-setting-actions">
          <button type="button" data-kanban-up="${escapeHTML(key)}" ${index === 0 ? "disabled" : ""}>Subir</button>
          <button type="button" data-kanban-down="${escapeHTML(key)}" ${index === settings.order.length - 1 ? "disabled" : ""}>Descer</button>
        </div>
      </article>
    `;
  }).join("");
}

function openKanbanSettingsDialog() {
  renderKanbanSettings();
  els.kanbanSettingsDialog.showModal();
}

function moveKanbanColumn(key, direction) {
  const settings = currentKanbanSettings();
  const index = settings.order.indexOf(key);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= settings.order.length) return;
  const nextOrder = [...settings.order];
  [nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]];
  saveCurrentKanbanSettings({ ...settings, order: nextOrder });
  renderKanbanSettings();
  renderKanban();
}

function toggleKanbanColumn(key, visible) {
  const settings = currentKanbanSettings();
  const hidden = visible
    ? settings.hidden.filter((item) => item !== key)
    : [...new Set([...settings.hidden, key])];
  saveCurrentKanbanSettings({ ...settings, hidden });
  renderKanbanSettings();
  renderKanban();
}

function resetKanbanSettings() {
  saveCurrentKanbanSettings(defaultKanbanSettings());
  renderKanbanSettings();
  renderKanban();
}

function openManageUsersDialog() {
  if (!canManageUsers()) {
    alert("Apenas administradores podem gerenciar usuarios.");
    return;
  }
  renderManageUsers();
  els.manageUsersDialog.showModal();
}

async function deleteUser(userId) {
  if (!canManageUsers()) {
    alert("Apenas administradores podem excluir usuarios.");
    return;
  }

  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  const count = processCountByUser()[userId] || 0;
  if (userId === state.currentUserId) {
    alert("Nao e possivel excluir o usuario ativo.");
    return;
  }
  if (count > 0) {
    alert("Nao e possivel excluir usuario com processos vinculados.");
    return;
  }
  if (!confirm(`Excluir o usuario ${user.name}?`)) return;

  if (state.apiOnline) {
    try {
      await apiRequest(`/api/users/${userId}?admin_user_id=${encodeURIComponent(state.currentUserId)}`, { method: "DELETE" });
      const users = await apiRequest("/api/users");
      state.users = users.map(apiUserToLocal);
      await loadAllApiProcesses();
    } catch (error) {
      alert(`Nao foi possivel excluir usuario: ${error.message}`);
      return;
    }
  } else {
    state.users = state.users.filter((item) => item.id !== userId);
  }

  persist();
  renderAll();
  renderManageUsers();
}

async function updateUserPassword(userId, password) {
  if (!canManageUsers()) {
    alert("Apenas administradores podem alterar senhas.");
    return;
  }

  const user = state.users.find((item) => item.id === userId);
  if (!user) return;

  if (state.apiOnline) {
    try {
      const saved = await apiRequest(`/api/users/${userId}/password`, {
        method: "PATCH",
        body: JSON.stringify({
          admin_user_id: state.currentUserId,
          password,
        }),
      });
      state.users = state.users.map((item) => (item.id === userId ? apiUserToLocal(saved) : item));
    } catch (error) {
      alert(`Nao foi possivel alterar senha: ${error.message}`);
      return;
    }
  } else {
    state.users = state.users.map((item) => (
      item.id === userId
        ? {
            ...item,
            passwordEnabled: Boolean(password),
            passwordHash: simplePasswordHash(password),
          }
        : item
    ));
  }

  persist();
  renderAll();
  renderManageUsers();
  alert(password ? `Senha atualizada para ${user.name}.` : `Senha removida de ${user.name}.`);
}

async function setUserPassword(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  const password = prompt(`Nova senha para ${user.name}:`);
  if (password === null) return;
  await updateUserPassword(userId, password);
}

async function clearUserPassword(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  if (!confirm(`Remover a senha de ${user.name}?`)) return;
  await updateUserPassword(userId, "");
}

async function refreshData() {
  if (state.apiOnline) {
    try {
      const users = await apiRequest("/api/users");
      state.users = users.map(apiUserToLocal);
      await loadAllApiProcesses();
      ensureCurrentUser();
      persist();
    } catch (error) {
      alert(`Nao foi possivel atualizar pela API: ${error.message}`);
      return;
    }
  } else {
    loadLocalData();
  }
  renderAll();
}

async function login(event) {
  event.preventDefault();
  if (!state.apiOnline) {
    hideLogin();
    return;
  }

  const data = new FormData(els.loginForm);
  const userId = data.get("userId");
  const password = data.get("password");

  try {
    const session = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, password }),
    });
    setSession(session.user_id, session.token);
    await loadAllApiProcesses();
    persist();
    hideLogin();
    renderAll();
  } catch (error) {
    showLogin(`Nao foi possivel entrar: ${error.message}`);
  }
}

async function logout() {
  clearSession();
  renderLoginUsers();
  showLogin("Sessao encerrada. Entre novamente para acessar sua mesa.");
  renderAll();
}

async function saveMovement(event) {
  event.preventDefault();
  if (!canEditProcesses()) {
    alert("Seu perfil permite apenas consulta.");
    return;
  }
  const data = new FormData(els.moveForm);
  const id = data.get("id");
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
  if (!process) return;

  if (state.apiOnline) {
    try {
      const saved = await apiRequest(`/api/processes/${id}/movements`, {
        method: "POST",
        body: JSON.stringify({
          date: data.get("date") || todayISO(),
          status: data.get("status"),
          to: data.get("to").trim(),
          purpose: data.get("purpose").trim(),
          notes: data.get("notes").trim(),
        }),
      });
      const localSaved = apiProcessToLocal(saved);
      state.processes = state.processes.map((item) => item.id === localSaved.id ? localSaved : item);
      persist();
      closeDialog(els.moveDialog);
      renderAll();
      return;
    } catch (error) {
      alert(`Nao foi possivel movimentar na API: ${error.message}`);
      return;
    }
  }

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

async function deleteProcess(id) {
  if (!canEditProcesses()) {
    alert("Seu perfil permite apenas consulta.");
    return;
  }
  const process = state.processes.find((item) => item.id === id && item.userId === state.currentUserId);
  if (!process) return;
  if (!confirm(`Excluir o processo ${process.number || "sem numero"}?`)) return;

  if (state.apiOnline) {
    try {
      await apiRequest(`/api/processes/${id}`, { method: "DELETE" });
    } catch (error) {
      alert(`Nao foi possivel excluir na API: ${error.message}`);
      return;
    }
  }

  state.processes = state.processes.filter((item) => item.id !== id);
  persist();
  renderAll();
}

async function addQuickProcess(event) {
  event.preventDefault();
  if (!canEditProcesses()) {
    alert("Seu perfil permite apenas consulta.");
    return;
  }
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

  if (state.apiOnline) {
    try {
      const saved = await apiRequest(`/api/users/${state.currentUserId}/processes`, {
        method: "POST",
        body: JSON.stringify(localProcessToApi(process)),
      });
      state.processes.push(apiProcessToLocal(saved));
      await loadAllApiProcesses();
    } catch (error) {
      alert(`Nao foi possivel registrar na API: ${error.message}`);
      return;
    }
  } else {
    state.processes.push(process);
  }
  persist();
  event.currentTarget.reset();
  renderAll();
}

async function saveUser(event) {
  event.preventDefault();
  if (!canManageUsers()) {
    alert("Apenas administradores podem criar usuarios.");
    return;
  }
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

  if (state.apiOnline) {
    try {
      const saved = await apiRequest(`/api/users?admin_user_id=${encodeURIComponent(state.currentUserId)}`, {
        method: "POST",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          department: user.department,
          role: user.role,
          password: data.get("password"),
        }),
      });
      state.users.push(apiUserToLocal(saved));
      state.currentUserId = saved.id;
      await loadApiProcesses();
    } catch (error) {
      alert(`Nao foi possivel criar usuario na API: ${error.message}`);
      return;
    }
  } else {
    state.users.push(user);
    state.currentUserId = user.id;
  }
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

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const processes = reportProcesses();
  const rows = [
    ["Usuario", "Numero", "Ano", "Objeto", "Secretaria", "Responsavel", "Prioridade", "Status", "Chegada", "Prazo", "Saida", "Documentos"],
    ...processes.map((process) => [
      userNameById(process.userId),
      process.number,
      process.year,
      process.subject,
      process.secretary,
      process.owner,
      process.priority,
      labelForStatus(process.status),
      formatDate(process.arrivalDate),
      formatDate(process.deadline),
      formatDate(process.exitDate),
      (process.docs || []).join("; "),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const userName = (isAdminUser() ? "consolidado" : currentUser()?.name || "usuario").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  link.href = url;
  link.download = `atlasflow-relatorio-${userName || "mesa"}-${todayISO()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function printExecutiveReport() {
  window.print();
}

function importedPayloadFromParsed(parsed) {
  if (Array.isArray(parsed)) {
    return {
      users: defaultUsers(),
      currentUserId: state.currentUserId || "user-compras",
      processes: parsed,
    };
  }

  return {
    users: Array.isArray(parsed.users) && parsed.users.length ? parsed.users : defaultUsers(),
    currentUserId: parsed.currentUserId || parsed.current_user_id || state.currentUserId || "user-compras",
    processes: Array.isArray(parsed.processes) ? parsed.processes : [],
  };
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const payload = importedPayloadFromParsed(parsed);

      if (state.apiOnline) {
        const result = await apiRequest("/api/import", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const users = await apiRequest("/api/users");
        state.users = users.map(apiUserToLocal);
        state.currentUserId = result.current_user_id || payload.currentUserId || state.currentUserId;
        await loadAllApiProcesses();
        ensureCurrentUser();
        persist();
        renderAll();
        alert(`Importacao fixada na API. Usuarios: ${result.users}. Processos: ${result.processes}.`);
        return;
      }

      state.users = payload.users.map(normalizeUser);
      state.currentUserId = payload.currentUserId || state.users[0].id;
      state.processes = payload.processes.map((process) => normalizeProcess(process, state.currentUserId));
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
  els.loginForm.addEventListener("submit", login);
  document.querySelector("#newProcessBtn").addEventListener("click", () => openProcessDialog());
  document.querySelector("#newUserBtn").addEventListener("click", () => {
    if (!isAdminUser()) {
      alert("Apenas Israel Junior pode criar usuarios.");
      return;
    }
    els.userDialog.showModal();
  });
  document.querySelector("#refreshDataBtn").addEventListener("click", refreshData);
  document.querySelector("#logoutBtn").addEventListener("click", logout);
  document.querySelector("#manageUsersBtn").addEventListener("click", openManageUsersDialog);
  document.querySelector("#customizeKanbanBtn").addEventListener("click", openKanbanSettingsDialog);
  document.querySelector("#closeProcessDialog").addEventListener("click", () => closeDialog(els.processDialog));
  document.querySelector("#cancelProcessBtn").addEventListener("click", () => closeDialog(els.processDialog));
  document.querySelector("#closeMoveDialog").addEventListener("click", () => closeDialog(els.moveDialog));
  document.querySelector("#cancelMoveBtn").addEventListener("click", () => closeDialog(els.moveDialog));
  document.querySelector("#closeUserDialog").addEventListener("click", () => closeDialog(els.userDialog));
  document.querySelector("#cancelUserBtn").addEventListener("click", () => closeDialog(els.userDialog));
  document.querySelector("#closeManageUsersDialog").addEventListener("click", () => closeDialog(els.manageUsersDialog));
  document.querySelector("#doneManageUsersBtn").addEventListener("click", () => closeDialog(els.manageUsersDialog));
  document.querySelector("#closeKanbanSettingsDialog").addEventListener("click", () => closeDialog(els.kanbanSettingsDialog));
  document.querySelector("#doneKanbanSettingsBtn").addEventListener("click", () => closeDialog(els.kanbanSettingsDialog));
  document.querySelector("#resetKanbanSettingsBtn").addEventListener("click", resetKanbanSettings);
  document.querySelector("#closeCotaDialog").addEventListener("click", () => closeDialog(els.cotaDialog));
  document.querySelector("#cancelCotaBtn").addEventListener("click", () => closeDialog(els.cotaDialog));
  document.querySelector("#saveReasonsBtn").addEventListener("click", () => {
    saveReturnReasons(els.cotaForm.elements.reasonsText.value.split("\n"));
    renderCotaReasons();
    updateCotaPreview();
  });
  document.querySelector("#saveTemplateBtn").addEventListener("click", () => {
    const type = els.cotaForm.elements.documentType.value || "devolucao";
    saveDocumentTemplate(type, els.cotaForm.elements.templateText.value);
    updateCotaPreview();
    alert("Modelo salvo para este navegador.");
  });
  document.querySelector("#resetTemplateBtn").addEventListener("click", () => {
    const type = els.cotaForm.elements.documentType.value || "devolucao";
    els.cotaForm.elements.templateText.value = resetDocumentTemplate(type);
    updateCotaPreview();
  });
  els.documentTypeSelect.addEventListener("change", () => {
    loadSelectedTemplate();
    updateCotaPreview();
  });
  document.querySelector("#copyCotaBtn").addEventListener("click", copyCotaText);
  document.querySelector("#exportDocBtn").addEventListener("click", exportDocumentWord);
  document.querySelector("#exportPdfBtn").addEventListener("click", exportDocumentPdf);
  els.cotaForm.addEventListener("input", updateCotaPreview);
  els.cotaReasons.addEventListener("change", updateCotaPreview);
  document.querySelector("#quickForm").addEventListener("submit", addQuickProcess);
  document.querySelector("#exportBtn").addEventListener("click", exportData);
  document.querySelector("#exportCsvBtn").addEventListener("click", exportCsv);
  document.querySelector("#printReportBtn").addEventListener("click", printExecutiveReport);
  document.querySelector("#importInput").addEventListener("change", importData);
  els.processForm.addEventListener("submit", saveProcess);
  els.moveForm.addEventListener("submit", saveMovement);
  els.userForm.addEventListener("submit", saveUser);

  els.userSelect.addEventListener("change", async () => {
    state.currentUserId = els.userSelect.value;
    if (state.apiOnline) {
      try {
        await loadApiProcesses();
      } catch (error) {
        alert(`Nao foi possivel carregar processos da API: ${error.message}`);
      }
    }
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
    const deleteUserId = event.target.closest("[data-delete-user]")?.dataset.deleteUser;
    const passwordUserId = event.target.closest("[data-password-user]")?.dataset.passwordUser;
    const clearPasswordUserId = event.target.closest("[data-clear-password-user]")?.dataset.clearPasswordUser;
    const kanbanUpId = event.target.closest("[data-kanban-up]")?.dataset.kanbanUp;
    const kanbanDownId = event.target.closest("[data-kanban-down]")?.dataset.kanbanDown;

    if (deleteUserId) deleteUser(deleteUserId);
    if (passwordUserId) setUserPassword(passwordUserId);
    if (clearPasswordUserId) clearUserPassword(clearPasswordUserId);
    if (kanbanUpId) moveKanbanColumn(kanbanUpId, -1);
    if (kanbanDownId) moveKanbanColumn(kanbanDownId, 1);
    if (cotaId) openCotaDialog(cotaId);
    if (editId) openProcessDialog(state.processes.find((process) => process.id === editId && process.userId === state.currentUserId));
    if (moveId) openMoveDialog(moveId);
    if (deleteId) deleteProcess(deleteId);
  });

  els.kanbanSettingsList.addEventListener("change", (event) => {
    const key = event.target.closest("[data-kanban-visible]")?.dataset.kanbanVisible;
    if (key) toggleKanbanColumn(key, event.target.checked);
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

async function startApp() {
  fillSelects();
  bindEvents();
  await load();
  renderLoginUsers();
  renderAll();
  if (state.apiOnline && !state.authToken) {
    showLogin();
  } else {
    hideLogin();
  }
}

startApp();
