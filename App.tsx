
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import { LOGO_URL, SANDWICH_ITEMS, TRAY_ITEMS, SWEET_ITEMS } from './constants';
import { SpecialOrderState } from './types';
import { Utensils, IceCream, Sandwich, ShoppingBasket, X, Trash2, Send, Loader2, HeartHandshake, Zap, Phone, Facebook, Clock, Plus, Minus, Sparkles, Smartphone, Download } from 'lucide-react';

const DELIVERY_FEE = 20;
const SAUCE_PRICE = 20;

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '', notes: '' });
  const [cateringRequest, setCateringRequest] = useState({ name: '', phone: '', message: '', urgency: 'normal' });

  // Initial States
  const initQty = (items: any[]) => Object.fromEntries(items.map(i => [i.name, 0]));
  
  const [sandwichState, setSandwichState] = useState<SpecialOrderState>({
    quantities: initQty(SANDWICH_ITEMS),
    sauceQuantity: 0,
    breadChoices: {}
  });
  
  const [trayState, setTrayState] = useState<SpecialOrderState>({
    quantities: initQty(TRAY_ITEMS),
    sauceQuantity: 0
  });
  
  const [sweetState, setSweetState] = useState<SpecialOrderState>({
    quantities: initQty(SWEET_ITEMS),
    sauceQuantity: 0
  });

  useEffect(() => {
    // Progress loader
    const timer = setInterval(() => {
      setLoadProgress(prev => {
        const next = prev + Math.random() * 20;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 600);
          return 100;
        }
        return next;
      });
    }, 80);

    // PWA Install Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => clearInterval(timer);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleUpdateQty = (name: string, category: 'sandwiches' | 'trays' | 'sweets', delta: number) => {
    const update = (prev: SpecialOrderState) => ({
      ...prev,
      quantities: { ...prev.quantities, [name]: Math.max(0, (prev.quantities[name] || 0) + delta) }
    });
    if (category === 'sandwiches') setSandwichState(update);
    else if (category === 'trays') setTrayState(update);
    else if (category === 'sweets') setSweetState(update);
  };

  const handleBreadChoice = (name: string, choice: 'baladi' | 'western') => {
    setSandwichState(prev => ({
      ...prev,
      breadChoices: { ...prev.breadChoices, [name]: choice }
    }));
  };

  const subtotal = useMemo(() => {
    const calc = (state: SpecialOrderState, items: any[]) => {
      let sum = items.reduce((acc, item) => acc + (item.price * (state.quantities[item.name] || 0)), 0);
      if (state.sauceQuantity) sum += (state.sauceQuantity * SAUCE_PRICE);
      return sum;
    };
    return calc(sandwichState, SANDWICH_ITEMS) + calc(trayState, TRAY_ITEMS) + calc(sweetState, SWEET_ITEMS);
  }, [sandwichState, trayState, sweetState]);

  const globalTotal = useMemo(() => subtotal > 0 ? subtotal + DELIVERY_FEE : 0, [subtotal]);

  const fullOrderSummary = useMemo(() => {
    const summary: any[] = [];
    const collect = (state: SpecialOrderState, items: any[], cat: string) => {
      items.forEach(item => {
        const q = state.quantities[item.name] || 0;
        if (q > 0) summary.push({ 
          name: item.name, 
          quantity: q, 
          price: item.price, 
          bread: state.breadChoices?.[item.name] || 'baladi',
          category: cat 
        });
      });
    };
    collect(sandwichState, SANDWICH_ITEMS, 'sandwiches');
    collect(trayState, TRAY_ITEMS, 'trays');
    collect(sweetState, SWEET_ITEMS, 'sweets');
    if (sandwichState.sauceQuantity > 0) {
      summary.push({ name: 'صوص أعجوبة السحري', quantity: sandwichState.sauceQuantity, price: SAUCE_PRICE, category: 'extra' });
    }
    return summary;
  }, [sandwichState, trayState, sweetState]);

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInfo.name || !userInfo.phone || !userInfo.address) {
      alert('كمل بياناتك يا عم!');
      return;
    }
    setIsSubmitting(true);
    try {
      const orderDetails = fullOrderSummary.map(i => `- ${i.name} (${i.quantity}) ${i.category === 'sandwiches' ? `[خبز ${i.bread === 'baladi' ? 'بلدي' : 'فينو'}]` : ''}`).join('\n');
      const response = await fetch("https://formspree.io/f/xdazllep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userInfo, الطلب: orderDetails, الإجمالي: globalTotal })
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          // Keep success screen visible for PWA promo if they want
        }, 3000);
      }
    } catch (err) {
      alert('حصل مشكلة!');
      setIsSubmitting(false);
    }
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setIsCartOpen(false);
    setSandwichState({ quantities: initQty(SANDWICH_ITEMS), sauceQuantity: 0, breadChoices: {} });
    setTrayState({ quantities: initQty(TRAY_ITEMS), sauceQuantity: 0 });
    setSweetState({ quantities: initQty(SWEET_ITEMS), sauceQuantity: 0 });
    setUserInfo({ name: '', phone: '', address: '', notes: '' });
    setIsSubmitting(false);
  };

  const handleCateringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("https://formspree.io/f/xeelqgpd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cateringRequest, النوع: "عزومة" })
      });
      if (response.ok) {
        setShowSuccess(true);
      }
    } catch (err) {
      alert('حاول تاني!');
      setIsSubmitting(false);
    }
  };

  const totalItemCount = fullOrderSummary.reduce((a, b) => a + b.quantity, 0);

  // Install Button Component
  const InstallButton = ({ className = "" }: { className?: string }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleInstallClick}
      className={`flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-2xl transition-all group ${className}`}
    >
      <div className="bg-[#FAB520] p-2 rounded-lg text-black group-hover:rotate-12 transition-transform">
        <Smartphone size={20} />
      </div>
      <div className="text-right">
        <p className="text-[10px] text-gray-400 font-bold leading-tight">حمل تطبيق</p>
        <p className="text-sm font-black text-white leading-tight">يا عم دليفري</p>
      </div>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-black text-white font-['Changa'] overflow-x-hidden selection:bg-[#FAB520] selection:text-black">
      <AnimatePresence>
        {loading && (
          <motion.div key="loader" exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
            <motion.img animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} src={LOGO_URL} className="h-40 md:h-56 object-contain mb-8" />
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#FAB520]" style={{ width: `${loadProgress}%` }} />
            </div>
            <p className="mt-4 text-[#FAB520] font-['Lalezar'] text-3xl">دستوووووور! 🧞‍♂️</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
          <main className="max-w-7xl mx-auto px-4 pt-6 pb-40">
            {/* Hero with Install Button */}
            <div className="relative">
              <Hero />
              {deferredPrompt && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center -mt-8 mb-12 relative z-20"
                >
                  <InstallButton />
                </motion.div>
              )}
            </div>
            
            {/* Sandwich Section */}
            <section id="ordering-section" className="mt-20">
              <div className="flex items-center gap-4 mb-12">
                <div className="bg-[#FAB520] p-3 rounded-2xl"><Sandwich className="text-black w-8 h-8" /></div>
                <h2 className="text-4xl md:text-6xl font-['Lalezar'] text-[#FAB520]">ركن السندوتشات</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {SANDWICH_ITEMS.map((item, i) => {
                  const qty = sandwichState.quantities[item.name] || 0;
                  const bread = sandwichState.breadChoices?.[item.name] || 'baladi';
                  return (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5 }}
                      className={`relative bg-zinc-900/50 border-2 rounded-[2.5rem] p-6 transition-all ${qty > 0 ? 'border-[#FAB520] shadow-[0_0_30px_rgba(250,181,32,0.1)]' : 'border-white/5'}`}
                    >
                      <div className="flex gap-4">
                        <img src={item.image} className="w-24 h-24 object-cover rounded-3xl border border-white/10" alt={item.name} />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                          <span className="text-[#FAB520] font-black text-lg">{item.price} ج.م</span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between bg-black/40 p-2 rounded-2xl border border-white/5">
                        <button onClick={() => handleUpdateQty(item.name, 'sandwiches', -1)} className="p-3 text-[#FAB520] hover:bg-[#FAB520]/10 rounded-xl transition-all"><Minus /></button>
                        <span className="text-2xl font-black">{qty}</span>
                        <button onClick={() => handleUpdateQty(item.name, 'sandwiches', 1)} className="p-3 text-[#FAB520] hover:bg-[#FAB520]/10 rounded-xl transition-all"><Plus /></button>
                      </div>

                      <AnimatePresence>
                        {qty > 0 && !['حواوشي يا عم', 'سندوتش فراخ استربس', 'صينية شهية لفرد واحد', 'مكرونة بالبشامل لفرد واحد', 'كرات بطاطس بالجبنة لفرد واحد'].includes(item.name) && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                            <button onClick={() => handleBreadChoice(item.name, 'baladi')} className={`py-2 rounded-xl text-xs font-black transition-all ${bread === 'baladi' ? 'bg-[#FAB520] text-black' : 'bg-white/5 text-gray-500'}`}>عيش بلدي</button>
                            <button onClick={() => handleBreadChoice(item.name, 'western')} className={`py-2 rounded-xl text-xs font-black transition-all ${bread === 'western' ? 'bg-[#FAB520] text-black' : 'bg-white/5 text-gray-500'}`}>عيش فينو</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Magic Sauce */}
              <div className="mt-12 max-w-md mx-auto">
                <div className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between transition-all ${sandwichState.sauceQuantity > 0 ? 'bg-[#FAB520] border-black text-black shadow-xl' : 'bg-zinc-900 border-dashed border-[#FAB520]/20'}`}>
                   <div className="flex items-center gap-4">
                      <Sparkles className={sandwichState.sauceQuantity > 0 ? 'text-black' : 'text-[#FAB520]'} />
                      <div>
                        <div className="font-black text-lg">صوص أعجوبة السحري ✨</div>
                        <div className="text-xs opacity-60">خلطة يا عم السرية (20 ج.م)</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 bg-black/10 p-2 rounded-2xl">
                      <button onClick={() => setSandwichState(s => ({...s, sauceQuantity: Math.max(0, s.sauceQuantity - 1)}))} className="p-2"><Minus size={18} /></button>
                      <span className="font-black text-xl">{sandwichState.sauceQuantity}</span>
                      <button onClick={() => setSandwichState(s => ({...s, sauceQuantity: s.sauceQuantity + 1}))} className="p-2"><Plus size={18} /></button>
                   </div>
                </div>
              </div>
            </section>

            {/* Trays & Sweets */}
            <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
               <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#FAB520] p-3 rounded-2xl"><Utensils className="text-black w-6 h-6" /></div>
                    <h2 className="text-3xl font-['Lalezar'] text-[#FAB520]">صواني وطواجن العيلة</h2>
                  </div>
                  <div className="space-y-4">
                    {TRAY_ITEMS.map((item, i) => (
                      <div key={i} className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-[#FAB520]/30 transition-all">
                        <div>
                          <div className="font-bold text-lg mb-1">{item.name}</div>
                          <div className="text-[#FAB520] font-black">{item.price} ج.م</div>
                        </div>
                        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl">
                          <button onClick={() => handleUpdateQty(item.name, 'trays', -1)} className="p-2 text-[#FAB520]"><Minus size={18} /></button>
                          <span className="font-black w-6 text-center">{trayState.quantities[item.name] || 0}</span>
                          <button onClick={() => handleUpdateQty(item.name, 'trays', 1)} className="p-2 text-[#FAB520]"><Plus size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
               </section>

               <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#FAB520] p-3 rounded-2xl"><IceCream className="text-black w-6 h-6" /></div>
                    <h2 className="text-3xl font-['Lalezar'] text-[#FAB520]">حلويات يا عم</h2>
                  </div>
                  <div className="space-y-4">
                    {SWEET_ITEMS.map((item, i) => (
                      <div key={i} className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-[#FAB520]/30 transition-all">
                        <div>
                          <div className="font-bold text-lg mb-1">{item.name}</div>
                          <div className="text-[#FAB520] font-black">{item.price} ج.م</div>
                        </div>
                        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl">
                          <button onClick={() => handleUpdateQty(item.name, 'sweets', -1)} className="p-2 text-[#FAB520]"><Minus size={18} /></button>
                          <span className="font-black w-6 text-center">{sweetState.quantities[item.name] || 0}</span>
                          <button onClick={() => handleUpdateQty(item.name, 'sweets', 1)} className="p-2 text-[#FAB520]"><Plus size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
               </section>
            </div>

            {/* Total Summary */}
            <AnimatePresence>
              {globalTotal > 0 && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto bg-zinc-900 border-2 border-[#FAB520] rounded-[3.5rem] p-10 mt-24 mb-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><ShoppingBasket size={120} /></div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="text-center md:text-right">
                      <h3 className="text-4xl font-['Lalezar'] text-[#FAB520] mb-2">إجمالي حسابك</h3>
                      <p className="text-gray-400 font-bold">الأكلة بتتحضر وهتجيلك في صاروخ 🚀</p>
                    </div>
                    <div className="text-6xl font-black text-[#FAB520] drop-shadow-[0_0_20px_rgba(250,181,32,0.4)]">{globalTotal} ج.م</div>
                  </div>
                  <button onClick={() => setIsCartOpen(true)} className="w-full mt-10 py-6 bg-[#FAB520] text-black font-['Lalezar'] text-4xl rounded-3xl shadow-[0_20px_40px_rgba(250,181,32,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                    أكد الأكلة دلوقتي!
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Catering Section */}
            <section className="mt-32">
              <div className="bg-gradient-to-br from-[#FAB520] to-[#E6A610] p-12 md:p-20 rounded-[4.5rem] text-black relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <img src={LOGO_URL} className="w-24 h-24 object-contain mb-8 bg-black/10 p-4 rounded-full" />
                    <h2 className="text-5xl md:text-7xl font-['Lalezar'] mb-6">عايز عزومة؟<br/>أو أكلة مخصوص؟</h2>
                    <p className="text-2xl font-black opacity-80 leading-relaxed">يا عم بيعملك أي أكلة بيتي تخطر على بالك! قولي إيه في نفسك واحنا علينا التنفيذ والتوصيل.</p>
                  </div>
                  <div className="bg-black/95 p-10 rounded-[3rem] shadow-2xl">
                    <h3 className="text-3xl font-['Lalezar'] text-[#FAB520] mb-8 text-center">اطلب عزومتك هنا</h3>
                    <form onSubmit={handleCateringSubmit} className="space-y-4">
                      <input required value={cateringRequest.name} onChange={e => setCateringRequest(s => ({...s, name: e.target.value}))} placeholder="الاسم" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] text-white" />
                      <input required type="tel" value={cateringRequest.phone} onChange={e => setCateringRequest(s => ({...s, phone: e.target.value}))} placeholder="رقم الموبايل" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] text-white" />
                      <textarea required value={cateringRequest.message} onChange={e => setCateringRequest(s => ({...s, message: e.target.value}))} placeholder="اكتب الأصناف اللي عايزها (مثلاً: حلة محشي، صينية بشاميل، ...) " className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none h-32 text-white" />
                      <button disabled={isSubmitting} className="w-full py-5 bg-[#FAB520] text-black font-['Lalezar'] text-3xl rounded-2xl hover:scale-105 transition-all">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'ابعت لـ يا عم'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Cart Drawer */}
          <AnimatePresence>
            {isCartOpen && (
              <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
                <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="relative w-full max-w-2xl bg-zinc-950 border-2 border-[#FAB520] rounded-[4rem] p-8 md:p-14 overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(250,181,32,0.2)]">
                  <button onClick={() => setIsCartOpen(false)} className="absolute top-10 left-10 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                  <h2 className="text-5xl font-['Lalezar'] text-[#FAB520] text-center mb-10">بيانات التوصيل</h2>
                  
                  <div className="space-y-4 mb-10 max-h-60 overflow-y-auto pr-4 scrollbar-hide">
                    {fullOrderSummary.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div>
                          <div className="font-bold text-lg">{item.name}</div>
                          <div className="text-sm text-[#FAB520] font-black">{item.quantity} × {item.price} ج.م {item.category === 'sandwiches' && `- عيش ${item.bread === 'baladi' ? 'بلدي' : 'فينو'}`}</div>
                        </div>
                        <div className="font-black text-xl">{item.price * item.quantity} ج.م</div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-5 bg-[#FAB520]/5 rounded-2xl border border-[#FAB520]/20">
                      <span className="font-bold">خدمة التوصيل</span>
                      <span className="font-black text-[#FAB520]">{DELIVERY_FEE} ج.م</span>
                    </div>
                  </div>

                  <form onSubmit={handleFinalSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required value={userInfo.name} onChange={e => setUserInfo(u => ({...u, name: e.target.value}))} placeholder="الاسم" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] text-lg" />
                      <input required type="tel" value={userInfo.phone} onChange={e => setUserInfo(u => ({...u, phone: e.target.value}))} placeholder="رقم الموبايل" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] text-lg" />
                    </div>
                    <input required value={userInfo.address} onChange={e => setUserInfo(u => ({...u, address: e.target.value}))} placeholder="العنوان بالتفصيل" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] text-lg" />
                    <textarea value={userInfo.notes} onChange={e => setUserInfo(u => ({...u, notes: e.target.value}))} placeholder="ملاحظات (اختياري)" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none h-24 text-lg" />
                    
                    <div className="text-center py-6 border-t border-white/10 mt-6">
                      <span className="text-gray-500 font-bold block mb-2">الإجمالي النهائي</span>
                      <div className="text-5xl font-black text-[#FAB520]">{globalTotal} ج.م</div>
                    </div>

                    <button disabled={isSubmitting} className="w-full py-6 bg-[#FAB520] text-black font-['Lalezar'] text-4xl rounded-3xl shadow-2xl hover:scale-[1.02] transition-all">
                      {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'أكد الطلب الآن'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Cart */}
          <AnimatePresence>
            {totalItemCount > 0 && !showSuccess && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="fixed bottom-10 right-10 z-[10000]"
              >
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="bg-[#FAB520] text-black p-6 rounded-full shadow-[0_20px_50px_rgba(250,181,32,0.4)] border-4 border-black relative group"
                >
                  <ShoppingBasket size={44} />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-black border-4 border-black">{totalItemCount}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Overlay with App Promo */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[20000] bg-black/98 flex flex-col items-center justify-center p-8 text-center backdrop-blur-3xl overflow-y-auto">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} className="bg-[#FAB520] p-12 md:p-16 rounded-full mb-8 shadow-[0_0_100px_rgba(250,181,32,0.5)]">
                  <HeartHandshake size={80} className="text-black" />
                </motion.div>
                <h2 className="text-5xl md:text-7xl font-['Lalezar'] text-[#FAB520] mb-4">وصلت يا عم!</h2>
                <p className="text-2xl text-white font-black mb-8">استلمنا طلبك وبنجهزهولك بكل حب 🤝🔥</p>
                
                <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] max-w-sm w-full mb-10">
                   <img src={LOGO_URL} className="h-16 mx-auto mb-4" />
                   <h3 className="text-xl font-bold mb-4">عشان تطلب أسرع المرة الجاية</h3>
                   {deferredPrompt ? (
                     <InstallButton className="w-full justify-center bg-[#FAB520] text-black border-none" />
                   ) : (
                     <p className="text-gray-400 text-sm">ضيف موقعنا للشاشة الرئيسية لمتابعة العروض الجديدة!</p>
                   )}
                </div>

                <button 
                  onClick={closeSuccess}
                  className="bg-white/10 hover:bg-white/20 px-12 py-4 rounded-2xl font-bold transition-all"
                >
                  رجوع للمنيو
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="py-24 text-center border-t border-white/5 bg-zinc-950 mt-32">
            <div className="flex flex-col items-center gap-8">
              <img src={LOGO_URL} className="h-24 grayscale opacity-40 hover:grayscale-0 transition-all cursor-pointer" />
              <div className="flex gap-12">
                <a href="https://wa.me/201010373331" target="_blank" className="text-gray-400 hover:text-green-500 hover:scale-125 transition-all"><Phone size={36} /></a>
                <a href="https://www.facebook.com/Ya3mCom" target="_blank" className="text-gray-400 hover:text-blue-500 hover:scale-125 transition-all"><Facebook size={36} /></a>
              </div>
              <div className="max-w-md mx-auto h-px bg-white/5 w-full" />
              <p className="opacity-20 text-sm font-black tracking-widest">جميع الحقوق محفوظة لـ يا عم . كوم © 2025</p>
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
};

export default App;
