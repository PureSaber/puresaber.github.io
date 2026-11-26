const search = document.querySelector("#catalog-search");
const query = document.querySelector("#catalog-query");
const clear = document.querySelector("#clear-search");
const platformSelect = document.querySelector("#tool-platform");
const status = document.querySelector("#search-status");
const componentKind = document.querySelector("#component-kind");
const componentEcosystem = document.querySelector("#component-ecosystem");
const componentFunction = document.querySelector("#component-function");

// Build filters from the server-rendered component inventory. No duplicate item definitions.
function initializeComponentFilters() {
  const cards = Array.from(document.querySelectorAll("#components .resources > li[data-kind]"));
  const controls = [
    [componentKind, "kind", { library: "软件库", framework: "框架", plugin: "插件", sdk: "SDK", runtime: "运行时", tool: "辅助工具" }],
    [componentEcosystem, "ecosystems", null],
    [componentFunction, "functions", null],
    [platformSelect, "hosts", null],
  ];
  for (const [select, attribute, labels] of controls) {
    if (!select) continue;
    const values = new Set();
    for (const card of cards) {
      for (const value of (card.dataset[attribute] || "").split("|")) {
        if (value) values.add(value);
      }
    }
    for (const value of [...values].sort((a, b) => a.localeCompare(b, "zh-CN"))) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = labels?.[value] || value;
      select.append(option);
    }
  }
  const params = new URLSearchParams(location.search);
  for (const [key, control] of [["host", platformSelect], ["kind", componentKind], ["ecosystem", componentEcosystem], ["function", componentFunction]]) {
    const value = params.get(key);
    if (value && control && Array.from(control.options).some(option => option.value === value)) control.value = value;
  }
}
// Populated after the relationship index loads, so ecosystem options stay canonical.
const normalize = (text) => text.normalize("NFKC").toLowerCase();
let filtering = false;

// Families are separate presentation containers; placement is not a product hierarchy.
function groupProductFamilies() {
  const all = Array.from(document.querySelectorAll("#tools .resources > li[data-family]"));
  const families = new Map();
  for (const card of all) {
    if (!families.has(card.dataset.family)) families.set(card.dataset.family, []);
    families.get(card.dataset.family).push(card);
  }
  for (const [id, products] of families) {
    if (products.length < 2) continue;
    const placement = products.find(card => card.id === "tool-" + card.dataset.familyPlacement);
    if (!placement) continue;
    const familyName = placement.dataset.familyTitle;
    if (!familyName) continue;
    const homeGroup = placement.closest(".catalog-group");
    const wrapper = document.createElement("li");
    wrapper.id = "family-" + id;
    wrapper.className = "family-ecosystem";
    const details = document.createElement("details");
    details.className = "product-family";
    details.open = true;
    const summary = document.createElement("summary");
    summary.className = "family-heading";
    const title = document.createElement("span");
    title.className = "family-title";
    const icon = placement.querySelector("h5 img")?.cloneNode(true);
    if (icon) title.append(icon);
    title.append(document.createTextNode(familyName));
    const count = document.createElement("span");
    count.className = "family-count";
    count.textContent = products.length + (placement.dataset.familyKind === "ecosystem" ? " 个生态条目" : " 个产品");
    summary.append(title, count);
    const list = document.createElement("ul");
    list.className = "family-members";
    details.append(summary, list);
    wrapper.append(details);
    placement.before(wrapper);
    for (const product of [placement, ...products.filter(card => card !== placement)]) {
      const group = product.closest(".catalog-group");
      const category = product.closest(".catalog-category");
      product.dataset.originalLabels = category.querySelector("h3").textContent + " " + group.querySelector("h4").textContent;
      if (group !== homeGroup) {
        const shortcut = document.createElement("li");
        shortcut.className = "family-shortcut";
        shortcut.dataset.target = product.id;
        const source = product.querySelector(".catalog-card-heading h5");
        const link = document.createElement("a");
        link.href = "#" + product.id;
        const productIcon = source.querySelector("img")?.cloneNode(true);
        if (productIcon) link.append(productIcon);
        const name = document.createElement("span");
        name.textContent = source.textContent.trim();
        link.append(name);
        link.className = "card-title-with-icon";
        const note = document.createElement("p");
        note.textContent = "查看 " + familyName + (placement.dataset.familyKind === "ecosystem" ? " 工具生态" : " 产品家族");
        shortcut.append(link, note);
        product.before(shortcut);
      }
      list.append(product);
    }
  }
}
groupProductFamilies();
const familyRecords = new Map();


/*
 * One canonical entity catalog + one typed many-to-many relation table.
 * Render direct links in both directions, then derive related items through
 * common ecosystem/vendor nodes without claiming ownership or compatibility.
 */
async function installEntityNetwork() {
  const main = document.querySelector("main[data-entity-index]");
  if (!main) return;
  const response = await fetch(main.dataset.entityIndex);
  if (!response.ok) throw new Error("Entity index unavailable");
  const data = await response.json();
  const catalog = data.catalog ?? {};
  const components = data.components ?? {};
  const nodes = data.nodes ?? {};
  const families = data.families ?? {};
  const relations = [...(data.relations ?? [])];
  const items = new Map();
  const componentIds = new Set();
  const pageByGroup = new Map();
  const plain = value => String(value || "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&");
  for (const [page, nav] of Object.entries(data.navigation ?? {})) {
    if (page === "components") continue;
    for (const category of Object.values(nav.categories ?? {})) {
      for (const group of Object.keys(category.groups ?? {})) pageByGroup.set(group, page);
    }
  }
  for (const [group, entries] of Object.entries(catalog)) {
    for (const entry of entries || []) {
      if (entry.entity_id) items.set(entry.entity_id, { ...entry, source_group: group });
    }
  }
  for (const entries of Object.values(components)) {
    for (const component of entries || []) componentIds.add(component.id);
  }

  // Host-installation URLs remain attached to the plugin record; derive
  // host relations from that existing source, rather than copying them.
  const byName = new Map([...items.values()].map(item => [plain(item.name), item.entity_id]));
  for (const item of items.values()) {
    for (const integration of item.integrations || []) {
      const hostId = byName.get(integration.host);
      if (hostId) relations.push({
        from: item.entity_id, to: hostId, type: "extends",
        source_url: integration.url
      });
    }
  }

  const membersByNode = new Map();
  const incomingById = new Map();
  const outgoingById = new Map();
  for (const relation of relations) {
    if (!outgoingById.has(relation.from)) outgoingById.set(relation.from, []);
    outgoingById.get(relation.from).push(relation);
    if (items.has(relation.to)) {
      if (!incomingById.has(relation.to)) incomingById.set(relation.to, []);
      incomingById.get(relation.to).push(relation);
    }
    if (nodes[relation.to] || relation.to?.startsWith("family-")) {
      if (!membersByNode.has(relation.to)) membersByNode.set(relation.to, new Set());
      membersByNode.get(relation.to).add(relation.from);
    }
  }
  const labelOf = id => {
    if (items.has(id)) return plain(items.get(id).name);
    if (nodes[id]) return nodes[id].label;
    if (id?.startsWith("family-")) return families[id.slice(7)]?.title || id;
    return id;
  };
  const linkOf = id => {
    const item = items.get(id);
    if (!item) {
      if (nodes[id]?.related_entity) return linkOf(nodes[id].related_entity);
      return nodes[id]?.url || null;
    }
    if (componentIds.has(id)) return main.dataset.componentsRoot + "#component-" + encodeURIComponent(id);
    const page = pageByGroup.get(item.source_group) || "tools";
    const base = page === "resources" ? main.dataset.resourcesRoot : main.dataset.toolsRoot;
    return base + "#tool-" + encodeURIComponent(item.anchor || item.entity_id);
  };
  const typeLabels = {
    depends_on: "依赖", built_on: "基于", integrates_with: "集成",
    official_companion: "官方配套", supports_language: "支持语言",
    extends: "扩展宿主", alternative_to: "替代选择"
  };
  const reverseLabels = {
    depends_on: "被依赖", built_on: "作为基础", integrates_with: "被集成",
    official_companion: "配套组件", supports_language: "支持此语言的工具",
    extends: "相关插件", alternative_to: "替代选择"
  };
  const nodeRoleLabels = {
    vendor: "供应商", family_member: "产品家族",
    ecosystem: "技术生态", ecosystem_tool: "支持的生态",
    ecosystem_language: "语言生态", ecosystem_core: "技术生态核心",
    ecosystem_host: "插件生态"
  };
  function createLink(href, label) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    return a;
  }
  function appendRelation(list, label, targetName, href, detail = "", proof = null) {
    if (!href) return;
    const li = document.createElement("li");
    const tag = document.createElement("span");
    tag.className = "relation-kind";
    tag.textContent = label;
    li.append(tag, createLink(href, targetName));
    if (detail) {
      const caption = document.createElement("span");
      caption.className = "entity-relation-note";
      caption.textContent = detail;
      li.append(caption);
    }
    if (proof) {
      const source = createLink(proof, "依据");
      source.className = "relation-source";
      source.setAttribute("aria-label", "查看官方依据");
      li.append(source);
    }
    list.append(li);
  }
  const entityCards = Array.from(document.querySelectorAll(
    "#tools [data-entity-id], #components [data-entity-id], #resources [data-entity-id]"
  )).filter(card => card.matches("li"));
  for (const card of entityCards) {
    const id = card.dataset.entityId;
    const outgoing = outgoingById.get(id) || [];
    const incoming = incomingById.get(id) || [];
    if (!outgoing.length && !incoming.length) continue;
    const tags = new Set();
    const keywords = new Set();
    const panel = document.createElement("details");
    panel.className = "entity-links";
    const summary = document.createElement("summary");
    summary.textContent = "关联与生态";
    const list = document.createElement("ul");
    let count = 0;
    for (const edge of outgoing) {
      if (nodes[edge.to] || edge.to?.startsWith("family-")) {
        const node = nodes[edge.to];
        const name = labelOf(edge.to);
        keywords.add(name);
        const ecosystemEdge = edge.type.startsWith("ecosystem");
        if (ecosystemEdge) tags.add(name);
        const href = ecosystemEdge
          ? main.dataset.componentsRoot + "?ecosystem=" + encodeURIComponent(name)
          : edge.to.startsWith("family-")
            ? main.dataset.toolsRoot + "#family-" + encodeURIComponent(edge.to.slice(7))
            : node?.url || linkOf(edge.to);
        appendRelation(list, nodeRoleLabels[edge.type] || "关联", name, href);
        count++;
      } else {
        const label = edge.external_name || labelOf(edge.to);
        const href = edge.external_url || linkOf(edge.to);
        keywords.add(label);
        appendRelation(list, typeLabels[edge.type] || "相关", label, href, edge.note, edge.source_url);
        count++;
      }
    }
    for (const edge of incoming) {
      keywords.add(labelOf(edge.from));
      appendRelation(list, reverseLabels[edge.type] || "被关联", labelOf(edge.from), linkOf(edge.from), edge.note, edge.source_url);
      count++;
    }

    // Derived relationships are explicitly marked as same-ecosystem or same-vendor,
    // not falsely presented as direct integration, ownership, or installed packages.
    for (const edge of outgoing) {
      if (!(nodes[edge.to] || edge.to?.startsWith("family-"))) continue;
      const related = [...(membersByNode.get(edge.to) || [])].filter(member => member !== id && items.has(member));
      if (!related.length) continue;
      const ecosystem = edge.type.startsWith("ecosystem");
      if (!(ecosystem || edge.type === "vendor")) continue;
      const subsection = document.createElement("details");
      subsection.className = "entity-related-members";
      const heading = document.createElement("summary");
      heading.textContent = (ecosystem ? "同生态" : "同供应商") + " · " + labelOf(edge.to) + "（" + related.length + "）";
      const inner = document.createElement("ul");
      for (const target of related.sort((a,b) => labelOf(a).localeCompare(labelOf(b), "zh-CN"))) {
        const li = document.createElement("li");
        const href = linkOf(target);
        if (href) li.append(createLink(href, labelOf(target)));
        inner.append(li);
      }
      subsection.append(heading, inner);
      list.append(subsection);
    }

    if (count) {
      summary.textContent += "（" + count + "）";
      panel.append(summary, list);
      card.append(panel);
    }
    if (card.closest("#components")) {
      card.dataset.ecosystems = [...tags].join("|");
      const chips = card.querySelector(":scope > .component-tags");
      if (chips && tags.size) {
        for (const name of tags) {
          const chip = document.createElement("li");
          chip.textContent = name;
          chips.append(chip);
        }
        chips.hidden = false;
      }
    }
    card.dataset.relationKeywords = [...keywords].join(" ");
  }
}

function indexCard(card, labels, inheritedPlatforms = []) {
  const content = Array.from(card.children)
    .filter((child) => !child.matches(".extensions, .tool-platforms, .tool-linux-note, .product-family"))
    .map((child) => (child.matches(".catalog-card-heading") ? child.firstElementChild : child).textContent)
    .join(" ");
  const link = card.querySelector("a");
  return {
    element: card,
    platforms: card.dataset.hosts?.split("|") ?? card.dataset.platforms?.split(" ") ?? inheritedPlatforms,
    keywords: normalize([...labels, content, card.dataset.originalLabels ?? "", card.dataset.alias ?? "", link?.getAttribute("href")].join(" ")),
  };
}


function indexProduct(card, labels) {
  if (card.classList.contains("family-shortcut")) {
    return { element: card, shortcut: card.dataset.target };
  }
  const record = indexCard(card, labels);
  record.ecosystem = card.classList.contains("family-ecosystem");
  const family = card.querySelector(":scope > .product-family");
  if (family) {
    record.family = family;
    record.members = Array.from(family.querySelectorAll(":scope > .family-members > li"), member => {
      const child = indexProduct(member, [...labels, card.querySelector(".family-title").textContent]);
      familyRecords.set(member.id, child);
      return child;
    });
  }
  const folder = card.querySelector(":scope > details.extensions");
  if (folder) {
    record.extensionFolder = folder;
    record.extensionSummary = folder.querySelector("summary");
    record.extensionLabel = record.extensionSummary.textContent;
    const hostName = card.querySelector(".catalog-card-heading h5")?.textContent ?? "";
    record.extensions = Array.from(folder.querySelectorAll(":scope > .extension-list > li"), extension =>
      indexCard(extension, [...labels, hostName, record.extensionLabel], record.platforms));
  }
  return record;
}


const sections = Array.from(document.querySelectorAll(".catalog-section"), (section) => ({
  element: section,
  categories: Array.from(section.querySelectorAll(".catalog-category"), (category) => ({
    element: category,
    groups: Array.from(category.querySelectorAll(".catalog-group"), (group) => {
      const labels = [
        section.querySelector("h2").textContent,
        category.querySelector("h3").textContent,
        group.querySelector("h4").textContent,
      ];
      const cards = Array.from(group.querySelectorAll(":scope > .resources > li"),
        card => indexProduct(card, labels));
      return { element: group, cards };
    }),
  })),
}));

function matchesCard(card, terms, platform) {
  const element = card.element;
  return (!platform || card.platforms.includes(platform))
    && (!componentKind?.value || element.dataset.kind === componentKind.value)
    && (!componentEcosystem?.value || (element.dataset.ecosystems || "").split("|").includes(componentEcosystem.value))
    && (!componentFunction?.value || (element.dataset.functions || "").split("|").includes(componentFunction.value))
    && terms.every(term => (card.keywords + ' ' + normalize(element.dataset.relationKeywords || '')).includes(term));
}

function filterCard(card, terms, platform, matched) {
  if (card.shortcut) {
    const source = familyRecords.get(card.shortcut);
    card.element.hidden = !source || !matchesCard(source, terms, platform);
    return 0;
  }

  const matches = !card.ecosystem && matchesCard(card, terms, platform);
  let memberCount = 0;
  if (card.members) {
    for (const member of card.members) memberCount += filterCard(member, terms, platform, matched);
    card.family.hidden = memberCount === 0;
    if ((terms.length || platform) && memberCount) card.family.open = true;
  }

  let extensionCount = 0;
  if (card.extensions) {
    const folder = card.extensionFolder;
    if (terms.length && !filtering) card.extensionsWereOpen = folder.open;
    for (const extension of card.extensions) {
      const extensionMatches = matchesCard(extension, terms, platform);
      extension.element.hidden = !extensionMatches;
      if (extensionMatches) {
        extensionCount += 1;
        // Extensions belong to the unified plugin catalog. Do not inflate
        // the normal tools count just because a host's folder is expanded.
        if (terms.length) matched.add("plugin:" + extension.element.dataset.pluginAnchor);
      }
    }
    folder.hidden = extensionCount === 0;
    card.extensionSummary.textContent = terms.length && extensionCount
      ? `匹配 ${extensionCount} 个扩展 · 共 ${card.extensions.length} 个`
      : card.extensionLabel;
    if (terms.length) folder.open = extensionCount > 0;
    else if (filtering) folder.open = Boolean(card.extensionsWereOpen);
  }

  card.element.hidden = !matches && extensionCount === 0 && memberCount === 0;
  if (matches) matched.add(card.element);
  // A matching plugin makes its host group visible during search, while
  // the separate tools count remains based on actual products.
  return Number(matches) + memberCount + (terms.length ? extensionCount : 0);
}


function filterCatalog() {
  const platform = platformSelect?.value;
  const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean);
  const matched = new Set();

  for (const section of sections) {
    let sectionCount = 0;
    for (const category of section.categories) {
      let categoryCount = 0;
      for (const group of category.groups) {
        let groupCount = 0;
        for (const card of group.cards) {
          groupCount += filterCard(card, terms, platform, matched);
        }
        const shortcutsVisible = group.cards.some(card => card.shortcut && !card.element.hidden);
        group.element.hidden = groupCount === 0 && !shortcutsVisible;
        categoryCount += groupCount || Number(shortcutsVisible);
      }
      category.element.hidden = categoryCount === 0;
      sectionCount += categoryCount;
    }
    section.element.hidden = sectionCount === 0;
  }

  const total = matched.size;
  filtering = terms.length > 0;
  clear.hidden = query.value === "";
  const componentFiltered = Boolean(componentKind?.value || componentEcosystem?.value || componentFunction?.value);
  if (!filtering && !platform && !componentFiltered) {
    status.textContent = "共 " + total + " 项";
  } else if (total === 0) {
    status.textContent = "没有匹配的条目";
  } else {
    status.textContent = "找到 " + total + " 项";
  }
  sidebar.refresh();
}


function revealTarget(hash) {
  const target = document.getElementById(hash.slice(1));
  const wasHidden = target?.closest("[hidden]");
  if (wasHidden) {
    query.value = "";
    if (platformSelect) platformSelect.value = "";
    for (const control of [componentKind, componentEcosystem, componentFunction]) if (control) control.value = "";
    filterCatalog();
  }
  let wasClosed = false;
  for (let parent = target; parent; parent = parent.parentElement) {
    if (parent.matches("details.extensions, details.product-family") && !parent.open) {
      parent.open = true;
      wasClosed = true;
    }
  }
  return wasHidden || wasClosed ? target : null;
}

function initializeCatalogView(sidebar) {
  const switcher = document.querySelector(".catalog-view");
  if (!switcher) return;

  const catalog = switcher.closest(".catalog-section");
  const buttons = Array.from(switcher.querySelectorAll("button"));
  const storageKey = "toolbox:tools-view";

  function showView(view) {
    catalog.dataset.view = view;
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.view === view));
    }
  }

  let savedView;
  try {
    savedView = localStorage.getItem(storageKey);
  } catch {
    // The directory still works when storage is blocked.
  }
  showView(savedView === "list" ? "list" : "cards");

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      showView(view);
      sidebar.refresh();
      try {
        localStorage.setItem(storageKey, view);
      } catch {
        // Keep the selected view for the current page.
      }
    });
  }
  switcher.hidden = false;
}

function initializeSidebar() {
  const element = document.querySelector("#catalog-sidebar");
  const navigation = element.querySelector("nav");
  const title = element.querySelector("#sidebar-title");
  const toggle = element.querySelector("#sidebar-toggle");
  const fallback = document.querySelector(".category-links");
  const index = fallback.querySelector(".category-index");
  const narrow = window.matchMedia("(max-width: 44rem)");
  const categoriesById = new Map(Array.from(index.children, (item) => [item.firstElementChild.hash.slice(1), item]));
  const entries = new Map();
  let active;
  let anchor;
  let frame;

  function register(source, control, category) {
    entries.set(source.id, { source, heading: source.firstElementChild, control, category });
  }

  for (const section of sections) {
    const label = document.createElement("a");
    label.href = "#" + section.element.id;
    label.textContent = section.element.querySelector("h2").textContent;
    label.className = "sidebar-section";
    const list = document.createElement("ul");
    navigation.append(label, list);
    register(section.element, label);

    for (const { element: category, groups } of section.categories) {
      const item = categoriesById.get(category.id);
      const [labelLink, children] = item.children;
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = labelLink.textContent;
      details.append(summary, children);
      item.replaceChildren(details);
      list.append(item);
      register(category, summary, details);

      const groupLinks = new Map(Array.from(children.querySelectorAll("a"), (link) => [link.hash.slice(1), link]));
      for (const { element: group } of groups) register(group, groupLinks.get(group.id), details);
    }
  }

  function revealActiveControl() {
    if (!active || navigation.hidden || !active.control.getClientRects().length) return;
    const control = active.control.getBoundingClientRect();
    const bounds = navigation.getBoundingClientRect();
    if (control.top < bounds.top) navigation.scrollTop += control.top - bounds.top;
    else if (control.bottom > bounds.bottom) navigation.scrollTop += control.bottom - bounds.bottom;
  }

  function update() {
    frame = undefined;
    if (anchor && Math.abs(window.scrollY - anchor.scrollY) > 2) anchor = undefined;
    const available = Array.from(entries.values()).filter(({ source }) => !source.hidden);
    const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const line = Math.min(104, window.innerHeight * .22);
    const next = anchor?.entry ?? (atBottom ? available.at(-1) : available.findLast(({ heading }) =>
      heading.getBoundingClientRect().top <= line)) ?? available[0];
    if (next === active) return;
    active?.control.removeAttribute("aria-current");
    active?.category?.removeAttribute("data-active");
    active = next;
    if (!active) return;
    active.control.setAttribute("aria-current", "location");
    if (active.category) {
      active.category.open = true;
      active.category.setAttribute("data-active", "");
    }
    revealActiveControl();
  }

  function queueUpdate() {
    if (frame === undefined) frame = window.requestAnimationFrame(update);
  }

  function setCollapsed(collapsed) {
    const before = active?.heading.getBoundingClientRect().top;
    document.body.toggleAttribute("data-sidebar-collapsed", collapsed);
    navigation.hidden = collapsed;
    title.hidden = collapsed;
    const label = collapsed ? "展开侧边栏" : "收起侧边栏";
    toggle.setAttribute("aria-label", label);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.title = label;
    if (before !== undefined && window.scrollY > 0) {
      window.scrollBy(0, active.heading.getBoundingClientRect().top - before);
      if (anchor) anchor.scrollY = window.scrollY;
    }
    revealActiveControl();
    queueUpdate();
  }

  function followHash(hash) {
    const entry = entries.get(hash.slice(1));
    // Near the bottom, multiple links can land at the same scroll position.
    window.requestAnimationFrame(() => {
      anchor = entry ? { entry, scrollY: window.scrollY } : undefined;
      queueUpdate();
    });
  }

  toggle.addEventListener("click", () => setCollapsed(!navigation.hidden));
  element.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || navigation.hidden) return;
    event.preventDefault();
    setCollapsed(true);
    toggle.focus();
  });
  narrow.addEventListener("change", () => setCollapsed(narrow.matches));
  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", queueUpdate);
  if ("ResizeObserver" in window) new ResizeObserver(queueUpdate).observe(document.querySelector("main"));
  document.body.classList.add("has-sidebar");
  setCollapsed(narrow.matches);
  element.hidden = false;
  fallback.hidden = true;

  return {
    element,
    followHash,
    refresh() { anchor = undefined; queueUpdate(); },
    closeOnNarrowScreen() { if (narrow.matches) setCollapsed(true); },
  };
}

query.addEventListener("input", filterCatalog);
platformSelect?.addEventListener("change", filterCatalog);
for (const control of [componentKind, componentEcosystem, componentFunction]) control?.addEventListener("change", filterCatalog);
clear.addEventListener("click", () => {
  query.value = "";
  filterCatalog();
  query.focus();
});

const sidebar = initializeSidebar();
initializeCatalogView(sidebar);

for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    revealTarget(link.hash);
    if (sidebar.element.contains(link)) {
      sidebar.closeOnNarrowScreen();
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    }
    sidebar.followHash(link.hash);
  });
}
window.addEventListener("hashchange", () => {
  revealTarget(location.hash)?.scrollIntoView();
  sidebar.followHash(location.hash);
});

filterCatalog();
installEntityNetwork().catch(() => {
  // Keep the catalog usable if the optional relationship index cannot load.
}).finally(() => {
  initializeComponentFilters();
  filterCatalog();
});
revealTarget(location.hash);
const initialTarget = document.getElementById(location.hash.slice(1));
if (initialTarget?.closest(".family-ecosystem")) initialTarget.scrollIntoView();
sidebar.followHash(location.hash);
search.hidden = false;

// Missing images must not leave broken-image placeholders in catalog titles.
for (const icon of document.querySelectorAll("img.tool-icon")) {
  const hideFailedIcon = () => icon.remove();
  icon.addEventListener("error", hideFailedIcon, { once: true });
  if (icon.complete && icon.naturalWidth === 0) hideFailedIcon();
}
