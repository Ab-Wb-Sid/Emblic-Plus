/* ==========================================================
   EMBLIC PLUS — front-end only shop
   Cart + orders are saved in the browser with localStorage.
   ========================================================== */

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const money = (n) => `${SHOP.currency} ${Math.round(n).toLocaleString("en-PK")}`;
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
const page = document.body.dataset.page;

function stars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += '<i class="fa-solid fa-star"></i>';
    else if (rating >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

function store(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked: cart lives in memory */ }
}

/* ---------- cart ---------- */
let cart = store("emblic-cart", []); // [{ id, qty }]
let coupon = store("emblic-coupon", null);

const Cart = {
  items() {
    return cart.map((i) => ({ ...findProduct(i.id), qty: i.qty })).filter((i) => i.name);
  },
  count() { return cart.reduce((s, i) => s + i.qty, 0); },
  add(id, qty = 1) {
    const line = cart.find((i) => i.id === id);
    line ? (line.qty += qty) : cart.push({ id, qty });
    this.commit();
    toast(`${findProduct(id).name} added to cart`);
  },
  setQty(id, qty) {
    if (qty < 1) return this.remove(id);
    cart.find((i) => i.id === id).qty = Math.min(qty, 20);
    this.commit();
  },
  remove(id) { cart = cart.filter((i) => i.id !== id); this.commit(); },
  clear() { cart = []; coupon = null; save("emblic-coupon", null); this.commit(); },
  totals() {
    const subtotal = this.items().reduce((s, i) => s + i.price * i.qty, 0);
    const discount = coupon ? subtotal * SHOP.coupons[coupon] : 0;
    const afterDiscount = subtotal - discount;
    const shipping = subtotal === 0 || afterDiscount >= SHOP.freeShippingAt ? 0 : SHOP.shippingFee;
    return { subtotal, discount, shipping, total: afterDiscount + shipping };
  },
  commit() { save("emblic-cart", cart); renderCartUI(); }
};

/* ---------- shared layout (header, footer, drawer, search) ---------- */
function layout() {
  const links = [
    ["index.html#home", "Home"], ["index.html#about", "About"], ["index.html#benefits", "Benefits"],
    ["index.html#ingredients", "Ingredients"], ["shop.html", "Shop"], ["index.html#reviews", "Reviews"]
  ];
  const nav = links.map(([href, label]) =>
    `<a href="${href}" class="${(page === "shop" && label === "Shop") || (page === "home" && label === "Home") ? "active" : ""}">${label}</a>`
  ).join("");

  $("#site-header").outerHTML = `
  <header class="header ${page === "home" ? "header--over" : ""}" id="header">
    <div class="container header__inner">
      <a href="index.html" class="logo" aria-label="Emblic Plus home"><span class="logo__name">Emblic</span><span class="logo__plus">plus</span></a>
      <nav class="nav" id="nav">${nav}</nav>
      <div class="header__icons">
        <button id="searchBtn" aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></button>
        <button id="cartBtn" class="cart-btn" aria-label="Open cart"><i class="fa-solid fa-bag-shopping"></i><span class="cart-count" hidden>0</span></button>
        <button id="burgerBtn" class="burger" aria-label="Menu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
  </header>`;

  $("#site-footer").outerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <a href="index.html" class="logo"><span class="logo__name">Emblic</span><span class="logo__plus">plus</span></a>
        <nav class="footer__links">${links.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}</nav>
        <div class="footer__social">
          <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          <a href="#" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
        </div>
      </div>
      <div class="footer__bottom">
        <p>© ${new Date().getFullYear()} Emblic Plus. All rights reserved.</p>
        <p><a href="#">Privacy Policy</a> &nbsp;|&nbsp; <a href="#">Terms &amp; Conditions</a></p>
      </div>
    </div>
  </footer>

  <div class="overlay" id="overlay"></div>

  <aside class="drawer" id="drawer" aria-label="Shopping cart" aria-hidden="true">
    <div class="drawer__head">
      <h3>Your Cart</h3>
      <button class="icon-btn" id="closeDrawer" aria-label="Close cart"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="ship-bar" id="drawerShip"></div>
    <div class="drawer__items" id="drawerItems"></div>
    <div class="drawer__foot">
      <div class="row"><span>Subtotal</span><strong id="drawerSubtotal">PKR 0</strong></div>
      <p class="muted small">Shipping &amp; discounts calculated at checkout.</p>
      <a href="checkout.html" class="btn btn-block" id="drawerCheckout">Checkout <i class="fa-solid fa-arrow-right"></i></a>
      <a href="cart.html" class="link-center">View full cart</a>
    </div>
  </aside>

  <div class="search" id="search" hidden>
    <div class="search__box">
      <div class="search__field">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="search" id="searchInput" placeholder="Search products…" autocomplete="off" />
        <button class="icon-btn" id="closeSearch" aria-label="Close search"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="search__results" id="searchResults"></div>
    </div>
  </div>

  <div class="toast" id="toast" role="status"></div>`;
}

function renderCartUI() {
  const count = Cart.count();
  const badge = $(".cart-count");
  if (badge) { badge.textContent = count; badge.hidden = count === 0; }

  const box = $("#drawerItems");
  if (!box) return;
  const items = Cart.items();
  const { subtotal } = Cart.totals();

  box.innerHTML = items.length
    ? items.map(lineItem).join("")
    : `<div class="empty"><i class="fa-solid fa-bag-shopping"></i><p>Your cart is empty.</p><a href="shop.html" class="btn btn-sm">Shop now</a></div>`;
  $("#drawerSubtotal").textContent = money(subtotal);
  $("#drawerCheckout").classList.toggle("disabled", !items.length);
  $("#drawerShip").innerHTML = shipBar(subtotal);

  if (page === "cart") renderCartPage();
  if (page === "checkout") renderSummary();
}

function lineItem(i) {
  return `
  <div class="line" data-id="${i.id}">
    <img src="${i.image}" alt="${i.name}" />
    <div class="line__info">
      <a href="product.html?id=${i.id}" class="line__name">${i.name}</a>
      <span class="muted small">${i.size}</span>
      <div class="qty qty--sm">
        <button data-act="dec" aria-label="Decrease">−</button><span>${i.qty}</span><button data-act="inc" aria-label="Increase">+</button>
      </div>
    </div>
    <div class="line__end">
      <strong>${money(i.price * i.qty)}</strong>
      <button data-act="remove" class="link-muted">Remove</button>
    </div>
  </div>`;
}

function shipBar(subtotal) {
  if (subtotal === 0) return "";
  const left = SHOP.freeShippingAt - subtotal;
  const pct = Math.min(100, (subtotal / SHOP.freeShippingAt) * 100);
  const msg = left > 0
    ? `Add <strong>${money(left)}</strong> more for free shipping`
    : `<i class="fa-solid fa-truck-fast"></i> You've unlocked <strong>free shipping</strong>`;
  return `<p>${msg}</p><div class="ship-bar__track"><span style="width:${pct}%"></span></div>`;
}

/* qty / remove buttons anywhere in a cart list */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  const line = btn && btn.closest("[data-id]");
  if (line) {
    const id = line.dataset.id;
    const current = cart.find((i) => i.id === id)?.qty || 0;
    if (btn.dataset.act === "inc") Cart.setQty(id, current + 1);
    if (btn.dataset.act === "dec") Cart.setQty(id, current - 1);
    if (btn.dataset.act === "remove") Cart.remove(id);
  }
  const add = e.target.closest("[data-add]");
  if (add) { e.preventDefault(); Cart.add(add.dataset.add); }
});

/* ---------- drawer, menu, search ---------- */
function openDrawer() {
  $("#drawer").classList.add("open"); $("#overlay").classList.add("show");
  $("#drawer").setAttribute("aria-hidden", "false"); document.body.classList.add("lock");
}
function closeDrawer() {
  $("#drawer").classList.remove("open"); $("#overlay").classList.remove("show");
  $("#drawer").setAttribute("aria-hidden", "true"); document.body.classList.remove("lock");
}
function openSearch() { $("#search").hidden = false; $("#searchInput").focus(); renderSearch(""); }
function closeSearch() { $("#search").hidden = true; }

function renderSearch(q) {
  q = q.trim().toLowerCase();
  const hits = PRODUCTS.filter((p) => (p.name + p.size + p.short + p.category).toLowerCase().includes(q));
  $("#searchResults").innerHTML = hits.length
    ? hits.map((p) => `
      <a href="product.html?id=${p.id}" class="search__hit">
        <img src="${p.image}" alt="" /><span><strong>${p.name}</strong><small>${p.size}</small></span><em>${money(p.price)}</em>
      </a>`).join("")
    : `<p class="muted small">No products match “${q}”.</p>`;
}

function bindLayout() {
  $("#cartBtn").addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);
  $("#searchBtn").addEventListener("click", openSearch);
  $("#closeSearch").addEventListener("click", closeSearch);
  $("#search").addEventListener("click", (e) => { if (e.target.id === "search") closeSearch(); });
  $("#searchInput").addEventListener("input", (e) => renderSearch(e.target.value));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDrawer(); closeSearch(); } });

  const nav = $("#nav"), burger = $("#burgerBtn");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open"); burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));

  const header = $("#header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg} <button onclick="openDrawer()">View cart</button>`;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ---------- product card ---------- */
function productCard(p) {
  return `
  <article class="card">
    <a href="product.html?id=${p.id}" class="card__img">
      <img src="${p.image}" alt="${p.name} ${p.size}" loading="lazy" />
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
    </a>
    <div class="card__body">
      <div class="stars">${stars(p.rating)}<span>(${p.reviews})</span></div>
      <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <p class="muted small">${p.size}</p>
      <div class="card__foot">
        <div class="price">${money(p.price)} ${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</div>
        <button class="btn btn-sm" data-add="${p.id}" aria-label="Add ${p.name} to cart"><i class="fa-solid fa-plus"></i> Add</button>
      </div>
    </div>
  </article>`;
}

/* ==========================================================
   PAGES
   ========================================================== */
function initHome() {
  $("#featured").innerHTML = PRODUCTS.map(productCard).join("");

  // reviews slider (mobile: one at a time, desktop: scrolls by card)
  const track = $(".reviews__track");
  const step = () => track.firstElementChild.getBoundingClientRect().width + 20;
  $("#prevReview").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  $("#nextReview").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

  // highlight nav link of the section in view
  const links = $$("#nav a");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `index.html#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach((s) => io.observe(s));

  // newsletter
  $("#newsletter").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.innerHTML = `<p class="nl-done"><i class="fa-solid fa-envelope-circle-check"></i> Thanks! Use code <strong>WELCOME5</strong> for 5% off.</p>`;
  });
}

function initShop() {
  const grid = $("#shopGrid"), sort = $("#sort");
  let filter = new URLSearchParams(location.search).get("cat") || "all";

  function render() {
    let list = PRODUCTS.filter((p) => filter === "all" || p.category === filter);
    if (sort.value === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort.value === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort.value === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    grid.innerHTML = list.map(productCard).join("");
    $("#shopCount").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    $$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === filter));
  }
  $$(".chip").forEach((c) => c.addEventListener("click", () => { filter = c.dataset.cat; render(); }));
  sort.addEventListener("change", render);
  render();
}

function initProduct() {
  const p = findProduct(new URLSearchParams(location.search).get("id")) || PRODUCTS[0];
  document.title = `${p.name} ${p.size} | Emblic Plus`;
  let qty = 1;

  $("#product").innerHTML = `
    <nav class="crumbs"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span>${p.name}</span></nav>
    <div class="pd">
      <div class="pd__media"><img src="${p.image}" alt="${p.name} ${p.size}" />${p.tag ? `<span class="tag">${p.tag}</span>` : ""}</div>
      <div class="pd__info">
        <p class="eyebrow">Emblic Plus</p>
        <h1 class="section-title">${p.name}</h1>
        <p class="pd__size">${p.size}</p>
        <div class="stars">${stars(p.rating)}<span>${p.rating} · ${p.reviews} reviews</span></div>
        <div class="price price--lg">${money(p.price)} ${p.oldPrice ? `<s>${money(p.oldPrice)}</s><em>Save ${money(p.oldPrice - p.price)}</em>` : ""}</div>
        <p class="pd__desc">${p.description}</p>
        <ul class="pd__details">${p.details.map((d) => `<li><i class="fa-solid fa-circle-check"></i>${d}</li>`).join("")}</ul>
        <div class="pd__buy">
          <div class="qty"><button id="qMinus" aria-label="Decrease">−</button><span id="qVal">1</span><button id="qPlus" aria-label="Increase">+</button></div>
          <button class="btn" id="addBtn">Add to Cart <i class="fa-solid fa-bag-shopping"></i></button>
        </div>
        <button class="btn btn-outline btn-block" id="buyNow">Buy it now</button>
        <div class="pd__perks">
          <span><i class="fa-solid fa-truck-fast"></i>Free shipping over ${money(SHOP.freeShippingAt)}</span>
          <span><i class="fa-solid fa-money-bill-wave"></i>Cash on delivery</span>
          <span><i class="fa-solid fa-rotate-left"></i>7-day easy returns</span>
        </div>
        <details class="acc" open><summary>How to use</summary><p>Warm a little oil between your palms and massage into the scalp in small circles for 5 minutes. Work the rest through to the ends. Leave on for at least 1 hour (or overnight) and wash with a mild shampoo. Use 2–3 times a week.</p></details>
        <details class="acc"><summary>Ingredients</summary><p>Amla (Emblica officinalis) extract, Bhringraj (Eclipta alba) extract, cold-pressed coconut oil, sesame oil, vitamin E.</p></details>
      </div>
    </div>`;

  const setQ = (n) => { qty = Math.max(1, Math.min(20, n)); $("#qVal").textContent = qty; };
  $("#qMinus").onclick = () => setQ(qty - 1);
  $("#qPlus").onclick = () => setQ(qty + 1);
  $("#addBtn").onclick = () => { Cart.add(p.id, qty); openDrawer(); };
  $("#buyNow").onclick = () => { Cart.add(p.id, qty); location.href = "checkout.html"; };

  $("#related").innerHTML = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 3).map(productCard).join("");
}

function summaryRows() {
  const t = Cart.totals();
  return `
    <div class="row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
    ${t.discount ? `<div class="row discount"><span>Discount (${coupon})</span><span>− ${money(t.discount)}</span></div>` : ""}
    <div class="row"><span>Shipping</span><span>${t.shipping ? money(t.shipping) : "Free"}</span></div>
    <div class="row total"><span>Total</span><strong>${money(t.total)}</strong></div>`;
}

function bindCoupon(form) {
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = form.code.value.trim().toUpperCase();
    const msg = form.querySelector(".coupon__msg");
    if (SHOP.coupons[code]) {
      coupon = code; save("emblic-coupon", code);
      msg.textContent = `Code ${code} applied — ${SHOP.coupons[code] * 100}% off.`; msg.className = "coupon__msg ok";
    } else {
      msg.textContent = "That code isn't valid."; msg.className = "coupon__msg err";
    }
    renderCartUI();
  });
}

function renderCartPage() {
  const items = Cart.items();
  $("#cartPage").innerHTML = items.length ? `
    <div class="cart-grid">
      <div class="panel">
        ${items.map(lineItem).join("")}
        <a href="shop.html" class="link-muted"><i class="fa-solid fa-arrow-left"></i> Continue shopping</a>
      </div>
      <aside class="panel summary">
        <h3>Order Summary</h3>
        <div class="ship-bar">${shipBar(Cart.totals().subtotal)}</div>
        <form class="coupon" id="couponForm">
          <input name="code" placeholder="Discount code" value="${coupon || ""}" />
          <button class="btn btn-sm btn-outline">Apply</button>
          <p class="coupon__msg"></p>
        </form>
        ${summaryRows()}
        <a href="checkout.html" class="btn btn-block">Proceed to Checkout <i class="fa-solid fa-arrow-right"></i></a>
        <p class="muted small center"><i class="fa-solid fa-lock"></i> Secure checkout · Cash on delivery available</p>
      </aside>
    </div>` : `
    <div class="empty empty--page"><i class="fa-solid fa-bag-shopping"></i><h3>Your cart is empty</h3><p class="muted">Nature's goodness is one click away.</p><a href="shop.html" class="btn">Shop now <i class="fa-solid fa-arrow-right"></i></a></div>`;
  bindCoupon($("#couponForm"));
}

function renderSummary() {
  const items = Cart.items();
  if (!items.length && !$("#orderDone").hidden) return;
  if (!items.length) { location.href = "cart.html"; return; }
  $("#summaryItems").innerHTML = items.map((i) => `
    <div class="mini"><span class="mini__img"><img src="${i.image}" alt="" /><b>${i.qty}</b></span>
    <span class="mini__name">${i.name}<small>${i.size}</small></span><span>${money(i.price * i.qty)}</span></div>`).join("");
  $("#summaryRows").innerHTML = summaryRows();
}

function initCheckout() {
  bindCoupon($("#couponForm2"));
  const form = $("#checkoutForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.checkValidity();
      f.closest(".field")?.classList.toggle("invalid", bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) return;

    const data = Object.fromEntries(new FormData(form));
    const order = {
      id: "EP-" + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      customer: data, items: Cart.items().map(({ id, name, qty, price }) => ({ id, name, qty, price })),
      ...Cart.totals(), coupon
    };
    const orders = store("emblic-orders", []); orders.push(order); save("emblic-orders", orders);

    $("#checkoutWrap").hidden = true;
    const done = $("#orderDone");
    done.hidden = false;
    done.innerHTML = `
      <div class="done">
        <span class="done__icon"><i class="fa-solid fa-check"></i></span>
        <p class="eyebrow">Order placed</p>
        <h1 class="section-title">Thank you, ${data.firstName}!</h1>
        <p>Your order <strong>${order.id}</strong> for <strong>${money(order.total)}</strong> has been received.
        We'll call <strong>${data.phone}</strong> to confirm, then ship to ${data.city} within 2–4 working days.</p>
        <p class="muted small">This is a demo store — no payment was taken and nothing will be shipped.</p>
        <a href="shop.html" class="btn">Continue shopping <i class="fa-solid fa-arrow-right"></i></a>
      </div>`;
    Cart.clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $$("input, select", form).forEach((f) => f.addEventListener("input", () => f.closest(".field")?.classList.remove("invalid")));
  $$('input[name="payment"]').forEach((r) => r.addEventListener("change", () => {
    $("#bankInfo").hidden = r.value !== "bank" || !r.checked;
  }));
}

/* ---------- boot ---------- */
layout();
bindLayout();
({ home: initHome, shop: initShop, product: initProduct, checkout: initCheckout }[page] || (() => {}))();
renderCartUI();
