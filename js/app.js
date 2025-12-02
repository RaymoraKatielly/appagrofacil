// ==========================================================
//  APP.JS FINAL — COM TODAS AS FUNÇÕES INTEGRADAS
// ==========================================================

import { supabase } from './supabaseClient.js';

/* ---------------------------
   SVGs
--------------------------- */
const iconProdutos = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-13z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>`;
const iconVendas = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4"/><path d="M12 4v4m0 8v4"/></svg>`;
const iconCustos = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-5"/></svg>`;
const iconRelatorios = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3h18v18H3z"/><path d="M7 17v-5m5 5v-8m5 8v-3"/></svg>`;

/* ---------------------------
   LocalStorage helpers
--------------------------- */
const storageKeys = {
  PRODUTOS: "agrofacil_produtos",
  VENDAS: "agrofacil_vendas",
  CUSTOS: "agrofacil_custos",
  CONFIG: "agrofacil_config",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("Erro ao carregar:", key, e);
    return fallback;
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao salvar:", key, e);
  }
}

/* ---------------------------
   Estado global
--------------------------- */
let products = load(storageKeys.PRODUTOS, []);
let vendas = load(storageKeys.VENDAS, []);
let custos = load(storageKeys.CUSTOS, []);
let config = load(storageKeys.CONFIG, { autoSync: true });

let currentScreen = "home";
let screenContainer = null;

/* ---------------------------
   Supabase LOAD (corrigido)
--------------------------- */
async function loadProductsFromSupabase() {
  try {
    const { data, error } = await supabase.from('produto').select('*');
    if (error) throw error;
    if (data) {
      products = data.map(p => ({
        id: p.id,
        nome: p.nome,
        preco: p.preco,
        synced: true
      }));
      save(storageKeys.PRODUTOS, products);
    }
  } catch (err) {
    console.warn("Falha ao carregar produtos do Supabase.");
  }
}

/* ---------------------------
   Sincronização
--------------------------- */
async function syncPendingData() {
  for (const p of products.filter(x => !x.synced)) {
    try {
      await supabase.from("produto").insert([p]);
      p.synced = true;
    } catch {}
  }
  save(storageKeys.PRODUTOS, products);
}

window.addEventListener("online", () => {
  if (config.autoSync) syncPendingData();
});

/* ---------------------------
   UI helpers
--------------------------- */
function clearScreen() {
  if (!screenContainer) return;
  screenContainer.innerHTML = "";
}

function createBackButton(text = "Voltar", target = "home") {
  const btn = document.createElement("button");
  btn.className = "focus-ring rounded-full bg-[#D1B38A] px-3 py-1 text-sm font-bold text-[#3F2A14]";
  btn.textContent = text;
  btn.onclick = () => navigateTo(target);
  return btn;
}

/* ---------------------------
   Navegação
--------------------------- */
function navigateTo(screenKey) {
  currentScreen = screenKey;
  switch (screenKey) {
    case "home": renderHome(); break;
    case "produtos": renderProdutos(); break;
    case "custos": renderCustos(); break;
    case "vendas": renderVendas(); break;
    case "relatorios": renderRelatorios(); break;
    case "config": renderConfig(); break;
    default: renderHome();
  }
}

/* ---------------------------
   HOME
--------------------------- */
function renderHome() {
  clearScreen();

  const t = document.createElement("div");
  t.className = "flex flex-col items-center gap-4 p-6";

  t.innerHTML = `
    <button onclick="navigateTo('produtos')" class="btn-home">${iconProdutos} Produtos</button>
    <button onclick="navigateTo('vendas')" class="btn-home">${iconVendas} Vendas</button>
    <button onclick="navigateTo('custos')" class="btn-home">${iconCustos} Custos</button>
    <button onclick="navigateTo('relatorios')" class="btn-home">${iconRelatorios} Relatórios</button>
    <button onclick="navigateTo('config')" class="btn-home">⚙️ Configurações</button>
  `;

  screenContainer.appendChild(t);
}

/* ---------------------------
   PRODUTOS (corrigido sem lista carregada indevida)
--------------------------- */
function renderProdutos() {
  clearScreen();

  const section = document.createElement("section");
  section.className = "flex-1 flex flex-col h-full overflow-auto px-4 py-4";

  const header = document.createElement("div");
  header.className = "flex items-center justify-between pb-2";

  const title = document.createElement("h2");
  title.className = "text-xl font-extrabold text-[#3F2A14]";
  title.textContent = "Produtos";

  header.append(title, createBackButton());
  section.appendChild(header);

  const subtitle = document.createElement("p");
  subtitle.className = "text-[#5C4A32] mb-3";
  subtitle.textContent = "Gerencie seus produtos cadastrados.";

  section.appendChild(subtitle);

  const form = document.createElement("div");
  form.className = "flex gap-2";
  form.innerHTML = `
    <input id="prod-name" placeholder="Nome" class="border p-2 rounded w-1/2" />
    <input id="prod-price" placeholder="Preço" type="number" class="border p-2 rounded w-1/3" />
    <button id="btn-add-prod" class="bg-green-700 text-white px-4 rounded">+</button>
  `;
  section.appendChild(form);

  const list = document.createElement("div");
  list.id = "product-list";
  list.className = "mt-4 flex flex-col gap-2";
  section.appendChild(list);

  screenContainer.appendChild(section);

  // renderiza lista
  renderProductList();

  document.getElementById("btn-add-prod").onclick = () => {
    const nome = document.getElementById("prod-name").value.trim();
    const preco = Number(document.getElementById("prod-price").value.trim());
    if (!nome || !preco) return alert("Preencha nome e preço.");

    const item = {
      id: Date.now(),
      nome,
      preco,
      synced: false
    };

    products.push(item);
    save(storageKeys.PRODUTOS, products);
    renderProductList();
  };
}

function renderProductList() {
  const list = document.getElementById("product-list");
  if (!list) return;
  list.innerHTML = "";

  for (const p of products) {
    const row = document.createElement("div");
    row.className = "p-3 border rounded flex justify-between";
    row.innerHTML = `
      <span><b>${p.nome}</b> — ${p.preco.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
      <button class="text-red-600 font-bold">X</button>
    `;

    row.querySelector("button").onclick = () => {
      products = products.filter(x => x.id !== p.id);
      save(storageKeys.PRODUTOS, products);
      renderProductList();
    };

    list.appendChild(row);
  }
}

/* ---------------------------
   CUSTOS (placeholder)
--------------------------- */
function renderCustos() {
  clearScreen();
  const d = document.createElement("div");
  d.textContent = "Tela de Custos";
  screenContainer.appendChild(d);
}

/* ---------------------------
   VENDAS (placeholder)
--------------------------- */
function renderVendas() {
  clearScreen();
  const d = document.createElement("div");
  d.textContent = "Tela de Vendas";
  screenContainer.appendChild(d);
}

/* ---------------------------
   RELATÓRIOS (placeholder)
--------------------------- */
function renderRelatorios() {
  clearScreen();
  const d = document.createElement("div");
  d.textContent = "Tela de Relatórios";
  screenContainer.appendChild(d);
}

/* ---------------------------
   CONFIG (placeholder)
--------------------------- */
function renderConfig() {
  clearScreen();
  const d = document.createElement("div");
  d.textContent = "Configurações";
  screenContainer.appendChild(d);
}

/* ---------------------------
   Inicialização
--------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  screenContainer = document.getElementById("screen-container");

  await loadProductsFromSupabase();

  navigateTo("home");
});
