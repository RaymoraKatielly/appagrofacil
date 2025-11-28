// ==============================
// CONFIGURAÇÕES / ELEMENT SDK
// ==============================
const defaultConfig = {
  app_title: "AgroFácil",
  home_subtitle: "Controle simples de custos e vendas",
  produtos_title: "Produtos",
  custos_title: "Registrar custos",
  vendas_title: "Registrar vendas",
  relatorios_title: "Relatórios",
  config_title: "Configurações",
  ajuda_audio_label: "Ajuda por áudio",
  suporte_label: "Suporte",
  sobre_label: "Sobre o app",
  colors: {
    background: "#8B5A2B",
    surface: "#FDF6E3",
    text: "#3F2A14",
    primary_action: "#16A34A",
    secondary_action: "#FBBF24"
  },
  typography: {
    font_family: "system-ui",
    font_size: 18
  }
};

// ==============================
// ELEMENTOS GLOBAIS DO DOM
// ==============================
const appRoot         = document.getElementById("app-root");
const appShell        = document.getElementById("app-shell");
const screenContainer = document.getElementById("screen-container");
const appTitleEl      = document.getElementById("app-title");
const homeSubtitleEl  = document.getElementById("home-subtitle");
const btnOpenConfig   = document.getElementById("btn-open-config");

// ==============================
// ESTADO DO APP
// ==============================
let currentScreen = "home";        // home | produtos | custos | vendas | relatorios | config
let currentRecords = [];           // dados vindos da planilha (inclui __backendId)

// ==============================
// HELPERS UI
// ==============================

// Limpa a tela atual
function clearScreen() {
  // Enquanto houver elementos filhos dentro do container de telas
  while (screenContainer.firstChild) {
    // Remove o primeiro filho
    screenContainer.removeChild(screenContainer.firstChild);
  }
}

function createBackButton(labelText, targetScreen) {
  // Cria o elemento botão
  const btn = document.createElement("button");
  btn.type = "button";

  // Classes de estilo (TailwindCSS + acessibilidade)
  btn.className =
    "focus-ring inline-flex items-center gap-2 rounded-full bg-[#D1B38A] px-4 py-2 text-base font-bold text-[#3F2A14] shadow hover:bg-[#C79A64] transition";

  // Conteúdo do botão: seta + texto
  btn.innerHTML = `
    <span aria-hidden="true">←</span>   <!-- seta decorativa -->
    <span>${labelText}</span>           <!-- texto do botão passado como parâmetro -->
  `;

  // Evento de clique: navega para a tela alvo
  btn.addEventListener("click", (e) => {
    e.preventDefault();        // evita comportamento padrão do botão
    navigateTo(targetScreen);  // chama função de navegação passando a tela alvo
  });

  return btn;  // retorna o botão pronto para ser adicionado no DOM
}

function formatCurrency(value) {
  // Se o valor não for um número ou for nulo/indefinido, retorna "R$ 0,00"
  if (isNaN(value) || value === null || value === undefined) return "R$ 0,00";

  // Intl.NumberFormat → formata números de acordo com a localidade
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",   // formato monetário
    currency: "BRL"      // Real brasileiro
  }).format(value);
}

function formatDate(isoString) {
  if (!isoString) return "";        // Se a string estiver vazia ou nula, retorna vazio

  const d = new Date(isoString);    // Converte a string ISO para objeto Date
  return d.toLocaleDateString("pt-BR");  // Formata a data no padrão brasileiro (dd/mm/aaaa)
}

// ==============================
// tela inicial (Home) do app
// ==============================
function renderHome() {
  clearScreen(); // Limpa o container antes de renderizar a tela atual

  const wrapper = document.createElement("section");
  wrapper.className =
    "flex-1 flex flex-col items-center justify-center px-4 py-4 gap-6"; //flex-1 → ocupa todo o espaço disponível. flex flex-col → organiza elementos em coluna. items-center justify-center → centraliza conteúdo vertical e horizontalmente. px-4 py-4 → padding interno horizontal e vertical. gap-6 → espaçamento entre os elementos filhos.

  // Título extra opcional
  const title = document.createElement("h2");
  title.className =
    "text-2xl font-extrabold text-[#3F2A14] text-center mb-2"; //text-2xl font-extrabold → tamanho grande e negrito extra. text-[#3F2A14] → cor do texto (marrom escuro). text-center → centraliza o texto horizontalmente. mb-2 → margem inferior.

  title.textContent = "O que você quer fazer?";
  wrapper.appendChild(title);

    const grid = document.createElement("div"); //contêiner que vai organizar os botões da Home.
  grid.className =
    "grid grid-cols-2 gap-4 w-full max-w-xl"; //grid grid-cols-2 → layout em grid com 2 colunas. gap-4 → espaço entre os botões. w-full max-w-xl → ocupa 100% da largura disponível, mas no máximo xl.

 // ==============================
// Criar um botão clicável (<button>).
// ==============================   
function createHomeButton(label, iconSvg, screenKey, bgColorClass) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className =
    "focus-ring flex flex-col items-center justify-center rounded-3xl px-4 py-5 text-center shadow-lg " +
    bgColorClass +
    " text-[#FDF6E3] font-extrabold text-lg gap-3"; //focus-ring → estilo de foco acessível (anel amarelo quando selecionado via teclado). flex flex-col items-center justify-center → organiza o conteúdo do botão em coluna, centralizando vertical e horizontalmente. rounded-3xl → cantos arredondados extra. px-4 py-5 → padding interno. text-center → centraliza o texto dentro do botão. shadow-lg → sombra para dar profundidade. bgColorClass → cor de fundo personalizada (passada como argumento). text-[#FDF6E3] → cor do texto (clara). font-extrabold text-lg → negrito e tamanho maior para a fonte. gap-3 → espaçamento entre o ícone e o texto.

  btn.innerHTML = `
    <div class="w-12 h-12 rounded-full bg-[#FDF6E3]/10 flex items-center justify-center">

     <!--div dentro do botão → círculo para o ícone:-->
     <!--w-12 h-12 → largura e altura fixas (48px). rounded-full → deixa totalmente circular. bg-[#FDF6E3]/10 → fundo semitransparente do círculo (10% de opacidade). flex items-center justify-center → centraliza o ícone SVG dentro do círculo.

      ${iconSvg} <!--SVG passado como argumento da função, permitindo ícones diferentes para cada botão-->
    </div>
    <span>${label} <!-- texto do botão (ex.: "Produtos", "Custos").-->
    </span> 
  `;
    btn.addEventListener("click", () => {
    navigateTo(screenKey);
  }); // Evento de clique → chama a função navigateTo() com a chave da tela correspondente (screenKey).
    return btn; //Retorna o botão pronto para ser adicionado ao grid da Home.
}
// ==============================
// Ícones SVG simplificados
// ==============================
const iconProdutos = <svg viewBox="0 0 24 24" class="w-9 h-9 text-[#FDF6E3]" aria-hidden="true"> <path class="icon-stroke" fill="none" stroke="currentColor" d="M4 9l8-5 8 5-8 5-8-5zM4 15l8 5 8-5M4 9v6M20 9v6" /> </svg> ;
const iconCustos = <svg viewBox="0 0 24 24" class="w-9 h-9 text-[#FDF6E3]" aria-hidden="true"> <path class="icon-stroke" fill="none" stroke="currentColor" d="M5 4h9l5 5v11H5zM14 4v5h5M9 12h6M9 16h3" /> </svg> ;
const iconVendas = <svg viewBox="0 0 24 24" class="w-9 h-9 text-[#FDF6E3]" aria-hidden="true"> <path class="icon-stroke" fill="none" stroke="currentColor" d="M4 7h16l-2 10H6L4 7zM9 7l1-3h4l1 3" /> <circle class="icon-stroke" cx="9" cy="19" r="1.5" fill="none" stroke="currentColor" /> <circle class="icon-stroke" cx="17" cy="19" r="1.5" fill="none" stroke="currentColor" /> </svg> ;
const iconRelatorios = <svg viewBox="0 0 24 24" class="w-9 h-9 text-[#FDF6E3]" aria-hidden="true"> <path class="icon-stroke" fill="none" stroke="currentColor" d="M5 19h14M7 10v6M11 7v9M15 12v4M19 5H5v14" /> </svg> ;

// ==============================
// Cria e adiciona os botões da Home
// ==============================
grid.appendChild(createHomeButton("Registrar Custos", iconCustos, "custos", "bg-[#16A34A]"));
grid.appendChild(createHomeButton("Registrar Vendas", iconVendas, "vendas", "bg-[#16A34A]"));
grid.appendChild(createHomeButton("Produtos", iconProdutos, "produtos", "bg-[#15803D]"));
grid.appendChild(createHomeButton("Relatórios", iconRelatorios, "relatorios", "bg-[#15803D]"));

// Adiciona grid ao wrapper
wrapper.appendChild(grid);

// Adiciona wrapper ao container principal da tela
screenContainer.appendChild(wrapper);

// ==============================
// Aviso pequeno de configuração
// ==============================
const configHint = document.createElement("p");
configHint.className = "text-xs text-[#5C4A32] mt-2 text-center"; //text-[#5C4A32]: cor marrom escura para combinar com o layout; mt-2: margem superior de 0,5rem, dando espaçamento em relação aos botões;
configHint.textContent = "Configurações no botão amarelo, lá em cima.";
wrapper.appendChild(configHint); //Insere o <p> dentro do wrapper, abaixo do grid de botões. Assim, o aviso fica sempre no mesmo lugar, visível na tela da Home.

// Adiciona wrapper ao container principal da tela
screenContainer.appendChild(wrapper); //Coloca todo o conteúdo da Home (wrapper, que contém título, botões e aviso) dentro do container principal da aplicação. É isso que faz com que o usuário veja tudo na tela.
}
// Funções de renderização e gerenciamento de produtos: cria a interface completa de produtos, incluindo cabeçalho com título e botão voltar, lista de produtos existentes, formulário para adicionar novos produtos com validação, botões de ação (salvar e apagar), e atualiza dinamicamente a lista conforme os registros mudam. Todo o código cuida da criação de elementos, estilos, eventos e integração com o SDK de dados.

function renderProdutos() {
// ==============================
// Limpeza da tela e criação do wrapper principal
// ==============================
clearScreen();
const section = document.createElement("section");
section.className = "flex-1 flex flex-col h-full";

// ==============================
// Cabeçalho com título e botão voltar
// ==============================
const headerRow = document.createElement("div");
headerRow.className = "flex items-center justify-between px-4 pt-4 pb-2";

const title = document.createElement("h2");
title.id = "produtos-title";
title.className = "text-xl font-extrabold text-[#3F2A14]";
title.textContent =
(window.elementSdk && window.elementSdk.config.produtos_title) ||
defaultConfig.produtos_title;
headerRow.appendChild(title);

const backBtn = createBackButton("Voltar", "home");
headerRow.appendChild(backBtn);

section.appendChild(headerRow);

// ==============================
// Conteúdo principal
// ==============================
const content = document.createElement("div");
content.className = "flex-1 flex flex-col gap-4 px-4 pb-4 overflow-auto";

// ---------- Lista de produtos ----------
const listBox = document.createElement("div");
listBox.className = "rounded-2xl bg-[#FDF6E3] border border-[#D1B38A] p-3";

const listTitle = document.createElement("p");
listTitle.className = "text-base font-bold text-[#3F2A14] mb-2 flex items-center gap-2";
listTitle.innerHTML = '<span aria-hidden="true">📦</span><span>Produtos salvos</span>';
listBox.appendChild(listTitle);

const ul = document.createElement("ul");
ul.id = "produtos-list";
ul.className = "space-y-2 text-sm";
listBox.appendChild(ul);

content.appendChild(listBox);

// ---------- Formulário de adicionar produto ----------
const formBox = document.createElement("div");
formBox.className = "mt-2 rounded-2xl bg-[#F9F0DC] border border-[#D1B38A] p-4";

const formTitle = document.createElement("p");
formTitle.className = "text-base font-extrabold text-[#3F2A14] mb-3 flex items-center gap-2";
formTitle.innerHTML = '<span aria-hidden="true">➕</span><span>Adicionar Produto</span>';
formBox.appendChild(formTitle);

const form = document.createElement("form");
form.className = "grid grid-cols-1 md:grid-cols-2 gap-3";

// --- Campos do formulário ---
const createInputField = (id, labelText, type = "text", required = false) => {
const wrap = document.createElement("div");
wrap.className = "flex flex-col gap-1";

```
const label = document.createElement("label");
label.className = "text-sm font-bold text-[#3F2A14]";
label.setAttribute("for", id);
label.textContent = labelText;

const input = document.createElement("input");
input.id = id;
input.type = type;
input.required = required;
if (type === "number") {
  input.step = "0.01";
  input.min = "0";
}
input.className = "rounded-xl border border-[#D1B38A] px-3 py-2 text-base text-[#3F2A14] bg-[#FDF6E3] focus-ring";

wrap.appendChild(label);
wrap.appendChild(input);
return { wrap, input };
```

};

const nomeField = createInputField("produto-nome", "Nome", "text", true);
const catField = createInputField("produto-categoria", "Categoria");
const precoCompraField = createInputField("produto-preco-compra", "Preço de compra", "number");
const precoVendaField = createInputField("produto-preco-venda", "Preço de venda", "number");

form.appendChild(nomeField.wrap);
form.appendChild(catField.wrap);
form.appendChild(precoCompraField.wrap);
form.appendChild(precoVendaField.wrap);

// ---------- Ações do formulário ----------
const actionsRow = document.createElement("div");
actionsRow.className = "md:col-span-2 flex flex-wrap justify-between items-center gap-2 mt-2";

const msg = document.createElement("p");
msg.id = "produto-msg";
msg.className = "text-sm text-[#3F2A14]";
msg.textContent = "";

const saveBtn = document.createElement("button");
saveBtn.type = "submit";
saveBtn.id = "produto-save-btn";
saveBtn.className =
"focus-ring inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-5 py-2.5 text-base font-extrabold text-[#FDF6E3] shadow hover:bg-[#15803D] transition";
saveBtn.innerHTML = '<span aria-hidden="true">💾</span><span>Salvar</span>';

actionsRow.appendChild(msg);
actionsRow.appendChild(saveBtn);

form.appendChild(actionsRow);
formBox.appendChild(form);
content.appendChild(formBox);

section.appendChild(content);
screenContainer.appendChild(section);

// ==============================
// Preencher lista de produtos existentes
// ==============================
updateProdutosListUI(ul);

// ==============================
// Handler de submit
// ==============================
form.addEventListener("submit", async (e) => {
e.preventDefault();
msg.textContent = "";

```
const nome = nomeField.input.value.trim();
if (!nome) return (msg.textContent = "Digite pelo menos o nome do produto.");

const categoria = catField.input.value.trim();
const precoCompra = parseFloat(precoCompraField.input.value) || 0;
const precoVenda = parseFloat(precoVendaField.input.value) || 0;

if (currentRecords.length >= 999)
  return (msg.textContent = "Limite de 999 registros atingido. Apague algo antes de salvar mais.");
if (!window.dataSdk) return (msg.textContent = "Erro interno ao salvar (dados não disponíveis).");

saveBtn.disabled = true;
saveBtn.innerHTML = '<span>Salvando...</span>';

const result = await window.dataSdk.create({
  type: "produto",
  nome,
  categoria,
  preco_compra: precoCompra,
  preco_venda: precoVenda,
  registro_tipo: "produto",
  created_at: new Date().toISOString(),
});

if (result.isOk) {
  msg.textContent = "Produto salvo.";
  nomeField.input.value = "";
  catField.input.value = "";
  precoCompraField.input.value = "";
  precoVendaField.input.value = "";
} else {
  msg.textContent = "Não foi possível salvar agora.";
}

saveBtn.disabled = false;
saveBtn.innerHTML = '<span aria-hidden="true">💾</span><span>Salvar</span>';
```

});
}

// ==============================
// Atualiza a lista de produtos
// ==============================
function updateProdutosListUI(ulElement) {
const produtos = currentRecords.filter((r) => r.registro_tipo === "produto");

// Mapear produtos já renderizados
const existing = new Map();
Array.from(ulElement.children).forEach((li) => {
const id = li.getAttribute("data-id");
if (id) existing.set(id, li);
});

produtos.forEach((p) => {
let li = existing.get(p.__backendId);
const resumoPreco =
(p.preco_compra ? "C " + formatCurrency(p.preco_compra) : "") +
(p.preco_venda ? (p.preco_compra ? " | " : "") + "V " + formatCurrency(p.preco_venda) : "");
const text = (p.nome || "Sem nome") + (p.categoria ? " · " + p.categoria : "") + (resumoPreco ? " · " + resumoPreco : "");

```
if (li) {
  const textSpan = li.querySelector(".produto-text");
  if (textSpan) textSpan.textContent = text;
  existing.delete(p.__backendId);
} else {
  li = document.createElement("li");
  li.setAttribute("data-id", p.__backendId);
  li.className =
    "rounded-xl bg-[#F9F0DC] border border-[#D1B38A] px-3 py-2 text-[#3F2A14] flex items-center justify-between gap-2";

  const textSpan = document.createElement("span");
  textSpan.className = "produto-text flex-1 text-sm";
  textSpan.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className =
    "focus-ring rounded-full bg-[#B91C1C] text-[#FDF6E3] px-3 py-1 text-xs font-bold hover:bg-[#991B1B] transition";
  deleteBtn.textContent = "🗑️";
  deleteBtn.setAttribute("aria-label", "Apagar produto " + (p.nome || ""));

  deleteBtn.addEventListener("click", async () => {
    if (!window.dataSdk) return;
    deleteBtn.disabled = true;
    deleteBtn.textContent = "...";
    const result = await window.dataSdk.delete(p);
    if (!result.isOk) {
      deleteBtn.disabled = false;
      deleteBtn.textContent = "🗑️";
    }
  });

  li.appendChild(textSpan);
  li.appendChild(deleteBtn);
  ulElement.appendChild(li);
}
```

});

// Remover produtos que não existem mais
existing.forEach((li) => li.remove());
}

// Funções de renderização e gerenciamento de custos: cria a interface completa de custos, incluindo cabeçalho com título e botão voltar, lista de custos registrados, formulário para adicionar novos custos com validação, botões de ação (registrar e apagar), e atualiza dinamicamente a lista conforme os registros mudam. Todo o código cuida da criação de elementos, estilos, eventos e integração com o SDK de dados.
function renderCustos() {
  // ==============================
  // Limpa a tela e cria o wrapper principal
  // ==============================
  clearScreen();
  const section = document.createElement("section");
  section.className = "flex-1 flex flex-col h-full";

  // ==============================
  // Cabeçalho com título e botão voltar
  // ==============================
  const headerRow = document.createElement("div");
  headerRow.className = "flex items-center justify-between px-4 pt-4 pb-2";

  const title = document.createElement("h2");
  title.id = "custos-title";
  title.className = "text-xl font-extrabold text-[#3F2A14]";
  title.textContent =
    (window.elementSdk && window.elementSdk.config.custos_title) ||
    defaultConfig.custos_title;
  headerRow.appendChild(title);
  headerRow.appendChild(createBackButton("Voltar", "home"));

  section.appendChild(headerRow);

  // ==============================
  // Conteúdo principal
  // ==============================
  const content = document.createElement("div");
  content.className = "flex-1 flex flex-col gap-4 px-4 pb-4 overflow-auto";

  // ---------- Lista de custos ----------
  const listBox = document.createElement("div");
  listBox.className = "rounded-2xl bg-[#FDF6E3] border border-[#D1B38A] p-3";

  const listTitle = document.createElement("p");
  listTitle.className = "text-base font-bold text-[#3F2A14] mb-2 flex items-center gap-2";
  listTitle.innerHTML = '<span aria-hidden="true">📋</span><span>Custos registrados</span>';
  listBox.appendChild(listTitle);

  const ul = document.createElement("ul");
  ul.id = "custos-list";
  ul.className = "space-y-2 text-sm";
  listBox.appendChild(ul);

  content.appendChild(listBox);

  // ---------- Formulário adicionar custo ----------
  const formBox = document.createElement("div");
  formBox.className = "mt-2 rounded-2xl bg-[#F9F0DC] border border-[#D1B38A] p-4";

  const formTitle = document.createElement("p");
  formTitle.className = "text-base font-extrabold text-[#3F2A14] mb-3 flex items-center gap-2";
  formTitle.innerHTML = '<span aria-hidden="true">🧾</span><span>Novo custo</span>';
  formBox.appendChild(formTitle);

  const form = document.createElement("form");
  form.className = "grid grid-cols-1 md:grid-cols-2 gap-3";

  // ---------- Campos do formulário ----------
  const createSelectField = (id, labelText, options) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";

    const label = document.createElement("label");
    label.className = "text-sm font-bold text-[#3F2A14]";
    label.setAttribute("for", id);
    label.textContent = labelText;

    const select = document.createElement("select");
    select.id = id;
    select.className = "rounded-xl border border-[#D1B38A] px-3 py-2 text-base text-[#3F2A14] bg-[#FDF6E3] focus-ring";

    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt.toLowerCase();
      o.textContent = opt || "Escolha";
      select.appendChild(o);
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    return { wrap, select };
  };

  const createInputField = (id, labelText, type = "text", required = false) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";

    const label = document.createElement("label");
    label.className = "text-sm font-bold text-[#3F2A14]";
    label.setAttribute("for", id);
    label.textContent = labelText;

    const input = document.createElement("input");
    input.id = id;
    input.type = type;
    input.required = required;
    if (type === "number") {
      input.step = "0.01";
      input.min = "0";
    }
    input.className = "rounded-xl border border-[#D1B38A] px-3 py-2 text-base text-[#3F2A14] bg-[#FDF6E3] focus-ring";

    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap, input };
  };

  const tipoField = createSelectField("custo-tipo", "Tipo de custo", ["", "Insumo", "Ração", "Manutenção", "Energia", "Mão de obra", "Outro"]);
  const valorField = createInputField("custo-valor", "Valor", "number", true);
  const dataField = createInputField("custo-data", "Data", "date");

  form.appendChild(tipoField.wrap);
  form.appendChild(valorField.wrap);
  form.appendChild(dataField.wrap);

  // ---------- Ações do formulário ----------
  const actionsRow = document.createElement("div");
  actionsRow.className = "md:col-span-2 flex flex-wrap justify-between items-center gap-2 mt-2";

  const msg = document.createElement("p");
  msg.id = "custo-msg";
  msg.className = "text-sm text-[#3F2A14]";
  msg.textContent = "";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.id = "custo-save-btn";
  saveBtn.className = "focus-ring inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-5 py-2.5 text-base font-extrabold text-[#FDF6E3] shadow hover:bg-[#15803D] transition";
  saveBtn.innerHTML = '<span aria-hidden="true">✅</span><span>Registrar</span>';

  actionsRow.appendChild(msg);
  actionsRow.appendChild(saveBtn);

  form.appendChild(actionsRow);
  formBox.appendChild(form);
  content.appendChild(formBox);

  section.appendChild(content);
  screenContainer.appendChild(section);

  // ==============================
  // Preencher lista de custos existentes
  // ==============================
  updateCustosListUI(ul);

  // ==============================
  // Handler de submit
  // ==============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const valor = parseFloat(valorField.input.value);
    if (isNaN(valor)) return (msg.textContent = "Digite um valor.");
    if (currentRecords.length >= 999) return (msg.textContent = "Limite de 999 registros atingido. Apague algo antes.");
    if (!window.dataSdk) return (msg.textContent = "Erro interno ao salvar (dados não disponíveis).");

    saveBtn.disabled = true;
    saveBtn.innerHTML = "<span>Salvando...</span>";

    const result = await window.dataSdk.create({
      type: "custo",
      tipo_custo: tipoField.select.value || "outro",
      valor_custo: valor,
      data_custo: dataField.input.value || new Date().toISOString().slice(0, 10),
      registro_tipo: "custo",
      created_at: new Date().toISOString()
    });

    if (result.isOk) {
      msg.textContent = "Custo registrado.";
      valorField.input.value = "";
    } else {
      msg.textContent = "Não foi possível salvar agora.";
    }

    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span aria-hidden="true">✅</span><span>Registrar</span>';
  });
}

// ==============================
// Atualiza a lista de custos
// ==============================
function updateCustosListUI(ulElement) {
  const custos = currentRecords.filter(r => r.registro_tipo === "custo");
  const existing = new Map();
  Array.from(ulElement.children).forEach(li => {
    const id = li.getAttribute("data-id");
    if (id) existing.set(id, li);
  });

  custos.forEach(c => {
    let li = existing.get(c.__backendId);
    const text = `${c.tipo_custo || "Outro"} · ${formatCurrency(c.valor_custo || 0)}${c.data_custo ? " · " + c.data_custo : ""}`;

    if (li) {
      const textSpan = li.querySelector('.custo-text');
      if (textSpan) textSpan.textContent = text;
      existing.delete(c.__backendId);
    } else {
      li = document.createElement("li");
      li.setAttribute("data-id", c.__backendId);
      li.className = "rounded-xl bg-[#F9F0DC] border border-[#D1B38A] px-3 py-2 text-[#3F2A14] flex items-center justify-between gap-2";

      const textSpan = document.createElement("span");
      textSpan.className = "custo-text flex-1 text-sm";
      textSpan.textContent = text;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "focus-ring rounded-full bg-[#B91C1C] text-[#FDF6E3] px-3 py-1 text-xs font-bold hover:bg-[#991B1B] transition";
      deleteBtn.textContent = "🗑️";
      deleteBtn.setAttribute("aria-label", "Apagar custo");

      deleteBtn.addEventListener("click", async () => {
        if (!window.dataSdk) return;
        deleteBtn.disabled = true;
        deleteBtn.textContent = "...";
        const result = await window.dataSdk.delete(c);
        if (!result.isOk) {
          deleteBtn.disabled = false;
          deleteBtn.textContent = "🗑️";
        }
      });

      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      ulElement.appendChild(li);
    }
  });

  existing.forEach(li => li.remove());
}
// Código responsável por renderizar a tela de Vendas: cria o layout completo com cabeçalho, lista de vendas, formulário para registrar novas vendas (produto, quantidade, preço e total), calcula o total automaticamente, valida entradas, salva os dados via dataSdk, atualiza dinamicamente a lista de vendas na interface e permite excluir registros. Contém funções auxiliares para preencher o select de produtos e atualizar a lista de vendas.

function renderVendas() {
  clearScreen();
  const section = document.createElement("section");
  section.className = "flex-1 flex flex-col h-full";

  // ==============================
  // Cabeçalho com título e botão voltar
  // ==============================
  const headerRow = document.createElement("div");
  headerRow.className = "flex items-center justify-between px-4 pt-4 pb-2";

  const title = document.createElement("h2");
  title.id = "vendas-title";
  title.className = "text-xl font-extrabold text-[#3F2A14]";
  title.textContent =
    (window.elementSdk && window.elementSdk.config.vendas_title) ||
    defaultConfig.vendas_title;

  headerRow.appendChild(title);
  headerRow.appendChild(createBackButton("Voltar", "home"));
  section.appendChild(headerRow);

  // ==============================
  // Conteúdo principal
  // ==============================
  const content = document.createElement("div");
  content.className = "flex-1 flex flex-col gap-4 px-4 pb-4 overflow-auto";

  // ---------- Lista de vendas ----------
  const listBox = document.createElement("div");
  listBox.className = "rounded-2xl bg-[#FDF6E3] border border-[#D1B38A] p-3";

  const listTitle = document.createElement("p");
  listTitle.className = "text-base font-bold text-[#3F2A14] mb-2 flex items-center gap-2";
  listTitle.innerHTML = '<span aria-hidden="true">💰</span><span>Vendas registradas</span>';
  listBox.appendChild(listTitle);

  const ul = document.createElement("ul");
  ul.id = "vendas-list";
  ul.className = "space-y-2 text-sm";
  listBox.appendChild(ul);
  content.appendChild(listBox);

  // ---------- Formulário adicionar venda ----------
  const formBox = document.createElement("div");
  formBox.className = "mt-2 rounded-2xl bg-[#F9F0DC] border border-[#D1B38A] p-4";

  const formTitle = document.createElement("p");
  formTitle.className = "text-base font-extrabold text-[#3F2A14] mb-3 flex items-center gap-2";
  formTitle.innerHTML = '<span aria-hidden="true">🛒</span><span>Nova venda</span>';
  formBox.appendChild(formTitle);

  const form = document.createElement("form");
  form.className = "grid grid-cols-1 md:grid-cols-2 gap-3";

  // ---------- Campos do formulário ----------
  const createInputField = (id, labelText, type = "text", required = false) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";

    const label = document.createElement("label");
    label.className = "text-sm font-bold text-[#3F2A14]";
    label.setAttribute("for", id);
    label.textContent = labelText;

    const input = document.createElement("input");
    input.id = id;
    input.type = type;
    input.required = required;
    if (type === "number") {
      input.step = "0.01";
      input.min = "0";
    }
    input.className = "rounded-xl border border-[#D1B38A] px-3 py-2 text-base text-[#3F2A14] bg-[#FDF6E3] focus-ring";

    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap, input };
  };

  const createTotalBox = (id, labelText) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";

    const label = document.createElement("label");
    label.className = "text-sm font-bold text-[#3F2A14]";
    label.setAttribute("for", id);
    label.textContent = labelText;

    const box = document.createElement("div");
    box.id = id;
    box.className = "rounded-xl border border-dashed border-[#D1B38A] px-3 py-2 text-base font-bold text-[#3F2A14] bg-[#FDF6E3]";
    box.textContent = "R$ 0,00";

    wrap.appendChild(label);
    wrap.appendChild(box);
    return { wrap, box };
  };

  const prodWrap = document.createElement("div");
  prodWrap.className = "flex flex-col gap-1";
  const prodLabel = document.createElement("label");
  prodLabel.className = "text-sm font-bold text-[#3F2A14]";
  prodLabel.setAttribute("for", "venda-produto");
  prodLabel.textContent = "Produto";
  const prodSelect = document.createElement("select");
  prodSelect.id = "venda-produto";
  prodSelect.required = true;
  prodSelect.className = "rounded-xl border border-[#D1B38A] px-3 py-2 text-base text-[#3F2A14] bg-[#FDF6E3] focus-ring";
  prodWrap.appendChild(prodLabel);
  prodWrap.appendChild(prodSelect);

  const qtdField = createInputField("venda-qtd", "Quantidade", "number", true);
  const precoField = createInputField("venda-preco", "Preço por unidade", "number", true);
  const totalField = createTotalBox("venda-total", "Total");

  form.appendChild(prodWrap);
  form.appendChild(qtdField.wrap);
  form.appendChild(precoField.wrap);
  form.appendChild(totalField.wrap);

  // ---------- Ações do formulário ----------
  const actionsRow = document.createElement("div");
  actionsRow.className = "md:col-span-2 flex flex-wrap justify-between items-center gap-2 mt-2";

  const msg = document.createElement("p");
  msg.id = "venda-msg";
  msg.className = "text-sm text-[#3F2A14]";
  msg.textContent = "";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.id = "venda-save-btn";
  saveBtn.className = "focus-ring inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-5 py-2.5 text-base font-extrabold text-[#FDF6E3] shadow hover:bg-[#15803D] transition";
  saveBtn.innerHTML = '<span aria-hidden="true">💰</span><span>Salvar venda</span>';

  actionsRow.appendChild(msg);
  actionsRow.appendChild(saveBtn);
  form.appendChild(actionsRow);
  formBox.appendChild(form);
  content.appendChild(formBox);
  section.appendChild(content);
  screenContainer.appendChild(section);

  // ==============================
  // Preencher select com produtos e lista de vendas
  // ==============================
  fillProdutosSelect(prodSelect);
  updateVendasListUI(ul);

  const updateTotal = () => {
    const qtd = parseFloat(qtdField.input.value) || 0;
    const preco = parseFloat(precoField.input.value) || 0;
    totalField.box.textContent = formatCurrency(qtd * preco);
  };

  qtdField.input.addEventListener("input", updateTotal);
  precoField.input.addEventListener("input", updateTotal);

  // ==============================
  // Submit do formulário
  // ==============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const produto = prodSelect.value;
    const qtd = parseFloat(qtdField.input.value);
    const preco = parseFloat(precoField.input.value);

    if (!produto) return (msg.textContent = "Escolha um produto.");
    if (isNaN(qtd) || isNaN(preco)) return (msg.textContent = "Preencha quantidade e preço.");
    if (currentRecords.length >= 999) return (msg.textContent = "Limite de 999 registros atingido. Apague algo antes.");
    if (!window.dataSdk) return (msg.textContent = "Erro interno ao salvar (dados não disponíveis).");

    const total = qtd * preco;
    saveBtn.disabled = true;
    saveBtn.innerHTML = "<span>Salvando...</span>";

    const result = await window.dataSdk.create({
      type: "venda",
      produto,
      quantidade: qtd,
      preco_unidade: preco,
      total_venda: total,
      registro_tipo: "venda",
      created_at: new Date().toISOString()
    });

    if (result.isOk) {
      msg.textContent = "Venda salva.";
      qtdField.input.value = "";
      precoField.input.value = "";
      totalField.box.textContent = "R$ 0,00";
    } else {
      msg.textContent = "Não foi possível salvar agora.";
    }

    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span aria-hidden="true">💰</span><span>Salvar venda</span>';
  });
}

// ==============================
// Atualiza a lista de vendas
// ==============================
function updateVendasListUI(ulElement) {
  const vendas = currentRecords.filter(r => r.registro_tipo === "venda");
  const existing = new Map();
  Array.from(ulElement.children).forEach(li => {
    const id = li.getAttribute("data-id");
    if (id) existing.set(id, li);
  });

  vendas.forEach(v => {
    let li = existing.get(v.__backendId);
    const text = `${v.produto || "Produto"} · Qtd: ${v.quantidade || 0} · ${formatCurrency(v.total_venda || 0)}`;

    if (li) {
      li.querySelector('.venda-text')?.textContent = text;
      existing.delete(v.__backendId);
    } else {
      li = document.createElement("li");
      li.setAttribute("data-id", v.__backendId);
      li.className = "rounded-xl bg-[#F9F0DC] border border-[#D1B38A] px-3 py-2 text-[#3F2A14] flex items-center justify-between gap-2";

      const textSpan = document.createElement("span");
      textSpan.className = "venda-text flex-1 text-sm";
      textSpan.textContent = text;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "focus-ring rounded-full bg-[#B91C1C] text-[#FDF6E3] px-3 py-1 text-xs font-bold hover:bg-[#991B1B] transition";
      deleteBtn.textContent = "🗑️";
      deleteBtn.setAttribute("aria-label", "Apagar venda");

      deleteBtn.addEventListener("click", async () => {
        if (!window.dataSdk) return;
        deleteBtn.disabled = true;
        deleteBtn.textContent = "...";
        const result = await window.dataSdk.delete(v);
        if (!result.isOk) {
          deleteBtn.disabled = false;
          deleteBtn.textContent = "🗑️";
        }
      });

      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      ulElement.appendChild(li);
    }
  });

  existing.forEach(li => li.remove());
}

// ==============================
// Preenche select com produtos existentes
// ==============================
function fillProdutosSelect(selectEl) {
  selectEl.replaceChildren();
  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = "Escolha";
  selectEl.appendChild(emptyOpt);

  const produtos = currentRecords.filter(r => r.registro_tipo === "produto");
  produtos.forEach(p => {
    const o = document.createElement("option");
    o.value = p.nome || "";
    o.textContent = p.nome || "Sem nome";
    selectEl.appendChild(o);
  });
}
// Código responsável por renderizar a tela de Relatórios: cria o layout completo com cabeçalho, filtros de data, exibe resumo financeiro (total de custos, total de vendas, lucro/prejuízo) em cards, gera gráfico de barras simples, permite filtrar por período, atualizar dinamicamente os dados com base nos registros atuais e exportar o relatório completo em arquivo TXT.
function renderRelatorios() {
  clearScreen();
  const section = document.createElement("section");
  section.className = "flex-1 flex flex-col h-full overflow-auto";

  const headerRow = document.createElement("div");
  headerRow.className = "flex items-center justify-between px-4 pt-4 pb-2";
  const title = document.createElement("h2");
  title.id = "relatorios-title";
  title.className = "text-xl font-extrabold text-[#3F2A14]";
  title.textContent =
    (window.elementSdk && window.elementSdk.config.relatorios_title) ||
    defaultConfig.relatorios_title;
  headerRow.appendChild(title);
  headerRow.appendChild(createBackButton("Voltar", "home"));
  section.appendChild(headerRow);

  const content = document.createElement("div");
  content.className = "flex-1 flex flex-col gap-4 px-4 pb-4";

  const filterBox = document.createElement("div");
  filterBox.className = "rounded-2xl bg-[#F9F0DC] border border-[#D1B38A] p-3";
  const filterTitle = document.createElement("p");
  filterTitle.className = "text-sm font-bold text-[#3F2A14] mb-2 flex items-center gap-2";
  filterTitle.innerHTML = '<span aria-hidden="true">📅</span><span>Filtrar por período</span>';
  filterBox.appendChild(filterTitle);

  const filterForm = document.createElement("form");
  filterForm.className = "flex flex-wrap gap-2 items-end";

  const createDateInput = (id, labelText) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";
    const label = document.createElement("label");
    label.className = "text-xs font-bold text-[#3F2A14]";
    label.setAttribute("for", id);
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = id;
    input.type = "date";
    input.className = "rounded-xl border border-[#D1B38A] px-2 py-1 text-sm text-[#3F2A14] bg-[#FDF6E3] focus-ring";
    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap, input };
  };

  const { wrap: dataInicioWrap, input: dataInicioInput } = createDateInput("filter-data-inicio", "De");
  const { wrap: dataFimWrap, input: dataFimInput } = createDateInput("filter-data-fim", "Até");

  const filterBtn = document.createElement("button");
  filterBtn.type = "submit";
  filterBtn.className = "focus-ring rounded-full bg-[#16A34A] text-[#FDF6E3] px-4 py-1 text-sm font-bold hover:bg-[#15803D] transition";
  filterBtn.textContent = "Filtrar";

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "focus-ring rounded-full bg-[#D1B38A] text-[#3F2A14] px-4 py-1 text-sm font-bold hover:bg-[#C79A64] transition";
  clearBtn.textContent = "Limpar";

  filterForm.append(dataInicioWrap, dataFimWrap, filterBtn, clearBtn);
  filterBox.appendChild(filterForm);
  content.appendChild(filterBox);

  let filtroDataInicio = null;
  let filtroDataFim = null;

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    filtroDataInicio = dataInicioInput.value || null;
    filtroDataFim = dataFimInput.value || null;
    updateRelatoriosData();
  });

  clearBtn.addEventListener("click", () => {
    dataInicioInput.value = "";
    dataFimInput.value = "";
    filtroDataInicio = null;
    filtroDataFim = null;
    updateRelatoriosData();
  });

  const dataContainer = document.createElement("div");
  dataContainer.id = "relatorios-data-container";
  content.appendChild(dataContainer);

  section.appendChild(content);
  screenContainer.appendChild(section);

  function updateRelatoriosData() {
    let custos = currentRecords.filter(r => r.registro_tipo === "custo");
    let vendas = currentRecords.filter(r => r.registro_tipo === "venda");

    if (filtroDataInicio || filtroDataFim) {
      custos = custos.filter(c => {
        const data = c.data_custo || c.created_at?.slice(0, 10);
        return data && (!filtroDataInicio || data >= filtroDataInicio) && (!filtroDataFim || data <= filtroDataFim);
      });
      vendas = vendas.filter(v => {
        const data = v.created_at?.slice(0, 10);
        return data && (!filtroDataInicio || data >= filtroDataInicio) && (!filtroDataFim || data <= filtroDataFim);
      });
    }

    const totalCustos = custos.reduce((sum, r) => sum + (parseFloat(r.valor_custo) || 0), 0);
    const totalVendas = vendas.reduce((sum, r) => sum + (parseFloat(r.total_venda) || 0), 0);
    const lucro = totalVendas - totalCustos;

    dataContainer.innerHTML = "";

    const cardsRow = document.createElement("div");
    cardsRow.className = "grid grid-cols-1 md:grid-cols-3 gap-3";

    const createCard = (titulo, valor, color, icon) => {
      const card = document.createElement("div");
      card.className = `rounded-2xl px-3 py-3 flex flex-col gap-2 text-[#FDF6E3] ${color}`;
      const head = document.createElement("div");
      head.className = "flex items-center justify-between";
      const label = document.createElement("p"); label.className = "text-sm font-bold"; label.textContent = titulo;
      const iconSpan = document.createElement("span"); iconSpan.className = "text-xl"; iconSpan.textContent = icon;
      head.append(label, iconSpan);
      const val = document.createElement("p"); val.className = "text-lg font-extrabold"; val.textContent = valor;
      card.append(head, val);
      return card;
    };

    cardsRow.append(
      createCard("Total de Custos", formatCurrency(totalCustos), "bg-[#B45309]", "💸"),
      createCard("Total de Vendas", formatCurrency(totalVendas), "bg-[#16A34A]", "🧾"),
      createCard("Lucro / Prejuízo", formatCurrency(lucro), lucro >= 0 ? "bg-[#0F766E]" : "bg-[#B91C1C]", lucro >= 0 ? "📈" : "📉")
    );

    dataContainer.appendChild(cardsRow);

    const chartBox = document.createElement("div");
    chartBox.className = "mt-3 rounded-2xl bg-[#F9F0DC] border border-[#D1B38A] p-4 flex flex-col gap-3";
    const chartTitle = document.createElement("p");
    chartTitle.className = "text-base font-extrabold text-[#3F2A14] flex items-center gap-2";
    chartTitle.innerHTML = '<span aria-hidden="true">📊</span><span>Visual simples</span>';
    chartBox.appendChild(chartTitle);

    const chartArea = document.createElement("div");
    chartArea.className = "flex items-end gap-4 h-40 justify-center";
    const maxVal = Math.max(totalCustos, totalVendas, 1);

    const createBar = (label, valor, color) => {
      const wrap = document.createElement("div"); wrap.className = "flex flex-col items-center gap-1 flex-1";
      const bar = document.createElement("div"); bar.className = `w-10 md:w-16 rounded-t-xl ${color}`; bar.style.height = `${(valor / maxVal) * 100 || 5}%`;
      const valText = document.createElement("p"); valText.className = "text-xs text-[#3F2A14] font-bold"; valText.textContent = formatCurrency(valor);
      const lab = document.createElement("p"); lab.className = "text-xs text-[#3F2A14]"; lab.textContent = label;
      wrap.append(bar, valText, lab); return wrap;
    };

    chartArea.append(createBar("Custos", totalCustos, "bg-[#B45309]"), createBar("Vendas", totalVendas, "bg-[#16A34A]"));
    chartBox.appendChild(chartArea);

    const resumoText = document.createElement("p");
    resumoText.className = "text-sm text-[#3F2A14] font-bold mt-1";
    resumoText.textContent = totalCustos === 0 && totalVendas === 0 ? "Sem dados ainda. Registre custos e vendas para ver o resumo." : lucro >= 0 ? "Situação: lucro." : "Situação: prejuízo.";
    chartBox.appendChild(resumoText);
    dataContainer.appendChild(chartBox);

    const exportBox = document.createElement("div");
    exportBox.className = "mt-3 flex justify-center";
    const exportBtn = document.createElement("button");
    exportBtn.type = "button";
    exportBtn.className = "focus-ring inline-flex items-center gap-2 rounded-full bg-[#FBBF24] px-5 py-2.5 text-base font-extrabold text-[#3F2A14] shadow hover:bg-[#f59e0b] transition";
    exportBtn.innerHTML = '<span aria-hidden="true">📥</span><span>Exportar Relatório (TXT)</span>';
    exportBtn.addEventListener("click", () => {
      const periodo = filtroDataInicio || filtroDataFim ? `Período: ${filtroDataInicio || "início"} até ${filtroDataFim || "hoje"}\n` : "Período: Todos os registros\n";
      let txt = `=== RELATÓRIO AGROFÁCIL ===\n\n${periodo}Total de Custos: ${formatCurrency(totalCustos)}\nTotal de Vendas: ${formatCurrency(totalVendas)}\nLucro/Prejuízo: ${formatCurrency(lucro)}\n\n--- CUSTOS ---\n`;
      custos.forEach(c => txt += `${c.tipo_custo || "Outro"} - ${formatCurrency(c.valor_custo || 0)} - ${c.data_custo || ""}\n`);
      txt += "\n--- VENDAS ---\n"; vendas.forEach(v => txt += `${v.produto || "Produto"} - Qtd: ${v.quantidade || 0} - ${formatCurrency(v.total_venda || 0)}\n`);
      const blob = new Blob([txt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "relatorio_agrofacil.txt"; a.click(); URL.revokeObjectURL(url);
    });
    exportBox.appendChild(exportBtn);
    dataContainer.appendChild(exportBox);
  }

  updateRelatoriosData();
}
//Este trecho cria e exibe a seção de informações da tela de Configurações do app. Ele inclui três botões funcionais — Ajuda, Suporte e Sobre — que, ao serem clicados, chamam funções para abrir telas internas correspondentes. Além disso, adiciona um parágrafo explicativo informando que os botões podem ser substituídos por conteúdo real. Por fim, todos os elementos são adicionados ao container principal do app, garantindo que a tela de Configurações seja renderizada corretamente na interface do usuário.
function renderConfig() {
clearScreen();

const section = document.createElement("section");
section.className = "flex-1 flex flex-col h-full";

// Cabeçalho
const headerRow = document.createElement("div");
headerRow.className = "flex items-center justify-between px-4 pt-4 pb-2";

const title = document.createElement("h2");
title.id = "config-title";
title.className = "text-xl font-extrabold text-[#3F2A14]";
title.textContent =
(window.elementSdk && window.elementSdk.config.config_title) ||
defaultConfig.config_title;

headerRow.appendChild(title);
headerRow.appendChild(createBackButton("Voltar", "home"));
section.appendChild(headerRow);

// Conteúdo
const content = document.createElement("div");
content.className =
"flex-1 flex flex-col gap-4 px-4 pb-4 items-center justify-center";

function createConfigButton(id, text, icon) {
const btn = document.createElement("button");
btn.type = "button";
btn.id = id;
btn.className =
"focus-ring w-full max-w-xs inline-flex items-center justify-between rounded-3xl bg-[#16A34A] px-5 py-3 text-lg font-extrabold text-[#FDF6E3] shadow-lg hover:bg-[#15803D] transition";
btn.innerHTML = 
`       <span class="flex items-center gap-2">        
        <span aria-hidden="true">${icon}</span>      
        <span>${text}</span>       
        </span>
    `;
return btn;
}

const ajudaBtn = createConfigButton(
"cfg-ajuda-audio",
(window.elementSdk && window.elementSdk.config.ajuda_audio_label) ||
defaultConfig.ajuda_audio_label,
"🔊"
);

const supBtn = createConfigButton(
"cfg-suporte",
(window.elementSdk && window.elementSdk.config.suporte_label) ||
defaultConfig.suporte_label,
"🤝"
);

const sobreBtn = createConfigButton(
"cfg-sobre",
(window.elementSdk && window.elementSdk.config.sobre_label) ||
defaultConfig.sobre_label,
"ℹ️"
);

const info = document.createElement("p");
info.className = "mt-3 text-sm text-center text-[#3F2A14] max-w-xs";
info.textContent =
"Esses botões abrem telas reais no app, podendo ser substituídas por conteúdo funcional.";

content.append(ajudaBtn, supBtn, sobreBtn, info);
section.appendChild(content);
screenContainer.appendChild(section);

// FUNÇÕES QUE ABREM TELAS REAIS
ajudaBtn.addEventListener("click", () => renderAjudaScreen());
supBtn.addEventListener("click", () => renderSuporteScreen());
sobreBtn.addEventListener("click", () => renderSobreScreen());
}

// Tela Ajuda
function renderAjudaScreen() {
clearScreen();
const section = document.createElement("section");
section.className = "flex-1 flex flex-col h-full px-4 py-4";

const header = document.createElement("div");
header.className = "flex items-center justify-between pb-2";
const title = document.createElement("h2");
title.textContent = "Ajuda";
title.className = "text-xl font-extrabold text-[#3F2A14]";
header.appendChild(title);
header.appendChild(createBackButton("Voltar", "config"));
section.appendChild(header);

//Aqui vou colocar tutoriais, vídeos ou áudios de ajuda.
const content = document.createElement("div");
content.innerHTML =
"<p class='text-[#3F2A14]'>Aqui vou colocar tutoriais, vídeos ou áudios de ajuda.</p>";
section.appendChild(content);

screenContainer.appendChild(section);
}

// Tela Suporte com validação
function renderSuporteScreen() {
  clearScreen();
  const section = document.createElement("section");
  section.className = "flex-1 flex flex-col h-full px-4 py-4";

  // Cabeçalho
  const header = document.createElement("div");
  header.className = "flex items-center justify-between pb-2";
  const title = document.createElement("h2");
  title.textContent = "Suporte";
  title.className = "text-xl font-extrabold text-[#3F2A14]";
  header.appendChild(title);
  header.appendChild(createBackButton("Voltar", "config"));
  section.appendChild(header);

  // Conteúdo
  const content = document.createElement("div");
  content.innerHTML = `
    <input id="support-email" type="email" placeholder="Seu e-mail" class="mb-2 p-2 border rounded w-full" />
    <textarea id="support-message" placeholder="Sua mensagem" class="mb-2 p-2 border rounded w-full"></textarea>
  `;

  // Criar botão enviar
  const enviarBtn = document.createElement("button");
  enviarBtn.textContent = "Enviar";
  enviarBtn.className = "bg-green-600 text-white px-4 py-2 rounded";
  content.appendChild(enviarBtn);

  section.appendChild(content);
  screenContainer.appendChild(section);

  // Evento de clique do botão (aqui entra sua função de envio com fetch)
  enviarBtn.addEventListener("click", enviarMensagemSuporte);
}

// Função enviarMensagemSuporte já deve usar:
async function enviarMensagemSuporte() {
  const emailInput = document.getElementById("support-email");
  const msgInput = document.getElementById("support-message");
  const email = emailInput.value;
  const message = msgInput.value;

  if (!email || !message) {
    alert("Preencha todos os campos antes de enviar.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Digite um e-mail válido.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/send-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });

    if (response.ok) {
      alert("Mensagem enviada com sucesso!");
      renderConfig();
    } else {
      throw new Error("Erro ao enviar mensagem");
    }
  } catch (err) {
    alert("Falha no envio. Tente novamente mais tarde.");
    console.error(err);
  }

// Tela Sobre
function renderSobreScreen() {
clearScreen();
const section = document.createElement("section");
section.className = "flex-1 flex flex-col h-full px-4 py-4";

const header = document.createElement("div");
header.className = "flex items-center justify-between pb-2";
const title = document.createElement("h2");
title.textContent = "Sobre";
title.className = "text-xl font-extrabold text-[#3F2A14]";
header.appendChild(title);
header.appendChild(createBackButton("Voltar", "config"));
section.appendChild(header);

const content = document.createElement("div");
content.className = "text-[#3F2A14] flex flex-col gap-2";

content.innerHTML = `
  <p><strong>Nome do App:</strong> AgroFácil</p>
  <p><strong>Versão:</strong> 1.0.0</p>
  <p><strong>Desenvolvedora:</strong> Raymora Katielle de Almeida Silva</p>
  <p><strong>Contato:</strong> Raymorakatielly@gmail.com</p>
  <p><strong>Descrição:</strong> Este app ajuda agricultores a gerenciar suas atividades de forma digital, com controle de vendas, estoque e suporte técnico.</p>
`;
section.appendChild(content);
screenContainer.appendChild(section);
}
}