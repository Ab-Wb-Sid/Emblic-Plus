const cartKey = "emblic-cart";
let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
const money = (amount) => `PKR ${amount.toLocaleString("en-PK")}`;

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = count;
    badge.hidden = count === 0;
  });

  const items = cart.map((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return product ? { ...product, qty: item.qty } : null;
  }).filter(Boolean);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartPage = document.querySelector("#cartPage");
  if (cartPage) {
    cartPage.innerHTML = items.length
      ? `<div class="cart-grid"><div class="panel">${items.map((item) => `
          <div class="line" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" />
            <div class="line__info"><strong class="line__name">${item.name}</strong><span class="muted small">${item.size}</span>
              <div class="qty"><button data-change="-1" aria-label="Remove one ${item.name}">−</button><span>${item.qty}</span><button data-change="1" aria-label="Add one ${item.name}">+</button></div>
            </div><strong>${money(item.price * item.qty)}</strong>
          </div>`).join("")}</div><aside class="panel summary"><h3>Cart Total</h3><p><strong>${money(total)}</strong></p><a class="btn btn-block" href="shop.html">Continue shopping</a></aside></div>`
      : `<div class="empty empty--page"><h3>Your cart is empty</h3><a class="btn" href="shop.html">Browse products</a></div>`;
  }
}

function productCard(product) {
  return `<article class="card"><a class="card__img" href="product.html?id=${product.id}"><img src="${product.image}" alt="${product.name}" /></a><div class="card__body"><h3>${product.name}</h3><p>${product.size}</p><strong>${money(product.price)}</strong><button class="btn btn-sm" data-add="${product.id}">Add to cart</button></div></article>`;
}

const links = [["index.html#home", "Home"], ["index.html#about", "About"], ["index.html#benefits", "Benefits"], ["index.html#ingredients", "Ingredients"], ["shop.html", "Shop"], ["index.html#reviews", "Reviews"]];
const header = document.querySelector("#site-header");
if (header) header.innerHTML = `<header class="header"><div class="container header__inner"><a href="index.html" class="logo"><span class="logo__name">Emblic</span><span class="logo__plus">plus</span></a><nav class="nav">${links.map(([url, label]) => `<a href="${url}">${label}</a>`).join("")}</nav><div class="header__actions"><form class="site-search" id="siteSearch" role="search"><input id="searchInput" type="search" placeholder="Search products" aria-label="Search products" autocomplete="off"><div class="search-results" id="searchResults" hidden></div></form><a id="cartBtn" class="cart-btn" href="./cart.html" aria-label="Open cart"><i class="fa-solid fa-bag-shopping"></i><span class="cart-count" hidden>0</span></a></div></div></header>`;

const footer = document.querySelector("#site-footer");
if (footer) footer.innerHTML = `<footer class="footer"><div class="container"><div class="footer__top"><a href="index.html" class="logo"><span class="logo__name">Emblic</span><span class="logo__plus">plus</span></a><nav class="footer__links">${links.map(([url, label]) => `<a href="${url}">${label}</a>`).join("")}</nav></div><p class="footer__bottom">© ${new Date().getFullYear()} Emblic Plus.</p></div></footer>`;

if (document.querySelector("#featured")) document.querySelector("#featured").innerHTML = PRODUCTS.map(productCard).join("");
if (document.querySelector("#shopGrid")) document.querySelector("#shopGrid").innerHTML = PRODUCTS.map(productCard).join("");
if (document.querySelector("#related")) document.querySelector("#related").innerHTML = PRODUCTS.slice(1).map(productCard).join("");

const productBox = document.querySelector("#product");
if (productBox) {
  const product = PRODUCTS.find((item) => item.id === new URLSearchParams(location.search).get("id")) || PRODUCTS[0];
  productBox.innerHTML = `<div class="pd"><div class="pd__media"><img src="${product.image}" alt="${product.name}" /></div><div class="pd__info"><p class="eyebrow">Emblic Plus</p><h1 class="section-title">${product.name}</h1><p>${product.size}</p><h2>${money(product.price)}</h2><p>${product.description}</p><button class="btn" data-add="${product.id}">Add to cart</button></div></div>`;
}


const searchInput = document.querySelector("#searchInput");
const searchResults = document.querySelector("#searchResults");
if (searchInput && searchResults) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const matches = query ? PRODUCTS.filter((product) => `${product.name} ${product.size} ${product.description}`.toLowerCase().includes(query)) : [];
    searchResults.innerHTML = matches.length
      ? matches.map((product) => `<a href="product.html?id=${product.id}">${product.name} <span>${money(product.price)}</span></a>`).join("")
      : query ? "<p>No products found.</p>" : "";
    searchResults.hidden = !query;
  });
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const id = addButton.dataset.add;
    const item = cart.find((entry) => entry.id === id);
    if (item) item.qty++;
    else cart.push({ id, qty: 1 });
    saveCart();
  }
  const changeButton = event.target.closest("[data-change]");
  if (changeButton) {
    const line = cart.find((entry) => entry.id === changeButton.closest("[data-id]").dataset.id);
    if (line) {
      line.qty += Number(changeButton.dataset.change);
      if (line.qty <= 0) cart = cart.filter((entry) => entry.id !== line.id);
      saveCart();
    }
  }
});

updateCart();
