const search = document.querySelector("#catalog-search");
const query = document.querySelector("#catalog-query");
const clear = document.querySelector("#clear-search");
const platformSelect = document.querySelector("#tool-platform");
const status = document.querySelector("#search-status");
const extensions = document.querySelector("#extensions");
const extensionsSummary = document.querySelector("#extensions-title");
const defaultExtensionsLabel = extensionsSummary?.textContent;
const normalize = (text) => text.normalize("NFKC").toLowerCase();
let filtering = false;
let extensionsWereOpen = false;

function indexCard(card, labels, inheritedPlatforms = []) {
  const content = Array.from(card.children)
    .filter((child) => child !== extensions && !child.matches(".tool-platforms, .tool-linux-note"))
    .map((child) => (child.matches(".catalog-card-heading") ? child.firstElementChild : child).textContent)
    .join(" ");
  const link = card.querySelector("a");
  return {
    element: card,
    platforms: card.dataset.platforms?.split(" ") ?? inheritedPlatforms,
    keywords: normalize([...labels, content, card.dataset.alias ?? "", link.getAttribute("href")].join(" ")),
  };
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
      const cards = Array.from(group.querySelectorAll(".resources > li"), (card) => {
        const record = indexCard(card, labels);
        if (card.contains(extensions)) {
          const host = card.querySelector("h5").textContent;
          const extensionLabels = [...labels, host, defaultExtensionsLabel];
          record.extensions = Array.from(extensions.querySelectorAll(".extension-list > li"), (extension) =>
            indexCard(extension, extensionLabels, record.platforms));
        }
        return record;
      });
      return { element: group, cards };
    }),
  })),
}));

function filterCard(card, terms, platform) {
  const matches = (!platform || card.platforms.includes(platform))
    && terms.every((term) => card.keywords.includes(term));
  let extensionCount = 0;
  if (card.extensions) {
    for (const extension of card.extensions) {
      extensionCount += filterCard(extension, terms, platform);
    }
    extensions.hidden = extensionCount === 0;
    extensionsSummary.textContent = terms.length && extensionCount > 0
      ? `匹配 ${extensionCount} 个扩展 · 共 ${card.extensions.length} 个`
      : defaultExtensionsLabel;
    if (terms.length) {
      extensions.open = extensionCount > 0;
    } else if (filtering) {
      extensions.open = extensionsWereOpen;
    }
  }
  card.element.hidden = !matches && extensionCount === 0;
  return Number(matches) + extensionCount;
}

function filterCatalog() {
  const platform = platformSelect?.value;
  const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean);
  if (extensions && terms.length && !filtering) extensionsWereOpen = extensions.open;
  let total = 0;

  for (const section of sections) {
    let sectionCount = 0;
    for (const category of section.categories) {
      let categoryCount = 0;
      for (const group of category.groups) {
        let groupCount = 0;
        for (const card of group.cards) {
          groupCount += filterCard(card, terms, platform);
        }
        group.element.hidden = groupCount === 0;
        categoryCount += groupCount;
      }
      category.element.hidden = categoryCount === 0;
      sectionCount += categoryCount;
    }
    section.element.hidden = sectionCount === 0;
    total += sectionCount;
  }

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
  if (target && extensions?.contains(target)) extensions.open = true;
  return wasHidden ? target : null;
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
