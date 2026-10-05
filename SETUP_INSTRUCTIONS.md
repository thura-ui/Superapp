# Setup Instructions - My Data & My Order Features

## ✅ What Has Been Completed

All the code has been implemented and is ready to use! Here's what was done:

### 1. Database Tables Created (SQL Ready)
- ✅ `orders` table - Stores purchase history
- ✅ `esim_profiles` table - Stores individual eSIM profiles
- ✅ Secure RLS policies configured
- ✅ Indexes for fast queries

### 2. Edge Function Updated
- ✅ `order-esim` function now saves to both `orders` and `esim_profiles` tables
- ✅ Extracts eSIM profile data from API response
- ✅ Links profiles to orders via foreign key

### 3. UI Components Ready
- ✅ `MyData.tsx` - Shows data usage with progress bars
- ✅ `PurchaseHistory.tsx` - Updated to use `orders` table
- ✅ Wired to bottom navigation (My Data & My Order buttons)

### 4. Build Successful
- ✅ Project compiles without errors
- ✅ All TypeScript types are correct

---

## 🚀 What You Need To Do

### Step 1: Create Database Tables

**သင်လုပ်ရမယ့်အရာ:**

1. သင့် Supabase Dashboard ကိုဖွင့်ပါ
2. **SQL Editor** သို့သွားပါ
3. **New Query** ကိုနှိပ်ပါ
4. အောက်ပါ SQL code ကို paste လုပ်ပါ:

```sql
-- ============================================================================
-- TABLE 1: orders
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  user_id uuid,
  email text,
  order_data jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_package_code ON orders(package_code);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can read their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Users can read own orders'
  ) THEN
    CREATE POLICY "Users can read own orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- TABLE 2: esim_profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS esim_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  user_id uuid,
  esim_tran_no text UNIQUE NOT NULL,
  iccid text UNIQUE NOT NULL,
  package_code text NOT NULL,
  country_name text,
  data_amount text,
  validity_days integer CHECK (validity_days > 0),
  qr_code text,
  lpa text,
  activation_date timestamptz,
  expiry_date timestamptz,
  status text DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_esim_profiles_user_id ON esim_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_esim_profiles_order_id ON esim_profiles(order_id);
CREATE INDEX IF NOT EXISTS idx_esim_profiles_esim_tran_no ON esim_profiles(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_esim_profiles_iccid ON esim_profiles(iccid);
CREATE INDEX IF NOT EXISTS idx_esim_profiles_status ON esim_profiles(status);
CREATE INDEX IF NOT EXISTS idx_esim_profiles_package_code ON esim_profiles(package_code);

-- Enable Row Level Security
ALTER TABLE esim_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can read their own profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'esim_profiles' AND policyname = 'Users can read own profiles'
  ) THEN
    CREATE POLICY "Users can read own profiles"
      ON esim_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policy: Authenticated users can update their own profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'esim_profiles' AND policyname = 'Users can update own profiles'
  ) THEN
    CREATE POLICY "Users can update own profiles"
      ON esim_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for esim_profiles table
DROP TRIGGER IF EXISTS update_esim_profiles_updated_at ON esim_profiles;
CREATE TRIGGER update_esim_profiles_updated_at
  BEFORE UPDATE ON esim_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

5. **Run** ကို နှိပ်ပါ
6. Success message မြင်ရပါမယ်

---

### Step 2: Verify Tables Created

**စစ်ဆေးရန်:**

1. Supabase Dashboard > **Table Editor** သို့သွားပါ
2. ဘယ်ဘက်မှာ tables list မြင်ရမယ်:
   - ✅ `orders`
   - ✅ `esim_profiles`
3. တစ်ခုချင်းစီ click လုပ်ပြီး structure စစ်ကြည့်ပါ

---

### Step 3: Deploy Updated Edge Function (Optional)

**Note:** Edge function code က update လုပ်ပြီးသားပါ။ သို့သော် Supabase မှာ အလိုအလျောက် deploy မဖြစ်ပါဘူး။

**နည်းလမ်း (၂) မျိုးရှိပါတယ်:**

#### Option A: Wait for Auto-Deploy
- Supabase က automatically deploy လုပ်ပေးနိုင်ပါတယ် (project settings အပေါ်မူတည်)
- Test လုပ်ကြည့်ပြီး အလုပ်မလုပ်ရင် Option B သုံးပါ

#### Option B: Manual Deploy (via Supabase Dashboard)
1. Supabase Dashboard > **Edge Functions**
2. `order-esim` function ကိုရှာပါ
3. အသစ် deploy လုပ်ပါ (deployment option ကို သုံးပါ)

---

## 🎯 How It Works Now

### When User Purchases eSIM:

```
User clicks "Buy"
    ↓
order-esim edge function called
    ↓
Creates order in eSIM API
    ↓
Saves to "orders" table (full response)
    ↓
Extracts eSIM profiles
    ↓
Saves to "esim_profiles" table
    ↓
Returns success to user
```

### My Order Section:

```
User clicks "My Order" in bottom nav
    ↓
Opens PurchaseHistory modal
    ↓
Queries "orders" table (filtered by user_id)
    ↓
Displays: Package code, quantity, order date, status
```

### My Data Section:

```
User clicks "My Data" in bottom nav
    ↓
Opens MyData modal
    ↓
Queries "esim_profiles" table (filtered by user_id)
    ↓
Gets esim_tran_no values
    ↓
Calls "check-usage" edge function
    ↓
Displays: Progress bars, remaining data, expiry dates
```

---

## 🧪 Testing

### Test 1: Purchase Flow

1. Run your app: `npm run dev`
2. Select a country and plan
3. Complete purchase
4. Check Supabase Dashboard:
   - Go to **Table Editor** > `orders`
   - Should see new row with `order_data` (JSON)
   - Go to `esim_profiles`
   - Should see profile(s) extracted from order

### Test 2: My Order

1. Click **"My Order"** button in bottom navigation
2. Should see modal with:
   - Package code
   - Quantity
   - Order number
   - Purchase date
   - Status badge

### Test 3: My Data

1. Click **"My Data"** button in bottom navigation
2. Should see modal with:
   - eSIM profiles
   - Data usage progress bars
   - Remaining data (GB)
   - Expiry dates

**Note:** My Data ကို test လုပ်ဖို့ `check-usage` edge function လည်း အလုပ်လုပ်ရမယ်။

---

## 🐛 Troubleshooting

### Issue 1: Tables မရှိဘူး

**အဖြေ:**
- Supabase SQL Editor မှာ SQL code run လုပ်ထားပြီးပြီလား စစ်ပါ
- Error message ရှိရင် console ကိုကြည့်ပါ

### Issue 2: My Order မှာ data မပြဘူး

**အဖြေ:**
- `orders` table မှာ data ရှိလား စစ်ပါ
- Console errors စစ်ပါ
- User authenticated ဖြစ်ပြီး `user_id` match ဖြစ်လား စစ်ပါ

### Issue 3: My Data မှာ usage မပြဘူး

**အဖြေ:**
- `esim_profiles` table မှာ data ရှိလား စစ်ပါ
- `check-usage` edge function အလုပ်လုပ်လား စစ်ပါ
- Browser console မှာ network errors စစ်ပါ

### Issue 4: RLS Policy Errors

**အဖြေ:**
- User logged in ဖြစ်ရမယ် (authenticated)
- `user_id` က `auth.uid()` နဲ့ match ဖြစ်ရမယ်
- Guest users များအတွက် အခု system က support မလုပ်သေးပါ

---

## 📊 Database Structure

```
orders table
├── id (uuid) - Primary Key
├── package_code (text) - "TH-7D-5GB"
├── quantity (integer) - 1
├── user_id (uuid) - Links to auth.users
├── email (text)
├── order_data (jsonb) - Full API response
├── status (text) - pending/completed/failed/refunded
├── created_at (timestamptz)
└── updated_at (timestamptz)

esim_profiles table
├── id (uuid) - Primary Key
├── order_id (uuid) - Foreign Key → orders.id
├── user_id (uuid) - Links to auth.users
├── esim_tran_no (text) - For usage API ⭐
├── iccid (text) - eSIM identifier
├── package_code (text)
├── country_name (text)
├── data_amount (text) - "5GB"
├── validity_days (integer) - 7
├── qr_code (text)
├── lpa (text)
├── activation_date (timestamptz)
├── expiry_date (timestamptz)
├── status (text) - inactive/active/expired/cancelled
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

---

## 🔒 Security Features

✅ **Row Level Security (RLS) Enabled**
- Users can only see their own orders
- Users can only see their own eSIM profiles
- No public read/write access

✅ **Foreign Key Constraints**
- `esim_profiles.order_id` references `orders.id`
- Maintains data integrity

✅ **Service Role Key**
- Edge functions use service role key
- Bypasses RLS for inserts (secure)

---

## 📝 Summary

### ✅ ပြီးသွားတာတွေ:

1. ✅ Database tables created (SQL ready)
2. ✅ Edge function updated
3. ✅ MyData component created
4. ✅ PurchaseHistory updated
5. ✅ Bottom navigation wired up
6. ✅ Build successful

### 🔄 သင်လုပ်ရမယ့်အရာ:

1. ⏳ Run SQL in Supabase Dashboard (Step 1)
2. ⏳ Verify tables created (Step 2)
3. ⏳ Test the complete flow (Step 3)

### 📚 Documentation Files:

- `DATABASE_ARCHITECTURE.md` - Detailed database docs
- `DATA_FLOW_DIAGRAM.md` - Visual diagrams
- `MY_DATA_MY_ORDER_SUMMARY.md` - Quick reference
- `CREATE_MY_DATA_TABLES.sql` - Same SQL as above
- `SETUP_INSTRUCTIONS.md` - This file

---

## 💡 Next Steps

အခု setup ပြီးရင်:

1. **Test ကောင်းကောင်းလုပ်ပါ** - အားလုံး အလုပ်လုပ်ကြောင်း သေချာအောင်
2. **Real data နဲ့ test လုပ်ပါ** - eSIM တစ်ခု ဝယ်ပြီး test လုပ်ကြည့်ပါ
3. **User feedback စုဆောင်းပါ** - UI/UX ကောင်းအောင် improve လုပ်ပါ

---

**မေးခွန်းရှိရင်:** Documentation files တွေကို ထပ်ဖတ်ပါ သို့မဟုတ် error messages တွေကို share လုပ်ပါ။

**Good luck! 🚀**
