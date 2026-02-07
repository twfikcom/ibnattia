
// Data Constants
const SANDWICH_ITEMS = [
  { name: 'كبدة إسكندراني', price: 40, image: 'https://sayedsamkary.com/%D9%83%D8%A8%D8%AF%D8%A9%D9%8A%D8%A7%D8%B9%D9%85.png' },
  { name: 'سجق بلدي', price: 40, image: 'https://sayedsamkary.com/%D8%B3%D8%AC%D9%82.png' },
  { name: 'حواوشي يا عم', price: 45, image: 'https://sayedsamkary.com/hawwshy.png' },
  { name: 'سندوتش فراخ استربس', price: 120, image: 'https://sayedsamkary.com/unnamed4.jpg' },
  { name: 'صينية شهية لفرد واحد', price: 115, image: 'https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D8%B4%D9%87%D9%8A%D8%A9.png' },
  { name: 'مكرونة بالبشامل لفرد واحد', price: 95, image: 'https://sayedsamkary.com/%D9%85%D9%83%D8%B1%D9%88%D9%86%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%8A%D9%84.png' },
  { name: 'كرات بطاطس بالجبنة لفرد واحد', price: 40, image: 'https://sayedsamkary.com/%D9%83%D8%B1%D8%A7%D8%AA%D8%A8%D8%B7%D8%A7%D8%B7%D8%B3%D8%A8%D8%A7%D9%84%D8%AC%D8%A8%D9%86%D8%A9.png' },
];

let cart = {}; 
let sauceQuantity = 0;
let currentUrgency = 'normal';
const DELIVERY_FEE = 20;
const SAUCE_PRICE = 20;

function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// Global functions for static part
window.scrollToMenu = function() {
  const section = document.getElementById('ordering-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
};

window.toggleSpecialModal = function() {
  const modal = document.getElementById('special-order-modal');
  if (modal) {
    modal.classList.toggle('hidden');
  }
};

window.setUrgency = function(level) {
  currentUrgency = level;
  const urgentBtn = document.getElementById('urgency-btn-urgent');
  const normalBtn = document.getElementById('urgency-btn-normal');
  
  if (level === 'urgent') {
    urgentBtn.classList.replace('border-white/5', 'border-[#FAB520]');
    urgentBtn.classList.replace('bg-white/5', 'bg-[#FAB520]/10');
    urgentBtn.querySelector('i').classList.replace('text-gray-500', 'text-[#FAB520]');
    urgentBtn.querySelector('p').classList.replace('text-gray-300', 'text-[#FAB520]');
    
    normalBtn.classList.replace('border-[#FAB520]', 'border-white/5');
    normalBtn.classList.replace('bg-[#FAB520]/10', 'bg-white/5');
    normalBtn.querySelector('i').classList.replace('text-[#FAB520]', 'text-gray-500');
    normalBtn.querySelector('p').classList.replace('text-[#FAB520]', 'text-gray-300');
  } else {
    normalBtn.classList.replace('border-white/5', 'border-[#FAB520]');
    normalBtn.classList.replace('bg-white/5', 'bg-[#FAB520]/10');
    normalBtn.querySelector('i').classList.replace('text-gray-500', 'text-[#FAB520]');
    normalBtn.querySelector('p').classList.replace('text-gray-300', 'text-[#FAB520]');
    
    urgentBtn.classList.replace('border-[#FAB520]', 'border-white/5');
    urgentBtn.classList.replace('bg-[#FAB520]/10', 'bg-white/5');
    urgentBtn.querySelector('i').classList.replace('text-[#FAB520]', 'text-gray-500');
    urgentBtn.querySelector('p').classList.replace('text-[#FAB520]', 'text-gray-300');
  }
};

function startPreloader() {
  const loaderBar = document.getElementById('loader-bar');
  const preloader = document.getElementById('preloader');
  const mainContent = document.getElementById('main-content');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        if (preloader) preloader.classList.add('opacity-0');
        setTimeout(() => {
          if (preloader) preloader.style.display = 'none';
          if (mainContent) {
            mainContent.classList.remove('opacity-0');
            mainContent.classList.add('opacity-100');
          }
        }, 800);
      }, 1000);
    }
    if (loaderBar) loaderBar.style.width = `${progress}%`;
  }, 150);
}

function renderSandwiches() {
  const container = document.getElementById('sandwich-list');
  if(!container) return;
  container.innerHTML = SANDWICH_ITEMS.map((item, index) => {
    const qty = cart[item.name]?.quantity || 0;
    const bread = cart[item.name]?.bread || 'baladi';
    const noBreadOptions = ['حواوشي يا عم', 'سندوتش فراخ استربس', 'صينية شهية لفرد واحد', 'مكرونة بالبشامل لفرد واحد', 'كرات بطاطس بالجبنة لفرد واحد'];
    const showBread = !noBreadOptions.includes(item.name);
    return `
      <div class="p-4 md:p-5 rounded-[2.5rem] border-2 transition-all duration-300 ${qty > 0 ? 'bg-white/5 border-[#FAB520] shadow-2xl' : 'bg-white/5 border-transparent'}">
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <div class="w-full sm:w-32 h-32 shrink-0 rounded-[2rem] overflow-hidden bg-white/5 relative">
             <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          <div class="flex-1 text-center sm:text-right">
            <h3 class="text-xl md:text-2xl font-['Lalezar'] mb-1">${item.name}</h3>
            <p class="text-[#FAB520] font-bold text-lg">${item.price} ج.م</p>
          </div>
          <div class="flex items-center gap-4 bg-black p-2 rounded-2xl border border-white/10">
            <button onclick="updateQty('${item.name}', -1, ${item.price})" class="text-[#FAB520] p-1.5"><i data-lucide="minus" class="w-5 h-5"></i></button>
            <span class="text-xl font-bold w-8 text-center text-white" id="qty-${item.name}">${qty}</span>
            <button onclick="updateQty('${item.name}', 1, ${item.price})" class="text-[#FAB520] p-1.5"><i data-lucide="plus" class="w-5 h-5"></i></button>
          </div>
        </div>
        ${showBread ? `
          <div class="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 ${qty > 0 ? 'block' : 'hidden'}" id="bread-${item.name}">
            <button onclick="setBread('${item.name}', 'baladi')" class="py-2.5 rounded-xl font-bold text-sm ${bread === 'baladi' ? 'bg-[#FAB520] text-black' : 'bg-white/5 text-gray-500'}">عيش بلدي</button>
            <button onclick="setBread('${item.name}', 'western')" class="py-2.5 rounded-xl font-bold text-sm ${bread === 'western' ? 'bg-[#FAB520] text-black' : 'bg-white/5 text-gray-500'}">عيش فينو فرنسي</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  initIcons();
}

window.updateQty = function(name, delta, price) {
  if (!cart[name]) cart[name] = { quantity: 0, price: price, bread: 'baladi' };
  cart[name].quantity = Math.max(0, cart[name].quantity + delta);
  if (cart[name].quantity === 0) delete cart[name];
  renderSandwiches();
  updateCartBadge();
  updateMainSummary();
};

window.setBread = function(name, type) {
  if (cart[name]) {
    cart[name].bread = type;
    renderSandwiches();
  }
};

window.updateSauceQty = function(delta) {
  sauceQuantity = Math.max(0, sauceQuantity + delta);
  const sauceEl = document.getElementById('sauce-qty');
  if (sauceEl) sauceEl.innerText = sauceQuantity;
  updateMainSummary();
  updateCartBadge();
};

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0) + sauceQuantity;
  if(badge) {
    badge.innerText = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function updateMainSummary() {
  const summaryBox = document.getElementById('main-order-summary');
  const totalEl = document.getElementById('main-total-price');
  let subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  subtotal += (sauceQuantity * SAUCE_PRICE);
  if (subtotal > 0) {
    if (summaryBox) summaryBox.classList.remove('hidden');
    if (totalEl) totalEl.innerText = `${subtotal + DELIVERY_FEE} ج.م`;
  } else {
    if (summaryBox) summaryBox.classList.add('hidden');
  }
}

window.toggleCart = function() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) overlay.classList.toggle('hidden');
};

// Handle Special Request Form
const specialForm = document.getElementById('special-request-form');
if(specialForm) {
  specialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('special-msg').value;
    const phone = document.getElementById('special-phone').value;
    const btn = document.getElementById('special-submit-btn');
    
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i><span>جاري الإرسال...</span>`;
    }
    initIcons();

    try {
      const response = await fetch("https://formspree.io/f/xdazllep", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ 
          النوع: "عزومة / طلب خاص (HTML)", 
          الطلب: msg, 
          التليفون: phone,
          الحالة: currentUrgency === 'urgent' ? 'مستعجل' : 'موعد عادي'
        })
      });
      if (response.ok) {
        window.toggleSpecialModal();
        const success = document.getElementById('success-screen');
        if (success) success.style.display = 'flex';
        setTimeout(() => { location.reload(); }, 4000);
      } else {
        alert('حدث خطأ، حاول مجدداً');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i data-lucide="send" class="w-6 h-6"></i><span>بعت الطلب لـ يا عم!</span>`;
        }
        initIcons();
      }
    } catch (err) {
      alert('خطأ في الاتصال');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="send" class="w-6 h-6"></i><span>بعت الطلب لـ يا عم!</span>`;
      }
      initIcons();
    }
  });
}

window.addEventListener('load', () => {
  startPreloader();
  renderSandwiches();
  initIcons();
});
