
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import SpecialModal from './components/SpecialModals';
import { LOGO_URL, SANDWICH_ITEMS, TRAY_ITEMS, SWEET_ITEMS } from './constants';
import { SpecialOrderState } from './types';
import { Utensils, IceCream, Sandwich, ShoppingBasket, X, Trash2, Send, Plus, Minus, Truck, Loader2, Star, Sparkles, MapPin, Phone, User, AlertCircle, MessageSquare, Facebook, ChefHat, HeartHandshake, Clock, Zap } from 'lucide-react';

const DELIVERY_FEE = 20;
const SAUCE_PRICE = 20;

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaderText] = useState("دستوووووور! 🧞‍♂️");

  const [activeModal, setActiveModal] = useState<'sandwiches' | 'trays' | 'sweets' | null>(null);
  const [isCateringOpen, setIsCateringOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '', notes: '' });
  const [cateringRequest, setCateringRequest] = useState({ name: '', phone: '', message: '', urgency: 'normal', date: '' });
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

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadProgress(prev => {
        const next = prev + (Math.random() * 6);
        if (next >= 100) {
          clearInterval(timer);
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
    if (totalSauce > 0) summary.push({ name: 'صوص أعجوبة السحري', quantity: totalSauce, price: SAUCE_PRICE, category: 'extra' });
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
            النوع: "طلب من المنيو",
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
          setIsCartOpen(false);
          setSandwichState({ quantities: {}, sauceQuantity: 0, breadChoices: {} });
          setTrayState({ quantities: {}, sauceQuantity: 0 });
          setSweetState({ quantities: {}, sauceQuantity: 0 });
          setUserInfo({ name: '', phone: '', address: '', notes: '' });
          setIsSubmitting(false);
        }, 4000);
      } else {
        alert('يا عم حصل غلط، جرب تاني!');
        setIsSubmitting(false);
      }
    } catch (err) {
      alert('مشكلة في الاتصال!');
      setIsSubmitting(false);
    }
  };

  const handleCateringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cateringRequest.message || !cateringRequest.phone || !cateringRequest.name) {
      alert('يا عم كمل بياناتك عشان نخدمك صح!');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("https://formspree.io/f/xeelqgpd", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            النوع: "عزومة / طلب خاص",
            الاسم: cateringRequest.name,
            التليفون: cateringRequest.phone,
            الطلب: cateringRequest.message,
            الاستعجال: cateringRequest.urgency === 'urgent' ? 'مستعجل' : 'موعد عادي',
            الموعد: cateringRequest.date || 'غير محدد'
        })
      });
      if (response.ok) {
        setShowSuccess(true);
        setIsCateringOpen(false);
        setCateringRequest({ name: '', phone: '', message: '', urgency: 'normal', date: '' });
        setTimeout(() => {
          setShowSuccess(false);
          setIsSubmitting(false);
        }, 4000);
      } else {
        alert('حصل غلط، حاول تاني يا عم!');
        setIsSubmitting(false);
      }
    } catch (err) {
      alert('خطأ في الاتصال!');
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
          <motion.div key="loader" exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
            <motion.div className="relative flex flex-col items-center">
                <motion.img animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }} src={LOGO_URL} alt="Loading" className="h-32 md:h-48 object-contain" />
                <div className="mt-12 flex flex-col items-center w-full">
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-3">
                        <motion.div className="h-full bg-[#FAB520]" style={{ width: `${loadProgress}%` }} />
                    </div>
                    <AnimatePresence>
                      {loadProgress > 35 && (
                        <motion.div className="text-[#FAB520] font-black text-2xl md:text-4xl font-['Lalezar'] drop-shadow-[0_0_15px_rgba(250,181,32,0.4)] flex gap-1" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}>
                          {loaderText.split('').map((char, i) => (
                            <motion.span key={i} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>{char}</motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <div className="fixed inset-0 pointer-events-none z-0">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] border-[2px] border-[#FAB520]/5 rounded-full blur-2xl" />
            </div>

            <main className="max-w-7xl mx-auto px-4 pt-4 relative z-10 pb-32">
              <Hero />
              
              <section id="ordering-section" className="mt-12">
                <motion.h2 initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="text-3xl md:text-5xl font-normal text-center mb-12 text-[#FAB520] font-['Lalezar']">عايز تاكل إيه يا عم؟ 🤤</motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'sandwiches', title: 'ركن السندوتشات', icon: Sandwich, color: 'bg-[#FAB520]', text: 'text-black' },
                    { id: 'trays', title: 'صواني وطواجن', icon: Utensils, color: 'bg-white/5 border-4 border-[#FAB520]', text: 'text-[#FAB520]' },
                    { id: 'sweets', title: 'حلويات يا عم', icon: IceCream, color: 'bg-white/10', text: 'text-white' }
                  ].map((cat, i) => (
                    <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05 }} onClick={() => setActiveModal(cat.id as any)} className={`cursor-pointer ${cat.color} p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-4 group relative shadow-2xl overflow-hidden`}>
                      <cat.icon className={`w-16 h-16 md:w-20 md:h-20 ${cat.text}`} />
                      <h3 className={`text-3xl font-normal font-['Lalezar'] ${cat.text}`}>{cat.title}</h3>
                      <div className={`${cat.id === 'sandwiches' ? 'bg-black text-[#FAB520]' : 'bg-[#FAB520] text-black'} px-6 py-2 rounded-xl font-bold`}>دخول المتجر</div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Summary Block */}
              <AnimatePresence>
                {globalTotal > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="max-w-4xl mx-auto bg-white/5 border border-[#FAB520]/20 rounded-[2.5rem] p-8 mt-12 mb-20 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                      <h3 className="text-3xl font-['Lalezar'] text-[#FAB520]">حساب أكلة يا عم</h3>
                      <div className="text-right">
                         <span className="block text-gray-400 text-sm font-bold">الإجمالي شامل التوصيل</span>
                         <span className="text-4xl font-bold text-[#FAB520]">{globalTotal} ج.م</span>
                      </div>
                    </div>
                    <button onClick={() => setIsCartOpen(true)} className="w-full py-5 bg-[#FAB520] text-black font-bold text-2xl rounded-3xl shadow-xl flex items-center justify-center gap-3 font-['Lalezar']">
                      <ShoppingBasket className="w-8 h-8" />
                      <span>أكد أكلتك مع يا عم!</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Special Catering Section */}
              <section className="mt-20">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[#FAB520] to-[#facc15] p-10 md:p-16 rounded-[4rem] text-black text-center shadow-2xl relative overflow-hidden">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-10 -right-10 opacity-10"><img src={LOGO_URL} className="w-64 h-64 object-contain" /></motion.div>
                  <div className="relative z-10">
                    <ChefHat className="w-16 h-16 mx-auto mb-6 text-black/40" />
                    <h2 className="text-4xl md:text-6xl font-normal font-['Lalezar'] mb-4">عايز عزومة؟ أو أكلة مخصوص؟</h2>
                    <p className="text-xl md:text-2xl font-bold mb-10 max-w-2xl mx-auto opacity-80">يا عم بيعملك أي أكلة بيتي تخطر على بالك! قولي إيه في نفسك واحنا علينا التنفيذ والتوصيل.</p>
                    <button onClick={() => setIsCateringOpen(true)} className="bg-black text-[#FAB520] px-12 py-5 rounded-2xl font-['Lalezar'] text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                        اطلب طلب خاص يا عم!
                    </button>
                  </div>
                </motion.div>
              </section>
            </main>

            {/* Special Catering Modal */}
            <AnimatePresence>
              {isCateringOpen && (
                <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCateringOpen(false)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                  <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#0c0c0c] rounded-[3rem] border-2 border-[#FAB520] p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setIsCateringOpen(false)} className="absolute top-6 left-6 text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                    <div className="text-center mb-8">
                      <img src={LOGO_URL} className="h-20 mx-auto mb-4" alt="لوجو يا عم" />
                      <h2 className="text-3xl font-['Lalezar'] text-[#FAB520]">طلبات خاصة وعزومات</h2>
                      <p className="text-gray-400 font-bold mt-2">اكتب اللي في نفسك وهنتواصل معاك!</p>
                    </div>
                    <form onSubmit={handleCateringSubmit} className="space-y-5 pb-6">
                      <div className="grid grid-cols-2 gap-3">
                        <input required value={cateringRequest.name} onChange={e => setCateringRequest(s => ({...s, name: e.target.value}))} placeholder="الاسم" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#FAB520] font-bold text-white" />
                        <input required type="tel" value={cateringRequest.phone} onChange={e => setCateringRequest(s => ({...s, phone: e.target.value}))} placeholder="رقم التليفون" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#FAB520] font-bold text-white" />
                      </div>
                      <div>
                        <textarea required value={cateringRequest.message} onChange={e => setCateringRequest(s => ({...s, message: e.target.value}))} placeholder="مثلاً: عايز حلة محشي مشكل وصينية مكرونة بشاميل كبيرة لعزومة..." className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#FAB520] h-32 resize-none font-bold text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setCateringRequest(s => ({...s, urgency: 'urgent'}))} className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${cateringRequest.urgency === 'urgent' ? 'border-[#FAB520] bg-[#FAB520]/10 text-[#FAB520]' : 'border-white/10 bg-white/5 text-gray-500'}`}><Zap className="w-4 h-4" /> مستعجل</button>
                        <button type="button" onClick={() => setCateringRequest(s => ({...s, urgency: 'normal'}))} className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${cateringRequest.urgency === 'normal' ? 'border-[#FAB520] bg-[#FAB520]/10 text-[#FAB520]' : 'border-white/10 bg-white/5 text-gray-500'}`}><Clock className="w-4 h-4" /> طلب عادي</button>
                      </div>
                      {cateringRequest.urgency === 'normal' && (
                        <input type="datetime-local" value={cateringRequest.date} onChange={e => setCateringRequest(s => ({...s, date: e.target.value}))} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#FAB520] font-bold text-white" />
                      )}
                      <button disabled={isSubmitting} className="w-full py-5 bg-[#FAB520] text-black rounded-2xl font-['Lalezar'] text-2xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                        <span>ابعت الطلب لـ يا عم!</span>
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
              {isCartOpen && (
                <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                  <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative w-full max-w-xl bg-[#0c0c0c] rounded-[3rem] border-2 border-[#FAB520] p-6 md:p-10 shadow-2xl flex flex-col max-h-[90vh]">
                    <button onClick={() => setIsCartOpen(false)} className="absolute top-6 left-6 text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                    <div className="text-center mb-8">
                       <h2 className="text-4xl font-['Lalezar'] text-[#FAB520]">سلة أكلة يا عم</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 px-2 mb-6 scrollbar-hide">
                      {fullOrderSummary.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                           <div className="flex flex-col">
                              <span className="font-bold text-lg text-white">{item.name}</span>
                              <span className="text-xs text-[#FAB520]">{item.quantity} × {item.price} ج.م</span>
                              {item.bread && <span className="text-[10px] text-gray-500">عيش {item.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}</span>}
                           </div>
                           <span className="font-bold text-lg">{item.quantity * item.price} ج.م</span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleFinalSubmit} className="space-y-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <input required type="text" value={userInfo.name} onChange={e => setUserInfo(u => ({...u, name: e.target.value}))} placeholder="الاسم" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#FAB520] font-bold text-white text-base" />
                         <input required type="tel" value={userInfo.phone} onChange={e => setUserInfo(u => ({...u, phone: e.target.value}))} placeholder="رقم التليفون" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#FAB520] font-bold text-white text-base" />
                      </div>
                      <input required type="text" value={userInfo.address} onChange={e => setUserInfo(u => ({...u, address: e.target.value}))} placeholder="العنوان" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#FAB520] font-bold text-white text-base" />
                      <div className="flex justify-between items-center px-2 py-4">
                         <span className="text-xl font-bold text-gray-400">الإجمالي:</span>
                         <span className="text-3xl font-bold text-[#FAB520]">{globalTotal} ج.م</span>
                      </div>
                      <button disabled={isSubmitting} className="w-full py-5 bg-[#FAB520] text-black rounded-2xl font-['Lalezar'] text-2xl shadow-xl flex items-center justify-center gap-3">
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                        <span>أكد الأكلة يا عم!</span>
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Success Feedback */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[12000] bg-black flex flex-col items-center justify-center p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#FAB520] p-10 rounded-full mb-8 shadow-[0_0_100px_rgba(250,181,32,0.6)]"><HeartHandshake className="w-16 h-16 text-black" /></motion.div>
                  <h2 className="text-5xl font-['Lalezar'] text-[#FAB520] mb-4">وصلت يا عم!</h2>
                  <p className="text-xl text-gray-400 font-bold mb-2">استلمنا طلبك وبنجهزهولك 🤝🔥</p>
                  <p className="text-lg text-[#FAB520]/60 font-bold">هنتواصل معاك فوراً لتأكيد التفاصيل</p>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="py-16 text-center text-gray-700 bg-black/50 border-t border-white/5 relative z-10 mt-20">
              <img src={LOGO_URL} className="h-14 mx-auto mb-6 grayscale opacity-40" />
              <p className="font-bold text-[10px] uppercase">جميع الحقوق محفوظة لـ يا عم دوت كوم © 2025</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
