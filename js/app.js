const STATE = {
  products: [],
  cart: JSON.parse(localStorage.getItem("acehill-cart") || "[]")
};

const money = (n) =>
  `${STORE.currency} ${Number(n).toLocaleString("en-KE")}`;

const effectivePrice = (p) => p.discountPrice || p.price;

const inStock = (p) => p.availability === "In Stock";

function icon(name) {
  const icons = {
    phone: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2" width="10" height="18" rx="2"/><path d="M10 17h2"/></svg>',
    laptop: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="16" height="10" rx="1"/><path d="M2 16h18M7 19h8"/></svg>',
    tablet: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="2" width="12" height="18" rx="2"/><path d="M10 17h2"/></svg>',
    cctv: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6"/><circle cx="11" cy="11" r="2"/><path d="M11 2v2M11 18v2M2 11h2M18 11h2"/></svg>',
    accessory: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 7V5a3 3 0 0 1 6 0v2"/><rect x="6" y="7" width="10" height="12" rx="2"/></svg>',
    search: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="6"/><path d="m16 16-3.5-3.5"/></svg>',
    cart: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h2l.6 3M7 16h8M8 12h7.4a1 1 0 0 0 1-.8L18 4H6"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/></svg>',
    menu: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h12M3 11h12M3 16h12"/></svg>',
    wa: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11.5A8.5 8.5 0 0 1 7.2 18.7L4 20l1.4-3.1A8.5 8.5 0 1 1 20 11.5Zm-8.4 6.3A6.3 6.3 0 1 0 7 16.6l.2.1-1.5 1.5 1.6-.4.1.1a6.3 6.3 0 0 0 4.2 1Zm3.4-4.7c-.2-.1-1.1-.5-1.3-.6s-.3-.1-.5.1-.5.6-.7.7-.3.1-.5 0a5.2 5.2 0 0 1-1.5-.9 5.7 5.7 0 0 1-1-1.3c-.1-.2 0-.3.1-.4l.3-.4.1-.2a.4.4 0 0 0 0-.4l-.6-1.4c-.2-.4-.3-.3-.5-.3h-.4a.8.8 0 0 0-.6.3 2.5 2.5 0 0 0-.8 1.9 4.3 4.3 0 0 0 .9 2.3 10 10 0 0 0 3.8 3.6 4.4 4.4 0 0 0 2.6.8 2.2 2.2 0 0 0 1.5-.9 1.8 1.8 0 0 0 .1-1.3c-.1-.2-.2-.2-.4-.3Z"/></svg>',
    check: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 10 4 4 8-8"/></svg>',
    wrench: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 6a4 4 0 0 0-5.6 5.6L4 16l2 2 4.4-4.4A4 4 0 0 0 16 8l-3 3-2-2 3-3Z"/></svg>'
  };
  return icons[name] || "";
}

function deviceClass(product) {
  if (product.category === "Phones") return "device-phone";
  if (product.category === "Tablets") return "device-tablet";
  if (product.category === "Laptops") {
    if (product.subcategory === "Printers" || product.subcategory === "Computer accessories") return "device-acc";
    if (product.subcategory === "Desktop computers") return "device-acc";
    return "device-laptop";
  }
  if (product.category === "CCTV") {
    return product.subcategory === "CCTV cameras" ? "device-cctv" : "device-acc";
  }
  return "device-acc";
}

function stockClass(p) {
  if (p.availability === "In Stock") return "in";
  if (p.availability === "Out of Stock") return "out";
  return "pre";
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function categoryImage(product) {
  const map = {
    Phones: "images/products/cat-phones.svg",
    Laptops: "images/products/cat-laptops.svg",
    Tablets: "images/products/cat-tablets.svg",
    CCTV: "images/products/cat-cctv.svg",
    Accessories: "images/products/cat-accessories.svg"
  };
  return map[product.category] || "images/products/cat-accessories.svg";
}

function productImages(product) {
  const seen = new Set();
  const list = [];
  const add = (src) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    list.push(src);
  };
  add(product.image);
  if (Array.isArray(product.images)) product.images.forEach(add);
  if (!list.length) add(categoryImage(product));
  return list;
}

function acePhotoError(img) {
  const fallback = img.getAttribute("data-fallback") || "";
  const current = img.getAttribute("src") || "";
  if (img.dataset.stage !== "fallback" && fallback && current !== fallback && !current.endsWith("/" + fallback)) {
    img.dataset.stage = "fallback";
    img.src = fallback;
    return;
  }
  const shot = img.closest(".product-shot, .hit-thumb, .cart-thumb, .gallery-thumb");
  img.remove();
  shot?.classList.remove("has-photo");
}

window.acePhotoError = acePhotoError;

function productShot(product, extra = "", opts = {}) {
  const src = productImages(product)[0];
  const fallback = categoryImage(product);
  return `<div class="product-shot has-photo ${product.category} ${extra}">
    <div class="shot-badge">
      ${product.discountPrice ? '<span class="badge badge-sale">Sale</span>' : ""}
      ${product.newest ? '<span class="badge badge-new">New</span>' : ""}
      ${product.featured ? '<span class="badge badge-feat">Featured</span>' : ""}
    </div>
    <img class="product-photo" src="${escapeAttr(src)}" alt="${escapeAttr(product.name)}" width="640" height="480" loading="${opts.eager ? "eager" : "lazy"}" data-fallback="${escapeAttr(fallback)}" onerror="acePhotoError(this)">
    <div class="device ${deviceClass(product)}"></div>
  </div>`;
}

function productThumb(product, className = "hit-thumb") {
  const src = productImages(product)[0];
  const fallback = categoryImage(product);
  return `<span class="${className} has-photo ${product.category}">
    <img class="product-photo" src="${escapeAttr(src)}" alt="" data-fallback="${escapeAttr(fallback)}" onerror="acePhotoError(this)">
    <span class="device ${deviceClass(product)}"></span>
  </span>`;
}

function productGallery(product) {
  const imgs = productImages(product);
  const thumbs = imgs.length > 1
    ? `<div class="gallery-thumbs">${imgs.map((src, i) => `
        <button type="button" class="gallery-thumb has-photo ${i === 0 ? "is-active" : ""}" data-gallery="${escapeAttr(src)}" aria-label="Photo ${i + 1} of ${product.name}">
          <img src="${escapeAttr(src)}" alt="" data-fallback="${escapeAttr(categoryImage(product))}" onerror="acePhotoError(this)">
        </button>`).join("")}</div>`
    : "";
  return `<div class="product-gallery">
    ${productShot(product, "detail-shot panel", { eager: true })}
    ${thumbs}
  </div>`;
}

function productCard(product) {
  const price = effectivePrice(product);
  return `<article class="product-card">
    <a href="${productUrl(product.id)}">${productShot(product)}</a>
    <div class="product-body">
      <div class="brand-kicker">${product.brand}</div>
      <h3><a href="${productUrl(product.id)}">${product.name}</a></h3>
      <p class="muted">${product.shortDescription}</p>
      <div class="price">${money(price)}${product.discountPrice ? `<s>${money(product.price)}</s>` : ""}</div>
      <div class="stock ${stockClass(product)}">${product.availability}</div>
      <div class="card-actions">
        <a class="btn btn-outline btn-sm" href="${productUrl(product.id)}">View</a>
        <button class="btn btn-green btn-sm" data-wa="${product.id}">WhatsApp</button>
      </div>
    </div>
  </article>`;
}

function query() {
  const search = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, "").replace(/^\?/, ""));
  hash.forEach((value, key) => {
    if (!search.get(key)) search.set(key, value);
  });
  return search;
}

function productUrl(id) {
  return `product.html#id=${id}`;
}

function catalogUrl(opts = {}) {
  const p = new URLSearchParams();
  if (opts.q) p.set("q", opts.q);
  if (opts.category && opts.category !== "All") p.set("category", opts.category);
  const qs = p.toString();
  return qs ? `products.html#${qs}` : "products.html";
}

function matchesQuery(product, q) {
  if (!q) return true;
  const hay = [
    product.name, product.brand, product.category, product.subcategory,
    product.model, product.description, product.shortDescription, product.sku
  ].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase().trim());
}

function withWebsiteSource(text) {
  const body = text.trim().replace(/^Hello Ace Hill Electronics,?\s*/i, "");
  return `Hello Ace Hill Electronics (acehillonlinemarket.co.ke)\n\n${body}\n\nSent from acehillonlinemarket.co.ke`;
}

function waUrl(text, whatsapp) {
  return `https://wa.me/${whatsapp}/?text=${encodeURIComponent(withWebsiteSource(text))}`;
}

function mapsUrl(branch) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`;
}

function orderMessage(product, qty = 1) {
  return `Hello Ace Hill Electronics, I would like to order ${product.name}${qty > 1 ? ` × ${qty}` : ""}. The listed price is ${money(effectivePrice(product))}.`;
}

function enquiryMessage(items) {
  const lines = items.map((item, i) => {
    const p = STATE.products.find((x) => x.id === item.id);
    return `${i + 1}. ${p ? p.name : "Product"} × ${item.qty}`;
  });
  return `Hello Ace Hill Electronics, I would like to enquire about:\n\n${lines.join("\n")}\n\nPlease confirm availability and final price.`;
}

function saveCart() {
  localStorage.setItem("acehill-cart", JSON.stringify(STATE.cart));
  updateCartCount();
}

function addToCart(id, qty = 1) {
  const found = STATE.cart.find((x) => x.id === id);
  if (found) found.qty += qty;
  else STATE.cart.push({ id, qty });
  saveCart();
  toast("Added to enquiry list");
  renderCart();
}

function setQty(id, qty) {
  if (qty <= 0) STATE.cart = STATE.cart.filter((x) => x.id !== id);
  else {
    const found = STATE.cart.find((x) => x.id === id);
    if (found) found.qty = qty;
  }
  saveCart();
  renderCart();
}

function updateCartCount() {
  const n = STATE.cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0;
  });
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("is-on"), 2200);
}

function currentPage() {
  let file = (location.pathname.split("/").pop() || "index.html").replace(/\/$/, "");
  if (!file) file = "index.html";
  if (!file.includes(".")) file += ".html";
  return file;
}

function renderHeader() {
  const page = currentPage();
  const links = [
    ["index.html", "Home"],
    ["products.html", "Products"],
    ["services.html", "Services"],
    ["special-orders.html", "Special Orders"],
    ["about.html", "About Us"],
    ["contact.html", "Contact"]
  ];
  document.getElementById("site-header").innerHTML = `
    <header class="site-header">
      <div class="branch-bar">
        <div class="wrap branch-bar-inner">
          ${STORE.branches.map((b) => `<a href="${b.phoneHref}"><strong>${b.city}</strong> ${b.phoneDisplay}</a>`).join("")}
        </div>
      </div>
      <div class="wrap header-top">
        <a class="brand" href="index.html">
          <img src="images/logo.svg" alt="Ace Hill Electronics logo">
          <span class="brand-text"><strong>ACE HILL</strong><span>Electronics</span></span>
        </a>
        <form class="header-search" id="header-search">
          ${icon("search")}
          <input type="search" name="q" placeholder="Search phones, laptops, CCTV, accessories..." autocomplete="off" aria-label="Search products">
          <div class="search-panel" id="search-panel"></div>
        </form>
        <div class="header-actions">
          <button class="btn btn-green btn-sm" id="open-wa" type="button">${icon("wa")} WhatsApp</button>
          <button class="icon-btn" id="open-search" aria-label="Search">${icon("search")}</button>
          <button class="icon-btn" id="open-cart" aria-label="Enquiry cart">${icon("cart")}<span class="cart-count" hidden>0</span></button>
          <button class="nav-toggle" id="nav-toggle" aria-label="Menu">${icon("menu")}</button>
        </div>
      </div>
      <nav class="wrap header-nav" id="main-nav">
        ${links.map(([href, label]) => `<a href="${href}" class="${page === href ? "is-active" : ""}">${label}</a>`).join("")}
      </nav>
    </header>`;
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `
    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div>
          <a class="brand" href="index.html">
            <img src="images/logo.svg" alt="" width="44" height="44">
            <span class="brand-text"><strong>ACE HILL</strong><span>Electronics</span></span>
          </a>
          <p style="margin-top:12px;max-width:36ch">${STORE.tagline}. CCTV, phones and laptops in Garissa, Nairobi and North Eastern Kenya.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <p><a href="products.html">All products</a></p>
          ${CATEGORIES.map((c) => `<p><a href="${catalogUrl({ category: c.id })}">${c.label}</a></p>`).join("")}
        </div>
        <div>
          <h3>Company</h3>
          <p><a href="services.html">Services</a></p>
          <p><a href="special-orders.html">Special orders</a></p>
          <p><a href="about.html">About us</a></p>
          <p><a href="contact.html">Contact</a></p>
        </div>
        <div>
          <h3>Branches</h3>
          ${STORE.branches.map((b) => `
            <p><strong>${b.city}</strong></p>
            <p><a href="${b.phoneHref}">${b.phoneDisplay}</a></p>
            <p>${b.address}</p>
          `).join("")}
        </div>
      </div>
      <div class="wrap footer-bottom">
        <span>© ${new Date().getFullYear()} Ace Hill Electronics. All rights reserved.</span>
        <span>Garissa · Nairobi · North Eastern Kenya</span>
      </div>
    </footer>
    <button class="whatsapp-float" id="float-wa" type="button" aria-label="Chat on WhatsApp">${icon("wa")}</button>
    <div class="overlay" id="overlay"></div>
    <div class="wa-modal" id="wa-picker" role="dialog" aria-labelledby="wa-picker-title">
      <h2 id="wa-picker-title">Choose a branch</h2>
      <p class="muted">WhatsApp Garissa or Nairobi. Your message will show it came from acehillonlinemarket.co.ke.</p>
      <div class="wa-choices" id="wa-choices"></div>
      <button class="btn btn-outline" type="button" id="close-wa">Cancel</button>
    </div>
    <aside class="drawer" id="cart-drawer" aria-label="Enquiry list">
      <div class="drawer-head">
        <h2>Enquiry list</h2>
        <button class="icon-btn" id="close-cart" aria-label="Close" style="color:var(--ink);border-color:var(--line);background:white">✕</button>
      </div>
      <div class="drawer-body" id="cart-body"></div>
      <div class="drawer-foot">
        <button class="btn btn-green" id="send-enquiry">${icon("wa")} Send enquiry via WhatsApp</button>
        <button class="btn btn-outline" id="clear-cart">Clear list</button>
      </div>
    </aside>`;
}

function renderCart() {
  const body = document.getElementById("cart-body");
  if (!body) return;
  if (!STATE.cart.length) {
    body.innerHTML = `<div class="empty-state"><p>Your enquiry list is empty.</p><p class="muted">Add products, then send them together on WhatsApp.</p></div>`;
    return;
  }
  body.innerHTML = STATE.cart.map((item) => {
    const p = STATE.products.find((x) => x.id === item.id);
    if (!p) return "";
    return `<div class="cart-item">
      ${productThumb(p, "cart-thumb")}
      <div>
        <strong>${p.name}</strong>
        <div class="muted">${money(effectivePrice(p))}</div>
        <div class="qty">
          <button data-qty="${p.id}" data-d="-1">−</button>
          <span>${item.qty}</span>
          <button data-qty="${p.id}" data-d="1">+</button>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" data-remove="${p.id}">Remove</button>
    </div>`;
  }).join("");
}

function bindGlobal() {
  const searchForm = document.getElementById("header-search");
  const input = searchForm?.querySelector("input");
  const panel = document.getElementById("search-panel");
  const params = query();
  if (input && params.get("q") && currentPage() === "products.html") input.value = params.get("q");

  input?.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    const hits = STATE.products.filter((p) => matchesQuery(p, q)).slice(0, 6);
    panel.classList.add("is-open");
    panel.innerHTML = hits.length
      ? hits.map((p) => `<a class="search-hit" href="${productUrl(p.id)}">
          ${productThumb(p)}
          <div><strong>${p.name}</strong><span>${p.brand} · ${p.category} · ${money(effectivePrice(p))}</span></div>
        </a>`).join("") + `<a class="search-more" href="${catalogUrl({ q })}">See all results for “${q}”</a>`
      : `<div class="search-empty">No products match “${q}”. Try a brand, model or SKU.</div>`;
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    location.href = catalogUrl({ q });
  });

  document.addEventListener("click", (e) => {
    if (!searchForm?.contains(e.target)) panel?.classList.remove("is-open");
  });

  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    document.getElementById("main-nav")?.classList.toggle("is-open");
  });
  document.getElementById("open-search")?.addEventListener("click", () => {
    searchForm?.classList.toggle("is-open");
    searchForm?.querySelector("input")?.focus();
  });

  const overlay = document.getElementById("overlay");
  const drawer = document.getElementById("cart-drawer");
  const picker = document.getElementById("wa-picker");
  const openCart = () => {
    picker.classList.remove("is-open");
    overlay.classList.add("is-open");
    drawer.classList.add("is-open");
    renderCart();
  };
  const closeOverlays = () => {
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    picker.classList.remove("is-open");
  };
  const openWaPicker = (text) => {
    drawer.classList.remove("is-open");
    const box = document.getElementById("wa-choices");
    box.innerHTML = "";
    STORE.branches.forEach((b) => {
      const link = document.createElement("a");
      link.className = "btn btn-green";
      link.target = "_blank";
      link.rel = "noopener";
      link.href = waUrl(text, b.whatsapp);
      link.innerHTML = `${icon("wa")} ${b.city} · ${b.phoneDisplay}`;
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = b.address;
      box.append(link, note);
    });
    overlay.classList.add("is-open");
    picker.classList.add("is-open");
  };
  window.openWaPicker = openWaPicker;

  document.getElementById("open-cart")?.addEventListener("click", openCart);
  document.getElementById("close-cart")?.addEventListener("click", closeOverlays);
  document.getElementById("close-wa")?.addEventListener("click", closeOverlays);
  document.getElementById("open-wa")?.addEventListener("click", () => {
    openWaPicker("Hello Ace Hill Electronics, I would like to make an enquiry.");
  });
  document.getElementById("float-wa")?.addEventListener("click", () => {
    openWaPicker("Hello Ace Hill Electronics, I would like to make an enquiry.");
  });
  overlay?.addEventListener("click", closeOverlays);

  document.getElementById("cart-body")?.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const id = Number(qtyBtn.dataset.qty);
      const item = STATE.cart.find((x) => x.id === id);
      setQty(id, (item?.qty || 1) + Number(qtyBtn.dataset.d));
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) setQty(Number(rm.dataset.remove), 0);
  });

  document.getElementById("clear-cart")?.addEventListener("click", () => {
    STATE.cart = [];
    saveCart();
    renderCart();
  });

  document.getElementById("send-enquiry")?.addEventListener("click", () => {
    if (!STATE.cart.length) return toast("Add products first");
    closeOverlays();
    openWaPicker(enquiryMessage(STATE.cart));
  });

  document.body.addEventListener("click", (e) => {
    const wa = e.target.closest("[data-wa]");
    if (wa) {
      const p = STATE.products.find((x) => x.id === Number(wa.dataset.wa));
      if (p) openWaPicker(orderMessage(p));
    }
    const genericWa = e.target.closest("[data-wa-msg]");
    if (genericWa) {
      e.preventDefault();
      openWaPicker(genericWa.dataset.waMsg);
    }
    const add = e.target.closest("[data-add]");
    if (add) addToCart(Number(add.dataset.add));
  });

  updateCartCount();
}

function pageHome() {
  const featured = STATE.products.filter((p) => p.featured);
  const popular = STATE.products.filter((p) => p.popular).slice(0, 8);
  document.getElementById("category-grid").innerHTML = CATEGORIES.map((c) => `
    <a class="cat-card" href="${catalogUrl({ category: c.id })}">
      <div class="cat-icon">${icon(c.icon)}</div>
      <div><h3>${c.label}</h3><p>${c.blurb}</p></div>
    </a>`).join("");
  document.getElementById("featured-grid").innerHTML = featured.map(productCard).join("");
  document.getElementById("popular-grid").innerHTML = popular.map(productCard).join("");
  document.getElementById("hero-search")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    location.href = catalogUrl({ q });
  });
}

function pageProducts() {
  const params = query();
  const ui = {
    q: params.get("q") || "",
    category: params.get("category") || "All",
    brands: new Set(),
    min: 0,
    max: PRICE_MAX,
    availability: "All",
    sort: "featured"
  };

  const brands = [...new Set(STATE.products.map((p) => p.brand))].sort();
  document.getElementById("category-chips").innerHTML =
    ["All", ...CATEGORIES.map((c) => c.id)].map((c) =>
      `<button class="chip ${ui.category === c ? "is-active" : ""}" data-cat="${c}">${c === "All" ? "All" : c}</button>`
    ).join("");
  document.getElementById("brand-filters").innerHTML = brands.map((b) =>
    `<label class="check"><input type="checkbox" value="${b}"> ${b}</label>`
  ).join("");
  document.getElementById("catalog-search").value = ui.q;

  const apply = () => {
    let list = STATE.products.filter((p) => matchesQuery(p, ui.q));
    if (ui.category !== "All") list = list.filter((p) => p.category === ui.category);
    if (ui.brands.size) list = list.filter((p) => ui.brands.has(p.brand));
    list = list.filter((p) => effectivePrice(p) >= ui.min && effectivePrice(p) <= ui.max);
    if (ui.availability !== "All") list = list.filter((p) => p.availability === ui.availability);

    list = [...list].sort((a, b) => {
      if (ui.sort === "newest") return Number(b.newest) - Number(a.newest) || b.createdAt.localeCompare(a.createdAt);
      if (ui.sort === "price-asc") return effectivePrice(a) - effectivePrice(b);
      if (ui.sort === "price-desc") return effectivePrice(b) - effectivePrice(a);
      if (ui.sort === "az") return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    });

    document.getElementById("result-count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    document.getElementById("product-grid").innerHTML = list.length
      ? list.map(productCard).join("")
      : `<div class="empty-state panel" style="grid-column:1/-1"><h3>No matching products</h3><p class="muted">Try another search, clear filters, or <a href="special-orders.html">request a special order</a>.</p></div>`;
  };

  document.getElementById("category-chips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    ui.category = btn.dataset.cat;
    document.querySelectorAll("#category-chips .chip").forEach((c) => c.classList.toggle("is-active", c === btn));
    apply();
  });
  document.getElementById("brand-filters").addEventListener("change", (e) => {
    if (e.target.checked) ui.brands.add(e.target.value);
    else ui.brands.delete(e.target.value);
    apply();
  });
  document.getElementById("price-max").addEventListener("input", (e) => {
    ui.max = Number(e.target.value);
    document.getElementById("price-label").textContent = `${money(0)} – ${money(ui.max)}`;
    apply();
  });
  document.getElementById("availability").addEventListener("change", (e) => {
    ui.availability = e.target.value;
    apply();
  });
  document.getElementById("sort").addEventListener("change", (e) => {
    ui.sort = e.target.value;
    apply();
  });
  document.getElementById("catalog-search").addEventListener("input", (e) => {
    ui.q = e.target.value;
    apply();
  });
  document.getElementById("filter-toggle")?.addEventListener("click", () => {
    document.getElementById("filters").classList.toggle("is-open");
  });
  apply();
}

function pageProduct() {
  const id = Number(query().get("id"));
  const product = STATE.products.find((p) => p.id === id);
  const root = document.getElementById("product-detail");
  if (!product) {
    root.innerHTML = `<div class="empty-state panel"><h1>Product not found</h1><p class="muted">This item may have been moved.</p><p><a class="btn btn-primary" href="products.html">Back to products</a></p></div>`;
    return;
  }
  document.title = `${product.name} for sale in Garissa & Nairobi | Ace Hill Electronics`;
  setMeta("description", `${product.name} by ${product.brand} at Ace Hill Electronics in Garissa, Nairobi and North Eastern Kenya. ${product.shortDescription}. ${money(effectivePrice(product))}.`);
  setMeta("og:image", siteUrl(productImages(product)[0]), "property");
  const schema = businessSchema();
  schema["@graph"].push(productSchema(product));
  injectJsonLd(schema);
  const related = STATE.products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  root.innerHTML = `
    <div class="detail-grid">
      ${productGallery(product)}
      <div>
        <p class="brand-kicker">${product.brand} · ${product.category} / ${product.subcategory}</p>
        <h1 style="margin-top:8px">${product.name}</h1>
        <p class="muted" style="margin-top:8px">SKU ${product.sku} · Model ${product.model}</p>
        <div class="price" style="font-size:1.6rem;margin:16px 0">${money(effectivePrice(product))}${product.discountPrice ? `<s>${money(product.price)}</s>` : ""}</div>
        <div class="stock ${stockClass(product)}">${product.availability}</div>
        <p style="margin-top:16px;line-height:1.7">${product.description} Available at Ace Hill Electronics in Garissa, Nairobi and North Eastern Kenya.</p>
        <h3 style="margin-top:22px">Specifications</h3>
        <div class="spec-list">
          ${Object.entries(product.specs).map(([k, v]) => `<div class="spec"><span>${k}</span><strong>${v}</strong></div>`).join("")}
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" data-add="${product.id}" ${inStock(product) ? "" : ""}>Add to enquiry</button>
          <button class="btn btn-green" data-wa="${product.id}">${icon("wa")} Order via WhatsApp</button>
        </div>
      </div>
    </div>
    <div class="section-head" style="margin-top:48px"><h2>Related products</h2><a href="${catalogUrl({ category: product.category })}">View category</a></div>
    <div class="product-grid">${related.map(productCard).join("")}</div>`;
  root.addEventListener("click", (e) => {
    const thumb = e.target.closest("[data-gallery]");
    if (!thumb) return;
    const main = root.querySelector(".detail-shot .product-photo");
    if (!main) return;
    main.dataset.stage = "";
    main.src = thumb.getAttribute("data-gallery");
    root.querySelector(".detail-shot")?.classList.add("has-photo");
    root.querySelectorAll("[data-gallery]").forEach((el) => el.classList.toggle("is-active", el === thumb));
  });
}

function pageSpecial() {
  document.getElementById("special-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const msg = `Hello Ace Hill Electronics, I would like to request a product that may not be in the local catalogue.

Product name: ${data.name}
Description: ${data.description}
Quantity: ${data.qty}
Customer name: ${data.customer}
Phone: ${data.phone}

Please confirm availability, sourcing time and final price.`;
    openWaPicker(msg);
  });
}

function pageContact() {
  const root = document.getElementById("contact-root");
  if (!root) return;
  root.innerHTML = `
    <div class="page-hero">
      <h1>Visit Ace Hill Electronics in Garissa and Nairobi</h1>
      <p class="muted" style="margin-top:10px">Two branches serving Garissa, Nairobi and North Eastern Kenya. Call, WhatsApp, or get directions to the shop nearest you. Search CCTV camera Garissa or electronics Nairobi — we are Ace Hill.</p>
    </div>
    <div class="branch-grid" style="margin-top:28px">
      ${STORE.branches.map((b) => `
        <article class="panel card">
          <p class="brand-kicker">${b.label}</p>
          <h2 style="margin-top:6px">${b.city}</h2>
          <p style="margin-top:10px">${b.address}</p>
          <p style="margin-top:8px"><a href="${b.phoneHref}">${b.phoneDisplay}</a></p>
          <div class="hero-actions" style="margin-top:16px">
            <a class="btn btn-green" href="${waUrl("Hello Ace Hill Electronics, I would like to make an enquiry.", b.whatsapp).replace(/&/g, "&amp;")}" target="_blank" rel="noopener">${icon("wa")} WhatsApp ${b.city}</a>
            <a class="btn btn-outline" href="${mapsUrl(b)}" target="_blank" rel="noopener">Get directions</a>
          </div>
          <div class="map-frame" style="margin-top:18px">
            <iframe title="Map of ${b.label}" src="${b.mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </article>
      `).join("")}
    </div>
    <div class="info-grid" style="margin-top:22px">
      <article class="panel card">
        <h3>Opening hours</h3>
        ${STORE.hours.map((h) => `<p>${h.day}: ${h.time}</p>`).join("")}
      </article>
      <article class="panel card">
        <h3>Email</h3>
        <p><a href="mailto:${STORE.email}">${STORE.email}</a></p>
      </article>
      <article class="panel card">
        <h3>Online sales & delivery</h3>
        <p class="muted">Order through WhatsApp to the branch that will serve you. Delivery can be arranged after the shop confirms the items.</p>
      </article>
    </div>
  `;
}

async function loadProducts() {
  const res = await fetch("data/products.json");
  STATE.products = await res.json();
}

async function boot() {
  renderHeader();
  renderFooter();
  const page = document.body.dataset.page;
  const seoByPage = {
    home: { path: "" },
    products: { path: "products.html" },
    product: { path: "product.html" },
    services: { path: "services.html" },
    special: { path: "special-orders.html" },
    about: { path: "about.html" },
    contact: { path: "contact.html" }
  };
  injectSeo(seoByPage[page] || { path: "" });
  try {
    await loadProducts();
  } catch (err) {
    document.body.insertAdjacentHTML("afterbegin", `<div class="wrap" style="padding:20px"><div class="panel card"><strong>Could not load products.json.</strong> Start a local server from this folder: <code>npm start</code></div></div>`);
    bindGlobal();
    return;
  }
  bindGlobal();
  if (page === "home") pageHome();
  if (page === "products") pageProducts();
  if (page === "product") pageProduct();
  if (page === "special") pageSpecial();
  if (page === "contact") pageContact();
}

boot();
