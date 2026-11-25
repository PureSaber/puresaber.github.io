const search = document.querySelector("#catalog-search");
const query = document.querySelector("#catalog-query");
const clear = document.querySelector("#clear-search");
const platformSelect = document.querySelector("#tool-platform");
const status = document.querySelector("#search-status");
const requestedHost = new URLSearchParams(location.search).get("host");
if (requestedHost && platformSelect && Array.from(platformSelect.options).some(option => option.value === requestedHost)) {
  platformSelect.value = requestedHost;
}
const normalize = (text) => text.normalize("NFKC").toLowerCase();
let filtering = false;

// The original catalog remains the single source of truth. Group cards progressively.
function groupProductFamilies() {
  const all = Array.from(document.querySelectorAll("#tools .resources > li[data-family]"));
  for (const parent of all.filter(card => card.dataset.familyRole === "parent")) {
    const members = all.filter(card => card.dataset.family === parent.dataset.family && card.dataset.familyRole === "member");
    if (!members.length) continue;
    const parentGroup = parent.closest(".catalog-group");
    const ecosystemTitle = parent.dataset.familyTitle;
    const familyName = ecosystemTitle || parent.querySelector("h5").textContent.trim();
    const details = document.createElement("details");
    details.className = "product-family";
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = "关联产品（" + (members.length + Number(Boolean(ecosystemTitle))) + "）";
    const list = document.createElement("ul");
    list.className = "family-members";
    for (const member of members) {
      const group = member.closest(".catalog-group");
      const category = member.closest(".catalog-category");
      member.dataset.originalLabels = category.querySelector("h3").textContent + " " + group.querySelector("h4").textContent;
      if (group !== parentGroup) {
        const shortcut = document.createElement("li");
        shortcut.className = "family-shortcut";
        shortcut.dataset.target = member.id;
        const source = member.querySelector(".catalog-card-heading h5");
        const link = document.createElement("a");
        link.href = "#" + member.id;
        const icon = source.querySelector("img")?.cloneNode(true);
        if (icon) link.append(icon);
        const name = document.createElement("span");
        name.textContent = source.textContent.trim();
        link.append(name);
        link.className = "card-title-with-icon";
        const note = document.createElement("p");
        note.textContent = "查看 " + familyName + " 产品家族";
        shortcut.append(link, note);
        member.before(shortcut);
      }
      list.append(member);
    }
    details.append(summary, list);
    if (ecosystemTitle) {
      // An ecosystem is a presentation-only wrapper, not a product or a search result.
      const wrapper = document.createElement("li");
      wrapper.id = "family-" + parent.dataset.family;
      wrapper.className = "family-parent family-ecosystem";
      const heading = document.createElement("div");
      heading.className = "catalog-card-heading";
      const title = document.createElement("h5");
      title.className = "card-title-with-icon";
      const icon = parent.querySelector("h5 img")?.cloneNode(true);
      if (icon) title.append(icon);
      title.append(document.createTextNode(ecosystemTitle));
      heading.append(title);
      wrapper.append(heading, details);
      parent.before(wrapper);
      list.prepend(parent);
    } else {
      parent.append(details);
      parent.classList.add("family-parent");
    }
  }
}
groupProductFamilies();
const familyRecords = new Map();

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
  if (card.classList.contains("family-shortcut")) return { element: card, shortcut: card.dataset.target };
  const record = indexCard(card, labels);
  record.ecosystem = card.classList.contains("family-ecosystem");
  const family = card.querySelector(":scope > .product-family");
  if (family) {
    record.family = family;
    record.members = Array.from(family.querySelectorAll(":scope > .family-members > li"), member => {
      const child = indexProduct(member, [...labels, card.querySelector("h5").textContent]);
      familyRecords.set(member.id, child);
      return child;
    });
  }
  const folder = card.querySelector(":scope > details.extensions");
  if (folder) {
    record.extensionFolder = folder;
    record.extensionSummary = folder.querySelector("summary");
    record.extensionLabel = record.extensionSummary.textContent;
    const extensionLabels = [...labels, card.querySelector(".catalog-card-heading h5").textContent, record.extensionLabel];
    record.extensions = Array.from(folder.querySelectorAll(":scope > .extension-list > li"), extension =>
      indexCard(extension, extensionLabels, record.platforms));
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
      const cards = Array.from(group.querySelectorAll(":scope > .resources > li"), card => indexProduct(card, labels));
      return { element: group, cards };
    }),
  })),
}));

function matchesCard(card, terms, platform) {
  return (!platform || card.platforms.includes(platform)) && terms.every(term => card.keywords.includes(term));
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
      extensionCount += filterCard(extension, terms, platform, matched);
    }
    folder.hidden = extensionCount === 0;
    card.extensionSummary.textContent = terms.length && extensionCount > 0
      ? `匹配 ${extensionCount} 个扩展 · 共 ${card.extensions.length} 个`
      : card.extensionLabel;
    if (terms.length) {
      folder.open = extensionCount > 0;
    } else if (filtering) {
      folder.open = Boolean(card.extensionsWereOpen);
    }
  }
  card.element.hidden = !matches && extensionCount === 0 && memberCount === 0;
  if (matches) matched.add(card.element.dataset.pluginAnchor ? 'plugin:' + card.element.dataset.pluginAnchor : card.element);
  return Number(matches) + extensionCount + memberCount;
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
  if (!filtering && !platform) {
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
      if (section.element.id === "plugins") {
        // Plugin ecology is a single navigation level; groups remain internal.
        list.append(item);
        register(category, labelLink);
        continue;
      }
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
revealTarget(location.hash);
sidebar.followHash(location.hash);
search.hidden = false;

// Missing images must not leave broken-image placeholders in catalog titles.
for (const icon of document.querySelectorAll("img.tool-icon")) {
  const hideFailedIcon = () => icon.remove();
  icon.addEventListener("error", hideFailedIcon, { once: true });
  if (icon.complete && icon.naturalWidth === 0) hideFailedIcon();
}
