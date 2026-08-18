import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  Wifi, 
  Zap,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🌟 i18next ကို import လုပ်ထားပါသည်

interface OrderDetailProps {
  orderNumber?: string;
  onBack?: () => void;
  onHelp?: () => void;
}

interface ESimMetadata {
  apn: string;
  pin: string;
  puk: string;
  uid: string;
  iccid: string;
  msisdn: string | null;
  validTime: string;
  subOrderId: string;
  qrCodeContent: string;
  rechargeableESIM: number;
  channelSubOrderId: string;
}

interface ESim {
  esim_iccid: string;
  esim_activation_code: string;
  esim_qr_code_url: string | null;
  esim_smdp_address: string;
  esim_auth_code: string;
  esim_reference_id: string;
  esim_activated_at: string;
  esim_metadata: ESimMetadata;
  index: number;
}

interface ProductVariation {
  id: number;
  sku: string;
  product_code: string;
  price: number;
  effective_price: number;
  days: number;
  data_plan: string;
  plan_type: string;
  description: string;
  stock_status: string;
  is_active: boolean;
  combination_label: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_variation_id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_total: number;
  total: number;
  product_variation: ProductVariation;
  esims: ESim[];
}

interface OrderData {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  placed_at: string;
  sparks_used: number;
  currency: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  payment_method_title: string;
  customer_email: string;
  order_note: string | null;
  completed_at: string;
  items: OrderItem[];
  has_esim: boolean;
}

export default function OrderDetail({ 
  orderNumber = "SML-ORD-20260715-0008", 
  onBack, 
  onHelp 
}: OrderDetailProps) {
  // 🌟 Translation hook ကို ခေါ်ယူထားပါသည်
  const { t } = useTranslation();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch(
          `https://admin-sml.simless-mm.com/api/v1/orders/${orderNumber}`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load order details (Status: ${response.status})`);
        }

        const json = await response.json();
        setOrder(json.order || json.data || json);
      } catch (err: any) {
        console.error('Order Detail Fetch Error:', err);
        setError(err.message || 'Unable to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderNumber]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 relative selection:bg-blue-500/10 font-['Retro_Floral',sans-serif]">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[10%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black hover:bg-slate-50 transition-all shadow-sm cursor-pointer font-['Retro_Floral']"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>{t('backToOrders')}</span>
          </button>

          <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest font-['Retro_Floral']">
            {t('orderDetail')}
          </span>
        </div>

        {loading && (
          <div className="bg-white rounded-[32px] p-12 sm:p-20 border border-slate-100 shadow-sm flex flex-col items-center justify-center font-['Retro_Floral']">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">{t('fetchingOrderInfo')}</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-[30px] p-10 border border-rose-100 shadow-sm text-center max-w-md mx-auto font-['Retro_Floral']">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">{t('errorLoadingOrder')}</h3>
            <p className="text-xs text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-blue-700 transition-all cursor-pointer font-['Retro_Floral']"
            >
              {t('tryAgain')}
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_12px_30px_rgba(15,23,42,0.03)] space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 font-mono tracking-tight whitespace-nowrap shrink-0">
                      {order.order_number}
                    </h1>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 font-['Retro_Floral'] ${
                      order.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {t(`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, order.status)} 
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium font-['Retro_Floral']">
                    {t('placedOn')} <span className="text-slate-600 font-bold">{formatDate(order.placed_at)}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 font-['Retro_Floral']">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('totalValuation')}</span>
                  <span className="text-xl font-black text-blue-600 whitespace-nowrap">
                    {order.total > 0 ? `${order.total.toLocaleString()} ${order.currency}` : `0 ${order.currency}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100/80 text-xs font-['Retro_Floral']">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('paymentMethod')}</p>
                  <p className="font-extrabold text-slate-800 uppercase mt-0.5 flex items-center gap-1">
                    {order.payment_method === 'sparks' && <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    {order.payment_method_title}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('paymentStatus')}</p>
                  <p className="font-extrabold text-emerald-600 uppercase mt-0.5">{order.payment_status}</p>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('sparksUsed')}</p>
                  <p className="font-extrabold text-amber-600 mt-0.5">{order.sparks_used} Sparks</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('customerEmail')}</p>
                  <p className="font-bold text-slate-700 mt-0.5 break-all">{order.customer_email}</p>
                </div>
              </div>

            </div>

            {order.items.map((item) => (
              <div key={item.id} className="space-y-6">
                
                <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_12px_30px_rgba(15,23,42,0.03)] font-['Retro_Floral']">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                    <div className="flex items-center gap-3.5">
                      <img 
                        src="/esim-icon_1.webp"
                        alt="eSIM Icon" 
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
                      />
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">{item.name} {t('esimPlan')}</h2>
                        <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                          {item.product_variation.combination_label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-4 h-4 text-blue-600" />
                        <span>{t('data')} <strong>{item.product_variation.data_plan}</strong></span>
                      </div>
                      <div className="w-px h-4 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{t('validity')} <strong>{item.product_variation.days} {t('days')}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <p className="font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">{t('coverageAndDetails')}</p>
                    <div 
                      className="prose prose-xs max-w-none space-y-1 font-['Retro_Floral']"
                      dangerouslySetInnerHTML={{ __html: item.product_variation.description }} 
                    />
                  </div>
                </div>

                {item.esims.map((esim, idx) => {
                  return (
                    <div key={idx} className="bg-white border border-blue-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_16px_35px_rgba(37,99,235,0.05)] space-y-6 font-['Retro_Floral']">
                      
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-blue-600" />
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                            {t('esimActivationProfile', { number: idx + 1 })}
                          </h3>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {t('readyToInstall')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        
                        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 border border-slate-200/70 p-6 rounded-2xl text-center">
                          <div className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-100 mb-3">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(esim.esim_activation_code)}`} 
                              alt="eSIM QR Code"
                              className="w-40 h-40 object-contain" 
                            />
                          </div>
                          <p className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-blue-600" />
                            {t('scanQrCode')}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {t('scanQrCodeDesc')}
                          </p>
                        </div>

                        <div className="lg:col-span-7 space-y-3.5">
                          
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('esimIccid')}</p>
                              <p className="text-xs font-black text-slate-800 font-mono truncate">{esim.esim_iccid}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(esim.esim_iccid, 'iccid')}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer font-['Retro_Floral']"
                            >
                              {copiedField === 'iccid' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedField === 'iccid' ? t('copied') : t('copy')}</span>
                            </button>
                          </div>

                          <div className="flex flex-col gap-2 pt-1 text-[11px]">
                            <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{t('apnSetting')}</span>
                              <p className="font-extrabold text-blue-700">{esim.esim_metadata.apn}</p>
                            </div>
                            <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{t('pinPuk')}</span>
                              <p className="font-extrabold text-blue-700">{esim.esim_metadata.pin} / {esim.esim_metadata.puk}</p>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            ))}

            <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_12px_30px_rgba(15,23,42,0.03)] space-y-4 font-['Retro_Floral']">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
                {t('billingBreakdown')}
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{t('subtotal')}</span>
                  <span className="font-bold text-slate-800">{order.subtotal.toLocaleString()} {order.currency}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{t('discountTotal')}</span>
                  <span className="font-bold text-emerald-600">-{order.discount_total.toLocaleString()} {order.currency}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{t('tax')}</span>
                  <span className="font-bold text-slate-800">{order.tax_total} {order.currency}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-black text-slate-900">
                  <span>{t('finalAmountPaid')}</span>
                  <span className="text-blue-600">{order.total > 0 ? `${order.total.toLocaleString()} ${order.currency}` : `0 ${order.currency}`}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[28px] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg font-['Retro_Floral']">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black">{t('needHelpInstalling')}</h4>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{t('needHelpInstallingDesc')}</p>
                </div>
              </div>

              <button
                onClick={onHelp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-blue-900 font-black text-xs uppercase tracking-wider hover:bg-blue-50 transition-all cursor-pointer shrink-0 font-['Retro_Floral']"
              >
                {t('getSupport')}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}