# 🗄️ Database Architecture - SimleesUI

SimleesUI သည် **Supabase (PostgreSQL)** ကို အသုံးပြု၍ Data များကို စနစ်တကျ သိမ်းဆည်းပါသည်။

## 📊 Entity Relationship Summary

### 1. Catalog Tables (Public Data)
* **`countries`**: eSIM ရရှိနိုင်သော နိုင်ငံများစာရင်း။
    * `id`, `name`, `iso_code`, `popular` (boolean), `popular_rank` (integer).
* **`regions`**: ဒေသအလိုက် စုစည်းမှုများ (Asia, Europe, etc.)။
* **`data_pricing` / `packages`**: eSIM plan များ၏ အသေးစိတ်။
    * `id`, `country_id`, `data_amount_gb`, `duration_days`, `price_mmk`, `price_usd`, `package_code`.

### 2. User & Transaction Tables (Protected Data)
* **`orders`**: ဝယ်ယူမှုမှတ်တမ်းများ။
    * `id`, `user_id`, `package_code`, `total_amount`, `currency`, `status` (pending, completed, failed), `order_data` (JSON).
* **`esim_profiles`**: အမှန်တကယ် အသုံးပြုမည့် eSIM အချက်အလက်များ။
    * `id`, `order_id`, `user_id`, `esim_tran_no`, `iccid`, `lpa_string`, `matching_id`.

## 🛡️ Security (Row Level Security - RLS)
- **Anonymous Access**: `countries` နှင့် `data_pricing` table များကိုသာ Read-only ကြည့်ရှုခွင့်ရှိသည်။
- **Authenticated Access**: `orders` နှင့် `esim_profiles` table များတွင် `auth.uid() = user_id` ဖြစ်မှသာ Data ဖတ်ခြင်း/ရေးခြင်း ပြုလုပ်နိုင်သည်။

---
