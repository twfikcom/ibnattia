
// Data Constants
const SANDWICH_ITEMS = [
  { 
    name: 'كبدة إسكندراني', 
    price: 35, 
    image: 'https://sayedsamkary.com/%D9%83%D8%A8%D8%AF%D8%A9%D9%8A%D8%A7%D8%B9%D9%85.png' 
  },
  { 
    name: 'سجق بلدي', 
    price: 35, 
    image: 'https://sayedsamkary.com/%D8%B3%D8%AC%D9%82.png' 
  },
  { 
    name: 'حواوشي يا عم', 
    price: 45, 
    image: 'https://sayedsamkary.com/hawwshy.png' 
  },
  { 
    name: 'سندوتش فراخ استربس', 
    price: 75, 
    image: 'https://sayedsamkary.com/unnamed4.jpg' 
  },
  { 
    name: 'صينية شهية لفرد واحد', 
    price: 95, 
    image: 'https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D8%B4%D9%87%D9%8A%D8%A9.png' 
  },
  { 
    name: 'مكرونة بالبشامل لفرد واحد', 
    price: 75, 
    image: 'https://sayedsamkary.com/%D9%85%D9%83%D8%B1%D9%88%D9%86%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%8A%D9%84.png' 
  },
  { 
    name: 'كرات بطاطس بالجبنة لفرد واحد', 
    price: 30, 
    image: 'https://sayedsamkary.com/%D9%83%D8%B1%D8%A7%D8%AA%D8%A8%D8%B7%D8%A7%D8%B7%D8%B3%D8%A8%D8%A7%D9%84%D8%AC%D8%A8%D9%86%D8%A9.png' 
  },
];

// App State
let cart = {}; 
let sauceQuantity = 0;
const DELIVERY_FEE = 20;
const SAUCE_PRICE = 10;

// Initialize Lucide Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Function to scroll to the ordering section
window.scrollToMenu = function() {
  const section = document.getElementById('ordering-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

// Preloader Logic - Slowed down and delayed text display
function startPreloader() {
  const loaderBar = document.getElementById('loader-bar');
  const preloader = document.getElementById('preloader');
  const mainContent = document.getElementById('main-content');
  const dastoorText = document.querySelector('.animate-dastoor');
  let progress = 0;

  const interval = setInterval(() => {
    // Slower progress step
    progress += Math.random() * 8;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      // Wait longer at 100% to ensure animations are seen
      setTimeout(() => {
        preloader.classList.add('opacity-0');
        setTimeout(() => {
          preloader.style.display = 'none';
          mainContent.classList.remove('opacity-0');
          mainContent.classList.add('opacity-100');
        }, 800);
      }, 1000);
    }
    loaderBar.style.width = `${progress}%`;
  }, 150);
}

// Render Sandwiches directly on home page
function renderSandwiches() {
  const container = document.getElementById('sandwich-list');
  if(!container) return;
  
  container.innerHTML = SANDWICH_ITEMS.map((item, index) => {
    const qty = cart[item.name]?.quantity || 0;
    const bread = cart[item.name]?.bread || 'baladi';
    
    const noBreadOptions = ['حواوشي يا عم', 'سندوتش فراخ استربس', 'صينية شهية لفرد واحد', 'مكرونة بالبشامل لفرد واحد', 'كرات بطاطس بالجبنة لفرد واحد'];
    const showBread = !noBreadOptions.includes(item.name);
    
    const isLazy = index > 1;

    return `
      <div class="p-4 md:p-5 rounded-[2.5rem] border-2 transition-all duration-300 ${qty > 0 ? 'bg-white/5 border-[#FAB520] shadow-2xl scale-[1.01]' : 'bg-white/5 border-transparent'}">
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <div class="w-full sm:w-32 h-32 shrink-0 rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-lg group bg-white/5 relative">
             <div class="skeleton-loader absolute inset-0"></div>
             <img 
               src="${item.image}" 
               alt="${item.name} - يا عم دليفري" 
               class="w-full h-full object-cover transition-opacity duration-500 opacity-0"
               ${isLazy ? 'loading="lazy"' : 'fetchpriority="high"'}
               width="128" height="128"
               onload="this.classList.remove('opacity-0'); this.previousElementSibling.style.display='none';"
               decoding="async">
          </div>

          <div class="flex-1 text-center sm:text-right">
            <h3 class="text-xl md:text-2xl font-['Lalezar'] mb-1">${item.name}</h3>
            <p class="text-[#FAB520] font-bold text-lg">${item.price} ج.م</p>
            ${item.name === 'صينية شهية لفرد واحد' ? '<p class="text-gray-400 text-xs mt-1">تشكيلة يا عم من كفته وسجق</p>' : ''}
            ${item.name === 'مكرونة بالبشامل لفرد واحد' ? '<p class="text-gray-400 text-xs mt-1">أحلى مكرونة بشاميل سخنة من يا عم دوت كوم</p>' : ''}
          </div>
          
          <div class="flex items-center gap-4 bg-black p-2 rounded-2xl border border-white/10">
            <button onclick="updateQty('${item.name}', -1, ${item.price})" class="text-[#FAB520] p-1.5 active:scale-125 transition-transform" aria-label="أقل من ${item.name}"><i data-lucide="minus" class="w-5 h-5"></i></button>
            <span class="text-xl font-bold w-8 text-center text-white" id="qty-${item.name}">${qty}</span>
            <button onclick="updateQty('${item.name}', 1, ${item.price})" class="text-[#FAB520] p-1.5 active:scale-125 transition-transform" aria-label="أكثر من ${item.name}"><i data-lucide="plus" class="w-5 h-5"></i></button>
          </div>
        </div>

        ${showBread ? `
          <div class="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 transition-all duration-500 ${qty > 0 ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 pointer-events-none overflow-hidden'}" id="bread-${item.name}">
            <button onclick="setBread('${item.name}', 'baladi')" class="py-2.5 rounded-xl font-bold text-sm transition-all ${bread === 'baladi' ? 'bg-[#FAB520] text-black shadow-lg scale-[1.02]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}" data-bread="baladi">عيش بلدي</button>
            <button onclick="setBread('${item.name}', 'western')" class="py-2.5 rounded-xl font-bold text-sm transition-all ${bread === 'western' ? 'bg-[#FAB520] text-black shadow-lg scale-[1.02]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}" data-bread="western">عيش فينو فرنسي</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  initIcons();
}

function updateQty(name, delta, price) {
  if (!cart[name]) {
    cart[name] = { quantity: 0, price: price, category: 'sandwiches', bread: 'baladi' };
  }
  cart[name].quantity = Math.max(0, cart[name].quantity + delta);
  if (cart[name].quantity === 0) {
    delete cart[name];
  }
  
  const qtyEl = document.getElementById(`qty-${name}`);
  if (qtyEl) qtyEl.innerText = cart[name]?.quantity || 0;
  
  const breadContainer = document.getElementById(`bread-${name}`);
  if (breadContainer) {
    const qty = cart[name]?.quantity || 0;
    if (qty > 0) {
      breadContainer.classList.remove('opacity-0', 'max-h-0', 'pointer-events-none');
      breadContainer.classList.add('opacity-100', 'max-h-20');
    } else {
      breadContainer.classList.add('opacity-0', 'max-h-0', 'pointer-events-none');
      breadContainer.classList.remove('opacity-100', 'max-h-20');
    }
  }
  
  updateCartBadge();
  updateMainSummary();
}

function setBread(name, type) {
  if (cart[name]) {
    cart[name].bread = type;
    const breadContainer = document.getElementById(`bread-${name}`);
    if (breadContainer) {
      const buttons = breadContainer.querySelectorAll('button');
      buttons.forEach(btn => {
        const isTarget = btn.getAttribute('data-bread') === type;
        if (isTarget) {
          btn.classList.add('bg-[#FAB520]', 'text-black', 'shadow-lg', 'scale-[1.02]');
          btn.classList.remove('bg-white/5', 'text-gray-500');
        } else {
          btn.classList.remove('bg-[#FAB520]', 'text-black', 'shadow-lg', 'scale-[1.02]');
          btn.classList.add('bg-white/5', 'text-gray-500');
        }
      });
    }
  }
}

function updateSauceQty(delta) {
  sauceQuantity = Math.max(0, sauceQuantity + delta);
  const sauceQtyEl = document.getElementById('sauce-qty');
  const sauceBtn = document.getElementById('sauce-btn');
  
  if (sauceQtyEl) {
    sauceQtyEl.innerText = sauceQuantity;
    sauceQtyEl.style.color = sauceQuantity > 0 ? '#FAB520' : 'white';
  }
  
  if (sauceQuantity > 0) {
    sauceBtn.classList.add('bg-[#FAB520]', 'border-black', 'text-black');
    sauceBtn.classList.remove('bg-white/5', 'border-dashed', 'border-[#FAB520]/20');
  } else {
    sauceBtn.classList.remove('bg-[#FAB520]', 'border-black', 'text-black');
    sauceBtn.classList.add('bg-white/5', 'border-dashed', 'border-[#FAB520]/20');
  }
  
  updateMainSummary();
  updateCartBadge();
}

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
    summaryBox.classList.remove('hidden');
    totalEl.innerText = `${subtotal + DELIVERY_FEE} ج.م`;
  } else {
    summaryBox.classList.add('hidden');
  }
}

function toggleCart() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay.style.display === 'block') {
    drawer.classList.remove('open');
    setTimeout(() => overlay.style.display = 'none', 500);
  } else {
    overlay.style.display = 'block';
    renderCartSummary();
    setTimeout(() => drawer.classList.add('open'), 10);
  }
}

function renderCartSummary() {
  const container = document.getElementById('cart-items-container');
  if(!container) return;
  
  const cartArray = Object.entries(cart);
  
  if (cartArray.length === 0 && sauceQuantity === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
        <i data-lucide="shopping-basket" class="w-16 h-16"></i>
        <p class="text-base font-bold text-center">يا عم اطلب حاجة تملى السلة!</p>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="space-y-4">
        ${cartArray.map(([name, item]) => `
          <div class="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
            <div>
              <h4 class="font-bold text-base leading-tight">${name} (عدد ${item.quantity})</h4>
              ${!['حواوشي يا عم', 'سندوتش فراخ استربس', 'صينية شهية لفرد واحد', 'مكرونة بالبشامل لفرد واحد', 'كرات بطاطس بالجبنة لفرد واحد'].includes(name) ? `<span class="text-[9px] font-bold text-[#FAB520] bg-[#FAB520]/10 px-2 py-0.5 rounded-full mt-1 inline-block">خبز ${item.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}</span>` : ''}
            </div>
            <span class="font-bold text-[#FAB520] text-sm">${item.quantity * item.price} ج.م</span>
          </div>
        `).join('')}
        ${sauceQuantity > 0 ? `
          <div class="p-3.5 bg-[#FAB520]/10 rounded-xl border border-[#FAB520]/20 flex justify-between items-center text-[#FAB520] text-sm">
            <span class="font-bold">صوص أعجوبة السحري (عدد ${sauceQuantity})</span>
            <span class="font-bold">${sauceQuantity * SAUCE_PRICE} ج.م</span>
          </div>
        ` : ''}
        <div class="p-3.5 bg-white/5 rounded-xl flex justify-between items-center text-gray-400 text-xs">
            <span>مصاريف توصيل يا عم دليفري</span>
            <span>${DELIVERY_FEE} ج.م</span>
        </div>
      </div>
    `;
  }
  initIcons();
}

const orderForm = document.getElementById('order-form');
if(orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const address = document.getElementById('form-address').value;
    const notes = document.getElementById('form-notes').value;
    const btn = document.getElementById('submit-btn');
    
    if (!name || !phone || !address) return;
    
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-6 h-6 loading-spin"></i><span>جاري طيران يا عم دليفري...</span>`;
    initIcons();
  
    try {
      const orderDetails = Object.entries(cart).map(([name, item]) => 
        `- ${name} (${item.quantity}) ${!['حواوشي يا عم', 'سندوتش فراخ استربس', 'صينية شهية لفرد واحد', 'مكرونة بالبشامل لفرد واحد', 'كرات بطاطس بالجبنة لفرد واحد'].includes(name) ? `[خبز ${item.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}]` : ''}`
      ).join('\n') + (sauceQuantity > 0 ? `\n+ صوص أعجوبة السحري (عدد ${sauceQuantity})` : '');
      
      let subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      subtotal += (sauceQuantity * SAUCE_PRICE);
      
      const response = await fetch("https://formspree.io/f/xdazllep", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            الاسم: name,
            التليفون: phone,
            العنوان: address,
            الملاحظات: notes,
            الطلب: orderDetails,
            الإجمالي: (subtotal + DELIVERY_FEE) + " ج.م"
        })
      });
  
      if (response.ok) {
        document.getElementById('success-screen').style.display = 'flex';
        setTimeout(() => {
          location.reload();
        }, 4000);
      } else {
        alert('يا عم حصل غلط، جرب تاني!');
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="send" class="w-8 h-8"></i><span>اطلب الآن يا عم!</span>`;
        initIcons();
      }
    } catch (err) {
      alert('يا عم النت فيه مشكلة، جرب تاني!');
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="send" class="w-8 h-8"></i><span>اطلب الآن يا عم!</span>`;
      initIcons();
    }
  });
}

window.onload = () => {
  startPreloader();
  renderSandwiches();
};
