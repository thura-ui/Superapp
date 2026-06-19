# 📱 SimleesUI - eSIM Travel Data Management Platform

<div align="center">

**မြန်မာနိုင်ငံအတွက် ပထမဆုံး Premium eSIM Data Plan Management Application**

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

*မြန်မာခရီးသွားများအတွက် modern web application တစ်ခုဖြစ်ပြီး travel eSIM ဝယ်ယူခြင်းနှင့် စီမံခန့်ခွဲခြင်းများကို တစ်နေရာတည်းတွင် ဆောင်ရွက်နိုင်ပါသည်။*

[Features](#-features) • [Installation](#-installation--setup) • [Architecture](#-core-architecture) • [Tech Stack](#-technology-stack) • [Documentation](#-documentation-files)

</div>

---

## ✨ Features

### 🌍 Global Coverage & Connectivity
- **190+ Countries & 500+ Networks** - ကမ္ဘာတလွှား ချိတ်ဆက်အသုံးပြုနိုင်ခြင်း။
- **Global & Regional Plans** - ဒေသအလိုက် (ဥပမာ - Asia, Europe) သို့မဟုတ် ကမ္ဘာလုံးဆိုင်ရာ data plan များ။
- **Popular Countries** - အသုံးအများဆုံးနိုင်ငံများကို လွယ်ကူစွာ ရွေးချယ်နိုင်သော Interface။

### 🎨 Premium UI/UX (Glassmorphism)
- **Modern Interface** - Framer Motion animations များနှင့် Glassmorphism design အသုံးပြုထားခြင်း။
- **Responsive Design** - Mobile-first ဖြစ်ပြီး Tablet နှင့် Desktop တို့တွင်လည်း အဆင်ပြေစွာ သုံးနိုင်ခြင်း။
- **Interactive Onboarding** - User များ အလွယ်တကူ စတင်နိုင်ရန် လမ်းညွှန်ချက် Carousel များ ပါဝင်ခြင်း။

### 📱 Smart eSIM Management
- **Compatibility Check** - မိမိဖုန်းက eSIM support ဖြစ်/မဖြစ် စစ်ဆေးပေးခြင်း။
- **Real-time Usage Tracking** - Data ဘယ်လောက်ကုန်ပြီလဲဆိုတာကို My Data dashboard တွင် တိုက်ရိုက်ကြည့်နိုင်ခြင်း။
- **Purchase History** - ဝယ်ယူခဲ့သော မှတ်တမ်းများကို user အလိုက် သိမ်းဆည်းပေးခြင်း။
- **Support & Guides** - Installation လမ်းညွှန်ချက်၊ APN settings နှင့် FAQ များ ပြည့်စုံစွာ ပါဝင်ခြင်း။

### 💰 Pricing & Payments
- **Multi-Currency** - မြန်မာကျပ်ငွေ (MMK) နှင့် USD နှစ်မျိုးလုံးဖြင့် စျေးနှုန်းများ ကြည့်ရှုနိုင်ခြင်း။
- **Real-time Pricing** - အချိန်နှင့်တစ်ပြေးညီ ပြောင်းလဲသော စျေးနှုန်းများကို tracking လုပ်နိုင်ခြင်း။

---

## 🚀 Installation & Setup

### လိုအပ်သော Software များ
- Node.js (v18+) / npm သို့မဟုတ် yarn / Git

### ၁။ Project ကို Clone လုပ်ခြင်း
```bash
git clone <your-repository-url>
cd simleesui
```

### ၂။ Dependencies သွင်းခြင်း
```bash
npm install
```

### ၃။ Environment Variables သတ်မှတ်ခြင်း
`.env` ဖိုင်တွင် အောက်ပါ key များ ဖြည့်စွက်ပါ:
```env
VITE_PRODUCTS_API_BASE_URL=http://168.144.129.220/api/v1
```

### ၄။ Development Server စတင်ခြင်း
```bash
npm run dev
```
ယခု `http://localhost:5173` တွင် စတင်အသုံးပြုနိုင်ပါပြီ။

---

## ⚙️ Core Architecture

Application ၏ အဓိက logic များကို **Mock APIs** ဖြင့် ချိတ်ဆက်ထားပါသည်။

### Technical Data Flow


1. **Purchase Flow:** User က plan ရွေးသည် -> Local Storage နှင့် Mock Response ဖြင့် order တင်သည် -> UI တွင် success ပြသသည်။
2. **Usage Flow:** My Data dashboard က profile list ကိုယူသည် -> Mock Response မှ data သွားစစ်သည် -> UI တွင် progress bar ဖြင့် ပြသသည်။

### Project Structure (Key Paths)
- `src/components`: UI screens များ (Onboarding, Home, PlanDetails, etc.)
- `src/lib/supabase.ts`: Mock Database connection configuration။

---

## 🗄️ Database Schema Summary

| Table | Description |
|-------|-------------|
| **countries/regions** | နိုင်ငံနှင့် ဒေသအလိုက် အချက်အလက်များ။ |
| **data_pricing** | eSIM packages များ၏ စျေးနှုန်းနှင့် plan ID များ။ |
| **orders** | User တစ်ဦးချင်းစီ၏ ဝယ်ယူမှုမှတ်တမ်းများ။ |
| **esim_profiles** | Activation code နှင့် usage tracking အတွက် လိုအပ်သော eSIM အချက်အလက်များ။ |

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server စတင်ရန်။ |
| `npm run build` | Production အတွက် build ဆွဲရန်။ |
| `npm run typecheck` | TypeScript error များ စစ်ဆေးရန်။ |

---

## 🎨 Technology Stack

- **Frontend:** React 18.3, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Mock Local APIs & Local Storage.
- **External Integration:** API-based eSIM provisioning.

---

## 🔐 Security & Guidelines

- **Row Level Security (RLS):** User များသည် မိမိတို့ဝယ်ယူထားသော data ကိုသာ မြင်ရအောင် database level မှ ကာကွယ်ထားသည်။
- **Edge Functions:** Sensitive ဖြစ်သော API key များကို browser ထဲတွင် မထားဘဲ server-side (Edge Functions) တွင်သာ သိမ်းဆည်းထားသည်။
- **Coding Standard:** Functional components နှင့် hooks များကို သုံးပါ။ Props များအတွက် interface များကို အမြဲ define လုပ်ပါ။

---

## 📚 Related Documentation

ပိုမိုအသေးစိတ်သိရှိလိုပါက အောက်ပါဖိုင်များကို ဖတ်ရှုပါ-
- `DATABASE_ARCHITECTURE.md` - Schema design အသေးစိတ်။
- `DATA_FLOW_DIAGRAM.md` - System တစ်ခုလုံး ချိတ်ဆက်ပုံ diagram များ။
- `SETUP_INSTRUCTIONS.md` - Deployment နှင့် configuration လမ်းညွှန်။

---

<div align="center">

**Made with ❤️ for Myanmar Travelers**
*Stay connected wherever you go!*

</div>
