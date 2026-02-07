
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import SpecialModal from './components/SpecialModals';
import { LOGO_URL, SANDWICH_ITEMS, TRAY_ITEMS, SWEET_ITEMS } from './constants';
import { SpecialOrderState } from './types';
import { Utensils, IceCream, Sandwich, ShoppingBasket, X, Trash2, Send, Plus, Minus, Truck, Loader2, Star, Sparkles, MapPin, Phone, User, AlertCircle, MessageSquare, Facebook } from 'lucide-react';

const DELIVERY_FEE = 20;
const SAUCE_PRICE = 10;

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaderText] = useState("دستوووووور! 🧞‍♂️");

  const [activeModal, setActiveModal] = useState<'sandwiches' | 'trays' | 'sweets' | null>(null);
  const [isGlobalSummaryOpen, setIsGlobalSummaryOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '', notes: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [sandwichState, setSandwichState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(SANDWICH_ITEMS.map(i => [i.name, 0])),
    sauceQuantity: 0,
    breadChoices: {}
  });
  
  const [trayState, setTrayState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(TRAY_ITEMS.map(i => [i.name, 0])),
    sauceQuantity: 0
  });
  
  const [sweetState, setSweetState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(SWEET_ITEMS.map(i => [i.name, 0])),
    sauceQuantity: 0
  });

  // Preloader Logic - Slowed down significantly
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadProgress(prev => {
        // Smaller increments for a more stable/slower feel
        const next = prev + (Math.random() * 6);
        if (next >= 100) {
          clearInterval(timer);
          // Longer pause at 100% to let animations finish
          setTimeout(() => setLoading(false), 1200);
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const updateGlobalQuantity = (name: string, category: string, delta: number) => {
    const update = (prev: SpecialOrderState) => ({
      ...prev,
      quantities: { ...prev.quantities, [name]: Math.max(0, (prev.quantities[name] || 0) + delta) }
    });
    if (category === 'sandwiches') setSandwichState(update);
    else if (category === 'trays') setTrayState(update);
    else if (category === 'sweets') setSweetState(update);
  };

  const removeGlobalItem = (name: string, category: string) => {
    const reset = (prev: SpecialOrderState) => ({ ...prev, quantities: { ...prev.quantities, [name]: 0 } });
    if (category === 'sandwiches') setSandwichState(reset);
    else if (category === 'trays') setTrayState(reset);
    else if (category === 'sweets') setSweetState(reset);
  };

  const subtotal = useMemo(() => {
    const calc = (state: SpecialOrderState, items: {name: string, price: number}[]) => {
      let sum = items.reduce((acc, item) => acc + (item.price * (state.quantities[item.name] || 0)), 0);
      sum += (state.sauceQuantity * SAUCE_PRICE);
      return sum;
    };
    return calc(sandwichState, SANDWICH_ITEMS) + calc(trayState, TRAY_ITEMS) + calc(sweetState, SWEET_ITEMS);
  }, [sandwichState, trayState, sweetState]);

  const globalTotal = useMemo(() => subtotal > 0 ? subtotal + DELIVERY_FEE : 0, [subtotal]);

  const fullOrderSummary = useMemo(() => {
    const summary: any[] = [];
    SANDWICH_ITEMS.forEach(item => {
      const q = sandwichState.quantities[item.name] || 0;
      if (q > 0) summary.push({ name: item.name, quantity: q, price: item.price, bread: sandwichState.breadChoices?.[item.name], category: 'sandwiches' });
    });
    TRAY_ITEMS.forEach(item => {
      const q = trayState.quantities[item.name] || 0;
      if (q > 0) summary.push({ name: item.name, quantity: q, price: item.price, category: 'trays' });
    });
    SWEET_ITEMS.forEach(item => {
      const q = sweetState.quantities[item.name] || 0;
      if (q > 0) summary.push({ name: item.name, quantity: q, price: item.price, category: 'sweets' });
    });
    
    const totalSauce = sandwichState.sauceQuantity;
    if (totalSauce > 0) {
      summary.push({ name: 'صوص أعجوبة السحري', quantity: totalSauce, price: SAUCE_PRICE, category: 'extra' });
    }
    
    return summary;
  }, [sandwichState, trayState, sweetState]);

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInfo.name || !userInfo.phone || !userInfo.address) {
      alert('يا عم لازم تكتب بياناتك عشان نجيلك!');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const orderDetails = fullOrderSummary.map(i => `- ${i.name} (${i.quantity}) ${i.bread ? `[خبز ${i.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}]` : ''}`).join('\n');
      const response = await fetch("https://formspree.io/f/xdazllep", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            الاسم: userInfo.name,
            التليفون: userInfo.phone,
            العنوان: userInfo.address,
            الملاحظات: userInfo.notes,
            الطلب: orderDetails,
            الإجمالي: globalTotal + " ج.م"
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsGlobalSummaryOpen(false);
          setSandwichState({ quantities: {}, sauceQuantity: 0, breadChoices: {} });
          setTrayState({ quantities: {}, sauceQuantity: 0 });
          setSweetState({ quantities: {}, sauceQuantity: 0 });
          setUserInfo({ name: '', phone: '', address: '', notes: '' });
          setIsSubmitting(false);
        }, 4000);
      } else {
        alert('يا عم حصل غلط في الإرسال، جرب تاني!');
        setIsSubmitting(false);
      }
    } catch (err) {
      alert('يا عم النت فيه مشكلة، جرب تاني!');
      setIsSubmitting(false);
    }
  };

  const totalItemCount = useMemo(() => {
    const allQtys = [...Object.values(sandwichState.quantities), ...Object.values(trayState.quantities), ...Object.values(sweetState.quantities)] as number[];
    return allQtys.reduce((a, b) => (a || 0) + (b || 0), 0) + sandwichState.sauceQuantity;
  }, [sandwichState, trayState, sweetState]);

  return (
    <div className="min-h-screen bg-black text-white font-['Changa'] relative selection:bg-[#FAB520] selection:text-black overflow-x-hidden">
      
      <AnimatePresence>
        {loading && (
          <motion.div 
            key="loader"
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
          >
            <motion.div className="relative flex flex-col items-center">
                <motion.img 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  src={LOGO_URL} 
                  alt="Loading Logo" 
                  className="h-32 md:h-48 object-contain"
                />
                <div className="mt-12 flex flex-col items-center w-full">
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-3">
                        <motion.div 
                          className="h-full bg-[#FAB520]" 
                          style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    {/* Character-by-character animation with conditional rendering delay */}
                    <AnimatePresence>
                      {loadProgress > 35 && (
                        <motion.div 
                          className="text-[#FAB520] font-black text-2xl md:text-4xl font-['Lalezar'] drop-shadow-[0_0_15px_rgba(250,181,32,0.4)] flex gap-1"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } }
                          }}
                        >
                          {loaderText.split('').map((char, i) => (
                            <motion.span 
                              key={i}
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0 }
                              }}
                            >
                              {char}
                            </motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </motion.div>
            <div className="absolute bottom-10 text-white/20 font-bold text-sm tracking-widest uppercase">Ya3m.com Delivery</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] border-[2px] border-[#FAB520]/5 rounded-full blur-2xl" />
              <motion.div animate={{ x: [-100, window.innerWidth + 100], rotate: [0, 10, -10, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute top-[20%] text-5xl opacity-30 select-none">🛵💨</motion.div>
            </div>

            <main className="max-w-7xl mx-auto px-4 pt-4 relative z-10 pb-32">
              <Hero />
              
              <section className="mt-12">
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="text-3xl md:text-5xl font-normal text-center mb-12 text-[#FAB520] drop-shadow-[0_0_20px_rgba(250,181,32,0.5)] font-['Lalezar']"
                >
                  عايز تاكل إيه يا عم؟ 🤤
                </motion.h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'sandwiches', title: 'ركن السندوتشات', icon: Sandwich, color: 'bg-[#FAB520]', text: 'text-black' },
                    { id: 'trays', title: 'صواني وطواجن', icon: Utensils, color: 'bg-white/5 border-4 border-[#FAB520]', text: 'text-[#FAB520]' },
                    { id: 'sweets', title: 'حلويات يا عم', icon: IceCream, color: 'bg-white/10', text: 'text-white' }
                  ].map((cat, i) => (
                    <motion.div 
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }} 
                      onClick={() => setActiveModal(cat.id as any)} 
                      className={`cursor-pointer ${cat.color} p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 group relative shadow-2xl overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <cat.icon className={`w-16 h-16 md:w-20 md:h-20 ${cat.text} group-hover:rotate-12 transition-transform duration-500`} />
                      <h3 className={`text-3xl font-normal font-['Lalezar'] ${cat.text}`}>{cat.title}</h3>
                      <div className={`${cat.id === 'sandwiches' ? 'bg-black text-[#FAB520]' : 'bg-[#FAB520] text-black'} px-6 py-2 rounded-xl font-bold text-base`}>دخول المتجر</div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </main>

            <div className="fixed bottom-6 left-6 md:bottom-10 md:left-10 flex flex-col items-start gap-4 z-[100]">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsGlobalSummaryOpen(true)} 
                className="bg-[#FAB520] text-black p-4 md:p-5 rounded-full shadow-[0_15px_40px_rgba(250,181,32,0.6)] flex items-center gap-3 border-4 border-black"
              >
                <div className="relative">
                  <ShoppingBasket className="w-6 h-6 md:w-8 md:h-8" />
                  <AnimatePresence>
                    {totalItemCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] md:text-xs font-bold w-5 h-5 md:w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
                      >
                        {totalItemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-lg font-bold hidden sm:inline">السلة يا عم</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {isGlobalSummaryOpen && (
                <div className="fixed inset-0 z-[1000] flex justify-end items-stretch overflow-hidden">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGlobalSummaryOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                  <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full md:w-[450px] h-full bg-[#0c0c0c] flex flex-col shadow-2xl">
                    <div className="p-5 md:p-6 flex justify-between items-center border-b border-white/5 bg-black/40 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FAB520]/20 rounded-xl"><ShoppingBasket className="text-[#FAB520] w-5 h-5" /></div>
                        <h2 className="text-2xl font-normal font-['Lalezar']">طلباتك يا عم</h2>
                      </div>
                      <button onClick={() => setIsGlobalSummaryOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-red-500/20"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 scrollbar-hide">
                      {fullOrderSummary.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
                          <ShoppingBasket className="w-20 h-20" />
                          <p className="text-lg font-bold text-center">السلة لسه مفيهاش حاجة يا عم!</p>
                        </div>
                      ) : (
                        <div className="space-y-4 pb-4">
                          {fullOrderSummary.map((item, idx) => (
                            <motion.div layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={`${item.name}-${idx}`} className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5 shadow-inner">
                              <div className="flex justify-between items-start mb-2">
                                <div><h4 className="font-bold text-lg leading-tight mb-1">{item.name}</h4>{item.bread && <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">خبز {item.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}</span>}</div>
                                {item.category !== 'extra' && (
                                   <button onClick={() => removeGlobalItem(item.name, item.category)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                )}
                              </div>
                              <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5">
                                <span className="text-xl font-bold text-[#FAB520]">{item.quantity * item.price} ج.م</span>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => item.category === 'extra' ? setSandwichState(s => ({...s, sauceQuantity: Math.max(0, s.sauceQuantity - 1)})) : updateGlobalQuantity(item.name, item.category, -1)} className="text-[#FAB520] bg-white/5 p-1.5 rounded-lg active:scale-125 transition-transform"><Minus className="w-4 h-4" /></button>
                                  <span className="font-bold text-lg w-6 text-center text-white">{item.quantity}</span>
                                  <button onClick={() => item.category === 'extra' ? setSandwichState(s => ({...s, sauceQuantity: s.sauceQuantity + 1})) : updateGlobalQuantity(item.name, item.category, 1)} className="text-[#FAB520] bg-white/5 p-1.5 rounded-lg active:scale-125 transition-transform"><Plus className="w-4 h-4" /></button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <SpecialModal isOpen={activeModal === 'sandwiches'} onClose={() => setActiveModal(null)} title="ركن السندوتشات" image="https://sayedsamkary.com/unnamed.jpg" type="sandwiches" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sandwichState} onUpdateState={(ns) => setSandwichState(ns)} onFinalSubmit={handleFinalSubmit} initialItems={SANDWICH_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} />
            <SpecialModal isOpen={activeModal === 'trays'} onClose={() => setActiveModal(null)} title="صواني وطواجن" image="https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D9%83%D9%88%D8%B3%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%84.jpg" type="trays" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={trayState} onUpdateState={(ns) => setTrayState(ns)} onFinalSubmit={handleFinalSubmit} initialItems={TRAY_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} />
            <SpecialModal isOpen={activeModal === 'sweets'} onClose={() => setActiveModal(null)} title="حلويات يا عم" image="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80" type="sweets" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sweetState} onUpdateState={(ns) => setSweetState(ns)} onFinalSubmit={handleFinalSubmit} initialItems={SWEET_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} />

            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#FAB520] p-10 rounded-full mb-8 shadow-[0_0_100px_rgba(250,181,32,0.6)]"><Send className="w-16 h-16 text-black" /></motion.div>
                  <h2 className="text-5xl font-normal font-['Lalezar'] text-[#FAB520] mb-4">طلبك طار عندنا!</h2>
                  <p class="text-xl text-gray-400 font-bold">هيكون عندك خلال 25 دقيقة بالضبط 🛵💨</p>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="py-16 text-center text-gray-700 bg-black/50 border-t border-white/5">
              <div className="mb-8 flex flex-col items-center gap-4">
                  <a href="https://wa.me/201010373331" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#25D366] hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5" />
                      <span className="font-bold text-lg">واتساب: 01010373331</span>
                  </a>
                  <a href="https://www.facebook.com/Ya3mCom" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#1877F2] hover:scale-105 transition-transform">
                      <Facebook className="w-5 h-5" />
                      <span className="font-bold text-lg">تابعنا على فيسبوك</span>
                  </a>
              </div>
              <img src={LOGO_URL} className="h-14 mx-auto mb-6 grayscale opacity-40" alt="Footer Logo" />
              <p className="font-bold text-[10px] tracking-widest uppercase">جميع الحقوق محفوظة لـ يا عم . كوم © 2025</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
