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
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { fetchOrderDetailApi } from '../lib/ordersApi';

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
  product_variation?: ProductVariation | null;
  esims?: ESim[];
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
  orderNumber, 
  onBack, 
  onHelp 
}: OrderDetailProps) {
  const { t } = useTranslation();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderNumber) {
        setLoading(false);
        setError('Order number is required.');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchOrderDetailApi(orderNumber);
        setOrder(data);
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
      const safeDateString = dateString.replace(' ', 'T');
      return new Date(safeDateString).toLocaleString('en-US', {
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

  // 🔴 Description စာသားများ ပျက်မနေစေဘဲ စာကြောင်းအသစ် လှပစွာ ခုန်ပေးမည့် Helper Function
  const formatDescriptionHtml = (rawHtml?: string) => {
    if (!rawHtml) return '';
    return rawHtml
      .replace(/\r\n/g, '<br />')
      .replace(/\n/g, '<br />')
      .replace(/\*Coverage/g, '<br />*Coverage')
      .replace(/\*Hotspot/g, '<br />*Hotspot');
  };

  const isCancelled = order?.status?.toLowerCase() === 'cancelled' || order?.status?.toLowerCase() === 'failed';

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 sm:pb-24 relative selection:bg-blue-500/10 font-['Poppins'] pt-[90px] sm:pt-[110px] mobile-typography-fix">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[10%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Navigation Header Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-8 pt-1 sm:pt-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs cursor-pointer font-['Poppins'] active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
            <span>{t('backToOrders', 'Back to Orders')}</span>
          </button>

          {/* 🔴 Red Border အကွက် ဖြုတ်ပြီး Header စာသားကို သပ်ရပ်အောင် ပြင်ဆင်ထားပါသည် */}
          <span className="text-xs sm:text-sm mt-1 font-bold text-slate-900 uppercase tracking-wider font-['Poppins'] px-3 py-1.5 bg-slate-100/80 rounded-lg">
            {t('orderDetail', 'Order Detail')}
          </span>
        </div>

        {loading && (
          <div className="bg-white rounded-[20px] sm:rounded-[24px] p-8 sm:p-20 border border-slate-100 shadow-xs flex flex-col items-center justify-center font-['Poppins']">
            <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-3 sm:border-4 border-blue-600 border-t-transparent mb-3 sm:mb-4"></div>
            <p className="text-slate-900 font-semibold text-xs sm:text-sm uppercase tracking-wider font-['Poppins']">{t('fetchingOrderInfo', 'Fetching Order Information...')}</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-10 border border-rose-100 shadow-xs text-center max-w-md mx-auto font-['Poppins']">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{t('errorLoadingOrder', 'Error Loading Order')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mb-5 sm:mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs hover:bg-blue-700 transition-all cursor-pointer font-['Poppins'] active:scale-95"
            >
              {t('tryAgain', 'Try Again')}
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-4 sm:space-y-6 font-['Poppins']">
            
            {/* Order Header Info Card */}
            <div className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6 font-['Poppins']">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-6">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap shrink-0 font-['Poppins']">
                      {order.order_number}
                    </h3>
                    
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider border shrink-0 font-['Poppins'] ${
                      isCancelled
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {isCancelled ? (
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                      )}
                      {t(`status${order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}`, order.status)} 
                    </span>
                  </div>
                  
                  <p className="text-[11px] sm:text-sm text-slate-600 font-medium font-['Poppins']">
                    {t('placedOn', 'Placed on')} <span className="text-slate-900 font-bold">{formatDate(order.placed_at)}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0 font-['Poppins']">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('totalValuation', 'Total Valuation')}</span>
                  <span className="text-sm sm:text-lg font-bold whitespace-nowrap font-['Poppins'] text-blue-600">
                    {order.total > 0 ? `${order.total.toLocaleString()} ${order.currency}` : `0 ${order.currency}`}
                  </span>
                </div>
              </div>

              {/* Meta Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-100/80 text-[11px] sm:text-sm font-['Poppins']">
                
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('paymentMethod', 'Payment Method')}</p>
                  <p className="font-bold uppercase mt-0.5 sm:mt-1 flex items-center gap-1 font-['Poppins'] text-blue-600">
                    {order.payment_method === 'sparks' && <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />}
                    {order.payment_method_title || order.payment_method || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('paymentStatus', 'Payment Status')}</p>
                  <p className="font-bold uppercase mt-0.5 sm:mt-1 font-['Poppins'] text-blue-600">
                    {order.payment_status || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('sparksUsed', 'Sparks Used')}</p>
                  <p className="font-bold mt-0.5 sm:mt-1 font-['Poppins'] text-blue-600">
                    {order.sparks_used || 0} Sparks
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('customerEmail', 'Customer Email')}</p>
                  <p className="font-bold mt-0.5 sm:mt-1 font-['Poppins'] text-blue-600 break-all">
                    {order.customer_email || '-'}
                  </p>
                </div>

              </div>

            </div>

            {/* Order Items Section */}
            {(order.items || []).map((item) => {
              const variation = item.product_variation;
              const esimsList = item.esims || [];
              
              const firstEsimValidTime = esimsList.length > 0 ? esimsList[0].esim_metadata?.validTime : null;

              return (
                <div key={item.id} className="space-y-4 sm:space-y-6">
                  
                  <div className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 shadow-xs font-['Poppins']">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5 mb-4 sm:mb-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src="/esim-icon_1.png"
                          alt="eSIM Icon" 
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
                        />
                        <div>
                          <h3 className="text-xs sm:text-base font-bold text-slate-900">{item.name} {t('esimPlan', 'eSIM Plan')}</h3>
                          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 text-blue-600 bg-blue-50 border border-blue-100">
                            {variation?.combination_label || 'Standard Package'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-sm font-semibold text-slate-900 bg-slate-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 min-w-max">
                          <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          <span>{t('data', 'Data:')} <strong className="font-bold">{variation?.data_plan || 'N/A'}</strong></span>
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-slate-200" />
                        
                        <div className="flex items-center gap-1.5 min-w-max">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          <span>{t('validity', 'Validity:')} <strong className="font-bold">
                            {firstEsimValidTime 
                              ? formatDate(firstEsimValidTime) 
                              : (variation?.days ? `${variation.days} ${t('days', 'Days')}` : 'N/A')}
                          </strong></span>
                        </div>
                      </div>

                    </div>

                    {/* 🔴 Coverage & Details စာသားများ ပျက်မနေစေရန် ပြင်ထားပါသည် */}
                    {variation?.description && (
                      <div className="text-[11px] sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 sm:p-4 rounded-xl border border-slate-100">
                        <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs mb-1.5">{t('coverageAndDetails', 'Coverage & Details')}</p>
                        <div 
                          className="space-y-1.5 font-['Poppins'] text-[11px] sm:text-sm font-medium text-slate-800 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatDescriptionHtml(variation.description) }} 
                        />
                      </div>
                    )}
                  </div>

                  {/* eSIM Activation Profiles */}
                  {esimsList.map((esim, idx) => {
                    return (
                      <div key={idx} className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6 font-['Poppins']">
                        
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                              {t('esimActivationProfile', { number: idx + 1 })}
                            </h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
                          
                          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 border border-slate-200/70 p-4 sm:p-5 rounded-xl text-center">
                            <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-xs border border-slate-100 mb-2.5 sm:mb-3">
                              {esim.esim_activation_code ? (
                                <QRCodeSVG 
                                  value={esim.esim_activation_code} 
                                  size={140}
                                  bgColor={"#FFFFFF"}
                                  fgColor={"#0F172A"}
                                  level={"M"}
                                  className="w-28 h-28 sm:w-36 sm:h-36"
                                />
                              ) : (
                                <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center text-xs text-slate-400 font-semibold">
                                  No QR Code Available
                                </div>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
                              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              {t('scanQrCode', 'Scan QR Code to Install')}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
                              {t('scanQrCodeDesc', 'Go to Settings > Cellular > Add eSIM on your device')}
                            </p>
                          </div>

                          <div className="lg:col-span-7 space-y-2.5 sm:space-y-3">
                            
                            <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('esimIccid', 'eSIM ICCID')}</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono truncate">{esim.esim_iccid || '-'}</p>
                              </div>
                              {esim.esim_iccid && (
                                <button
                                  onClick={() => copyToClipboard(esim.esim_iccid, 'iccid')}
                                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 hover:text-blue-600 text-[11px] sm:text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer font-['Poppins'] active:scale-95"
                                >
                                  {copiedField === 'iccid' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedField === 'iccid' ? t('copied', 'Copied') : t('copy', 'Copy')}</span>
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 text-xs sm:text-sm">
                              <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">{t('apnSetting', 'APN Setting')}</span>
                                <p className="font-bold mt-0.5 text-blue-600">{esim.esim_metadata?.apn || 'cmhk'}</p>
                              </div>
                              <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">{t('pinPuk', 'PIN / PUK')}</span>
                                <p className="font-bold mt-0.5 text-blue-600">{esim.esim_metadata?.pin || '0000'} / {esim.esim_metadata?.puk || '00000000'}</p>
                              </div>
                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              );
            })}

            {/* Billing Breakdown */}
            <div className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 shadow-xs space-y-3 sm:space-y-4 font-['Poppins']">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 sm:pb-3">
                {t('billingBreakdown', 'Billing Breakdown')}
              </h3>

              <div className="space-y-2 text-xs sm:text-sm font-normal">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span className="font-semibold text-slate-900">{t('subtotal', 'Subtotal')}</span>
                  <span className="font-bold text-slate-900">{order.subtotal ? order.subtotal.toLocaleString() : 0} {order.currency || 'MMK'}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span className="font-semibold text-slate-900">{t('discountTotal', 'Discount Total (Sparks)')}</span>
                  <span className="font-bold text-emerald-600">-{order.discount_total ? order.discount_total.toLocaleString() : 0} {order.currency || 'MMK'}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span className="font-semibold text-slate-900">{t('tax', 'Tax')}</span>
                  <span className="font-bold text-slate-900">{order.tax_total || 0} {order.currency || 'MMK'}</span>
                </div>
                <div className="border-t border-slate-100 pt-2.5 flex justify-between text-xs sm:text-sm font-bold text-slate-900">
                  <span className="font-bold text-slate-900">{t('finalAmountPaid', 'Final Amount Paid')}</span>
                  <span className="text-blue-600">{order.total > 0 ? `${order.total.toLocaleString()} ${order.currency || 'MMK'}` : `0 ${order.currency || 'MMK'}`}</span>
                </div>
              </div>
            </div>

            {/* Support Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-sm font-['Poppins']">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">{t('needHelpInstalling', 'Need Help Installing Your eSIM?')}</h4>
                  <p className="text-[11px] sm:text-xs text-blue-200 font-medium mt-0.5">{t('needHelpInstallingDesc', 'Contact our 24/7 roaming support team for guidance.')}</p>
                </div>
              </div>

              <button
                onClick={onHelp}
                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-blue-50 transition-all cursor-pointer shrink-0 font-['Poppins'] active:scale-95"
              >
                {t('getSupport', 'Get Support')}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}