# Data Flow Diagram - My Data & My Order Sections

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
├─────────────────────┬───────────────────────────────────────────┤
│   My Order Screen   │           My Data Screen                  │
│                     │                                           │
│  📱 Shows:          │  📊 Shows:                                │
│  • Purchase history │  • Data usage (GB used/remaining)         │
│  • Package details  │  • Active eSIM profiles                   │
│  • Order dates      │  • Expiry dates                           │
│  • Status badges    │  • Progress bars                          │
└──────┬──────────────┴─────────────┬─────────────────────────────┘
       │                            │
       │ Query                      │ Query
       ▼                            ▼
┌──────────────────┐         ┌─────────────────┐
│  orders table    │         │ esim_profiles   │
│                  │         │     table       │
│ • id            │◄────────┤ • order_id (FK) │
│ • package_code  │         │ • user_id       │
│ • user_id       │         │ • esim_tran_no  │
│ • order_data    │         │ • iccid         │
│ • created_at    │         │ • status        │
└────────┬─────────┘         └────────┬────────┘
         │                            │
         │                            │ esim_tran_no
         │                            ▼
         │                     ┌──────────────────┐
         │                     │  check-usage     │
         │                     │  Edge Function   │
         │                     └────────┬─────────┘
         │                              │
         │                              ▼
         │                     ┌──────────────────┐
         │                     │   eSIM API       │
         │                     │  Usage Endpoint  │
         │                     └──────────────────┘
         │
         │ Created by
         ▼
┌─────────────────────────────────────────────┐
│         order-esim Edge Function             │
│                                              │
│  1. Receive purchase request                 │
│  2. Call eSIM API to create order            │
│  3. Save response to orders table            │
│  4. Extract eSIM profiles                    │
│  5. Save to esim_profiles table              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │   eSIM API     │
          │ Order Endpoint │
          └────────────────┘
```

---

## Detailed Data Flow

### Flow 1: Purchase eSIM Package

```
┌──────────────┐
│ 1. User      │
│    selects   │
│    package   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 2. PlanDetails Component                │
│    • Collect: package_code, quantity    │
│    • Get: user_id (from auth)           │
│    • Generate: transaction_id           │
└──────┬──────────────────────────────────┘
       │
       │ POST request
       ▼
┌─────────────────────────────────────────┐
│ 3. order-esim Edge Function             │
│    /functions/v1/order-esim             │
│                                         │
│    Request Body:                        │
│    {                                    │
│      package_code: "TH-7D-5GB",        │
│      quantity: 1,                       │
│      user_id: "uuid",                   │
│      transaction_id: "TXN123",         │
│      price: 15000                       │
│    }                                    │
└──────┬──────────────────────────────────┘
       │
       │ Call external API
       ▼
┌─────────────────────────────────────────┐
│ 4. eSIM Provider API                    │
│    POST /api/v1/open/esim/order         │
│                                         │
│    Response:                            │
│    {                                    │
│      success: true,                     │
│      obj: {                             │
│        orderNo: "ORD123",               │
│        esimList: [{                     │
│          esimTranNo: "ESM456",          │
│          iccid: "8944...",              │
│          qrCode: "data:image...",       │
│          lpa: "LPA:1$...",              │
│        }]                               │
│      }                                  │
│    }                                    │
└──────┬──────────────────────────────────┘
       │
       │ Save to database
       ▼
┌─────────────────────────────────────────┐
│ 5a. Insert into orders table            │
│                                         │
│     {                                   │
│       id: "auto-generated-uuid",        │
│       package_code: "TH-7D-5GB",       │
│       quantity: 1,                      │
│       user_id: "user-uuid",            │
│       order_data: {                     │
│         success: true,                  │
│         obj: { ... full response ... }  │
│       },                                │
│       status: "pending",                │
│       created_at: "2026-02-15..."       │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       │ Extract eSIM profiles
       ▼
┌─────────────────────────────────────────┐
│ 5b. Insert into esim_profiles table     │
│     (for each eSIM in esimList)         │
│                                         │
│     {                                   │
│       id: "auto-generated-uuid",        │
│       order_id: "order-uuid",          │
│       user_id: "user-uuid",            │
│       esim_tran_no: "ESM456",          │
│       iccid: "8944...",                │
│       package_code: "TH-7D-5GB",       │
│       qr_code: "data:image...",        │
│       lpa: "LPA:1$...",                │
│       status: "inactive",               │
│       created_at: "2026-02-15..."       │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       │ Return success
       ▼
┌─────────────────────────────────────────┐
│ 6. Show success to user                 │
│    • Display QR code                    │
│    • Show installation instructions     │
│    • Update UI                          │
└─────────────────────────────────────────┘
```

---

### Flow 2: Display My Order (Purchase History)

```
┌──────────────┐
│ 1. User      │
│    clicks    │
│   "My Order" │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 2. PurchaseHistory Component            │
│    /src/components/PurchaseHistory.tsx  │
└──────┬──────────────────────────────────┘
       │
       │ Query database
       ▼
┌─────────────────────────────────────────┐
│ 3. Supabase Query                       │
│                                         │
│    const { data } = await supabase      │
│      .from('orders')                    │
│      .select('*')                       │
│      .eq('user_id', currentUserId)      │
│      .order('created_at', { desc })     │
└──────┬──────────────────────────────────┘
       │
       │ RLS Policy Check
       │ (auth.uid() = user_id)
       ▼
┌─────────────────────────────────────────┐
│ 4. orders table returns data            │
│                                         │
│    [                                    │
│      {                                  │
│        id: "uuid-1",                    │
│        package_code: "TH-7D-5GB",      │
│        quantity: 1,                     │
│        order_data: {                    │
│          obj: {                         │
│            orderNo: "ORD123",           │
│            esimList: [...]              │
│          }                              │
│        },                               │
│        status: "completed",             │
│        created_at: "2026-02-10"         │
│      },                                 │
│      ...                                │
│    ]                                    │
└──────┬──────────────────────────────────┘
       │
       │ Transform data
       ▼
┌─────────────────────────────────────────┐
│ 5. Display in UI                        │
│                                         │
│    ┌──────────────────────────────┐    │
│    │ Thailand 7 Days      Active  │    │
│    │ 5GB Data                     │    │
│    │ 📅 Feb 10, 2026   15,000 MMK│    │
│    └──────────────────────────────┘    │
│                                         │
│    ┌──────────────────────────────┐    │
│    │ Vietnam 10 Days    Expired   │    │
│    │ 3GB Data                     │    │
│    │ 📅 Jan 25, 2026   12,000 MMK│    │
│    └──────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

### Flow 3: Display My Data (Usage)

```
┌──────────────┐
│ 1. User      │
│    clicks    │
│   "My Data"  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 2. MyData Component                     │
│    /src/components/MyData.tsx           │
└──────┬──────────────────────────────────┘
       │
       │ Step 1: Get eSIM profiles
       ▼
┌─────────────────────────────────────────┐
│ 3. Query esim_profiles table            │
│                                         │
│    const { data: profiles } =           │
│      await supabase                     │
│        .from('esim_profiles')           │
│        .select('*')                     │
│        .eq('user_id', currentUserId)    │
│        .in('status', ['active',         │
│                       'inactive'])      │
└──────┬──────────────────────────────────┘
       │
       │ RLS Policy Check
       │ (auth.uid() = user_id)
       ▼
┌─────────────────────────────────────────┐
│ 4. esim_profiles returns data           │
│                                         │
│    [                                    │
│      {                                  │
│        esim_tran_no: "ESM456",          │
│        iccid: "8944...",                │
│        package_code: "TH-7D-5GB",      │
│        country_name: "Thailand",        │
│        data_amount: "5GB",              │
│        status: "active"                 │
│      },                                 │
│      ...                                │
│    ]                                    │
└──────┬──────────────────────────────────┘
       │
       │ Step 2: Extract esim_tran_no
       ▼
┌─────────────────────────────────────────┐
│ 5. Prepare usage check request          │
│                                         │
│    const esimTranNoList =               │
│      profiles.map(p => p.esim_tran_no)  │
│                                         │
│    // ["ESM456", "ESM789", ...]         │
└──────┬──────────────────────────────────┘
       │
       │ Step 3: Call edge function
       ▼
┌─────────────────────────────────────────┐
│ 6. check-usage Edge Function            │
│    POST /functions/v1/check-usage       │
│                                         │
│    Body: {                              │
│      esimTranNoList: [                  │
│        "ESM456",                        │
│        "ESM789"                         │
│      ]                                  │
│    }                                    │
└──────┬──────────────────────────────────┘
       │
       │ Call external API
       ▼
┌─────────────────────────────────────────┐
│ 7. eSIM Provider API                    │
│    POST /api/v1/open/esim/usage/query   │
│                                         │
│    Response:                            │
│    {                                    │
│      success: true,                     │
│      data: [{                           │
│        esimTranNo: "ESM456",            │
│        totalDataBytes: 5368709120,      │
│        usedDataBytes: 2147483648,       │
│        remainingDataBytes: 3221225472,  │
│        status: "active"                 │
│      }]                                 │
│    }                                    │
└──────┬──────────────────────────────────┘
       │
       │ Return to component
       ▼
┌─────────────────────────────────────────┐
│ 8. Calculate display values             │
│                                         │
│    totalGB = 5368709120 / (1024³)       │
│           = 5.00 GB                     │
│                                         │
│    usedGB = 2147483648 / (1024³)        │
│          = 2.00 GB                      │
│                                         │
│    remainingGB = 3221225472 / (1024³)   │
│               = 3.00 GB                 │
│                                         │
│    percentage = (2.00 / 5.00) × 100     │
│              = 40%                      │
└──────┬──────────────────────────────────┘
       │
       │ Render UI
       ▼
┌─────────────────────────────────────────┐
│ 9. Display in UI                        │
│                                         │
│    ┌──────────────────────────────┐    │
│    │ Thailand 7 Days              │    │
│    │ ▓▓▓▓▓▓▓▓░░░░░░░ 40%          │    │
│    │ 2.00 GB used of 5.00 GB      │    │
│    │ 3.00 GB remaining            │    │
│    │ Expires: Feb 17, 2026        │    │
│    └──────────────────────────────┘    │
│                                         │
│    ┌──────────────────────────────┐    │
│    │ Vietnam 10 Days              │    │
│    │ ▓▓▓░░░░░░░░░░░░ 15%          │    │
│    │ 0.45 GB used of 3.00 GB      │    │
│    │ 2.55 GB remaining            │    │
│    │ Expires: Feb 25, 2026        │    │
│    └──────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## Table Relationships

```
┌──────────────────────┐
│       orders         │
│                      │
│ PK: id (uuid)        │
│     package_code     │
│     quantity         │
│     user_id          │
│     order_data       │◄──────┐
│     status           │       │
│     created_at       │       │
└──────────────────────┘       │
                               │
                               │ References
                               │
                               │
┌──────────────────────┐       │
│   esim_profiles      │       │
│                      │       │
│ PK: id (uuid)        │       │
│ FK: order_id         ├───────┘
│     user_id          │
│     esim_tran_no     │◄────────── Used for usage API
│     iccid            │◄────────── Used for profile API
│     package_code     │
│     country_name     │
│     data_amount      │
│     qr_code          │
│     lpa              │
│     status           │
│     created_at       │
└──────────────────────┘
```

---

## Data Transformation Examples

### From order_data JSONB to Display

```javascript
// Raw order_data from orders table
const orderData = {
  success: true,
  obj: {
    orderNo: "ORD20260215001",
    transactionId: "TXN123456",
    esimList: [
      {
        esimTranNo: "ESM789456123",
        iccid: "89441234567890123456",
        qrCode: "data:image/png;base64,iVBORw0KG...",
        lpa: "LPA:1$sm-dp-plus.example.com$MATCHING_ID",
        carrier: "Carrier Name",
        packageCode: "TH-7D-5GB"
      }
    ]
  }
};

// Transform for My Order display
const orderDisplay = {
  orderNumber: orderData.obj.orderNo,
  esimCount: orderData.obj.esimList.length,
  firstEsimIccid: orderData.obj.esimList[0].iccid,
  status: "completed"
};
```

### From Usage API to Progress Bar

```javascript
// Raw usage data from check-usage API
const usageData = {
  esimTranNo: "ESM789456123",
  totalDataBytes: 5368709120,      // 5 GB
  usedDataBytes: 2147483648,       // 2 GB
  remainingDataBytes: 3221225472,  // 3 GB
  status: "active"
};

// Transform for UI
const GB = 1024 ** 3;
const display = {
  totalGB: (usageData.totalDataBytes / GB).toFixed(2),        // "5.00"
  usedGB: (usageData.usedDataBytes / GB).toFixed(2),          // "2.00"
  remainingGB: (usageData.remainingDataBytes / GB).toFixed(2),// "3.00"
  percentage: ((usageData.usedDataBytes / usageData.totalDataBytes) * 100).toFixed(1), // "40.0"
  progressColor: usageData.usedDataBytes / usageData.totalDataBytes > 0.8
    ? "red"
    : "green"
};
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| `/functions/v1/order-esim` | POST | Create eSIM order | package_code, quantity, user_id | Order details + eSIM profiles |
| `/functions/v1/check-usage` | POST | Check data usage | esimTranNoList[] | Usage data for each eSIM |
| `/functions/v1/query-profiles` | POST | Query eSIM profiles | orderNo / iccid / esimTranNo | Profile details |
| `/functions/v1/get-packages` | POST | Get available packages | country_code | Package list |

---

## Key Points

1. **orders table** stores the complete purchase history with full API responses
2. **esim_profiles table** stores individual eSIM details for quick access
3. **My Order** queries the `orders` table filtered by `user_id`
4. **My Data** queries `esim_profiles` then calls `check-usage` edge function
5. **RLS policies** ensure users can only see their own data
6. **Edge functions** handle all external API communication securely
7. **JSONB fields** allow flexible storage of API responses without schema changes

---

## Next Steps

1. Create `esim_profiles` table in Supabase
2. Update `order-esim` edge function to populate both tables
3. Create `MyData.tsx` component
4. Update `PurchaseHistory.tsx` to use `orders` table
5. Test complete purchase → display flow
