/* nutri.js — filtros de dieta (celíacos, alergias), calorías e información nutricional del catálogo.
   Incluye la opción de ocultar las calorías para quien prefiera no verlas. */
(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var store = {
  get: function (k, d) { try { var v = localStorage.getItem("dn." + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem("dn." + k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
};

/* a: alérgenos · v: vegetariano · n: [kcal, proteínas, hidratos, azúcares, grasas, saturadas, sal] · por: a qué se refieren */
var P = {
  tarta: { a: ["gluten", "huevo", "lacteos", "soja"], v: 1, n: [390, 5, 48, 34, 20, 11, 0.4], por: "por ración (110 g)" },
  tartaqueso: { a: ["gluten", "huevo", "lacteos"], v: 1, n: [400, 8, 30, 22, 28, 16, 0.6], por: "por ración (120 g)" },
  cheesecake: { a: ["gluten", "huevo", "lacteos"], v: 1, n: [380, 7, 34, 26, 24, 14, 0.5], por: "por ración (120 g)" },
  cupcake: { a: ["gluten", "huevo", "lacteos", "soja"], v: 1, n: [330, 3, 44, 32, 16, 9, 0.3], por: "por unidad (80 g)" },
  macaron: { a: ["frutos", "huevo", "lacteos"], v: 1, n: [70, 1.5, 9, 8.5, 3, 0.6, 0.02], por: "por unidad (15 g)" },
  eclair: { a: ["gluten", "huevo", "lacteos"], v: 1, n: [260, 5, 28, 16, 14, 8, 0.2], por: "por unidad (90 g)" },
  galleta: { a: ["gluten", "huevo", "lacteos"], v: 1, n: [180, 2, 28, 16, 7, 4.5, 0.15], por: "por unidad (40 g)" },
  croissant_d: { a: ["gluten", "huevo", "lacteos", "soja"], v: 1, n: [410, 7, 44, 16, 23, 14, 0.8], por: "por unidad (100 g)" }
};
var AL = { gluten: "Gluten", huevo: "Huevo", lacteos: "Lácteos", frutos: "Frutos secos", soja: "Soja" };
var F = [["gluten", "Sin gluten · celíacos"], ["lacteos", "Sin lactosa"], ["huevo", "Sin huevo"], ["frutos", "Sin frutos secos"], ["soja", "Sin soja"], ["vegano", "Vegano"]];

var grid = $("#cat-grid"); if (!grid) { return; }
var S = { f: store.get("diet", {}), hide: store.get("hideKcal", false) };

var css = document.createElement("style");
css.textContent = ".diet{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .9rem;margin:-.6rem 0 1.4rem}" +
  ".diet .lb{font-size:.85rem;font-weight:700;color:var(--mute)}.diet .ch{display:flex;flex-wrap:wrap;gap:.4rem}" +
  ".diet button.c{min-height:36px;padding:.35rem .85rem;border-radius:999px;border:1px solid var(--line2);background:transparent;font-weight:600;font-size:.84rem;color:inherit}" +
  ".diet button.c[aria-pressed=true]{background:var(--brand);border-color:var(--brand);color:var(--on-brand)}" +
  ".diet .clr{background:none;border:0;text-decoration:underline;font-size:.84rem;color:var(--mute);padding:.3rem}" +
  ".diet label{display:flex;align-items:center;gap:.45rem;font-size:.84rem;color:var(--mute);margin-left:auto;cursor:pointer}.diet label input{width:18px;height:18px;accent-color:var(--brand)}" +
  ".pc.diet-out{display:none}.pc .nb{display:flex;flex-wrap:wrap;gap:.3rem;margin:.55rem 0 .1rem}" +
  ".pc .nb span{font-size:.72rem;font-weight:700;padding:.2rem .55rem;border-radius:999px;background:var(--chip)}.pc .nb .al{opacity:.8;font-weight:600}" +
  ".pc details.ni{margin:.35rem 0 .2rem;font-size:.82rem}.pc details.ni summary{cursor:pointer;font-weight:700;color:var(--brand2,var(--brand))}" +
  ".pc .ni table{width:100%;border-collapse:collapse;margin-top:.4rem}.pc .ni th,.pc .ni td{padding:.25rem .1rem;border-bottom:1px solid var(--line);text-align:left;font-weight:500}" +
  ".pc .ni td{text-align:right;font-weight:700}.pc .ni tr.s th{padding-left:.9rem;color:var(--mute)}.pc .ni tr.p th,.pc .ni tr.p td{color:var(--mute);border:0;font-weight:500}" +
  ".dnone{grid-column:1/-1;text-align:center;color:var(--mute);padding:1.5rem}.dnote{font-size:.85rem;color:var(--mute);margin:1rem 0 0}" +
  ".no-kcal .kc{display:none!important}";
document.head.appendChild(css);

var g1 = function (v) { return String(Math.round(v * 10) / 10).replace(".", ",") + " g"; };
$$(".pc", grid).forEach(function (pc) {
  var d = P[pc.dataset.id]; if (!d) { return; }
  var tags = [];
  if (d.a.indexOf("gluten") < 0) { tags.push("<span>Sin gluten</span>"); }
  if (d.v) { tags.push("<span>Vegetariano</span>"); }
  tags.push("<span class=\"kc\">" + d.n[0] + " kcal</span>");
  var al = "<span class=\"al\">Alérgenos: " + d.a.map(function (a) { return AL[a]; }).join(", ") + "</span>";
  var rows = [["Energía", d.n[0] + " kcal", "kc"], ["Proteínas", g1(d.n[1])], ["Hidratos de carbono", g1(d.n[2])], ["de los cuales azúcares", g1(d.n[3]), "s"], ["Grasas", g1(d.n[4])], ["de las cuales saturadas", g1(d.n[5]), "s"], ["Sal", g1(d.n[6])]];
  var box = document.createElement("div");
  box.innerHTML = "<div class=\"nb\">" + tags.join("") + al + "</div><details class=\"ni\"><summary>Información nutricional</summary><table><tbody>" +
    rows.map(function (r) { return "<tr" + (r[2] ? " class=\"" + r[2] + "\"" : "") + "><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("") +
    "<tr class=\"p\"><th>Valores aproximados</th><td>" + d.por + "</td></tr></tbody></table></details>";
  var bt = $(".bt", pc);
  while (box.firstChild) { pc.insertBefore(box.firstChild, bt); }
});

var bar = document.createElement("div"); bar.className = "diet";
bar.innerHTML = "<span class=\"lb\">Filtra según tu dieta</span><div class=\"ch\">" + F.map(function (f) { return "<button class=\"c\" type=\"button\" data-f=\"" + f[0] + "\">" + f[1] + "</button>"; }).join("") +
  "</div><button class=\"clr\" type=\"button\" hidden>Quitar filtros</button><label><input type=\"checkbox\" id=\"kcalHide\"> Ocultar calorías</label>";
grid.parentNode.insertBefore(bar, grid);
var none = document.createElement("p"); none.className = "dnone"; none.hidden = true;
none.textContent = "Ahora mismo no hay productos del catálogo con estos filtros, pero hacemos tartas sin gluten, sin lactosa y veganas por encargo: escríbenos y te la preparamos.";
grid.appendChild(none);
var note = document.createElement("p"); note.className = "dnote";
note.textContent = "Si eres celíaco o tienes alguna alergia o intolerancia, avísanos al hacer el pedido: lo elaboramos aparte. Los valores nutricionales son aproximados.";
grid.parentNode.insertBefore(note, grid.nextSibling);

function fits(d) {
  if (!d) { return true; }
  for (var k in S.f) { if (S.f[k]) { if (k === "vegano") { return false; } if (d.a.indexOf(k) > -1) { return false; } } }
  return true;
}
function apply() {
  $$("button.c", bar).forEach(function (b) { b.setAttribute("aria-pressed", String(!!S.f[b.dataset.f])); });
  $(".clr", bar).hidden = !Object.keys(S.f).some(function (k) { return S.f[k]; });
  $("#kcalHide").checked = S.hide;
  document.documentElement.classList.toggle("no-kcal", S.hide);
  var any = false;
  $$(".pc", grid).forEach(function (pc) { var ok = fits(P[pc.dataset.id]); pc.classList.toggle("diet-out", !ok); if (ok && !pc.hidden) { any = true; } });
  none.hidden = any;
  if (window.ScrollTrigger) { window.ScrollTrigger.refresh(); }
}
bar.addEventListener("click", function (e) {
  var b = e.target.closest("button.c");
  if (b) { S.f[b.dataset.f] = !S.f[b.dataset.f]; store.set("diet", S.f); apply(); }
  if (e.target.closest(".clr")) { S.f = {}; store.set("diet", S.f); apply(); }
});
$("#kcalHide").addEventListener("change", function () { S.hide = this.checked; store.set("hideKcal", S.hide); apply(); });
// las pestañas de categoría también cambian lo que se ve
$$(".tab").forEach(function (t) { t.addEventListener("click", function () { setTimeout(apply, 0); }); });
apply();
})();
