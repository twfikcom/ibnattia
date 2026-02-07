import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import SpecialModal from './components/SpecialModals';
import { LOGO_URL, SANDWICH_ITEMS, TRAY_ITEMS, SWEET_ITEMS } from './constants';
import { SpecialOrderState } from './types';
// Added Facebook to the lucide-react import list
import { Utensils, IceCream, Sandwich, ShoppingBasket, X, Trash2, Send, Plus, Minus, Truck, Loader2, Star, Sparkles, MapPin, Phone, User, AlertCircle, MessageSquare, ChefHat, HeartHandshake, Clock, Zap, Facebook } from 'lucide-react';

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
        const next = prev + (Math.random() * 8);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 1200);
          return 100;
        }
        return next;
      });
    }, 180);
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
          setSandwichState({ quantities: Object.fromEntries(SANDWICH_ITEMS.map(i => [i.name, 0])), sauceQuantity: 0, breadChoices: {} });
          setTrayState({ quantities: Object.fromEntries(TRAY_ITEMS.map(i => [i.name, 0])), sauceQuantity: 0 });
          setSweetState({ quantities: Object.fromEntries(SWEET_ITEMS.map(i => [i.name, 0])), sauceQuantity: 0 });
          setUserInfo({ name: '', phone: '', address: '', notes: '' });
          setIsSubmitting(false);
        }, 3000);
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
        }, 3000);
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
          <motion.div key="loader" exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
            <motion.div className="relative flex flex-col items-center">
                <motion.img animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} src={LOGO_URL} alt="Loading" className="h-40 md:h-56 object-contain" />
                <div className="mt-12 flex flex-col items-center w-full px-10">
                    <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/10">
                        <motion.div className="h-full bg-[#FAB520] shadow-[0_0_20px_#FAB520]" style={{ width: `${loadProgress}%` }} />
                    </div>
                    <AnimatePresence>
                      {loadProgress > 25 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[#FAB520] font-black text-3xl md:text-5xl font-['Lalezar'] drop-shadow-[0_0_20px_rgba(250,181,32,0.8)]">
                          {loaderText}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
            {/* Background Decorative Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] bg-[#FAB520] rounded-full blur-[150px]" />
              <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] bg-[#FAB520] rounded-full blur-[180px]" />
            </div>

            <main className="max-w-7xl mx-auto px-4 pt-4 relative z-10 pb-40">
              <Hero />
              
              <section id="ordering-section" className="mt-16">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="text-center mb-16">
                  <h2 className="text-4xl md:text-6xl font-normal text-[#FAB520] font-['Lalezar'] drop-shadow-[0_5px_15px_rgba(250,181,32,0.4)]">عايز تاكل إيه يا عم؟ 🤤</h2>
                  <p className="text-gray-400 mt-4 text-xl font-bold">كل الأكل اللي تحبه في مكان واحد!</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { id: 'sandwiches', title: 'ركن السندوتشات', icon: Sandwich, color: 'from-[#FAB520] to-[#E6A610]', text: 'text-black' },
                    { id: 'trays', title: 'صواني وطواجن', icon: Utensils, color: 'from-zinc-900 to-black border-2 border-[#FAB520]', text: 'text-[#FAB520]' },
                    { id: 'sweets', title: 'حلويات يا عم', icon: IceCream, color: 'from-zinc-800 to-zinc-900 border border-white/10', text: 'text-white' }
                  ].map((cat, i) => (
                    <motion.div 
                      key={cat.id} 
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.15 }} 
                      whileHover={{ scale: 1.05, y: -10 }} 
                      onClick={() => setActiveModal(cat.id as any)} 
                      className={`cursor-pointer bg-gradient-to-br ${cat.color} p-8 md:p-10 rounded-[3.5rem] flex flex-col items-center text-center gap-6 group relative shadow-2xl overflow-hidden`}
                    >
                      <cat.icon className={`w-20 h-20 md:w-24 md:h-24 ${cat.text} transition-transform group-hover:rotate-12`} />
                      <h3 className={`text-3xl md:text-4xl font-normal font-['Lalezar'] ${cat.text}`}>{cat.title}</h3>
                      <div className={`${cat.id === 'sandwiches' ? 'bg-black text-[#FAB520]' : 'bg-[#FAB520] text-black'} px-8 py-3 rounded-2xl font-black text-lg transition-all group-hover:px-12`}>افتح المنيو</div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Enhanced Order Summary Block */}
              <AnimatePresence>
                {globalTotal > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 40 }} 
                    className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl border border-[#FAB520]/30 rounded-[3rem] p-10 mt-20 mb-10 shadow-[0_20px_60px_rgba(250,181,32,0.15)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <ShoppingBasket className="w-32 h-32 text-[#FAB520]" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 relative z-10">
                      <div className="text-center md:text-right">
                        <h3 className="text-4xl font-['Lalezar'] text-[#FAB520] mb-2">حساب أكلة يا عم</h3>
                        <p className="text-gray-400 font-bold">توصيل صاروخي لباب البيت 🚀</p>
                      </div>
                      <div className="text-center md:text-left bg-black/40 px-8 py-4 rounded-[2rem] border border-white/5">
                         <span className="block text-gray-500 text-sm font-black mb-1">الإجمالي شامل التوصيل ({DELIVERY_FEE} ج.م)</span>
                         <span className="text-5xl font-black text-[#FAB520] tracking-tighter">{globalTotal} ج.م</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(true)} 
                      className="w-full py-6 bg-[#FAB520] text-black font-black text-3xl rounded-[2rem] shadow-[0_15px_40px_rgba(250,181,32,0.5)] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all font-['Lalezar']"
                    >
                      <ShoppingBasket className="w-10 h-10" />
                      <span>أكد أكلتك مع يا عم!</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Special Catering Section */}
              <section className="mt-24">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  className="bg-gradient-to-br from-[#FAB520] to-[#E6A610] p-12 md:p-20 rounded-[4.5rem] text-black text-center shadow-[0_30px_80px_rgba(250,181,32,0.4)] relative overflow-hidden group"
                >
                  <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -top-20 -right-20 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src={LOGO_URL} className="w-96 h-96 object-contain" />
                  </motion.div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-black/10 p-5 rounded-full mb-8">
                      <ChefHat className="w-20 h-20 text-black" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-normal font-['Lalezar'] mb-6">عايز عزومة؟ أو أكلة مخصوص؟</h2>
                    <p className="text-2xl md:text-3xl font-black mb-12 max-w-3xl opacity-80 leading-relaxed">يا عم بيعملك أي أكلة بيتي تخطر على بالك! قولي إيه في نفسك واحنا علينا التنفيذ والتوصيل لحد بابك.</p>
                    <button 
                      onClick={() => setIsCateringOpen(true)} 
                      className="bg-black text-[#FAB520] px-16 py-6 rounded-3xl font-['Lalezar'] text-3xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all"
                    >
                        اطلب طلب خاص يا عم!
                    </button>
                  </div>
                </motion.div>
              </section>
            </main>

            {/* Special Catering Modal */}
            <AnimatePresence>
              {isCateringOpen && (
                <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCateringOpen(false)} className="fixed inset-0 bg-black/98 backdrop-blur-2xl" />
                  <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-2xl bg-[#0c0c0c] rounded-[3.5rem] border-2 border-[#FAB520] p-8 md:p-14 shadow-[0_0_100px_rgba(250,181,32,0.3)] z-[12001] my-10">
                    <button onClick={() => setIsCateringOpen(false)} className="absolute top-8 left-8 text-white/40 hover:text-[#FAB520] p-3 transition-colors bg-white/5 rounded-full"><X className="w-8 h-8" /></button>
                    <div className="text-center mb-10">
                      <img src={LOGO_URL} className="h-24 mx-auto mb-6" alt="لوجو يا عم" />
                      <h2 className="text-4xl md:text-5xl font-['Lalezar'] text-[#FAB520]">طلبات خاصة وعزومات</h2>
                      <p className="text-gray-400 font-bold mt-4 text-lg">اكتب اللي في نفسك وهنتواصل معاك فوراً!</p>
                    </div>
                    <form onSubmit={handleCateringSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-gray-500 mr-2">اسمك يا عم</label>
                          <input required value={cateringRequest.name} onChange={e => setCateringRequest(s => ({...s, name: e.target.value}))} placeholder="الاسم الكريم" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-bold text-white transition-all text-lg" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-gray-500 mr-2">رقم تليفونك</label>
                          <input required type="tel" value={cateringRequest.phone} onChange={e => setCateringRequest(s => ({...s, phone: e.target.value}))} placeholder="01XXXXXXXXX" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-bold text-white transition-all text-lg" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-500 mr-2">تفاصيل العزومة أو الأكلة</label>
                        <textarea required value={cateringRequest.message} onChange={e => setCateringRequest(s => ({...s, message: e.target.value}))} placeholder="مثلاً: عايز حلة محشي مشكل وصينية مكرونة بشاميل كبيرة لعزومة 10 أفراد يوم الجمعة..." className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none focus:border-[#FAB520] h-40 resize-none font-bold text-white transition-all text-lg" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setCateringRequest(s => ({...s, urgency: 'urgent'}))} className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-lg transition-all ${cateringRequest.urgency === 'urgent' ? 'border-[#FAB520] bg-[#FAB520]/10 text-[#FAB520] shadow-[0_0_15px_rgba(250,181,32,0.2)]' : 'border-white/10 bg-white/5 text-gray-500'}`}><Zap className="w-6 h-6" /> مستعجل</button>
                        <button type="button" onClick={() => setCateringRequest(s => ({...s, urgency: 'normal'}))} className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-lg transition-all ${cateringRequest.urgency === 'normal' ? 'border-[#FAB520] bg-[#FAB520]/10 text-[#FAB520] shadow-[0_0_15px_rgba(250,181,32,0.2)]' : 'border-white/10 bg-white/5 text-gray-500'}`}><Clock className="w-6 h-6" /> طلب عادي</button>
                      </div>
                      {cateringRequest.urgency === 'normal' && (
                        <div className="space-y-2">
                          <label className="text-sm font-black text-gray-500 mr-2">موعد الحجز</label>
                          <input type="datetime-local" value={cateringRequest.date} onChange={e => setCateringRequest(s => ({...s, date: e.target.value}))} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-bold text-white transition-all text-lg" />
                        </div>
                      )}
                      <button disabled={isSubmitting} className="w-full py-6 bg-[#FAB520] text-black rounded-3xl font-['Lalezar'] text-3xl shadow-xl flex items-center justify-center gap-4 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all">
                        {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
                        <span>ابعت الطلب لـ يا عم!</span>
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Final Cart Drawer */}
            <AnimatePresence>
              {isCartOpen && (
                <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                  <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0c0c0c] rounded-[4rem] border-2 border-[#FAB520] p-8 md:p-12 shadow-[0_0_120px_rgba(250,181,32,0.4)] flex flex-col max-h-[95vh]">
                    <button onClick={() => setIsCartOpen(false)} className="absolute top-10 left-10 text-white/40 hover:text-[#FAB520] p-3 transition-colors bg-white/5 rounded-full"><X className="w-8 h-8" /></button>
                    <div className="text-center mb-10 pt-4">
                       <h2 className="text-5xl font-['Lalezar'] text-[#FAB520]">سلة أكلة يا عم</h2>
                       <p className="text-gray-500 font-bold mt-2">راجع طلبك قبل ما نتحرك بالصاروخ!</p>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 px-4 mb-8 scrollbar-hide">
                      {fullOrderSummary.map((item, idx) => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={idx} className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-[#FAB520]/40 transition-colors">
                           <div className="flex flex-col">
                              <span className="font-black text-xl text-white">{item.name}</span>
                              <span className="text-sm text-[#FAB520] font-bold">{item.quantity} × {item.price} ج.م</span>
                              {item.bread && <span className="text-sm text-gray-500 mt-1 font-bold">عيش {item.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}</span>}
                           </div>
                           <div className="flex items-center gap-6">
                              <span className="font-black text-2xl text-white">{item.quantity * item.price} ج.م</span>
                              <button onClick={() => removeGlobalItem(item.name, item.category)} className="p-3 text-red-500/40 hover:text-red-500 bg-red-500/5 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
                           </div>
                        </motion.div>
                      ))}
                      <div className="flex justify-between items-center p-6 bg-[#FAB520]/5 rounded-3xl border border-[#FAB520]/10">
                         <span className="font-black text-gray-400 text-lg">خدمة التوصيل السريع 🛵</span>
                         <span className="font-black text-[#FAB520] text-xl">{DELIVERY_FEE} ج.م</span>
                      </div>
                    </div>
                    <form onSubmit={handleFinalSubmit} className="space-y-4 pt-6 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input required type="text" value={userInfo.name} onChange={e => setUserInfo(u => ({...u, name: e.target.value}))} placeholder="اسمك الكريم" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-black text-white text-lg transition-all" />
                         <input required type="tel" value={userInfo.phone} onChange={e => setUserInfo(u => ({...u, phone: e.target.value}))} placeholder="رقم الموبايل" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-black text-white text-lg transition-all" />
                      </div>
                      <input required type="text" value={userInfo.address} onChange={e => setUserInfo(u => ({...u, address: e.target.value}))} placeholder="عنوانك بالتفصيل (عشان نجيلك في ثانية)" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-black text-white text-lg transition-all" />
                      <div className="flex justify-between items-center px-4 py-6 bg-black/40 rounded-3xl mt-2 border border-white/5">
                         <span className="text-2xl font-black text-gray-400">الإجمالي النهائي:</span>
                         <span className="text-4xl font-black text-[#FAB520] drop-shadow-[0_0_10px_#FAB520]">{globalTotal} ج.م</span>
                      </div>
                      <button disabled={isSubmitting} className="w-full py-6 bg-[#FAB520] text-black rounded-[2rem] font-['Lalezar'] text-4xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="w-10 h-10 animate-spin" /> : <Send className="w-10 h-10" />}
                        <span>أكد الأكلة يا عم!</span>
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Order Ticker (Live Orders View Outside Cart) */}
            <AnimatePresence>
              {totalItemCount > 0 && !isCartOpen && (
                <motion.div 
                  initial={{ y: 100 }} 
                  animate={{ y: 0 }} 
                  exit={{ y: 100 }} 
                  className="fixed bottom-0 left-0 right-0 z-[14000] p-4 pointer-events-none"
                >
                  <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="bg-[#FAB520] text-black px-8 py-5 rounded-[2.5rem] shadow-[0_-10px_40px_rgba(250,181,32,0.4)] flex items-center justify-between border-4 border-black">
                       <div className="flex items-center gap-6 overflow-hidden">
                          <div className="bg-black/10 p-3 rounded-2xl animate-bounce">
                             <ShoppingBasket className="w-8 h-8" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-black text-2xl leading-tight">طلبك حالياً:</span>
                             <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {fullOrderSummary.slice(0, 3).map((item, i) => (
                                  <span key={i} className="text-sm font-black bg-black/5 px-3 py-1 rounded-full whitespace-nowrap">
                                    {item.name} ({item.quantity})
                                  </span>
                                ))}
                                {fullOrderSummary.length > 3 && <span className="text-sm font-black">+ {fullOrderSummary.length - 3} أصناف تانية</span>}
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-left">
                             <span className="block text-[10px] font-black opacity-60">إجمالي الحساب</span>
                             <span className="text-3xl font-black tracking-tighter">{globalTotal} ج.م</span>
                          </div>
                          <button onClick={() => setIsCartOpen(true)} className="bg-black text-[#FAB520] p-4 rounded-2xl hover:scale-105 active:scale-90 transition-all shadow-xl">
                             <Send className="w-7 h-7" />
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Cart Button - Ensuring it's always on top */}
            <div className="fixed bottom-10 right-10 z-[16000]">
              <motion.button 
                initial={{ scale: 0 }}
                animate={{ scale: totalItemCount > 0 ? 1 : 0 }}
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setIsCartOpen(true)} 
                className="bg-[#FAB520] text-black p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(250,181,32,0.6)] flex items-center gap-4 border-4 border-black relative group"
              >
                <div className="relative">
                  <ShoppingBasket className="w-10 h-10 md:w-12 md:h-12" />
                  <AnimatePresence>
                    {totalItemCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="absolute -top-6 -right-6 bg-red-600 text-white text-sm w-9 h-9 rounded-full flex items-center justify-center border-4 border-black font-black shadow-lg"
                      >
                        {totalItemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-2xl font-black hidden sm:inline font-['Lalezar']">سلة يا عم</span>
                <motion.div animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-[2.5rem] border-4 border-white/40 pointer-events-none" />
              </motion.button>
            </div>

            <SpecialModal isOpen={activeModal === 'sandwiches'} onClose={() => setActiveModal(null)} title="ركن السندوتشات" image="https://sayedsamkary.com/unnamed.jpg" type="sandwiches" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sandwichState} onUpdateState={(ns) => setSandwichState(ns)} onFinalSubmit={() => setIsCartOpen(true)} initialItems={SANDWICH_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} />
            <SpecialModal isOpen={activeModal === 'trays'} onClose={() => setActiveModal(null)} title="صواني وطواجن" image="https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D9%83%D9%88%D8%B3%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%84.jpg" type="trays" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={trayState} onUpdateState={(ns) => setTrayState(ns)} onFinalSubmit={() => setIsCartOpen(true)} initialItems={TRAY_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} />
            <SpecialModal isOpen={activeModal === 'sweets'} onClose={() => setActiveModal(null)} title="حلويات يا عم" image="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80" type="sweets" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sweetState} onUpdateState={(ns) => setSweetState(ns)} onFinalSubmit={() => setIsCartOpen(true)} initialItems={SWEET_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} />

            {/* Success Feedback Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[20000] bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-3xl">
                  <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="bg-[#FAB520] p-16 rounded-[4rem] mb-12 shadow-[0_0_150px_rgba(250,181,32,0.6)]">
                    <HeartHandshake className="w-32 h-32 text-black" />
                  </motion.div>
                  <h2 className="text-6xl md:text-8xl font-normal font-['Lalezar'] text-[#FAB520] mb-6 drop-shadow-[0_0_30px_rgba(250,181,32,0.5)]">وصلت يا عم!</h2>
                  <p className="text-3xl text-white font-black mb-4">استلمنا طلبك وبنجهزهولك بكل حب 🤝🔥</p>
                  <p className="text-2xl text-gray-500 font-bold">فريق "يا عم" هيكلمك فوراً لتأكيد التفاصيل</p>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="py-24 text-center text-gray-600 bg-black/50 border-t border-white/5 relative z-10 mt-32">
              <div className="flex flex-col items-center gap-8">
                  <img src={LOGO_URL} className="h-24 mx-auto mb-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" alt="Footer Logo" />
                  <div className="flex gap-10">
                     <a href="https://wa.me/201010373331" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#25D366] transition-colors flex flex-col items-center gap-2">
                        <div className="bg-white/5 p-4 rounded-3xl"><Phone className="w-8 h-8" /></div>
                        <span className="font-black text-sm">واتساب</span>
                     </a>
                     <a href="https://www.facebook.com/Ya3mCom" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors flex flex-col items-center gap-2">
                        <div className="bg-white/5 p-4 rounded-3xl"><Facebook className="w-8 h-8" /></div>
                        <span className="font-black text-sm">فيسبوك</span>
                     </a>
                  </div>
                  <div className="max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
                  <p className="font-black text-xs tracking-widest uppercase opacity-30">جميع الحقوق محفوظة لـ يا عم دوت كوم © 2025</p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;