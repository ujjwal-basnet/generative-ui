// static/js/main.js
let SESSION_ID = 'sb_' + Math.random().toString(36).substring(2, 11);
let typingBubble = null;

const messagesEl = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function addBubble(text, sender) {
    const row = document.createElement('div');
    row.className = `msg-row ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
    if (typingBubble) return;
    const row = document.createElement('div');
    row.className = 'msg-row bot typing-row';
    row.innerHTML = `
        <div class="bubble">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    `;
    messagesEl.appendChild(row);
    typingBubble = row;
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function hideTyping() {
    if (typingBubble) {
        typingBubble.remove();
        typingBubble = null;
    }
}

function updateBadge(count) {
    const badge = document.getElementById('cart-count');
    badge.textContent = count;
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 300);
}

function toast(message) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 500);
    }, 2600);
}

async function callBot(text) {
    addBubble(text, 'user');
    userInput.value = '';
    showTyping();
    sendBtn.disabled = true;

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, session_id: SESSION_ID })
        });

        const data = await res.json();
        hideTyping();

        if (data.text) addBubble(data.text, 'bot');
        if (data.cart_data) renderCartWidget(data.cart_data);
        if (typeof data.cart_count === 'number') updateBadge(data.cart_count);
        if (data.products) renderProductGrid(data.products); // <-- products grid
    } catch (err) {
        hideTyping();
        addBubble("⚠️ Oops, connection issue. Try again.", 'bot');
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}


function renderCartWidget(cartData) {
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.appendChild(buildCartWidget(cartData));
    messagesEl.appendChild(row);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function buildCartWidget(cartData) {
    const { items, total, count } = cartData;
    const wrap = document.createElement('div');
    wrap.className = 'cart-widget';

    wrap.innerHTML = `
        <div class="cart-widget-header">
            <div class="cart-widget-title">Your Cart</div>
            <div class="cart-item-pill">${count} items • $${total.toFixed(2)}</div>
        </div>
    `;

    items.forEach(item => wrap.appendChild(buildCartItem(item, wrap)));
    
    const footer = document.createElement('div');
    footer.className = 'cart-footer';
    footer.innerHTML = `
        <div class="total">$${total.toFixed(2)}</div>
        <button onclick="toast('Checkout flow coming soon ✨')" 
                class="checkout-btn flex items-center gap-2">
            <i class="fa-solid fa-credit-card"></i> Checkout
        </button>
    `;
    wrap.appendChild(footer);

    return wrap;
}

function buildCartItem(item, widgetRoot) {
    const card = document.createElement('div');
    card.className = 'cart-item';
    card.dataset.productName = item.name;
    card.dataset.qty = item.quantity;

    card.innerHTML = `
        <img src="${item.image}" class="item-image" alt="${item.name}">
        <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="qty-wrap">
            <button class="qty-btn" data-dir="-1">–</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" data-dir="1">+</button>
        </div>
        <button class="remove-item-btn"><i class="fa-solid fa-xmark"></i></button>
    `;

    card.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const current = parseInt(card.dataset.qty);
            const dir = parseInt(btn.dataset.dir);
            const newQty = Math.max(0, current + dir);
            await uiCartAction(newQty === 0 ? 'remove' : 'update', item.name, newQty, widgetRoot);
        });
    });

    card.querySelector('.remove-item-btn').addEventListener('click', async () => {
        await uiCartAction('remove', item.name, 0, widgetRoot);
    });

    return card;
}

async function uiCartAction(action, productName, quantity, widgetRoot) {
    const itemCard = widgetRoot.querySelector(`[data-product-name="${productName}"]`);
    if (itemCard) itemCard.style.opacity = '0.4';

    try {
        const res = await fetch('/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action, 
                product_name: productName, 
                quantity, 
                session_id: SESSION_ID 
            })
        });

        const data = await res.json();
        const newWidget = buildCartWidget(data.cart);
        widgetRoot.replaceWith(newWidget);
        updateBadge(data.cart.count || 0);
        toast(action === 'remove' ? 'Removed from cart' : 'Cart updated');
    } catch (e) {
        toast('Update failed');
    }
}

// Setup
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) callBot(text);
});

userInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        const text = userInput.value.trim();
        if (text) callBot(text);
    }
});

window.addEventListener('load', () => {
    addBubble(`Hey! 👋 I'm ShopBot.<br>Try: <strong>Add a white shirt</strong>`, 'bot');
    updateBadge(0);
    userInput.focus();
});


// --- Render products in chat messages ---
function renderProductGrid(products) {
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-4 p-2';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-md p-3 flex flex-col items-center gap-2';
        card.dataset.productName = product.name;
        card.dataset.qty = 0;

        card.innerHTML = `
            <img src="${product.image}" class="w-full h-32 object-cover rounded-xl">
            <div class="font-semibold text-base">${product.name}</div>
            <div class="text-gray-600">$${product.price.toFixed(2)}</div>
            <div class="flex gap-2 mt-2">
                <button class="qty-btn" data-dir="-1">–</button>
                <span class="qty-num">0</span>
                <button class="qty-btn" data-dir="1">+</button>
            </div>
            <button class="remove-item-btn mt-2 hidden"><i class="fa-solid fa-xmark"></i></button>
        `;

        const qtyNum = card.querySelector('.qty-num');
        const removeBtn = card.querySelector('.remove-item-btn');

        // Quantity buttons
        card.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                let current = parseInt(qtyNum.textContent);
                const dir = parseInt(btn.dataset.dir);
                const newQty = Math.max(0, current + dir);
                qtyNum.textContent = newQty;
                removeBtn.classList.toggle('hidden', newQty === 0);

                await uiCartAction(newQty === 0 ? 'remove' : 'update', product.name, newQty, card);
            });
        });

        // Remove button
        removeBtn.addEventListener('click', async () => {
            qtyNum.textContent = 0;
            removeBtn.classList.add('hidden');
            await uiCartAction('remove', product.name, 0, card);
        });

        grid.appendChild(card);
    });

    row.appendChild(grid);
    messagesEl.appendChild(row);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}