# Simless eSIM API Guideline for Frontend

## Base URL
All API endpoints are prefixed with:
```
http://your-domain.com/api/v1
```

## Authentication

Most endpoints require authentication using a Bearer token.

### How to Authenticate
1. Login to get an access token
2. Include the token in the Authorization header for authenticated requests:
   ```
   Authorization: Bearer {your-access-token}
   ```

---

## 1. Authentication Endpoints

### Register a New Customer
**Endpoint:** `POST /auth/register`
**Authentication:** No
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword123",
  "password_confirmation": "securepassword123"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Please login to continue.",
  "customer": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "created_at": "2026-06-11T00:00:00Z",
    "updated_at": "2026-06-11T00:00:00Z"
  }
}
```

---

### Login
**Endpoint:** `POST /auth/login`
**Authentication:** No
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "customer": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "created_at": "2026-06-11T00:00:00Z",
    "updated_at": "2026-06-11T00:00:00Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_at": "2026-06-12T00:00:00Z"
}
```

---

### Get Authenticated Customer
**Endpoint:** `GET /auth/me`
**Authentication:** Yes
**Response (200):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "created_at": "2026-06-11T00:00:00Z",
  "updated_at": "2026-06-11T00:00:00Z",
  "addresses": [],
  "orders": []
}
```

---

### Logout
**Endpoint:** `POST /auth/logout`
**Authentication:** Yes
**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Product Endpoints

### List Products
**Endpoint:** `GET /products`
**Authentication:** No
**Query Parameters:**
- `region` (optional): Filter by region slug
- `search` (optional): Search products by name
- `per_page` (optional, default: 12): Number of products per page

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Thailand 4G eSIM",
      "slug": "thailand-4g-esim",
      "status": "published",
      "description": "High-speed data for Thailand",
      "variations_count": 5,
      "regions": [
        {
          "id": 1,
          "name": "Thailand",
          "slug": "thailand"
        }
      ],
      "operators": [
        {
          "id": 1,
          "name": "AIS"
        }
      ]
    }
  ],
  "links": {
    "first": "http://your-domain.com/api/v1/products?page=1",
    "last": "http://your-domain.com/api/v1/products?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 12,
    "to": 1,
    "total": 1
  }
}
```

---

### Get Single Product
**Endpoint:** `GET /products/{product}`
**Authentication:** No
**Path Parameters:**
- `product`: Product slug or ID

**Response (200):**
```json
{
  "id": 1,
  "name": "Thailand 4G eSIM",
  "slug": "thailand-4g-esim",
  "status": "published",
  "description": "High-speed data for Thailand",
  "variations": [
    {
      "id": 1,
      "product_id": 1,
      "sku": "TH-4G-10GB-7DAYS",
      "product_code": "BC-12345",
      "plan_type": "fixed",
      "data_plan": "10GB",
      "days": 7,
      "price": 1500,
      "is_active": true,
      "sort_order": 1
    }
  ],
  "regions": [
    {
      "id": 1,
      "name": "Thailand",
      "slug": "thailand"
    }
  ],
  "operators": [
    {
      "id": 1,
      "name": "AIS"
    }
  ]
}
```

---


### Find Product Variation Combination
**Endpoint:** `POST /products/{product}/combination`
**Authentication:** No
**Path Parameters:**
- `product`: Product ID or slug

**Request Body:**
```json
{
  "plan_type": "fixed",
  "data_plan": "10GB",
  "days": 7
}
```

**Response (200):**
```json
{
  "variation": {
    "id": 1,
    "product_id": 1,
    "sku": "TH-4G-10GB-7DAYS",
    "product_code": "BC-12345",
    "plan_type": "fixed",
    "data_plan": "10GB",
    "days": 7,
    "price": 1500,
    "is_active": true
  },
  "effective_price": 1500
}
```

---

## 3. Cart Endpoints

### Get Cart
**Endpoint:** `GET /cart`
**Authentication:** Yes (or use X-Cart-Token header for guests)
**Headers:**
- `X-Cart-Token` (optional): Cart token for guest checkouts

**Response (200):**
```json
{
  "id": 1,
  "token": "abc123def456",
  "items": [
    {
      "id": 1,
      "product_variation_id": 1,
      "quantity": 1,
      "product_variation": {
        "id": 1,
        "sku": "TH-4G-10GB-7DAYS",
        "price": 1500
      }
    }
  ],
  "total": 1500
}
```

---

### Add Item to Cart
**Endpoint:** `POST /cart/add`
**Authentication:** Yes (or use X-Cart-Token header for guests)
**Headers:**
- `X-Cart-Token` (optional): Cart token for guest checkouts

**Request Body:**
```json
{
  "variation_id": 1,
  "quantity": 1
}
```

**Response (200):**
```json
{
  "id": 1,
  "token": "abc123def456",
  "items": [
    {
      "id": 1,
      "product_variation_id": 1,
      "quantity": 1,
      "product_variation": {
        "id": 1,
        "sku": "TH-4G-10GB-7DAYS",
        "price": 1500
      }
    }
  ],
  "total": 1500
}
```

---

### Update Cart Item Quantity
**Endpoint:** `PUT /cart/items/{cartItem}`
**Authentication:** Yes
**Path Parameters:**
- `cartItem`: Cart item ID

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response (200):**
```json
{
  "id": 1,
  "token": "abc123def456",
  "items": [
    {
      "id": 1,
      "product_variation_id": 1,
      "quantity": 2,
      "product_variation": {
        "id": 1,
        "sku": "TH-4G-10GB-7DAYS",
        "price": 1500
      }
    }
  ],
  "total": 3000
}
```

---

### Remove Item from Cart
**Endpoint:** `DELETE /cart/items/{cartItem}`
**Authentication:** Yes
**Path Parameters:**
- `cartItem`: Cart item ID

**Response (200):**
```json
{
  "id": 1,
  "token": "abc123def456",
  "items": [],
  "total": 0
}
```

---

### Clear Cart
**Endpoint:** `POST /cart/clear`
**Authentication:** Yes (or use X-Cart-Token header for guests)
**Headers:**
- `X-Cart-Token` (optional): Cart token for guest checkouts

**Response (200):**
```json
{
  "id": 1,
  "token": "abc123def456",
  "items": [],
  "total": 0
}
```

---

## 4. Order Endpoints

### Checkout (Create Order)
**Endpoint:** `POST /checkout`
**Authentication:** Yes
**Request Body:**
```json
{
  "items": [
    {
      "variation_id": 1,
      "quantity": 1
    }
  ],
  "billing": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address_line_1": "123 Main St",
    "address_line_2": "Apt 4B",
    "city": "Bangkok",
    "state": "Bangkok",
    "postcode": "10110",
    "country": "Thailand"
  },
  "payment_method": "ayapay_push",
  "customer_phone": "+1234567890"
}
```

**Payment Methods:**
- `ayapay_push`: Aya Pay Push Payment (requires `customer_phone`)
- `ayapay_qr`: Aya Pay QR Payment

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "order_number": "ORD-ABC123DEF",
    "status": "pending",
    "currency": "MMK",
    "subtotal": 1500,
    "tax_total": 0,
    "discount_total": 0,
    "total": 1500,
    "payment_method": "ayapay_push",
    "payment_method_title": "ayapay_push",
    "customer_email": "john@example.com",
    "placed_at": "2026-06-11T00:00:00Z",
    "items": [
      {
        "id": 1,
        "product_variation_id": 1,
        "quantity": 1,
        "name": "Thailand 4G eSIM",
        "sku": "TH-4G-10GB-7DAYS",
        "unit_price": 1500,
        "subtotal": 1500,
        "total": 1500
      }
    ],
    "addresses": [
      {
        "type": "billing",
        "first_name": "John",
        "last_name": "Doe",
        "address_line_1": "123 Main St",
        "city": "Bangkok",
        "country": "Thailand",
        "phone": "+1234567890",
        "email": "john@example.com"
      }
    ]
  },
  "payment": {
    "success": true,
    "reference": "AYA-PAY-REF-12345",
    "qr_data": null,
    "deeplink": "ayapay://mLink/screen=DynamicConfirm?requestedId=AYA-PAY-REF-12345"
  }
}
```

---

### List Customer Orders
**Endpoint:** `GET /orders`
**Authentication:** Yes
**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional, default: 10): Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "ORD-ABC123DEF",
      "status": "processing",
      "currency": "MMK",
      "subtotal": 1500,
      "tax_total": 0,
      "discount_total": 0,
      "total": 1500,
      "payment_method": "ayapay_push",
      "customer_email": "john@example.com",
      "placed_at": "2026-06-11T00:00:00Z",
      "has_esim": false
    }
  ],
  "links": {
    "first": "http://your-domain.com/api/v1/orders?page=1",
    "last": "http://your-domain.com/api/v1/orders?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 10,
    "to": 1,
    "total": 1
  }
}
```

---

### Get Single Order
**Endpoint:** `GET /orders/{order}`
**Authentication:** Yes
**Path Parameters:**
- `order`: Order ID

**Response (200):**
```json
{
  "id": 1,
  "order_number": "ORD-ABC123DEF",
  "status": "completed",
  "currency": "MMK",
  "subtotal": 1500,
  "tax_total": 0,
  "discount_total": 0,
  "total": 1500,
  "payment_method": "ayapay_push",
  "customer_email": "john@example.com",
  "placed_at": "2026-06-11T00:00:00Z",
  "completed_at": "2026-06-11T00:10:00Z",
  "items": [
    {
      "id": 1,
      "product_variation_id": 1,
      "quantity": 1,
      "name": "Thailand 4G eSIM",
      "sku": "TH-4G-10GB-7DAYS",
      "unit_price": 1500,
      "subtotal": 1500,
      "total": 1500,
      "product_variation": {
        "id": 1,
        "sku": "TH-4G-10GB-7DAYS"
      }
    }
  ],
  "addresses": [
    {
      "type": "billing",
      "first_name": "John",
      "last_name": "Doe",
      "address_line_1": "123 Main St",
      "city": "Bangkok",
      "country": "Thailand",
      "phone": "+1234567890",
      "email": "john@example.com"
    }
  ],
  "has_esim": true,
  "esim_iccid": "8986001234567890123",
  "esim_activation_code": "LPA:1$smdp.example.com$ABC123DEF456",
  "esim_qr_code_url": "https://example.com/qr/ABC123DEF.png",
  "esim_smdp_address": "smdp.example.com",
  "esim_auth_code": "ABC123DEF456"
}
```

---

### Check Order Payment Status
**Endpoint:** `GET /orders/{order}/payment-status`
**Authentication:** Yes
**Path Parameters:**
- `order`: Order ID

**Response (200):**
```json
{
  "order": {
    "id": 1,
    "order_number": "ORD-ABC123DEF",
    "status": "processing",
    "total": 1500,
    "has_esim": false
  },
  "payment_status": "paid"
}
```

---

## 5. Content Endpoints

### Get Terms and Conditions
**Endpoint:** `GET /terms`
**Authentication:** No
**Response (200):**
```json
{
  "id": 1,
  "title": "Terms and Conditions",
  "content": "Your terms and conditions content here...",
  "is_active": true,
  "published_at": "2026-06-01T00:00:00Z"
}
```

---

### Get Privacy Policy
**Endpoint:** `GET /privacy`
**Authentication:** No
**Response (200):**
```json
{
  "id": 1,
  "title": "Privacy Policy",
  "content": "Your privacy policy content here...",
  "is_active": true,
  "published_at": "2026-06-01T00:00:00Z"
}
```

---

### Get FAQs
**Endpoint:** `GET /faqs`
**Authentication:** No
**Query Parameters:**
- `type` (optional): Filter by FAQ type

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "question": "How do I activate my eSIM?",
      "answer": "Follow the instructions in your email...",
      "type": "general",
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

---

## Order Statuses
- `pending`: Order created, waiting for payment
- `processing`: Payment successful, eSIM order sent to Billion Connect
- `completed`: eSIM data received and ready
- `cancelled`: Order cancelled
- `refunded`: Order refunded
- `failed`: Payment or order failed

---

## Payment Statuses
- `pending`: Payment pending
- `paid`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded
- `cancelled`: Payment cancelled

---

## Error Handling
All error responses will include an error message:

**Example Error Response (500):**
```json
{
  "error": "Something went wrong. Please try again."
}
```

**Example Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field is required."
    ]
  }
}
```

---

## Webhooks (For Backend Only)
The backend handles webhooks from:
- **Aya Pay**: Payment status updates
- **Billion Connect**: eSIM order status and QR code data

Frontend does not need to handle these directly - just poll the order status endpoint or listen for real-time updates if available.

---

## Recommended Frontend Flow
1. Browse and select products
2. Add items to cart
3. Register/login (optional but recommended)
4. Proceed to checkout
5. Fill in billing details
6. Select payment method
7. Complete payment (use deeplink for Aya Pay Push or display QR code)
8. Poll order status or wait for completion
9. View and activate eSIM once order is completed
