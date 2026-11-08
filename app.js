"use strict";
/* Guida Claude — PWA. I contenuti stanno in data.json, aggiornato ogni settimana. */

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = d => new Date(d + "T12:00:00").toLocaleDateString("it-IT", {day:"numeric", month:"long", year:"numeric"});
const recent = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const norm = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const VIEWS = {
  skill:      {title:"Skill",      search:"Cerca una skill o un'attività…"},
  connettori: {title:"Connettori", search:"Cerca un'app o un servizio…"},
  novita:     {title:"Novità",     search:"Cerca nelle novità…"},
  perte:      {title:"Per te",     search:"Cerca nei suggerimenti…"},
  guida:      {title:"Guida",      search:"Cerca un concetto…"}
};
const state = {view:"skill", q:"", cat:{skill:"Tutte", connettori:"I miei"}};
let DATA = null;

/* ---------- dati ---------- */
async function load(){
  try{
    const r = await fetch("data.json", {cache:"no-cache"});
    DATA = await r.json();
  }catch(e){
    $("#main").innerHTML = `<div class="empty">Impossibile caricare i dati. Riprova quando sei online.</div>`;
    return;
  }
  render();
}

/* ---------- render ---------- */
function render(){
  if(!DATA) return;
  const v = state.view, q = norm(state.q);
  $("#h1").textContent = VIEWS[v].title;
  $("#q").placeholder = VIEWS[v].search;
  document.querySelectorAll(".tabbar a").forEach(a => a.classList.toggle("on", a.dataset.v === v));
  ({skill:renderSkills, connettori:renderConnectors, novita:renderNews, perte:renderForYou, guida:renderGuide})[v](q);
}

function chips(list, key){
  const cur = state.cat[key];
  $("#chips").innerHTML = list.map(c => `<button class="chip${c===cur?" on":""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  $("#chips").onclick = e => {
    const b = e.target.closest(".chip"); if(!b) return;
    state.cat[key] = b.dataset.c; render(); scrollTo({top:0});
  };
}

function grouped(items, keyOf, cardOf){
  if(!items.length) return `<div class="empty">Nessun risultato.</div>`;
  const g = {};
  items.forEach(i => (g[keyOf(i)] ||= []).push(i));
  return Object.entries(g).map(([k, arr]) => `<h2>${esc(k)} · ${arr.length}</h2>${arr.map(cardOf).join("")}`).join("");
}

function renderSkills(q){
  const cats = ["Tutte", ...new Set(DATA.skills.map(s => s.cat))];
  chips(cats, "skill");
  const cat = state.cat.skill;
  const items = DATA.skills.filter(s => (cat==="Tutte" || s.cat===cat) &&
    (!q || norm([s.id, s.desc, s.when, s.cat].join(" ")).includes(q)));
  $("#main").innerHTML = `<p class="count">${items.length} di ${DATA.skills.length} skill</p>` +
    grouped(items, s => s.cat, s => `
      <div class="card">
        <h3><code>${esc(s.id)}</code>${s.slash?'<span class="badge acc">/comando</span>':""}${s.added && s.added>=recent()?'<span class="badge ok">nuova</span>':""}</h3>
        <p>${esc(s.desc)}</p>
        <div class="when"><b>Quando:</b> ${esc(s.when)}</div>
      </div>`) + footer();
}

function statusBadge(s){
  if(s === "attivo" || s === "sempre attivo") return `<span class="badge ok">${esc(s)}</span>`;
  if(s === "disponibile") return `<span class="badge">disponibile</span>`;
  return `<span class="badge warn">${esc(s)}</span>`;
}

function renderConnectors(q){
  const mine = c => c.status !== "disponibile";
  const cats = ["I miei", "Tutti", ...new Set(DATA.connectors.map(c => c.cat))];
  chips(cats, "connettori");
  const cat = state.cat.connettori;
  const items = DATA.connectors.filter(c =>
    (cat==="Tutti" || (cat==="I miei" ? mine(c) : c.cat===cat)) &&
    (!q || norm([c.name, c.desc, c.cat].join(" ")).includes(q)));
  const nMine = DATA.connectors.filter(mine).length;
  $("#main").innerHTML =
    `<p class="count">${items.length} connettori mostrati · ${nMine} tuoi · ${DATA.connectors.length} in tutto</p>` +
    (cat==="I miei" && !q ? `<div class="note">Questi sono i connettori che hai collegato più quelli integrati in Claude. Tocca <b>Tutti</b> o una categoria per vedere il catalogo; si collegano da Impostazioni → Connettori.</div>` : "") +
    grouped(items, c => c.cat, c => `
      <div class="card">
        <h3>${esc(c.name)}${statusBadge(c.status)}${c.noLogin && c.cat!=="Integrati in Claude"?'<span class="badge">senza login</span>':""}${c.added && c.added>=recent()?'<span class="badge ok">nuovo</span>':""}</h3>
        <p>${esc(c.desc)}</p>
        ${c.when?`<div class="when"><b>Quando:</b> ${esc(c.when)}</div>`:""}
      </div>`) +
    `<div class="note">Il catalogo completo è su claude.ai, in Impostazioni → Connettori: qui c'è una selezione dei principali per categoria.</div>` + footer();
}

function renderNews(q){
  $("#chips").innerHTML = "";
  const items = DATA.news.slice().sort((a,b) => b.date.localeCompare(a.date))
    .filter(n => !q || norm(n.title + " " + n.text).includes(q));
  $("#main").innerHTML = (items.length ? items.map(n => `
    <div class="card">
      <div class="date">${fmt(n.date)}</div>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.text)}</p>
      ${n.url?`<p><a href="${esc(n.url)}" target="_blank" rel="noopener">Leggi la fonte</a></p>`:""}
    </div>`).join("") : `<div class="empty">Nessuna novità.</div>`) + footer();
}

function renderForYou(q){
  $("#chips").innerHTML = "";
  const items = DATA.suggestions.filter(s => !q || norm(s.name + " " + s.why + " " + s.how).includes(q));
  $("#main").innerHTML = `<div class="note">${esc(DATA.suggestionsNote)}</div>` +
    (items.length ? items.map(s => `
      <div class="card"><h3>${esc(s.name)}</h3><p>${esc(s.why)}</p><div class="when"><b>Come:</b> ${esc(s.how)}</div></div>`).join("")
      : `<div class="empty">Nessun suggerimento.</div>`) + footer();
}

function renderGuide(q){
  $("#chips").innerHTML = "";
  const items = (DATA.guide || []).filter(g => !q || norm(g.t + " " + g.b).includes(q));
  $("#main").innerHTML = items.map(g => `<div class="card"><h3>${esc(g.t)}</h3><p>${esc(g.b)}</p></div>`).join("") + footer();
}

function footer(){
  return `<footer>Aggiornata il ${fmt(DATA.updated)} · ${DATA.skills.length} skill · ${DATA.connectors.length} connettori</footer>`;
}

/* ---------- navigazione ---------- */
function fromHash(){
  const v = location.hash.slice(1);
  state.view = VIEWS[v] ? v : "skill";
  state.q = ""; $("#q").value = "";
  render(); scrollTo({top:0});
}
addEventListener("hashchange", fromHash);
$("#q").addEventListener("input", e => { state.q = e.target.value; render(); });

/* ---------- installazione ---------- */
let deferred = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; $("#install").hidden = false; });
$("#install").addEventListener("click", async () => {
  if(deferred){ deferred.prompt(); await deferred.userChoice; deferred = null; $("#install").hidden = true; }
  else toast("Su iPhone: tocca Condividi e poi \"Aggiungi alla schermata Home\".");
});
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
if(!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) $("#install").hidden = false;

function toast(msg, action, fn){
  const t = $("#toast");
  t.innerHTML = `<span>${esc(msg)}</span>${action?`<button>${esc(action)}</button>`:""}`;
  t.hidden = false;
  if(action) t.querySelector("button").onclick = fn;
  else setTimeout(() => t.hidden = true, 5000);
}

/* ---------- service worker ---------- */
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").then(reg => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      nw.addEventListener("statechange", () => {
        if(nw.state === "installed" && navigator.serviceWorker.controller)
          toast("Nuova versione disponibile.", "Aggiorna", () => { nw.postMessage("skipWaiting"); });
      });
    });
  });
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if(!reloading){ reloading = true; location.reload(); } });
  navigator.serviceWorker.addEventListener("message", e => {
    if(e.data === "data-updated") load().then(() => toast("Contenuti aggiornati."));
  });
}

fromHash();
load();
