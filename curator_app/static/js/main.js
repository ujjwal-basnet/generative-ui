// curator_app/static/js/main.js
// Vanilla JS chat engine for Curator Generative UI

const SESSION_ID = "session_" + Math.random().toString(36).substring(2, 10);
const API_BASE = "";

const chatHistory = document.getElementById("chat-history");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const cartBadge = document.getElementById("cart-badge");
const cartIconBtn = document.getElementById("cart-icon-btn");

// ─── Helpers ───────────────────────────────────────────

function scrollToBottom() {
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function updateCartBadge(count) {
  if (count > 0) {
    cartBadge.textContent = count;
    cartBadge.classList.remove("hidden");
    cartBadge.classList.add("flex");
  } else {
    cartBadge.classList.add("hidden");
    cartBadge.classList.remove("flex");
  }
}

// ─── Message Rendering ─────────────────────────────────

function addUserMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col items-end space-y-2";
  wrapper.innerHTML = `
    <div class="max-w-[80%] px-5 py-3 bg-primary text-on-primary rounded-xl font-headline font-light text-sm shadow-sm">
      ${escapeHtml(text)}
    </div>
    <span class="font-label text-[9px] uppercase tracking-widest text-on-surface-variant px-1">${formatTime()}</span>
  `;
  chatHistory.appendChild(wrapper);
  scrollToBottom();
}

function addTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.id = "typing-indicator";
  wrapper.className = "flex flex-col items-start space-y-2";
  wrapper.innerHTML = `
    <div class="flex items-center space-x-2 px-1 mb-2">
      <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-[12px] text-on-primary" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
      </div>
      <span class="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Curator</span>
    </div>
    <div class="max-w-[80%] px-5 py-4 bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant/10 shadow-sm">
      <div class="flex space-x-1.5">
        <div class="w-2 h-2 rounded-full bg-on-surface-variant/40 typing-dot"></div>
        <div class="w-2 h-2 rounded-full bg-on-surface-variant/40 typing-dot"></div>
        <div class="w-2 h-2 rounded-full bg-on-surface-variant/40 typing-dot"></div>
      </div>
    </div>
  `;
  chatHistory.appendChild(wrapper);
  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

function addAgentMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col items-start space-y-3";
  wrapper.innerHTML = `
    <div class="flex items-center space-x-2 px-1">
      <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-[12px] text-on-primary" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
      </div>
      <span class="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Curator</span>
    </div>
    <div class="max-w-[90%] px-5 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-body text-sm leading-relaxed border border-outline-variant/10 shadow-sm">
      ${escapeHtml(text)}
    </div>
  `;
  chatHistory.appendChild(wrapper);
  scrollToBottom();
}

// ─── Product Grid Rendering ────────────────────────────

function renderProducts(products, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col items-start space-y-3 w-full";
  wrapper.innerHTML = `
    <div class="flex items-center space-x-2 px-1">
      <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-[12px] text-on-primary" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
      </div>
      <span class="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Curator</span>
    </div>
  `;

  const card = document.createElement("div");
  card.className = "w-full bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/10";

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-1";

  const col1 = document.createElement("div");
  col1.className = "flex flex-col divide-y divide-outline-variant/10";
  const col2 = document.createElement("div");
  col2.className = "flex flex-col divide-y divide-outline-variant/10";

  products.forEach((product, i) => {
    const row = createProductRow(product);
    if (i < Math.ceil(products.length / 2)) {
      col1.appendChild(row);
    } else {
      col2.appendChild(row);
    }
  });

  grid.appendChild(col1);
  if (products.length > 1) grid.appendChild(col2);
  card.appendChild(grid);
  wrapper.appendChild(card);
  container.appendChild(wrapper);
  scrollToBottom();
}

function createProductRow(product) {
  const row = document.createElement("div");
  row.className = "group flex items-center py-4 gap-4 transition-all duration-300";
  row.dataset.productName = product.name;

  row.innerHTML = `
    <div class="w-20 h-20 bg-surface-container-low overflow-hidden rounded-sm flex-shrink-0">
      <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
           src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy"/>
    </div>
    <div class="flex-grow">
      <h4 class="font-headline text-sm font-semibold text-on-surface">${escapeHtml(product.name)}</h4>
      <p class="font-label text-xs text-on-surface-variant mt-0.5">$${product.price.toFixed(2)}</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex items-center bg-surface-container-low rounded-full px-2 py-1">
        <button onclick="changeProductQty(this, -1)" class="w-6 h-6 flex items-center justify-center hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-sm">remove</span>
        </button>
        <span class="product-qty px-2 text-xs font-medium w-6 text-center">1</span>
        <button onclick="changeProductQty(this, 1)" class="w-6 h-6 flex items-center justify-center hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-sm">add</span>
        </button>
      </div>
      <button onclick="addProductToCart(this)" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-headline text-[10px] uppercase tracking-widest font-bold hover:bg-primary-dim active:scale-95 transition-all shadow-sm">
        Add
      </button>
    </div>
  `;
  return row;
}

// ─── Cart Rendering ────────────────────────────────────

function renderCart(cartData, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col items-start space-y-3 w-full";
  wrapper.innerHTML = `
    <div class="flex items-center space-x-2 px-1">
      <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-[12px] text-on-primary" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
      </div>
      <span class="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Curator</span>
    </div>
  `;

  const card = document.createElement("div");
  card.className = "cart-widget w-full bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10";

  if (cartData.items.length === 0) {
    card.innerHTML = `
      <div class="p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">shopping_bag</span>
        <p class="font-headline text-on-surface-variant">Your selection is empty</p>
        <p class="font-label text-xs text-on-surface-variant/60 mt-1">Ask me to show you our collection</p>
      </div>
    `;
  } else {
    const inner = document.createElement("div");
    inner.className = "p-6 md:p-8 space-y-8";

    // Items
    const itemsDiv = document.createElement("div");
    itemsDiv.className = "space-y-6";
    cartData.items.forEach((item, i) => {
      const itemEl = createCartItem(item, i > 0);
      itemsDiv.appendChild(itemEl);
    });
    inner.appendChild(itemsDiv);

    // Summary
    const subtotal = cartData.total;
    inner.innerHTML += `
      <div class="pt-8 border-t border-on-surface/5 space-y-3">
        <div class="flex justify-between text-sm text-on-surface-variant">
          <span>Subtotal</span>
          <span class="font-medium">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm text-on-surface-variant">
          <span>Shipping</span>
          <span class="font-medium">Calculated at checkout</span>
        </div>
        <div class="flex justify-between pt-4">
          <span class="font-headline font-extrabold text-lg uppercase tracking-tight">Total</span>
          <span class="font-headline font-extrabold text-xl text-primary">$${subtotal.toFixed(2)}</span>
        </div>
      </div>
      <button class="w-full bg-primary hover:bg-primary-dim text-on-primary py-5 rounded-xl font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group">
        Proceed to Checkout
        <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
    `;
    card.appendChild(inner);
  }

  wrapper.appendChild(card);
  container.appendChild(wrapper);
  scrollToBottom();
}

function createCartItem(item, showBorder) {
  const div = document.createElement("div");
  div.className = `flex items-center gap-6 group${showBorder ? " pt-6 border-t border-outline-variant/10" : ""}`;
  div.dataset.cartItem = item.name;

  div.innerHTML = `
    <div class="w-20 h-20 bg-surface-container rounded-xl overflow-hidden flex-shrink-0">
      <img alt="${escapeHtml(item.name)}" class="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-110"
           src="${item.image}" loading="lazy"/>
    </div>
    <div class="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 class="font-headline font-bold text-on-surface tracking-tight">${escapeHtml(item.name)}</h3>
        <p class="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-1">${escapeHtml(item.variant || "")}</p>
      </div>
      <div class="flex items-center gap-8">
        <div class="flex items-center bg-surface-container-low rounded-full px-2 py-1">
          <button onclick="updateCartQty('${escapeAttr(item.name)}', -1)" class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <span class="material-symbols-outlined">remove</span>
          </button>
          <span class="cart-item-qty w-8 text-center text-sm font-bold font-headline">${item.quantity}</span>
          <button onclick="updateCartQty('${escapeAttr(item.name)}', 1)" class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <span class="material-symbols-outlined">add</span>
          </button>
        </div>
        <div class="text-right">
          <p class="font-headline font-bold text-on-surface">$${(item.price * item.quantity).toFixed(2)}</p>
          <button onclick="removeCartItem('${escapeAttr(item.name)}')" class="text-[10px] font-label uppercase tracking-wider text-error mt-1 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
            <span class="material-symbols-outlined !text-[14px]">delete</span>
            Remove
          </button>
        </div>
      </div>
    </div>
  `;
  return div;
}

// ─── Weather Rendering ─────────────────────────────────

function renderWeather(weather, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col items-start space-y-3";
  wrapper.innerHTML = `
    <div class="flex items-center space-x-2 px-1">
      <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-[12px] text-on-primary" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
      </div>
      <span class="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Curator</span>
    </div>
    <div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 max-w-sm">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1;">
            ${weather.condition === "Sunny" ? "wb_sunny" : weather.condition === "Light Rain" ? "rainy" : "cloud"}
          </span>
        </div>
        <div>
          <h3 class="font-headline font-bold text-on-surface text-lg">${weather.temperature}&deg;C</h3>
          <p class="font-label text-xs text-on-surface-variant uppercase tracking-widest">${escapeHtml(weather.location)}</p>
          <p class="font-body text-sm text-on-surface-variant mt-0.5">${escapeHtml(weather.condition)}</p>
        </div>
      </div>
    </div>
  `;
  container.appendChild(wrapper);
  scrollToBottom();
}

// ─── Cart Actions (Direct API, no LLM) ────────────────

async function updateCartQty(productName, delta) {
  const widget = document.querySelector(`.cart-widget`);
  if (!widget) return;

  const itemEl = widget.querySelector(`[data-cart-item="${productName}"]`);
  if (!itemEl) return;

  const qtySpan = itemEl.querySelector(".cart-item-qty");
  let newQty = parseInt(qtySpan.textContent) + delta;
  if (newQty < 1) newQty = 0;

  const action = newQty === 0 ? "remove" : "update";
  const res = await fetch(`${API_BASE}/cart/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: SESSION_ID, action, product_name: productName, quantity: newQty }),
  });
  const data = await res.json();
  if (data.success) {
    refreshCartWidget(data.cart);
    updateCartBadge(data.cart.count);
  }
}

async function removeCartItem(productName) {
  const res = await fetch(`${API_BASE}/cart/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: SESSION_ID, action: "remove", product_name: productName, quantity: 0 }),
  });
  const data = await res.json();
  if (data.success) {
    refreshCartWidget(data.cart);
    updateCartBadge(data.cart.count);
  }
}

function refreshCartWidget(cartData) {
  const widget = document.querySelector(".cart-widget");
  if (!widget) return;

  // Re-render the cart widget in place
  const parent = widget.parentElement;
  widget.remove();

  const newCard = document.createElement("div");
  newCard.className = "cart-widget w-full bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10";

  if (cartData.items.length === 0) {
    newCard.innerHTML = `
      <div class="p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">shopping_bag</span>
        <p class="font-headline text-on-surface-variant">Your selection is empty</p>
        <p class="font-label text-xs text-on-surface-variant/60 mt-1">Ask me to show you our collection</p>
      </div>
    `;
  } else {
    const inner = document.createElement("div");
    inner.className = "p-6 md:p-8 space-y-8";

    const itemsDiv = document.createElement("div");
    itemsDiv.className = "space-y-6";
    cartData.items.forEach((item, i) => {
      itemsDiv.appendChild(createCartItem(item, i > 0));
    });
    inner.appendChild(itemsDiv);

    const subtotal = cartData.total;
    const summaryDiv = document.createElement("div");
    summaryDiv.innerHTML = `
      <div class="pt-8 border-t border-on-surface/5 space-y-3">
        <div class="flex justify-between text-sm text-on-surface-variant">
          <span>Subtotal</span>
          <span class="font-medium">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm text-on-surface-variant">
          <span>Shipping</span>
          <span class="font-medium">Calculated at checkout</span>
        </div>
        <div class="flex justify-between pt-4">
          <span class="font-headline font-extrabold text-lg uppercase tracking-tight">Total</span>
          <span class="font-headline font-extrabold text-xl text-primary">$${subtotal.toFixed(2)}</span>
        </div>
      </div>
    `;
    inner.appendChild(summaryDiv);

    const checkoutBtn = document.createElement("button");
    checkoutBtn.className = "w-full bg-primary hover:bg-primary-dim text-on-primary py-5 rounded-xl font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group";
    checkoutBtn.innerHTML = `Proceed to Checkout <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>`;
    inner.appendChild(checkoutBtn);

    newCard.appendChild(inner);
  }

  parent.appendChild(newCard);
}

// ─── Product Actions ───────────────────────────────────

function changeProductQty(btn, delta) {
  const row = btn.closest("[data-product-name]");
  const qtySpan = row.querySelector(".product-qty");
  let qty = parseInt(qtySpan.textContent) + delta;
  if (qty < 1) qty = 1;
  qtySpan.textContent = qty;
}

async function addProductToCart(btn) {
  const row = btn.closest("[data-product-name]");
  const productName = row.dataset.productName;
  const qty = parseInt(row.querySelector(".product-qty").textContent);

  btn.disabled = true;
  btn.textContent = "...";

  const res = await fetch(`${API_BASE}/cart/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: SESSION_ID, action: "add", product_name: productName, quantity: qty }),
  });
  const data = await res.json();
  if (data.success) {
    updateCartBadge(data.cart.count);
    btn.textContent = "Added";
    btn.classList.remove("bg-primary");
    btn.classList.add("bg-green-600");
    setTimeout(() => {
      btn.textContent = "Add";
      btn.classList.add("bg-primary");
      btn.classList.remove("bg-green-600");
      btn.disabled = false;
    }, 1500);
  } else {
    btn.textContent = "Add";
    btn.disabled = false;
  }
}

// ─── Chat Flow ─────────────────────────────────────────

let isProcessing = false;

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message || isProcessing) return;

  isProcessing = true;
  chatInput.value = "";
  chatInput.disabled = true;

  addUserMessage(message);
  addTypingIndicator();

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: SESSION_ID, message }),
    });
    const data = await res.json();

    removeTypingIndicator();

    // Render products if returned
    if (data.products && data.products.length > 0) {
      renderProducts(data.products, chatHistory);
    }

    // Render cart if returned
    if (data.cart_data) {
      renderCart(data.cart_data, chatHistory);
    }

    // Render weather if returned
    if (data.weather) {
      renderWeather(data.weather, chatHistory);
    }

    // Render text message if present
    if (data.text) {
      addAgentMessage(data.text);
    }

    // Update cart badge
    if (data.cart_count !== undefined) {
      updateCartBadge(data.cart_count);
    }
  } catch (err) {
    removeTypingIndicator();
    addAgentMessage("I apologize, something went wrong. Please try again.");
    console.error("Chat error:", err);
  }

  chatInput.disabled = false;
  chatInput.focus();
  isProcessing = false;
});

// Cart icon click => ask the LLM to show cart
cartIconBtn.addEventListener("click", () => {
  if (isProcessing) return;
  chatInput.value = "show me my cart";
  chatForm.dispatchEvent(new Event("submit"));
});

// ─── Utilities ─────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
