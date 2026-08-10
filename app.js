(() => {
  const data = window.OLD_SOUL_GEM;
  if (!data) return;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const collectionMap = new Map(data.collections.map((collection) => [collection.id, collection]));

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function externalAttributes(url) {
    return url ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  function renderCollections() {
    const container = $("#collection-grid");
    if (!container) return;

    if (!data.collections.length) {
      container.innerHTML = '<div class="empty-state">The first Old Soul Gem collection is being prepared.</div>';
      return;
    }

    container.innerHTML = data.collections
      .map((collection, index) => {
        const pieceCount = data.pieces.filter((piece) => piece.collection === collection.id).length;
        return `
          <article class="collection-card ${index === 0 ? "is-wide" : ""}" data-collection="${escapeHtml(collection.id)}">
            <img class="collection-image" src="${escapeHtml(collection.image)}" alt="${escapeHtml(collection.imageAlt || collection.name + " collection")}" loading="lazy" decoding="async">
            <div class="collection-copy">
              <small>${escapeHtml(collection.eyebrow)} · ${pieceCount} ${pieceCount === 1 ? "piece" : "pieces"}</small>
              <h3>${escapeHtml(collection.name)}</h3>
              <p>${escapeHtml(collection.description)}</p>
            </div>
          </article>`;
      })
      .join("");
  }

  function renderFilters() {
    const container = $("#collection-filters");
    if (!container) return;

    const filters = [
      '<button class="filter-button" type="button" data-filter="all" aria-pressed="true">All Pieces</button>',
      ...data.collections.map(
        (collection) => `<button class="filter-button" type="button" data-filter="${escapeHtml(collection.id)}" aria-pressed="false">${escapeHtml(collection.name)}</button>`
      )
    ];

    container.innerHTML = filters.join("");
  }

  function pieceCard(piece) {
    const collection = collectionMap.get(piece.collection);
    return `
      <article class="piece-card" data-collection="${escapeHtml(piece.collection)}">
        <img class="piece-image" src="${escapeHtml(piece.image)}" alt="${escapeHtml(piece.imageAlt || piece.name)}" loading="lazy" decoding="async">
        <div class="piece-copy">
          <small>${escapeHtml(collection?.name || "Old Soul Gem")} · ${escapeHtml(piece.category)}</small>
          <h3>${escapeHtml(piece.name)}</h3>
          <p>${escapeHtml(piece.description)}</p>
          <ul class="piece-meta">
            <li><span>Details</span><span>${escapeHtml(piece.materials)}</span></li>
            <li><span>Status</span><span>${escapeHtml(piece.status)}</span></li>
          </ul>
          <div class="card-actions">
            <button class="text-link piece-details" type="button" data-piece="${escapeHtml(piece.id)}">Read the story</button>
            ${piece.shopUrl ? `<a class="text-link" href="${escapeHtml(piece.shopUrl)}"${externalAttributes(piece.shopUrl)}>View on Etsy ↗</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  function renderPieces(filter = "all") {
    const container = $("#piece-grid");
    if (!container) return;

    const pieces = filter === "all" ? data.pieces : data.pieces.filter((piece) => piece.collection === filter);
    container.innerHTML = pieces.length
      ? pieces.map(pieceCard).join("")
      : '<div class="empty-state">No pieces have been added to this collection yet.</div>';
  }

  function renderSocialLinks() {
    const container = $("#social-links");
    if (!container) return;

    const links = [
      ["Shop Etsy", data.links.etsy],
      ["Facebook", data.links.facebook],
      ["Instagram & More", data.links.instagram]
    ].filter(([, url]) => Boolean(url));

    container.innerHTML = links.length
      ? links
          .map(
            ([label, url]) => `<a class="social-link" href="${escapeHtml(url)}"${externalAttributes(url)}><span>${escapeHtml(label)}</span><span aria-hidden="true">↗</span></a>`
          )
          .join("")
      : '<p class="footer-note">Social links are being prepared.</p>';
  }

  function openPieceDialog(pieceId) {
    const piece = data.pieces.find((item) => item.id === pieceId);
    const dialog = $("#piece-dialog");
    if (!piece || !dialog) return;

    const collection = collectionMap.get(piece.collection);
    const dialogImage = $("#dialog-image");
    dialogImage.src = piece.image;
    dialogImage.alt = piece.imageAlt || piece.name;
    $("#dialog-eyebrow").textContent = `${collection?.name || "Old Soul Gem"} · ${piece.category}`;
    $("#dialog-title").textContent = piece.name;
    $("#dialog-description").textContent = piece.description;
    $("#dialog-story").textContent = piece.story;
    $("#dialog-materials").textContent = piece.materials;
    $("#dialog-status").textContent = piece.status;

    const shopLink = $("#dialog-shop");
    if (piece.shopUrl) {
      shopLink.href = piece.shopUrl;
      shopLink.hidden = false;
    } else {
      shopLink.hidden = true;
    }

    dialog.showModal();
  }

  function setBrandCopy() {
    $$("[data-brand-name]").forEach((node) => (node.textContent = data.brand.name));
    $$("[data-brand-tagline]").forEach((node) => (node.textContent = data.brand.tagline));
    $$("[data-brand-location]").forEach((node) => (node.textContent = data.brand.location));

    const shopLinks = $$("[data-shop-link]");
    shopLinks.forEach((link) => {
      if (data.links.etsy) {
        link.href = data.links.etsy;
        link.hidden = false;
      } else {
        link.hidden = true;
      }
    });
  }

  function bindEvents() {
    const filterContainer = $("#collection-filters");
    filterContainer?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;

      $$(".filter-button", filterContainer).forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      renderPieces(button.dataset.filter);
    });

    $("#piece-grid")?.addEventListener("click", (event) => {
      const button = event.target.closest(".piece-details");
      if (button) openPieceDialog(button.dataset.piece);
    });

    const dialog = $("#piece-dialog");
    $("#dialog-close")?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) dialog.close();
    });

    dialog?.addEventListener("close", () => {
      const image = $("#dialog-image");
      if (image) {
        image.removeAttribute("src");
        image.alt = "";
      }
    });

    const menuButton = $("#menu-button");
    const nav = $("#primary-nav");
    menuButton?.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      nav?.classList.toggle("is-open", !open);
      document.body.classList.toggle("menu-open", !open);
      menuButton.textContent = open ? "Menu" : "Close";
    });

    nav?.addEventListener("click", (event) => {
      if (!event.target.closest("a") || !nav.classList.contains("is-open")) return;
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuButton?.setAttribute("aria-expanded", "false");
      if (menuButton) menuButton.textContent = "Menu";
    });
  }

  function setYear() {
    const year = $("#current-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  setBrandCopy();
  renderCollections();
  renderFilters();
  renderPieces();
  renderSocialLinks();
  bindEvents();
  setYear();
})();
