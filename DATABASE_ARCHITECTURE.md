# Database Architecture for My Data & My Order Features

## Overview

This document explains the database structure and data flow for displaying user data in the **My Data** and **My Order** sections of the application.

---

## Database Tables

### 1. **orders** Table (PRIMARY - Recommended)

Stores all eSIM purchase orders from the `order-esim` edge function.

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code text NOT NULL,              -- eSIM package code
  quantity integer DEFAULT 1,              -- Number of eSIMs
  user_id uuid,                           -- User ID (if authenticated)
  email text,                             -- Customer email
  order_data jsonb,                       -- Full API response (contains orderNo, esimTranNo, etc.)
  status text DEFAULT 'pending',          -- Order status
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Key Fields in order_data JSONB:**
- `obj.orderNo` - Order number from eSIM provider
- `obj.esimList[]` - Array of eSIM profiles
  - `esimTranNo` - eSIM transaction number (needed for usage checks)
  - `iccid` - eSIM ICCID
  - `qrCode` - QR code for installation
  - `lpa` - LPA string for manual installation

**RLS Policies:**
- Authenticated users can read their own orders (`auth.uid() = user_id`)
- Edge function uses service role key to insert orders (bypasses RLS)

---

### 2. **purchase_history** Table (LEGACY - Optional)

Simplified purchase history for UI display. Can be used alongside or replaced by `orders` table.

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

**Note:** This table has insecure RLS policies allowing public read/write. Consider migrating to `orders` table with proper security.

---

### 3. **esim_profiles** Table (RECOMMENDED - To Be Created)

Stores active eSIM profiles extracted from orders for easier querying.

```sql
CREATE TABLE esim_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  user_id uuid,                           -- User who owns this eSIM
  esim_tran_no text UNIQUE NOT NULL,      -- eSIM transaction number (for usage API)
  iccid text UNIQUE NOT NULL,             -- eSIM ICCID
  package_code text NOT NULL,             -- Package code
  country_name text,                      -- Country/region
  data_amount text,                       -- e.g., "5GB"
  validity_days integer,                  -- e.g., 7
  qr_code text,                          -- QR code URL/data
  lpa text,                              -- LPA string
  activation_date timestamptz,            -- When user activated
  expiry_date timestamptz,                -- When plan expires
  status text DEFAULT 'inactive',         -- inactive, active, expired
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE esim_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profiles"
  ON esim_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

---

## Data Flow

### Purchase Flow

```
User Purchase
     ↓
PlanDetails Component
     ↓
Call: order-esim Edge Function
     ↓
eSIM API (create order)
     ↓
Save to: orders table (with full API response)
     ↓
Extract eSIM profiles from order_data.obj.esimList
     ↓
Save to: esim_profiles table (individual eSIMs)
     ↓
Show success to user
```

### My Order Section (Purchase History)

**Option A: Use orders table (Recommended)**

```typescript
// Fetch user's orders
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Extract display data from order_data jsonb
orders.forEach(order => {
  const orderDetails = order.order_data?.obj;
  const esimList = orderDetails?.esimList || [];
  // Display: package_code, quantity, created_at, status
});
```

**Option B: Use purchase_history table (Current)**

```typescript
// Current implementation
const { data: purchases } = await supabase
  .from('purchase_history')
  .select('*')
  .order('purchase_date', { ascending: false });

// Display: country_name, plan_name, data_amount, validity_days, price_mmk
```

---

### My Data Section (Usage Tracking)

**Step 1: Get user's active eSIM profiles**

```typescript
const { data: profiles } = await supabase
  .from('esim_profiles')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active');

const esimTranNoList = profiles.map(p => p.esim_tran_no);
```

**Step 2: Check usage via edge function**

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/check-usage`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    esimTranNoList: esimTranNoList
  })
});

const { usage } = await response.json();

// usage array contains:
// - esimTranNo
// - totalDataBytes (total data allocation)
// - usedDataBytes (data consumed)
// - remainingDataBytes (data remaining)
// - status
```

**Step 3: Display in UI**

```typescript
usage.forEach(item => {
  const totalGB = (item.totalDataBytes / (1024**3)).toFixed(2);
  const usedGB = (item.usedDataBytes / (1024**3)).toFixed(2);
  const remainingGB = (item.remainingDataBytes / (1024**3)).toFixed(2);
  const percentage = ((item.usedDataBytes / item.totalDataBytes) * 100).toFixed(1);

  // Display: Progress bar, remaining data, expiry date
});
```

---

## Recommended Database Structure

### For Production Use:

1. **orders** - Store all purchase orders with full API response
2. **esim_profiles** - Store individual eSIM profiles for quick access
3. **Remove or migrate from purchase_history** - Redundant and insecure

### Migration Path:

```sql
-- Step 1: Create esim_profiles table (see schema above)

-- Step 2: Migrate existing purchase_history data to orders
INSERT INTO orders (package_code, quantity, email, status, created_at)
SELECT
  plan_id as package_code,
  1 as quantity,
  NULL as email,
  status,
  purchase_date as created_at
FROM purchase_history;

-- Step 3: Update order-esim edge function to also populate esim_profiles
-- (After saving to orders, extract and save to esim_profiles)
```

---

## Edge Functions Integration

### order-esim Function

**Current behavior:**
- Receives: `package_code`, `quantity`, `user_id`, `email`, `transaction_id`, `price`
- Calls eSIM API to create order
- Saves to `orders` table with full response

**Recommended enhancement:**
```typescript
// After saving to orders table
const esimList = orderData.obj?.esimList || [];

// Extract and save individual eSIM profiles
const profileInserts = esimList.map(esim => ({
  order_id: savedOrder.id,
  user_id: requestBody.user_id || null,
  esim_tran_no: esim.esimTranNo,
  iccid: esim.iccid,
  package_code: requestBody.package_code,
  qr_code: esim.qrCode,
  lpa: esim.lpa,
  status: 'inactive'
}));

await supabase.from('esim_profiles').insert(profileInserts);
```

### check-usage Function

**Current behavior:**
- Receives: `esimTranNoList[]`
- Calls eSIM API to get usage for each eSIM
- Returns usage data

**Usage in My Data:**
```typescript
// Get esimTranNo from user's active profiles
const { data: profiles } = await supabase
  .from('esim_profiles')
  .select('esim_tran_no')
  .eq('user_id', userId)
  .eq('status', 'active');

// Call check-usage
const response = await fetch(checkUsageUrl, {
  method: 'POST',
  body: JSON.stringify({
    esimTranNoList: profiles.map(p => p.esim_tran_no)
  })
});
```

### query-profiles Function

**Current behavior:**
- Receives: `orderNo`, `iccid`, or `esimTranNo`
- Queries eSIM API for profile details
- Returns profile list

**Usage:**
- Verify eSIM installation status
- Get latest profile information
- Sync with local database

---

## UI Component Updates

### My Order Component

**File:** `src/components/PurchaseHistory.tsx`

**Current:** Reads from `purchase_history` table

**Recommended update:**

```typescript
// Fetch from orders table
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Transform order_data for display
const displayOrders = orders.map(order => {
  const orderDetails = order.order_data?.obj;
  return {
    id: order.id,
    package_code: order.package_code,
    quantity: order.quantity,
    order_no: orderDetails?.orderNo,
    purchase_date: order.created_at,
    status: order.status,
    esim_count: orderDetails?.esimList?.length || 0
  };
});
```

### My Data Component (To Be Created)

**File:** `src/components/MyData.tsx`

```typescript
// 1. Fetch user's active eSIM profiles
const { data: profiles } = await supabase
  .from('esim_profiles')
  .select('*')
  .eq('user_id', userId)
  .in('status', ['active', 'inactive']);

// 2. Get esimTranNo list
const esimTranNoList = profiles.map(p => p.esim_tran_no);

// 3. Call check-usage edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/check-usage`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ esimTranNoList })
});

const { usage } = await response.json();

// 4. Display usage data with progress bars
```

---

## Security Considerations

### Current Issues:

1. **purchase_history table**: Has `USING (true)` policies allowing anyone to read all purchases
2. **No user authentication**: orders table allows null user_id

### Recommendations:

1. **Require authentication** for all purchases
2. **Use secure RLS policies**:
   - Users can only read their own orders
   - Service role key for edge function inserts
3. **Store minimal sensitive data** in database
4. **Use JSONB for flexible API response storage**

---

## Summary

### For My Order Section:
- **Table:** `orders` (primary) or `purchase_history` (legacy)
- **Link:** `user_id` column
- **Display:** Package code, quantity, order date, status
- **Query:** Filter by `user_id` and order by `created_at DESC`

### For My Data Section:
- **Tables:** `esim_profiles` (to be created)
- **Link:** `user_id` column
- **Process:**
  1. Query `esim_profiles` for user's eSIMs
  2. Extract `esim_tran_no` values
  3. Call `check-usage` edge function
  4. Display usage data (total, used, remaining)

### Migration Checklist:

- [ ] Create `orders` table (✅ SQL provided above)
- [ ] Create `esim_profiles` table (SQL provided above)
- [ ] Update `order-esim` edge function to populate both tables
- [ ] Create `MyData.tsx` component
- [ ] Update `PurchaseHistory.tsx` to use `orders` table
- [ ] Migrate data from `purchase_history` to new schema
- [ ] Add authentication requirement
- [ ] Test end-to-end flow

---

## Quick Start

### 1. Run SQL in Supabase Dashboard

```sql
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code text NOT NULL,
  quantity integer DEFAULT 1,
  user_id uuid,
  email text,
  order_data jsonb,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create esim_profiles table
CREATE TABLE IF NOT EXISTS esim_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  user_id uuid,
  esim_tran_no text UNIQUE NOT NULL,
  iccid text UNIQUE NOT NULL,
  package_code text NOT NULL,
  country_name text,
  data_amount text,
  validity_days integer,
  qr_code text,
  lpa text,
  activation_date timestamptz,
  expiry_date timestamptz,
  status text DEFAULT 'inactive',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE esim_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profiles"
  ON esim_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Update Components

- Update `PurchaseHistory.tsx` to read from `orders`
- Create `MyData.tsx` component
- Add to bottom navigation

---

**Questions?** Review this document or check edge function implementations in:
- `/supabase/functions/order-esim/index.ts`
- `/supabase/functions/check-usage/index.ts`
- `/supabase/functions/query-profiles/index.ts`
