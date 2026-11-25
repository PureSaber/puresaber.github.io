const main = document.querySelector("#main");
const navigation = JSON.parse(main.dataset.navigation);
const search = document.querySelector("#catalog-search");
const query = document.querySelector("#catalog-query");
const clear = document.querySelector("#clear-search");
const status = document.querySelector("#search-status");
const results = document.querySelector("#search-results");
const routes = new Map();
const catalogs = new Map();
const normalize = (value) => value.normalize("NFKC").toLowerCase();
const plainText = (value) => value.replace(/<\/?code>/g, "");
let indexRequest;

for (const [id, catalog] of Object.entries(navigation)) {
  const url = document.getElementById(id + "-entry").href;
  catalogs.set(id, { ...catalog, url });
  routes.set(id, url);
  for (const [categoryId, category] of Object.entries(catalog.categories)) {
    routes.set(categoryId, url);
    for (const groupId of Object.keys(category.groups)) routes.set(groupId, url);
  }
}
routes.set("extensions", catalogs.get("tools").url);

function followLegacyLink() {
  const anchor = location.hash.slice(1);
  const route = routes.get(anchor.replace(/-title$/, ""));
  if (route) {
    const target = new URL(route);
    target.hash = anchor;
    location.replace(target);
  }
}

function toResult(entry, catalog, category, group, anchor, parentName = "") {
  const target = new URL(catalog.url);
  target.hash = anchor;
  const label = catalog.title + " · " + group;
  const summary = plainText(entry.summary);
  const keywords = normalize([
    label, category.title, parentName, plainText(entry.name), entry.alias, summary, entry.type, entry.url,
    entry.docs?.label, entry.usage?.example, ...(entry.integrations ?? []).map(integration => integration.host),
  ].join(" "));
  return { entry, label, target, summary, keywords };
}

async function loadIndex() {
  const response = await fetch(main.dataset.index);
  if (!response.ok) throw new Error("Unable to load catalog index");
  const data = await response.json();
  const entries = [];
  for (const catalog of catalogs.values()) {
    for (const category of Object.values(catalog.categories)) {
      for (const [groupId, group] of Object.entries(category.groups)) {
        for (const entry of data[groupId]) {
          entries.push(toResult(entry, catalog, category, group, entry.anchor ? `tool-${entry.anchor}` : groupId));
          for (const extension of entry.extensions ?? []) {
            entries.push(toResult(extension, catalog, category, group, "extensions", entry.name));
          }
        }
      }
    }
  }
  return entries;
}

function resultCard({ entry, label, target, summary }) {
  const card = document.createElement("li");
  const title = document.createElement("h3");
  title.className = "card-title-with-icon";
  if (entry.icon || entry.icon_url) {
    const icon = document.createElement("img");
    icon.className = "tool-icon";
    icon.addEventListener("error", () => { icon.remove(); }, { once: true });
    icon.src = entry.icon_url || main.dataset.iconBase + entry.icon;
    icon.alt = "";
    icon.width = 20;
    icon.height = 20;
    icon.loading = "lazy";
    title.append(icon);
  }
  const link = document.createElement("a");
  link.href = entry.url;
  link.textContent = plainText(entry.name);
  title.append(link);

  const description = document.createElement("p");
  description.textContent = summary;
  const details = document.createElement("div");
  details.className = "card-details";
  const categoryLink = document.createElement("a");
  categoryLink.href = target;
  categoryLink.textContent = label;
  details.append(categoryLink);
  card.append(title, description, details);
  return card;
}

async function searchCatalog() {
  const value = query.value;
  const terms = normalize(value).trim().split(/\s+/).filter(Boolean);
  const phrase = terms.join(" ");
  clear.hidden = value === "";
  results.replaceChildren();
  results.hidden = true;
  status.textContent = "";
  if (terms.length === 0) return;

  status.textContent = "正在搜索…";
  try {
    indexRequest ??= loadIndex().catch((error) => {
      indexRequest = undefined;
      throw error;
    });
    const entries = await indexRequest;
    if (query.value !== value) return;
    const rank = ({ entry }) => {
      const name = normalize(plainText(entry.name));
      if (name === phrase) return 0;
      return name.startsWith(phrase) ? 1 : 2;
    };
    const matches = entries.filter(({ keywords }) => terms.every((term) => keywords.includes(term)));
    matches.sort((a, b) => rank(a) - rank(b));
    results.replaceChildren(...matches.map(resultCard));
    results.hidden = matches.length === 0;
    status.textContent = matches.length ? `找到 ${matches.length} 项` : "没有匹配的条目";
  } catch {
    if (query.value === value) status.textContent = "搜索暂时不可用，可以直接打开相应目录。";
  }
}

query.addEventListener("input", searchCatalog);
clear.addEventListener("click", () => {
  query.value = "";
  searchCatalog();
  query.focus();
});
window.addEventListener("hashchange", followLegacyLink);
followLegacyLink();
search.hidden = false;
searchCatalog();
