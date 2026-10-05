# Plans Table Guide

## Database Structure

### အဓိက Tables များ

1. **`plans`** - Provider Plan Definitions (Excel မှ Plan ID အချက်အလက်များ)
2. **`country_pricing`** - User ဝယ်ယူနိုင်သော Data Packages (နိုင်ငံ/ဒေသ/Global အလိုက် ဈေးနှုန်း)
3. **`countries`** - နိုင်ငံများ
4. **`regions`** - ဒေသများ

## Plans Table (Provider Plan Definitions)

Excel file မှ Plan ID အချက်အလက်အားလုံးကို သိမ်းဆည်းရန်

```sql
plans
├── plan_id (text, PRIMARY KEY)              - Plan ID (e.g., "1764293386847178")
├── commodity_name (text)                    - Plan အမည် အပြည့်အစုံ
├── commodity_type (text)                    - eSIM အမျိုးအစား (e.g., "eSIM+Optional")
├── data_amount (text)                       - Data ပမာဏ (e.g., "3.00GB", "1024.00MB/Day")
├── validity_days (integer)                  - Carrier Validity ကာလ (90 ရက်ဆိုရင် ဝယ်ပြီး ၉၀ ရက်အတွင်း activate မလုပ်ရင် expire)
├── total_capacity_gb (numeric)              - စုစုပေါင်း Data capacity (GB)
├── high_speed_data (text)                   - မြန်နှုန်းမြင့် Data
├── throttled_speed_kbps (integer)           - Throttling နောက် အမြန်နှုန်း (e.g., 128 kbps)
├── package_type (text)                      - "bundles" သို့မဟုတ် "unlimited"
├── timing_rule (text)                       - "24 Hours" သို့မဟုတ် "Natural Day"
├── matching_carrier (text)                  - Carrier အချက်အလက်
├── commodity_status (text)                  - "listed" သို့မဟုတ် "unlisted"
└── created_at (timestamptz)                 - ဖန်တီးသည့် အချိန်
```

### Validity Days vs Duration Days ခွဲခြားချက်

- **validity_days (Plans table)**: Plan ဝယ်ပြီး ဘယ်နှရက်အတွင်း activate လုပ်ရမယ်။ ဥပမာ: 90 ရက်ဆိုရင် ဝယ်ပြီး ၉၀ ရက်အတွင်း activate မလုပ်ရင် plan က expire ဖြစ်သွားမယ်။

- **duration_days (Country Pricing table)**: User activate လုပ်ပြီး ဘယ်နှရက် သုံးနိုင်မယ်။ ဥပမာ: 30 ရက်ဆိုရင် activate ရက်မှစပြီး ၃၀ ရက်ကြာ သုံးနိုင်မယ်။

## Country Pricing Table (User Purchasable Packages)

User ဝယ်ယူနိုင်သော Data packages များနှင့် ဈေးနှုန်းများ

```sql
country_pricing
├── id (uuid, PRIMARY KEY)                   - Internal ID
├── country_id (uuid, FOREIGN KEY)           - Country reference (Local plans)
├── regional_id (uuid, FOREIGN KEY)          - Region reference (Regional plans)
├── global_id (uuid, FOREIGN KEY)            - Global reference (Global plans)
├── plan_id (text, FOREIGN KEY)              - Plans table ကို reference
├── data_amount (text)                       - User ဝယ်ယူနိုင်သော Data ပမာဏ
├── duration_days (integer)                  - User သုံးစွဲနိုင်သော ကာလ (activate ပြီးနောက်)
├── package_type (text)                      - "bundles" သို့မဟုတ် "unlimited"
├── price_mmk (numeric)                      - MMK ဈေးနှုန်း
├── price_usd (numeric)                      - USD ဈေးနှုန်း (optional)
├── currency (text)                          - ငွေကြေး code
└── created_at (timestamptz)                 - ဖန်တီးသည့် အချိန်
```

## အသုံးပြုပုံ

### 1. Excel မှ Plans များ Import လုပ်ခြင်း

Excel file (e.g., `esim_plan_ids.xlsx`) ကို import လုပ်ရန်:

```bash
node scripts/import-plans-from-excel.js esim_plan_ids.xlsx
```

**Excel File Format:**

| Column Name | Description |
|-------------|-------------|
| Plan ID | Plan ၏ unique identifier (e.g., "1764293386847178") |
| Commodity Name | Plan အမည် (e.g., "Singapore Malaysia Thailand-3GB,128kbps-eSIM Carrier of 90 days") |
| Commodity Type | eSIM အမျိုးအစား (e.g., "eSIM+Optional") |
| Days | Carrier validity period (e.g., 3, 1, 90) |
| Total capacity (GB) | စုစုပေါင်း data capacity |
| High Speed Data | High speed data limit (e.g., "3.00GB", "1024.00MB/Day") |
| Throttled Speed (kbps) | Speed after throttling (e.g., 128) |
| Package type | "Data Type" သို့မဟုတ် "Day-pass Type" |
| Timing Rule | "24 Hours" သို့မဟုတ် "Natural Day" |
| Matching Carrier | Carrier info (optional) |
| Commodity status | "listed" သို့မဟုတ် "unlisted" |

### 2. Country Pricing Records ဖန်တီးခြင်း

Plans import လုပ်ပြီးနောက်, User ဝယ်ယူနိုင်သော packages ဖန်တီးရန်:

```javascript
// Example: Thailand အတွက် 30 ရက် 3GB package ဖန်တီးခြင်း
const { data: thailand } = await supabase
  .from('countries')
  .select('id')
  .eq('name', 'Thailand')
  .single();

await supabase.from('country_pricing').insert({
  country_id: thailand.id,
  plan_id: '1764293386847178',   // Plans table မှ plan_id
  data_amount: '3GB',            // User ဝယ်ယူမည့် data
  duration_days: 30,             // User သုံးစွဲနိုင်မည့် ရက် (activate ပြီးနောက်)
  package_type: 'bundles',
  price_mmk: 15000,
  price_usd: 5
});
```

### 3. Regional Plans ဖန်တီးခြင်း

```javascript
// Example: Asia region အတွက် plan ဖန်တီးခြင်း
const { data: asiaRegion } = await supabase
  .from('regions')
  .select('id')
  .eq('code', 'ASIA')
  .single();

await supabase.from('country_pricing').insert({
  regional_id: asiaRegion.id,    // Region reference
  plan_id: '1764293386847178',
  data_amount: '5GB',
  duration_days: 15,
  package_type: 'bundles',
  price_mmk: 25000,
  price_usd: 8
});
```

### 4. Global Plans ဖန်တီးခြင်း

```javascript
// Example: Global plan ဖန်တီးခြင်း
const { data: globalEntry } = await supabase
  .from('countries')
  .select('id')
  .eq('type', 'global')
  .single();

await supabase.from('country_pricing').insert({
  global_id: globalEntry.id,     // Global reference
  plan_id: '1764293386847178',
  data_amount: '10GB',
  duration_days: 30,
  package_type: 'bundles',
  price_mmk: 50000,
  price_usd: 15
});
```

## UI မှ Data ဆွဲယူခြင်း

```typescript
const { data } = await supabase
  .from('country_pricing')
  .select(`
    plan_id,
    price_mmk,
    data_amount,
    duration_days,
    package_type,
    plans (
      commodity_name,
      high_speed_data,
      throttled_speed_kbps,
      validity_days
    )
  `)
  .eq('country_id', countryId);
```

## Database Structure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         plans                                │
│ (Provider Plan Definitions from Excel)                       │
├─────────────────────────────────────────────────────────────┤
│ plan_id (PK)      │ "1764293386847178"                      │
│ commodity_name    │ "Singapore Malaysia Thailand-3GB..."     │
│ validity_days     │ 90 (carrier expiry)                      │
│ ...               │                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Reference)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    country_pricing                           │
│ (User Purchasable Packages)                                  │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID                                     │
│ country_id (FK)   │ → countries.id (Local plans)            │
│ regional_id (FK)  │ → regions.id (Regional plans)           │
│ global_id (FK)    │ → countries.id where type='global'      │
│ plan_id (FK)      │ → plans.plan_id                         │
│ data_amount       │ "3GB" (what user purchases)             │
│ duration_days     │ 30 (user usage period after activation) │
│ price_mmk         │ 15000                                    │
│ ...               │                                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   countries   │    │    regions    │    │   countries   │
│ (type=local)  │    │               │    │ (type=global) │
└───────────────┘    └───────────────┘    └───────────────┘
```

## Sample Queries

### Plan တစ်ခု၏ အချက်အလက်များ ကြည့်ရှုခြင်း

```sql
SELECT * FROM plans
WHERE plan_id = '1764293386847178';
```

### Country တစ်ခု၏ Available Packages အားလုံး

```sql
SELECT
  c.name as country_name,
  cp.data_amount,
  cp.duration_days as usage_days,
  cp.price_mmk,
  p.validity_days as carrier_validity,
  p.commodity_name
FROM country_pricing cp
JOIN countries c ON cp.country_id = c.id
LEFT JOIN plans p ON cp.plan_id = p.plan_id
WHERE c.name = 'Thailand'
ORDER BY cp.duration_days, cp.data_amount;
```

### Regional Plans ကြည့်ရှုခြင်း

```sql
SELECT
  r.name as region_name,
  cp.data_amount,
  cp.duration_days,
  cp.price_mmk
FROM country_pricing cp
JOIN regions r ON cp.regional_id = r.id
ORDER BY r.name, cp.duration_days;
```

## Security (RLS Policies)

```sql
-- Plans table: Public read access
CREATE POLICY "Plans are publicly readable"
  ON plans FOR SELECT TO public USING (true);

-- Country Pricing table: Public read access
CREATE POLICY "Country pricing is publicly readable"
  ON country_pricing FOR SELECT TO public USING (true);
```

## Important Notes

1. **Plan ID Format**: Plan IDs များသည် large numbers ဖြင့် ရှိနိုင်သည် (e.g., "1764293386847178")
2. **Validity vs Duration**:
   - `validity_days` = Carrier expiry (Plans table)
   - `duration_days` = User usage period (Country Pricing table)
3. **Package Types**: "bundles" သို့မဟုတ် "unlimited" သာ ခွင့်ပြုသည်
4. **Pricing Links**: country_pricing သည် country_id, regional_id, သို့မဟုတ် global_id တစ်ခုခု ရှိရမည်
5. **Data Integrity**: Plans table မှ plan_id ကို country_pricing တွင် reference လုပ်နိုင်သည်
