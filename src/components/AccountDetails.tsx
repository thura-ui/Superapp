import { useEffect, useState, useRef } from 'react';
import { User, LogOut, Zap, ChevronRight, X, Mail, Phone, Lock, Shield, BarChart3, ShoppingBag } from 'lucide-react';
import { getCachedProfile, getProfile, getTotalSparks, updateProfile, changePasswordApi, type AuthProfile } from '../lib/authApi'; 
import { fetchPopularProducts, type ProductItem } from '../lib/productsApi';
import SparkInfoBox from './SparkInfoBox';
import { showAlert } from '../lib/customAlert';
import { useTranslation } from 'react-i18next';

interface AccountDetailsProps {
  onLogout: () => void;
  onGoToOrders?: () => void; 
  onGoToSparkHistory?: () => void; 
}

interface SparksData {
  total_sparks: number;
  target_sparks: number;
  tier_name: string;
}

const PRODUCTS_API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
const SPARK_VALUE_MMK = 450;

export default function AccountDetails({ onLogout, onGoToOrders, onGoToSparkHistory }: AccountDetailsProps) {
  const { t, i18n } = useTranslation();

  const [userData, setUserData] = useState<AuthProfile | null>(null);
  const [sparksData, setSparksData] = useState<SparksData>({
    total_sparks: 0,
    target_sparks: 100,
    tier_name: 'User'
  });
  const [totalSpentMMK, setTotalSpentMMK] = useState<number>(0);
  const [minPackagePrice, setMinPackagePrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState(''); 
  const [editPhone, setEditPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const lastFetchRef = useRef<boolean>(false);

  useEffect(() => {
    if (lastFetchRef.current) return;
    lastFetchRef.current = true;

    const cached = getCachedProfile();
    if (cached) {
      setUserData(cached);
      setEditName(cached.name);
      setEditEmail(cached.email); 
      setEditPhone(cached.phone);
    }

    getProfile().then((p) => {
      setUserData(p);
      setEditName(p.name);
      setEditEmail(p.email); 
      setEditPhone(p.phone);
    }).catch(console.error);
    
    const authToken = localStorage.getItem('authToken');

    const fetchOrdersSpent = async () => {
      if (!authToken) return 0;
      try {
        const res = await fetch(`${PRODUCTS_API_BASE}/orders?page=1`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!res.ok) return 0;
        const data = await res.json();
        const orderList = Array.isArray(data?.data) ? data.data : [];
        
        const spent = orderList
          .filter((o: any) => o.status === 'completed')
          .reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
        return spent;
      } catch (err) {
        console.error("Failed to fetch order totals:", err);
        return 0;
      }
    };

    Promise.all([
      getTotalSparks(),
      fetchPopularProducts({ type: 'country', perPage: 100 }),
      fetchOrdersSpent()
    ])
      .then(([sparks, productsRes, spentAmount]) => {
        setSparksData(sparks);
        setTotalSpentMMK(spentAmount);

        const productsList: ProductItem[] = Array.isArray(productsRes) ? productsRes : (productsRes as any)?.data || [];
        const prices = productsList
          .map((p) => {
            if (typeof p.starting_price === 'number' && p.starting_price > 0) return p.starting_price;
            const vars = (p.variations || []).map((v) => Number(v.effective_price || v.price_mmk || v.price || NaN)).filter((n) => Number.isFinite(n) && n > 0);
            return vars.length > 0 ? Math.min(...vars) : NaN;
          })
          .filter((n) => Number.isFinite(n) && n > 0);

        if (prices.length > 0) {
          setMinPackagePrice(Math.min(...prices));
        } else {
          setMinPackagePrice(4500);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormBusy(true);
    setFormError(null);
    try {
      await updateProfile({ 
        name: editName.trim(), 
        email: editEmail.trim().toLowerCase(), 
        phone: editPhone.trim() 
      });
      const updated = await getProfile();
      setUserData(updated);
      setShowEditProfileModal(false);
      showAlert(t('profileUpdatedSuccess', 'Profile updated successfully!'));
    } catch (err: any) {
      setFormError(err.message || 'Failed to update profile');
    } finally {
      setFormBusy(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setFormError(t('passwordsDoNotMatch', 'New passwords do not match'));
      return;
    }
    setFormBusy(true);
    setFormError(null);
    try {
      await changePasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmNewPassword
      });
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showAlert(t('passwordChangedSuccess', 'Password changed successfully!'));
    } catch (err: any) {
      setFormError(err.message || 'Failed to change password');
    } finally {
      setFormBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-slate-50/30 min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const currentPoints = sparksData.total_sparks;

  const requiredPointsForMinPackage = minPackagePrice > 0 ? Math.ceil(minPackagePrice / SPARK_VALUE_MMK) : 0;
  const pointsShortage = Math.max(requiredPointsForMinPackage - currentPoints, 0);

  const displayData = {
    name: userData?.name || 'Simless User',
    email: userData?.email || 'user@email.com',
    phone: userData?.phone || '+1234567890',
  };

  const isMyanmar = i18n.language === 'my';

  const renderRedemptionStatusText = () => {
    if (currentPoints === 0) {
      return isMyanmar 
        ? 'Package ဝယ်ယူရန် SPARK Points များမရှိပါ။' 
        : 'You have no SPARK points to buy a package.';
    }
    
    if (pointsShortage > 0) {
      return isMyanmar 
        ? `Package ဝယ်ယူရန် Point ${pointsShortage.toLocaleString()} လိုအပ်ပါသည်။` 
        : `${pointsShortage.toLocaleString()} points needed to buy a package.`;
    }

    return isMyanmar 
      ? 'Package ဝယ်ယူရန် Point လုံလောက်ပါသည်။' 
      : 'You have enough points to buy a package.';
  };

  return (
    <div 
      className="pt-24 sm:pt-32 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 min-h-screen selection:bg-blue-500/10 relative font-['Poppins'] text-slate-900 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/steps-BG.jpg')" }}
    >
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* Profile Header */}
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl border-4 border-white">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Poppins']">{displayData.name}</h1>
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1 font-['Poppins']">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> {t('verifiedAccount', 'အတည်ပြုထားသော အကောင့်')}
          </span>
        </div>

        {/* Account Details Glassmorphism Main Container */}
        <div className="bg-cyan-50/60 backdrop-blur-md border border-cyan-100/80 rounded-3xl p-5 md:p-7 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-5 tracking-tight font-['Poppins']">{t('accountInfo', 'အကောင့်အချက်အလက်')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* Left Column: Point Balance, Package Status, Validity */}
            <div className="space-y-3 justify-between flex flex-col font-['Poppins']">
              
              <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-3.5 shadow-xs flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-cyan-50/80 rounded-xl flex items-center justify-center border border-cyan-100 shrink-0 shadow-xs">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-['Poppins']">{t('pointBalance', 'လက်ကျန် ပွိုင့်')}</p>
                  <p className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide font-['Poppins']">{currentPoints.toLocaleString()} Sparks</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-3.5 shadow-xs flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-emerald-50/80 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0 shadow-xs">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-['Poppins']">
                    {t('packageRedemptionStatus', 'Package Redemption Status')}
                  </p>
                  <p className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide font-['Poppins']">
                    {renderRedemptionStatusText()}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-3.5 shadow-xs flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-cyan-50/80 rounded-xl flex items-center justify-center border border-cyan-100 shrink-0 shadow-xs">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-['Poppins']">{t('pointsValidity', 'ပွိုင့်သက်တမ်း')}</p>
                  <p className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide font-['Poppins']">{t('rolling12Months', 'Within 12 Months')}</p>
                </div>
              </div>

            </div>

            {/* Right Column: Settings & History */}
            <div className="space-y-4 font-['Poppins'] flex flex-col justify-between">
              
              {/* Account Settings Inner Glass Box */}
              <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-4 shadow-xs flex-1">
                <h4 className="text-base font-bold text-slate-900 mb-3 tracking-tight font-['Poppins']">{t('accountSettings', 'အကောင့် ဆက်တင်များ')}</h4>
                
                <ul className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide space-y-2.5 font-['Poppins']">
                  <li 
                    onClick={() => { setFormError(null); setShowEditProfileModal(true); }} 
                    className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t('editProfile', 'အကောင့် ပြင်ဆင်ရန်')}</span>
                  </li>
                  <li 
                    onClick={() => { setFormError(null); setShowChangePasswordModal(true); }} 
                    className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t('changePassword', 'စကားဝှက် ပြောင်းရန်')}</span>
                  </li>
                </ul>
              </div>
              
              {/* History Logs Inner Glass Box */}
              <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-4 shadow-xs font-['Poppins'] flex-1">
                <h4 className="text-base font-bold text-slate-900 mb-3 tracking-tight flex items-center gap-2 font-['Poppins']">
                  {t('historyLogs', 'မှတ်တမ်းများ')}
                </h4>
                
                <div className="flex flex-col gap-2 font-['Poppins']">
                  <button 
                    onClick={onGoToOrders}
                    className="w-full text-left bg-white/90 backdrop-blur-md text-slate-900 border border-blue-500 hover:border-blue-600 hover:bg-blue-50/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all duration-200 cursor-pointer flex items-center justify-between group font-['Poppins'] active:scale-[0.98] p-2.5 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-600 group-hover:text-blue-600 transition-colors duration-200" />
                      <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors duration-200">{t('purchaseHistory', 'ဝယ်ယူမှု မှတ်တမ်း')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
                  </button>

                  <button
                    onClick={onGoToSparkHistory}
                    className="w-full text-left bg-white/90 backdrop-blur-md text-slate-900 border border-blue-500 hover:border-blue-600 hover:bg-blue-50/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all duration-200 cursor-pointer flex items-center justify-between group font-['Poppins'] active:scale-[0.98] p-2.5 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600 group-hover:text-blue-600 transition-colors duration-200" />
                      <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors duration-200">{t('sparkHistory', 'Sparks ရရှိမှု မှတ်တမ်း')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 🌟 What is Spark Information Box 🌟 */}
        <SparkInfoBox />

        {/* Logout Button */}
        <div className="text-center pt-4">
          <button onClick={onLogout} className="inline-flex items-center gap-2 px-8 py-3 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 rounded-2xl text-rose-600 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer font-['Poppins']">
            <LogOut className="w-4 h-4" /> {t('logoutAccount', 'အကောင့်ထွက်မည်')}
          </button>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-['Poppins']">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 md:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-['Poppins']">{t('editProfile', 'အကောင့် ပြင်ဆင်ရန်')}</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-1 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer text-slate-400"><X size={18} /></button>
            </div>
            {formError && <div className="p-3 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 text-center uppercase tracking-wide font-['Poppins']">{formError}</div>}
            
            <form onSubmit={handleEditProfileSubmit} className="space-y-4 font-['Poppins']">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-['Poppins']">{t('fullName', 'အမည်')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors font-['Poppins']" required />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-['Poppins']">{t('emailAddress', 'အီးမေးလ် လိပ်စာ')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors font-['Poppins']" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-['Poppins']">{t('phoneNumber', 'ဖုန်းနံပါတ်')}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors font-['Poppins']" required />
                </div>
              </div>

              <button type="submit" disabled={formBusy} className="w-full py-3.5 mt-2 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 border-none cursor-pointer shadow-md hover:bg-blue-700 font-['Poppins']">
                {formBusy ? t('updating', 'ပြင်ဆင်နေသည်...') : t('saveChanges', 'သိမ်းဆည်းမည်')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-['Poppins']">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 md:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-['Poppins']">{t('changePassword', 'စကားဝှက် ပြောင်းရန်')}</h3>
              <button onClick={() => setShowChangePasswordModal(false)} className="p-1 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer text-slate-400"><X size={18} /></button>
            </div>
            {formError && <div className="p-3 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 text-center uppercase tracking-wide font-['Poppins']">{formError}</div>}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4 font-['Poppins']">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-['Poppins']">{t('currentPassword', 'လက်ရှိ စကားဝှက်')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors font-['Poppins']" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-['Poppins']">{t('newPassword', 'စကားဝှက် အသစ်')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors font-['Poppins']" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-['Poppins']">{t('confirmNewPassword', 'စကားဝှက် အသစ် အတည်ပြုရန်')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="password" placeholder="••••••••" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors font-['Poppins']" required />
                </div>
              </div>
              <button type="submit" disabled={formBusy} className="w-full py-3.5 mt-2 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 border-none cursor-pointer shadow-md hover:bg-blue-700 font-['Poppins']">
                {formBusy ? t('processing', 'လုပ်ဆောင်နေသည်...') : t('updatePassword', 'စကားဝှက် ပြောင်းမည်')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}