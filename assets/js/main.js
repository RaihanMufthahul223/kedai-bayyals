/* ── Init AOS ─────────────────────────────────── */
AOS.init({
  once: true,
  offset: 80,
  duration: 750,
  easing: 'ease-out-cubic',
});

/* ── Mobile Navigation ─────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    mobileMenu.classList.remove('hidden');
    // Tiny delay for the CSS transition to kick in
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
  } else {
    closeMobileMenu();
  }
  // Animate hamburger → X
  const lines = hamburger.querySelectorAll('.ham-line');
  lines[0].style.transform = menuOpen ? 'rotate(45deg) translate(5px, 5px)'  : '';
  lines[1].style.opacity   = menuOpen ? '0' : '1';
  lines[2].style.transform = menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  lines[2].style.width     = menuOpen ? '24px' : '';
});

function closeMobileMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  setTimeout(() => mobileMenu.classList.add('hidden'), 300);
  const lines = hamburger.querySelectorAll('.ham-line');
  lines[0].style.transform = '';
  lines[1].style.opacity   = '1';
  lines[2].style.transform = '';
  lines[2].style.width     = '';
}

/* ── Menu Tab Switching ────────────────────────── */
function switchTab(tab) {
  const panels = {
    kopi: document.getElementById('panel-kopi'),
    tea: document.getElementById('panel-tea'),
    biji: document.getElementById('panel-biji')
  };
  const buttons = {
    kopi: document.getElementById('tab-kopi'),
    tea: document.getElementById('tab-tea'),
    biji: document.getElementById('tab-biji')
  };

  Object.keys(panels).forEach(key => {
    if (panels[key]) {
      if (key === tab) {
        panels[key].classList.remove('hidden');
        if (buttons[key]) {
          buttons[key].classList.add('active');
          buttons[key].classList.remove('bg-cream', 'text-brown');
        }
      } else {
        panels[key].classList.add('hidden');
        if (buttons[key]) {
          buttons[key].classList.remove('active');
          buttons[key].classList.add('bg-cream', 'text-brown');
        }
      }
    }
  });

  // Re-trigger AOS for newly visible panel
  AOS.refresh();
}

/* ── Navbar scroll shadow ──────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 30px rgba(62,39,35,0.08)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});

/* ── Open/Closed status indicator ─────────────── */
(function checkOpenStatus() {
  const now     = new Date();
  const day     = now.getDay();   // 0=Sun, 1=Mon…6=Sat
  const hour    = now.getHours();
  const minutes = now.getMinutes();
  const time    = hour + minutes / 60;

  let openTime  = 8;
  let closeTime = 22;

  if (day === 6) { openTime = 9; closeTime = 23; }          // Sabtu
  if (day === 0) { openTime = 9; closeTime = 21; }          // Minggu

  const isOpen   = time >= openTime && time < closeTime;
  const dot      = document.getElementById('status-dot');
  const textEl   = document.getElementById('status-text');

  if (isOpen) {
    dot.classList.remove('bg-green-500');
    dot.classList.add('bg-green-500');                       // keep green
    const closesAt = `${closeTime}.00`;
    textEl.textContent = `Buka Sekarang · Tutup pukul ${closesAt}`;
    textEl.classList.add('text-green-700');
  } else {
    dot.classList.remove('bg-green-500', 'animate-pulse');
    dot.classList.add('bg-red-400');
    textEl.textContent = 'Saat ini Tutup · Buka besok';
    textEl.classList.add('text-red-600');
  }
})();

/* ── WA tooltip on hover (desktop) ────────────── */
const waBtn     = document.querySelector('.wa-float');
const waTooltip = document.getElementById('wa-tooltip');
if (waBtn && waTooltip) {
  waBtn.addEventListener('mouseenter', () => {
    waTooltip.style.opacity   = '1';
    waTooltip.style.transform = 'translateX(0)';
  });
  waBtn.addEventListener('mouseleave', () => {
    waTooltip.style.opacity   = '0';
    waTooltip.style.transform = 'translateX(8px)';
  });
}

/* ── Shopping Cart Logic ──────────────────────── */
let cart = JSON.parse(localStorage.getItem('kedaibayyals_cart')) || [];

const cartBtn = document.getElementById('cart-btn');
const cartClose = document.getElementById('cart-close');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsContainer = document.getElementById('cart-items');
const cartEmptyState = document.getElementById('cart-empty');
const cartTotalEl = document.getElementById('cart-total');
const cartBadge = document.getElementById('cart-badge');
const checkoutBtn = document.getElementById('checkout-btn');
const cartCta = document.getElementById('cart-cta');

// Toggle Cart Drawer
function openCart() {
  if (cartOverlay) cartOverlay.classList.add('active');
  if (cartDrawer) cartDrawer.classList.add('active');
}

function closeCart() {
  if (cartOverlay) cartOverlay.classList.remove('active');
  if (cartDrawer) cartDrawer.classList.remove('active');
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
if (cartCta) cartCta.addEventListener('click', openCart);

// Render Cart
function renderCart() {
  if (!cartItemsContainer || !cartEmptyState || !cartTotalEl || !cartBadge || !checkoutBtn) return;

  // Clear previous items (except empty state)
  const items = cartItemsContainer.querySelectorAll('.cart-item-row');
  items.forEach(el => el.remove());

  if (cart.length === 0) {
    cartEmptyState.classList.remove('hidden');
    cartBadge.classList.remove('scale-100');
    cartBadge.classList.add('scale-0');
    cartTotalEl.textContent = 'Rp 0';
    checkoutBtn.disabled = true;
    return;
  }

  cartEmptyState.classList.add('hidden');
  
  let total = 0;
  let totalCount = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    totalCount += item.qty;

    const row = document.createElement('div');
    row.className = 'cart-item-row flex gap-4 items-center border-b border-brown/5 pb-4 last:border-b-0';
    
    // Choose icon based on product id
    let icon = '☕';
    if (item.id.includes('tea') || item.id.includes('matcha')) icon = '🍵';
    else if (item.id.includes('ice') || item.id.includes('es-teh')) icon = '🧊';
    else if (item.id.includes('susu') || item.id.includes('latte')) icon = '🥛';

    row.innerHTML = `
      <div class="bg-cream-dark w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0">${icon}</div>
      <div class="flex-1 min-w-0">
        <h4 class="font-display font-semibold text-brown text-sm leading-tight truncate">${item.name}</h4>
        <span class="text-xs text-amber font-semibold block mt-1">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
      </div>
      <!-- Quantity Controls -->
      <div class="flex items-center gap-2 bg-cream-dark px-2.5 py-1.5 rounded-full text-xs shrink-0">
        <button onclick="updateCartQty('${item.id}', -1)" class="w-5 h-5 font-bold flex items-center justify-center text-brown-light hover:text-amber">-</button>
        <span class="font-semibold text-brown w-4 text-center">${item.qty}</span>
        <button onclick="updateCartQty('${item.id}', 1)" class="w-5 h-5 font-bold flex items-center justify-center text-brown-light hover:text-amber">+</button>
      </div>
      <!-- Hapus button -->
      <button onclick="removeCartItem('${item.id}')" class="text-red-400 hover:text-red-600 transition-colors p-1 shrink-0" aria-label="Hapus Item">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    `;
    cartItemsContainer.appendChild(row);
  });

  cartTotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  
  // Update badge count
  cartBadge.textContent = totalCount;
  cartBadge.classList.remove('scale-0');
  cartBadge.classList.add('scale-100');
  checkoutBtn.disabled = false;
}

// Update Qty
window.updateCartQty = function(id, delta) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].qty += delta;
    if (cart[itemIndex].qty <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    renderCart();
  }
};

// Remove Item
window.removeCartItem = function(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
};

// Save to localStorage
function saveCart() {
  localStorage.setItem('kedaibayyals_cart', JSON.stringify(cart));
}

// Add to Cart
function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price: parseInt(price), qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

// Event Listeners for menu buttons
document.querySelectorAll('.btn-add-to-cart').forEach(button => {
  button.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const price = btn.getAttribute('data-price');
    addToCart(id, name, price);
  });
});

// WhatsApp Checkout
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    let message = 'Halo Kedai Bayyals! ☕\nSaya ingin memesan menu berikut:\n\n';
    let total = 0;

    cart.forEach(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      message += `- ${item.qty}x ${item.name} (Rp ${subtotal.toLocaleString('id-ID')})\n`;
    });

    message += `\nTotal Pembayaran: Rp ${total.toLocaleString('id-ID')}\n\n`;
    message += 'Mohon segera diproses ya. Terima kasih! 😊';

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/6288973127414?text=${encodedMessage}`;
    
    // Clear cart after checkout
    cart = [];
    saveCart();
    renderCart();
    closeCart();
    
    window.open(waUrl, '_blank');
  });
}

// Render initially
renderCart();

// Cart Tooltip Hover (Desktop)
const cartBtnEl = document.getElementById('cart-btn');
const cartTooltipEl = document.getElementById('cart-tooltip');
if (cartBtnEl && cartTooltipEl) {
  cartBtnEl.addEventListener('mouseenter', () => {
    cartTooltipEl.style.opacity = '1';
    cartTooltipEl.style.transform = 'translateX(0)';
  });
  cartBtnEl.addEventListener('mouseleave', () => {
    cartTooltipEl.style.opacity = '0';
    cartTooltipEl.style.transform = 'translateX(8px)';
  });
}

