# My Data & My Order - Quick Reference

## Quick Answer to Your Question

### My Order Section (Purchase History)
**Shows:** List of all packages the user has purchased

**Database Table:** `orders`

**Key Columns:**
- `user_id` - Links to the user
- `package_code` - What package was purchased
- `quantity` - How many eSIMs
- `order_data` - Full order details (JSON)
- `created_at` - When purchased
- `status` - Order status

**Query:**
```typescript
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', currentUserId)
  .order('created_at', { ascending: false });
```

---

### My Data Section (Usage Display)
**Shows:** Remaining data balance for each active eSIM

**Database Tables:** `esim_profiles` + Edge Function

**Process:**
1. Query `esim_profiles` table (filtered by user_id)
2. Extract `esim_tran_no` from each profile
3. Call `/functions/v1/check-usage` with the list
4. Display usage data with progress bars

**Key Columns in esim_profiles:**
- `user_id` - Links to the user
- `esim_tran_no` - Used to check usage
- `iccid` - eSIM identifier
- `country_name` - Country/region
- `data_amount` - Total data (e.g., "5GB")
- `validity_days` - Validity period
- `status` - active, inactive, expired

**Query:**
```typescript
// Step 1: Get user's eSIM profiles
const { data: profiles } = await supabase
  .from('esim_profiles')
  .select('*')
  .eq('user_id', currentUserId)
  .in('status', ['active', 'inactive']);

// Step 2: Extract transaction numbers
const esimTranNoList = profiles.map(p => p.esim_tran_no);

// Step 3: Check usage via edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/check-usage`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ esimTranNoList })
});

const { usage } = await response.json();
// usage contains: totalDataBytes, usedDataBytes, remainingDataBytes
```

---

## Simple Diagram

```
┌─────────────────┐         ┌─────────────────┐
│   MY ORDER      │         │    MY DATA      │
│   (History)     │         │    (Usage)      │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
   ┌──────────┐              ┌──────────────┐
   │  orders  │              │esim_profiles │
   │  table   │              │    table     │
   └──────────┘              └──────┬───────┘
                                    │
                                    │ esim_tran_no
                                    ▼
                            ┌───────────────┐
                            │  check-usage  │
                            │edge function  │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │   eSIM API    │
                            │ (returns      │
                            │  usage data)  │
                            └───────────────┘
```

---

## Files to Create/Update

### 1. Database Tables (SQL)
✅ **File:** `CREATE_MY_DATA_TABLES.sql`
- Run this in Supabase SQL Editor
- Creates `orders` and `esim_profiles` tables
- Sets up RLS policies

### 2. My Order Component (Already exists)
📝 **File:** `src/components/PurchaseHistory.tsx`
- Currently reads from `purchase_history` table
- **Update to:** Read from `orders` table instead

### 3. My Data Component (Need to create)
📝 **File:** `src/components/MyData.tsx` (NEW)
- Query `esim_profiles` table
- Call `check-usage` edge function
- Display usage with progress bars

### 4. Edge Function (Already exists)
✅ **File:** `supabase/functions/order-esim/index.ts`
- Currently saves to `orders` table
- **Update to:** Also save to `esim_profiles` table

---

## Step-by-Step Setup

### Step 1: Create Database Tables
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `CREATE_MY_DATA_TABLES.sql`
4. Paste and Run

### Step 2: Update order-esim Edge Function
Add code to save eSIM profiles after saving order:

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

### Step 3: Create MyData Component
Create new component that:
1. Fetches user's eSIM profiles
2. Calls check-usage edge function
3. Displays usage data

### Step 4: Update PurchaseHistory Component
Change from:
```typescript
.from('purchase_history')
```

To:
```typescript
.from('orders')
```

---

## Data Examples

### orders table row
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "package_code": "TH-7D-5GB",
  "quantity": 1,
  "user_id": "user-uuid-here",
  "email": "user@example.com",
  "order_data": {
    "success": true,
    "obj": {
      "orderNo": "ORD20260215001",
      "esimList": [{
        "esimTranNo": "ESM789456123",
        "iccid": "89441234567890123456",
        "qrCode": "data:image/png...",
        "lpa": "LPA:1$..."
      }]
    }
  },
  "status": "completed",
  "created_at": "2026-02-15T10:30:00Z"
}
```

### esim_profiles table row
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid-here",
  "esim_tran_no": "ESM789456123",
  "iccid": "89441234567890123456",
  "package_code": "TH-7D-5GB",
  "country_name": "Thailand",
  "data_amount": "5GB",
  "validity_days": 7,
  "qr_code": "data:image/png...",
  "lpa": "LPA:1$...",
  "status": "active",
  "activation_date": "2026-02-15T11:00:00Z",
  "expiry_date": "2026-02-22T11:00:00Z"
}
```

### Usage API response
```json
{
  "success": true,
  "usage": [{
    "esimTranNo": "ESM789456123",
    "totalDataBytes": 5368709120,      // 5 GB
    "usedDataBytes": 2147483648,       // 2 GB
    "remainingDataBytes": 3221225472,  // 3 GB
    "status": "active"
  }]
}
```

---

## Benefits of This Structure

### Security
- ✅ RLS policies prevent users from seeing others' data
- ✅ Edge functions use service role key (secure)
- ✅ No public read/write access

### Flexibility
- ✅ Full API response stored in JSONB (order_data)
- ✅ Easy to add new fields without schema changes
- ✅ Can query specific eSIM details quickly

### Performance
- ✅ Indexes on user_id, esim_tran_no, iccid
- ✅ Separate table for profiles (faster queries)
- ✅ Status-based filtering

### Scalability
- ✅ One order can have multiple eSIM profiles
- ✅ Easy to track activation/expiry dates
- ✅ Can support future features (refunds, transfers, etc.)

---

## Troubleshooting

### Issue: No data showing in My Order
**Check:**
1. Is user authenticated? (user_id must match)
2. Are there records in `orders` table?
3. Is RLS policy correct?

### Issue: No usage data in My Data
**Check:**
1. Are there records in `esim_profiles` table?
2. Is `esim_tran_no` correct?
3. Is edge function working?
4. Check browser console for errors

### Issue: RLS policy error
**Solution:**
- User must be authenticated
- `user_id` in table must match `auth.uid()`
- Edge functions must use service role key

---

## Quick Links

- **Full Documentation:** `DATABASE_ARCHITECTURE.md`
- **Data Flow Diagrams:** `DATA_FLOW_DIAGRAM.md`
- **SQL Script:** `CREATE_MY_DATA_TABLES.sql`
- **Edge Functions:** `supabase/functions/`

---

## Summary

**My Order = Query `orders` table by user_id**
- Shows purchase history
- Contains full order details

**My Data = Query `esim_profiles` + Call `check-usage` API**
- Shows active eSIMs
- Displays remaining data balance
- Real-time usage from eSIM provider

Both sections are linked to users via `user_id` column with secure RLS policies!
