
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
let cateringUrgency = 'normal';
const DELIVERY_FEE = 20;

function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// Catering Logic
window.openSpecialCatering = function() {
  document.getElementById('special-catering-modal').classList.remove('hidden');
};

window.closeSpecialCatering = function() {
  document.getElementById('special-catering-modal').classList.add('hidden');
};

window.setCatUrgency = function(level) {
  cateringUrgency = level;
  const btnUrgent = document.getElementById('btn-urg-urgent');
  const btnNormal = document.getElementById('btn-urg-normal');
  const datePicker = document.getElementById('date-picker-container');

  if (level === 'urgent') {
    btnUrgent.className = "p-4 rounded-xl border border-[#FAB520] bg-[#FAB520]/10 text-[#FAB520] font-bold text-sm transition-all flex items-center justify-center gap-2";
    btnNormal.className = "p-4 rounded-xl border border-white/10 bg-white/5 font-bold text-sm transition-all flex items-center justify-center gap-2 text-white/40";
    datePicker.classList.add('hidden');
  } else {
    btnNormal.className = "p-4 rounded-xl border border-[#FAB520] bg-[#FAB520]/10 text-[#FAB520] font-bold text-sm transition-all flex items-center justify-center gap-2";
    btnUrgent.className = "p-4 rounded-xl border border-white/10 bg-white/5 font-bold text-sm transition-all flex items-center justify-center gap-2 text-white/40";
    datePicker.classList.remove('hidden');
  }
};

const cateringForm = document.getElementById('catering-form');
if (cateringForm) {
  cateringForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('cat-submit-btn');
    const msg = document.getElementById('cat-message').value;
    const name = document.getElementById('cat-name').value;
    const phone = document.getElementById('cat-phone').value;
    const date = document.getElementById('cat-date').value;

    btn.disabled = true;
    btn.innerHTML = `جاري الإرسال...`;

    try {
      const response = await fetch("https://formspree.io/f/xeelqgpd", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          النوع: "طلب عزومة/أصناف خاصة (HTML)",
          الاسم: name,
          التليفون: phone,
          الطلب: msg,
          الاستعجال: cateringUrgency === 'urgent' ? 'مستعجل' : 'موعد عادي',
          الموعد: date || 'غير محدد'
        })
      });
      if (response.ok) {
        document.getElementById('success-screen').style.display = 'flex';
        closeSpecialCatering();
        setTimeout(() => location.reload(), 4000);
      } else {
        alert('حدث خطأ أثناء الإرسال');
        btn.disabled = false;
        btn.innerHTML = `ابعت الطلب لـ يا عم!`;
      }
    } catch (err) {
      alert('خطأ في الاتصال بالشبكة');
      btn.disabled = false;
      btn.innerHTML = `ابعت الطلب لـ يا عم!`;
    }
  });
}

// Menu / Cart Logic (Existing)
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
        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
          mainContent.style.opacity = '1';
        }, 800);
      }, 1000);
    }
    if (loaderBar) loaderBar.style.width = `${progress}%`;
  }, 150);
}

function renderSandwiches() {
  const container = document.getElementById('sandwich-list');
  if(!container) return;
  container.innerHTML = SANDWICH_ITEMS.map((item) => {
    const qty = cart[item.name]?.quantity || 0;
    return `
      <div class="p-5 rounded-[2.5rem] bg-white/5 border-2 ${qty > 0 ? 'border-[#FAB520]' : 'border-transparent'} flex flex-col sm:flex-row items-center gap-5">
        <img src="${item.image}" class="w-32 h-32 rounded-[2rem] object-cover">
        <div class="flex-1 text-center sm:text-right">
          <h3 class="text-2xl font-['Lalezar']">${item.name}</h3>
          <p class="text-[#FAB520] font-bold">${item.price} ج.م</p>
        </div>
        <div class="flex items-center gap-4 bg-black p-2 rounded-2xl border border-white/10">
          <button onclick="updateQty('${item.name}', -1, ${item.price})" class="text-[#FAB520]"><i data-lucide="minus"></i></button>
          <span class="text-xl font-bold w-8 text-center">${qty}</span>
          <button onclick="updateQty('${item.name}', 1, ${item.price})" class="text-[#FAB520]"><i data-lucide="plus"></i></button>
        </div>
      </div>
    `;
  }).join('');
  initIcons();
}

window.updateQty = function(name, delta, price) {
  if (!cart[name]) cart[name] = { quantity: 0, price: price };
  cart[name].quantity = Math.max(0, cart[name].quantity + delta);
  if (cart[name].quantity === 0) delete cart[name];
  renderSandwiches();
  updateMainSummary();
};

function updateMainSummary() {
  const summaryBox = document.getElementById('main-order-summary');
  const totalEl = document.getElementById('main-total-price');
  let subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotal > 0) {
    summaryBox.classList.remove('hidden');
    totalEl.innerText = `${subtotal + DELIVERY_FEE} ج.م`;
  } else {
    summaryBox.classList.add('hidden');
  }
}

window.toggleCart = function() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay.classList.contains('hidden')) {
    overlay.classList.remove('hidden');
    setTimeout(() => drawer.style.transform = 'translateX(0)', 10);
  } else {
    drawer.style.transform = 'translateX(100%)';
    setTimeout(() => overlay.classList.add('hidden'), 500);
  }
};

window.onload = () => {
  startPreloader();
  renderSandwiches();
  initIcons();
};
