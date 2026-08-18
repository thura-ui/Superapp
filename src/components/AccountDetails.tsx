import { useEffect, useState, useRef } from 'react';
import { User, LogOut, Zap, ChevronRight, X, Mail, Phone, Lock, Shield, Globe, BarChart3 } from 'lucide-react';
import { getCachedProfile, getProfile, getTotalSparks, updateProfile, changePasswordApi, type AuthProfile } from '../lib/authApi'; 
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

export default function AccountDetails({ onLogout, onGoToOrders, onGoToSparkHistory }: AccountDetailsProps) {
  const { t, i18n } = useTranslation();

  const [userData, setUserData] = useState<AuthProfile | null>(null);
  const [sparksData, setSparksData] = useState<SparksData>({
    total_sparks: 0,
    target_sparks: 100,
    tier_name: 'Member'
  });
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
    
    getTotalSparks()
      .then(setSparksData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    localStorage.setItem('language', newLang);
  };

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
      showAlert('Profile updated successfully!');
    } catch (err: any) {
      setFormError(err.message || 'Failed to update profile');
    } finally {
      setFormBusy(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setFormError('New passwords do not match');
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
      showAlert('Password changed successfully!');
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
  const targetPoints = sparksData.target_sparks; 
  const progressPercentage = Math.min((currentPoints / targetPoints) * 100, 100);
  const pointsToNextTier = Math.max(targetPoints - currentPoints, 0);

  const displayData = {
    name: userData?.name || 'Simless User',
    email: userData?.email || 'user@gmail.com',
    phone: userData?.phone || '+1234567890',
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/30 min-h-screen selection:bg-blue-500/10 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl border-4 border-white">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{displayData.name}</h1>
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> {t('verifiedAccount')}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.02)]">
          <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">{t('accountInfo')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="flex flex-col items-center text-center justify-center lg:border-r lg:border-slate-100 lg:pr-6">
              {/* 🌟 97 ကို font-semibold ပြောင်းထားပါသည် */}
              <div className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight mb-1">{currentPoints.toLocaleString()}</div>
              
              {/* 🌟 Top Nav ၏ font-semibold text-xs lg:text-[13px] tracking-wide အတိုင်း ပြင်ထားပါသည် */}
              <p className="text-blue-600 font-semibold text-xs lg:text-[13px] tracking-wide uppercase">{t('loyaltyPoints')}</p>
              <p className="text-slate-500 font-semibold text-xs lg:text-[13px] tracking-wide mt-1.5">{t('tierLevel')} {sparksData.tier_name}</p>
              
              <div className="mt-4 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${progressPercentage}%` }} 
                />
              </div>
              <p className="text-slate-400 font-semibold text-xs lg:text-[13px] tracking-wide uppercase mt-2">
                {t('nextTierUpgrade')} {pointsToNextTier.toLocaleString()} / {t('target')} {targetPoints.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4 justify-center flex flex-col">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/60 shrink-0">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{t('pointBalance')}</p>
                  {/* 🌟 Top Nav ၏ font-semibold text-xs lg:text-[13px] tracking-wide အတိုင်း ပြင်ထားပါသည် */}
                  <p className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide">{currentPoints.toLocaleString()} Sparks</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/60 shrink-0">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{t('lastActivityEarned')}</p>
                  {/* 🌟 Top Nav ၏ font-semibold text-xs lg:text-[13px] tracking-wide အတိုင်း ပြင်ထားပါသည် */}
                  <p className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide">{t('sparkValue')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/60 shrink-0">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{t('pointsValidity')}</p>
                  {/* 🌟 Top Nav ၏ font-semibold text-xs lg:text-[13px] tracking-wide အတိုင်း ပြင်ထားပါသည် */}
                  <p className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide">{t('rolling12Months')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5">
                <h4 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">{t('accountSettings')}</h4>
                
                {/* 🌟 Top Nav ၏ font-semibold text-xs lg:text-[13px] tracking-wide အတိုင်း ပြင်ထားပါသည် */}
                <ul className="text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide space-y-4">
                  <li onClick={() => { setFormError(null); setShowEditProfileModal(true); }} className="cursor-pointer hover:text-blue-600 transition-colors">{t('editProfile')}</li>
                  <li onClick={() => { setFormError(null); setShowChangePasswordModal(true); }} className="cursor-pointer hover:text-blue-600 transition-colors">{t('changePassword')}</li>
                  
                  <li className="flex items-center justify-between">
                    <span>{t('language')}</span>
                    <select 
                      value={i18n.language}
                      onChange={handleLanguageChange}
                      className="bg-blue-50 border border-blue-100 text-blue-600 rounded-lg px-2 sm:px-3 py-1 font-semibold text-xs lg:text-[13px] tracking-wide outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/30 hover:bg-blue-100 transition-colors"
                    >
                      <option value="en">English (US)</option>
                      <option value="my">မြန်မာ</option>
                    </select>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5">
                <h4 className="text-lg font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                  {t('historyLogs')}
                </h4>
                
                <div className="flex flex-col gap-3">
                  {/* 🌟 Top Nav ၏ font-semibold text-xs lg:text-[13px] tracking-wide အတိုင်း ပြင်ထားပါသည် */}
                  <button 
                    onClick={onGoToOrders}
                    className="w-full text-left bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl px-4 py-3.5 text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide transition-all cursor-pointer shadow-sm flex items-center justify-between group"
                  >
                    <span>{t('purchaseHistory')}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={onGoToSparkHistory}
                    className="w-full text-left bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl px-4 py-3.5 text-slate-900 font-semibold text-xs lg:text-[13px] tracking-wide transition-all cursor-pointer shadow-sm flex items-center justify-between group"
                  >
                    <span>{t('sparkHistory')}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="text-center pt-4">
          <button onClick={onLogout} className="inline-flex items-center gap-2 px-8 py-3 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 rounded-2xl text-rose-600 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer">
            <LogOut className="w-4 h-4" /> {t('logoutAccount')}
          </button>
        </div>

      </div>

      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 md:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{t('editProfile')}</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-1 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer text-slate-400"><X size={18} /></button>
            </div>
            {formError && <div className="p-3 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 text-center uppercase tracking-wide">{formError}</div>}
            
            <form onSubmit={handleEditProfileSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('fullName')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors" required />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('gmailAddress')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('phoneNumber')}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors" required />
                </div>
              </div>

              <button type="submit" disabled={formBusy} className="w-full py-3.5 mt-2 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 border-none cursor-pointer shadow-md hover:bg-blue-700">
                {formBusy ? t('updating') : t('saveChanges')}
              </button>
            </form>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 md:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{t('changePassword')}</h3>
              <button onClick={() => setShowChangePasswordModal(false)} className="p-1 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer text-slate-400"><X size={18} /></button>
            </div>
            {formError && <div className="p-3 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 text-center uppercase tracking-wide">{formError}</div>}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('currentPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('newPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('confirmNewPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input type="password" placeholder="••••••••" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors" required />
                </div>
              </div>
              <button type="submit" disabled={formBusy} className="w-full py-3.5 mt-2 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 border-none cursor-pointer shadow-md hover:bg-blue-700">
                {formBusy ? t('processing') : t('updatePassword')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}