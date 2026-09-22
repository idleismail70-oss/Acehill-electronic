/* Ace Hill — simple site script
   Loads products, shows cards, search, enquiry cart, WhatsApp.
*/

const products = [];
let cart = JSON.parse(localStorage.getItem("acehill-cart") || "[]");

// --- helpers ---

function money(n) {
  return "KES " + Number(n).toLocaleString("en-KE");
}

function priceOf(p) {
  return p.discountPrice || p.price;
}

function photo(p) {
  // product.image, or a category picture
  if (p.image) return p.image.startsWith("/") || p.image.startsWith("http") ? p.image : "/" + p.image;
  const fallback = {
    Phones: "/images/products/cat-phones.svg",
    Laptops: "/images/products/cat-laptops.svg",
    Tablets: "/images/products/cat-tablets.svg",
    CCTV: "/images/products/cat-cctv.svg",
    Accessories: "/images/products/cat-accessories.svg"
  };
  return fallback[p.category] || "/images/products/cat-accessories.svg";
}

function getParams() {
  // support both ?id=1 and #id=1
  const q = new URLSearchParams(location.search);
  const h = new URLSearchParams(location.hash.replace(/^#/, ""));
  h.forEach((v, k) => {
    if (!q.get(k)) q.set(k, v);
  });
  return q;
}

function productLink(id) {
  return "/product.html#id=" + id;
}

function productsLink(extra) {
  if (!extra) return "/products.html";
  const p = new URLSearchParams(extra);
  return "/products.html#" + p.toString();
}

function matches(p, q) {
  if (!q) return true;
  const text = [p.name, p.brand, p.category, p.model, p.description, p.sku].join(" ").toLowerCase();
  return text.includes(q.toLowerCase());
}

function waText(msg) {
  return (
    "Hello Ace Hill Electronics (acehillonlinemarket.co.ke)\n\n" +
    msg.trim() +
    "\n\nSent from acehillonlinemarket.co.ke"
  );
}

function waLink(msg, number) {
  return "https://wa.me/" + number + "/?text=" + encodeURIComponent(waText(msg));
}

function saveCart() {
  localStorage.setItem("acehill-cart", JSON.stringify(cart));
  const n = cart.reduce((s, i) => s + i.qty, 0);
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
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("is-on"), 2000);
}

// --- product card HTML ---

function productCard(p) {
  const sale = p.discountPrice
    ? '<span class="badge badge-sale">Sale</span>'
    : "";
  return `
  <article class="product-card">
    <a href="${productLink(p.id)}">
      <div class="product-shot has-photo ${p.category}">
        <div class="shot-badge">${sale}</div>
        <img class="product-photo" src="${photo(p)}" alt="${p.name}" loading="lazy"
             onerror="this.src='/images/products/cat-accessories.svg'">
      </div>
    </a>
    <div class="product-body">
      <div class="brand-kicker">${p.brand}</div>
      <h3><a href="${productLink(p.id)}">${p.name}</a></h3>
      <p class="muted">${p.shortDescription || ""}</p>
      <div class="price">${money(priceOf(p))}${
        p.discountPrice ? "<s>" + money(p.price) + "</s>" : ""
      }</div>
      <div class="stock ${p.availability === "In Stock" ? "in" : "out"}">${p.availability}</div>
      <div class="card-actions">
        <a class="btn btn-outline btn-sm" href="${productLink(p.id)}">View</a>
        <button class="btn btn-green btn-sm" type="button" data-wa="${p.id}">WhatsApp</button>
      </div>
    </div>
  </article>`;
}

// --- header / footer ---

function renderHeader() {
  const page = (location.pathname.split("/").pop() || "index.html") || "index.html";
  const links = [
    ["/index.html", "Home", "index.html"],
    ["/products.html", "Products", "products.html"],
    ["/services.html", "Services", "services.html"],
    ["/special-orders.html", "Special Orders", "special-orders.html"],
    ["/about.html", "About Us", "about.html"],
    ["/contact.html", "Contact", "contact.html"]
  ];

  document.getElementById("site-header").innerHTML = `
  <header class="site-header">
    <div class="branch-bar">
      <div class="wrap branch-bar-inner">
        ${STORE.branches
          .map((b) => `<a href="${b.phoneHref}"><strong>${b.city}</strong> ${b.phoneDisplay}</a>`)
          .join("")}
      </div>
    </div>
    <div class="wrap header-top">
      <a class="brand" href="/index.html">
        <img src="/images/logo.svg" alt="Ace Hill Electronics">
        <span class="brand-text"><strong>ACE HILL</strong><span>Electronics</span></span>
      </a>
      <form class="header-search" id="header-search">
        <input type="search" name="q" placeholder="Search phones, laptops, CCTV..." aria-label="Search">
        <div class="search-panel" id="search-panel"></div>
      </form>
      <div class="header-actions">
        <button class="btn btn-green btn-sm" type="button" id="open-wa">WhatsApp</button>
        <button class="icon-btn" type="button" id="open-search" aria-label="Search">⌕</button>
        <button class="icon-btn" type="button" id="open-cart" aria-label="Enquiry list">🛒
          <span class="cart-count" hidden>0</span>
        </button>
        <button class="nav-toggle" type="button" id="nav-toggle" aria-label="Menu">☰</button>
      </div>
    </div>
    <nav class="wrap header-nav" id="main-nav">
      ${links
        .map(
          ([href, label, file]) =>
            `<a href="${href}" class="${page === file ? "is-active" : ""}">${label}</a>`
        )
        .join("")}
    </nav>
  </header>`;
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <a class="brand" href="/index.html">
          <img src="/images/logo.svg" alt="" width="44" height="44">
          <span class="brand-text"><strong>ACE HILL</strong><span>Electronics</span></span>
        </a>
        <p style="margin-top:12px;max-width:36ch">${STORE.tagline}</p>
      </div>
      <div>
        <h3>Shop</h3>
        <p><a href="/products.html">All products</a></p>
        ${CATEGORIES.map((c) => `<p><a href="${productsLink({ category: c.id })}">${c.label}</a></p>`).join("")}
      </div>
      <div>
        <h3>Company</h3>
        <p><a href="/services.html">Services</a></p>
        <p><a href="/special-orders.html">Special orders</a></p>
        <p><a href="/about.html">About us</a></p>
        <p><a href="/contact.html">Contact</a></p>
        <p><a href="/locations/">Branches</a></p>
      </div>
      <div>
        <h3>Branches</h3>
        ${STORE.branches
          .map(
            (b) => `
          <p><strong>${b.city}</strong></p>
          <p><a href="${b.phoneHref}">${b.phoneDisplay}</a></p>
          <p>${b.address}</p>
          <p><a href="/locations/${b.id}/">${b.city} pages</a></p>`
          )
          .join("")}
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span>© ${new Date().getFullYear()} Ace Hill Electronics</span>
      <span>Garissa · Nairobi · North Eastern Kenya</span>
    </div>
  </footer>

  <button class="whatsapp-float" type="button" id="float-wa" aria-label="WhatsApp">WA</button>
  <div class="overlay" id="overlay"></div>

  <div class="wa-modal" id="wa-picker" role="dialog">
    <h2>Choose a branch</h2>
    <p class="muted">Your WhatsApp message will show it came from acehillonlinemarket.co.ke</p>
    <div class="wa-choices" id="wa-choices"></div>
    <button class="btn btn-outline" type="button" id="close-wa">Cancel</button>
  </div>

  <aside class="drawer" id="cart-drawer">
    <div class="drawer-head">
      <h2>Enquiry list</h2>
      <button class="icon-btn" type="button" id="close-cart" aria-label="Close">✕</button>
    </div>
    <div class="drawer-body" id="cart-body"></div>
    <div class="drawer-foot">
      <button class="btn btn-green" type="button" id="send-enquiry">Send via WhatsApp</button>
      <button class="btn btn-outline" type="button" id="clear-cart">Clear list</button>
    </div>
  </aside>`;
}

function renderCart() {
  const body = document.getElementById("cart-body");
  if (!body) return;
  if (!cart.length) {
    body.innerHTML = "<div class='empty-state'><p>Your enquiry list is empty.</p></div>";
    return;
  }
  body.innerHTML = cart
    .map((item) => {
      const p = products.find((x) => x.id === item.id);
      if (!p) return "";
      return `
      <div class="cart-item">
        <img class="cart-thumb product-photo" src="${photo(p)}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:10px">
        <div>
          <strong>${p.name}</strong>
          <div class="muted">${money(priceOf(p))}</div>
          <div class="qty">
            <button type="button" data-qty="${p.id}" data-d="-1">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty="${p.id}" data-d="1">+</button>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" type="button" data-remove="${p.id}">Remove</button>
      </div>`;
    })
    .join("");
}

// --- WhatsApp branch picker ---

function openWa(msg) {
  const overlay = document.getElementById("overlay");
  const picker = document.getElementById("wa-picker");
  const box = document.getElementById("wa-choices");
  document.getElementById("cart-drawer")?.classList.remove("is-open");
  box.innerHTML = "";
  STORE.branches.forEach((b) => {
    const a = document.createElement("a");
    a.className = "btn btn-green";
    a.target = "_blank";
    a.rel = "noopener";
    a.href = waLink(msg, b.whatsapp);
    a.textContent = b.city + " · " + b.phoneDisplay;
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = b.address;
    box.append(a, note);
  });
  overlay.classList.add("is-open");
  picker.classList.add("is-open");
}

function closeOverlays() {
  document.getElementById("overlay")?.classList.remove("is-open");
  document.getElementById("cart-drawer")?.classList.remove("is-open");
  document.getElementById("wa-picker")?.classList.remove("is-open");
}

// --- events used on every page ---

function bindGlobal() {
  const form = document.getElementById("header-search");
  const input = form?.querySelector("input");
  const panel = document.getElementById("search-panel");

  input?.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    const hits = products.filter((p) => matches(p, q)).slice(0, 6);
    panel.classList.add("is-open");
    panel.innerHTML = hits.length
      ? hits
          .map(
            (p) =>
              `<a class="search-hit" href="${productLink(p.id)}"><div><strong>${p.name}</strong><span>${p.brand} · ${money(priceOf(p))}</span></div></a>`
          )
          .join("") +
        `<a class="search-more" href="${productsLink({ q })}">See all results</a>`
      : `<div class="search-empty">No match for “${q}”</div>`;
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    location.href = productsLink({ q: input.value.trim() });
  });

  document.addEventListener("click", (e) => {
    if (!form?.contains(e.target)) panel?.classList.remove("is-open");
  });

  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    document.getElementById("main-nav")?.classList.toggle("is-open");
  });
  document.getElementById("open-search")?.addEventListener("click", () => {
    form?.classList.toggle("is-open");
    input?.focus();
  });

  document.getElementById("open-cart")?.addEventListener("click", () => {
    document.getElementById("wa-picker")?.classList.remove("is-open");
    document.getElementById("overlay")?.classList.add("is-open");
    document.getElementById("cart-drawer")?.classList.add("is-open");
    renderCart();
  });
  document.getElementById("close-cart")?.addEventListener("click", closeOverlays);
  document.getElementById("close-wa")?.addEventListener("click", closeOverlays);
  document.getElementById("overlay")?.addEventListener("click", closeOverlays);

  const ask = () => openWa("I would like to make an enquiry.");
  document.getElementById("open-wa")?.addEventListener("click", ask);
  document.getElementById("float-wa")?.addEventListener("click", ask);

  document.getElementById("cart-body")?.addEventListener("click", (e) => {
    const qty = e.target.closest("[data-qty]");
    if (qty) {
      const id = Number(qty.dataset.qty);
      const item = cart.find((x) => x.id === id);
      const next = (item?.qty || 1) + Number(qty.dataset.d);
      if (next <= 0) cart = cart.filter((x) => x.id !== id);
      else if (item) item.qty = next;
      saveCart();
      renderCart();
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      cart = cart.filter((x) => x.id !== Number(rm.dataset.remove));
      saveCart();
      renderCart();
    }
  });

  document.getElementById("clear-cart")?.addEventListener("click", () => {
    cart = [];
    saveCart();
    renderCart();
  });

  document.getElementById("send-enquiry")?.addEventListener("click", () => {
    if (!cart.length) return toast("Add products first");
    const lines = cart.map((item, i) => {
      const p = products.find((x) => x.id === item.id);
      return i + 1 + ". " + (p ? p.name : "Product") + " × " + item.qty;
    });
    closeOverlays();
    openWa("I would like to enquire about:\n\n" + lines.join("\n") + "\n\nPlease confirm availability and final price.");
  });

  document.body.addEventListener("click", (e) => {
    const wa = e.target.closest("[data-wa]");
    if (wa) {
      const p = products.find((x) => x.id === Number(wa.dataset.wa));
      if (p) openWa("I would like to order " + p.name + ". Listed price: " + money(priceOf(p)) + ".");
    }
    const msg = e.target.closest("[data-wa-msg]");
    if (msg) {
      e.preventDefault();
      openWa(msg.dataset.waMsg);
    }
    const add = e.target.closest("[data-add]");
    if (add) {
      const id = Number(add.dataset.add);
      const found = cart.find((x) => x.id === id);
      if (found) found.qty += 1;
      else cart.push({ id, qty: 1 });
      saveCart();
      toast("Added to enquiry list");
      renderCart();
    }
  });

  saveCart();
}

// --- page-specific ---

function pageHome() {
  document.getElementById("category-grid").innerHTML = CATEGORIES.map(
    (c) => `
    <a class="cat-card" href="${productsLink({ category: c.id })}">
      <div class="cat-icon">•</div>
      <div><h3>${c.label}</h3><p>${c.blurb}</p></div>
    </a>`
  ).join("");
  document.getElementById("featured-grid").innerHTML = products
    .filter((p) => p.featured)
    .map(productCard)
    .join("");
  document.getElementById("popular-grid").innerHTML = products
    .filter((p) => p.popular)
    .slice(0, 8)
    .map(productCard)
    .join("");
  document.getElementById("hero-search")?.addEventListener("submit", (e) => {
    e.preventDefault();
    location.href = productsLink({ q: e.target.q.value.trim() });
  });
}

function pageProducts() {
  const params = getParams();
  let q = params.get("q") || "";
  let category = params.get("category") || "All";
  let sort = "featured";
  let maxPrice = 200000;
  let availability = "All";
  const brands = new Set();

  // category chips
  document.getElementById("category-chips").innerHTML = ["All", ...CATEGORIES.map((c) => c.id)]
    .map(
      (c) =>
        `<button class="chip ${category === c ? "is-active" : ""}" type="button" data-cat="${c}">${c}</button>`
    )
    .join("");

  // brand checkboxes
  const brandList = [...new Set(products.map((p) => p.brand))].sort();
  document.getElementById("brand-filters").innerHTML = brandList
    .map((b) => `<label class="check"><input type="checkbox" value="${b}"> ${b}</label>`)
    .join("");

  document.getElementById("catalog-search").value = q;

  function show() {
    let list = products.filter((p) => matches(p, q));
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (brands.size) list = list.filter((p) => brands.has(p.brand));
    list = list.filter((p) => priceOf(p) <= maxPrice);
    if (availability !== "All") list = list.filter((p) => p.availability === availability);

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return priceOf(a) - priceOf(b);
      if (sort === "price-desc") return priceOf(b) - priceOf(a);
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "newest") return Number(b.newest) - Number(a.newest);
      return Number(b.featured) - Number(a.featured);
    });

    document.getElementById("result-count").textContent =
      list.length + " product" + (list.length === 1 ? "" : "s");
    document.getElementById("product-grid").innerHTML = list.length
      ? list.map(productCard).join("")
      : `<div class="empty-state panel" style="grid-column:1/-1"><h3>No matching products</h3><p class="muted">Try another search or clear filters.</p></div>`;
  }

  document.getElementById("category-chips").onclick = (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    category = btn.dataset.cat;
    document.querySelectorAll("#category-chips .chip").forEach((c) => c.classList.toggle("is-active", c === btn));
    show();
  };

  document.getElementById("brand-filters").onchange = (e) => {
    if (e.target.checked) brands.add(e.target.value);
    else brands.delete(e.target.value);
    show();
  };

  document.getElementById("price-max").oninput = (e) => {
    maxPrice = Number(e.target.value);
    document.getElementById("price-label").textContent = money(0) + " – " + money(maxPrice);
    show();
  };

  document.getElementById("availability").onchange = (e) => {
    availability = e.target.value;
    show();
  };

  document.getElementById("catalog-search").oninput = (e) => {
    q = e.target.value;
    show();
  };

  document.getElementById("sort").onchange = (e) => {
    sort = e.target.value;
    show();
  };

  document.getElementById("filter-toggle")?.addEventListener("click", () => {
    document.getElementById("filters")?.classList.toggle("is-open");
  });

  show();
}

function pageProduct() {
  const id = Number(getParams().get("id"));
  const p = products.find((x) => x.id === id);
  const root = document.getElementById("product-detail");
  if (!p) {
    root.innerHTML = `<div class="empty-state panel"><h1>Product not found</h1><p><a class="btn btn-primary" href="/products.html">Back</a></p></div>`;
    return;
  }

  document.title = p.name + " | Ace Hill Electronics";
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const specs = Object.entries(p.specs || {})
    .map(([k, v]) => `<div class="spec"><span>${k}</span><strong>${v}</strong></div>`)
    .join("");

  root.innerHTML = `
  <div class="detail-grid">
    <div class="product-shot has-photo detail-shot panel ${p.category}">
      <img class="product-photo" src="${photo(p)}" alt="${p.name}"
           onerror="this.src='/images/products/cat-accessories.svg'">
    </div>
    <div>
      <p class="brand-kicker">${p.brand} · ${p.category}</p>
      <h1 style="margin-top:8px">${p.name}</h1>
      <p class="muted" style="margin-top:8px">SKU ${p.sku}</p>
      <div class="price" style="font-size:1.6rem;margin:16px 0">${money(priceOf(p))}${
        p.discountPrice ? "<s>" + money(p.price) + "</s>" : ""
      }</div>
      <div class="stock ${p.availability === "In Stock" ? "in" : "out"}">${p.availability}</div>
      <p style="margin-top:16px;line-height:1.7">${p.description}</p>
      <h3 style="margin-top:22px">Specifications</h3>
      <div class="spec-list">${specs}</div>
      <div class="hero-actions">
        <button class="btn btn-primary" type="button" data-add="${p.id}">Add to enquiry</button>
        <button class="btn btn-green" type="button" data-wa="${p.id}">Order via WhatsApp</button>
      </div>
    </div>
  </div>
  <div class="section-head" style="margin-top:48px">
    <h2>Related products</h2>
    <a href="${productsLink({ category: p.category })}">View category</a>
  </div>
  <div class="product-grid">${related.map(productCard).join("")}</div>`;
}

function pageSpecial() {
  document.getElementById("special-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    openWa(
      "Special order request\n\nProduct: " +
        d.name +
        "\nDescription: " +
        d.description +
        "\nQty: " +
        d.qty +
        "\nName: " +
        d.customer +
        "\nPhone: " +
        d.phone
    );
  });
}

// --- start ---

async function start() {
  renderHeader();
  renderFooter();

  try {
    const res = await fetch("/data/products.json");
    const data = await res.json();
    products.push(...data);
  } catch (err) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="wrap" style="padding:20px"><div class="panel card"><strong>Could not load products.</strong> Run <code>npm start</code> then open http://localhost:4173</div></div>'
    );
    bindGlobal();
    return;
  }

  bindGlobal();
  const page = document.body.dataset.page;
  if (page === "home") pageHome();
  if (page === "products") pageProducts();
  if (page === "product") pageProduct();
  if (page === "special") pageSpecial();
}

start();
