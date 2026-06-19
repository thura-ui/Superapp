# Purchase History Feature Guide

## Overview

Purchase History feature သည် users များ၏ eSIM ဝယ်ယူမှု မှတ်တမ်းများကို ကြည့်ရှုနိုင်စေရန် ထည့်သွင်းထားသော feature ဖြစ်ပါသည်။

## Features

- ✅ ဝယ်ယူမှု မှတ်တမ်းများကို chronological order ဖြင့် ပြသခြင်း
- ✅ Plan အသေးစိတ်များ (နိုင်ငံ၊ data amount၊ validity၊ စျေးနှုန်း)
- ✅ Purchase status tracking (active, expired, cancelled)
- ✅ လှပသော modal UI design
- ✅ Empty state design

## UI Components

### 1. History Button

Country Selection screen ၏ header တွင် clock icon button ထည့်သွင်းထားပါသည်။

**Location:** `src/components/CountrySelection.tsx`

```typescript
<button
  onClick={() => setShowHistory(true)}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors -mr-2"
>
  <Clock className="w-6 h-6 text-gray-700" />
</button>
```

### 2. Purchase History Modal

**Component:** `src/components/PurchaseHistory.tsx`

Modal သည် အောက်ပါ information များကို ပြသပါသည်:

- Country/Region name
- Plan name
- Data amount
- Validity period (days)
- Price in MMK
- Purchase date
- Status badge (active/expired/cancelled)

## Database Schema

### purchase_history Table

```sql
CREATE TABLE purchase_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL,
  country_name text NOT NULL,
  plan_name text NOT NULL,
  data_amount text NOT NULL,
  validity_days integer NOT NULL,
  price_mmk numeric NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)

Table သည် RLS enable လုပ်ထားပြီး anonymous users များ read နှင့် insert လုပ်နိုင်ပါသည်။

```sql
-- Read access
CREATE POLICY "Allow anonymous read access to purchase history"
  ON purchase_history
  FOR SELECT
  TO anon
  USING (true);

-- Insert access
CREATE POLICY "Allow anonymous insert to purchase history"
  ON purchase_history
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

## Setup Instructions

### 1. Database Table Creation

`CREATE_PURCHASE_HISTORY_TABLE.sql` file ကို Supabase SQL Editor တွင် run လုပ်ပါ:

1. Supabase Dashboard > SQL Editor သို့သွားပါ
2. New Query ဖန်တီးပါ
3. SQL file ရှိ contents များကို paste လုပ်ပါ
4. Run ကို နှိပ်ပါ

### 2. Testing

Application run လုပ်ပြီး test လုပ်ပါ:

```bash
npm run dev
```

1. Country Selection page သို့ သွားပါ
2. Clock icon button ကို နှိပ်ပါ
3. Purchase History modal ပေါ်လာပါမည်

## Adding Purchase Records

Purchase records များကို အောက်ပါနည်းဖြင့် ထည့်သွင်းနိုင်ပါသည်:

### Method 1: Via Supabase Dashboard

1. Supabase Dashboard > Table Editor
2. purchase_history table ကို select လုပ်ပါ
3. Insert row ကို နှိပ်ပါ
4. Data များ ဖြည့်သွင်းပါ

### Method 2: Via Code

```typescript
const { data, error } = await supabase
  .from('purchase_history')
  .insert([
    {
      plan_id: 'plan-123',
      country_name: 'Thailand',
      plan_name: 'Thailand 7 Days',
      data_amount: '5GB',
      validity_days: 7,
      price_mmk: 15000,
      status: 'active'
    }
  ]);
```

## Status Types

Purchase records တွင် အောက်ပါ status များ ရှိနိုင်ပါသည်:

- **active** - အသုံးပြုနေသော plan (green badge)
- **expired** - သက်တမ်းကုန်ဆုံးပြီးသော plan (gray badge)
- **cancelled** - ပယ်ဖျက်ထားသော plan (red badge)

## UI/UX Features

### Animation

Modal သည် slide-up animation ဖြင့် ပေါ်လာပါသည်။

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Empty State

ဝယ်ယူမှု မှတ်တမ်း မရှိသေးပါက friendly empty state message ပြသပါသည်။

### Responsive Design

- Mobile: Full width modal
- Desktop: Max-width 448px modal with rounded corners

## Future Enhancements

အနာဂတ်တွင် ထည့်သွင်းနိုင်သော features များ:

- 🔜 Filter by status
- 🔜 Search functionality
- 🔜 Sort by date/price
- 🔜 Download receipt/invoice
- 🔜 Refund requests
- 🔜 QR code display for eSIM activation

## Troubleshooting

### Issue: Modal မပေါ်ပါ

**Solution:**
- Browser console ကို စစ်ဆေးပါ
- PurchaseHistory component import လုပ်ထားမှု စစ်ဆေးပါ

### Issue: Data များ မပြပါ

**Solution:**
- Database table ဖန်တီးထားမှု စစ်ဆေးပါ
- RLS policies များ စစ်ဆေးပါ
- Network tab တွင် API calls များ စစ်ဆေးပါ

### Issue: Database connection error

**Solution:**
- `.env` file ထဲက Supabase credentials များ စစ်ဆေးပါ
- Supabase project status စစ်ဆေးပါ

## Support

ပြဿနာများ ရှိပါက GitHub Issues တွင် တင်ပြနိုင်ပါသည်။
