# Coupon Management System

A comprehensive coupon management system for the AntiRomantic e-commerce platform, featuring admin management capabilities and customer checkout integration.

## Features

### Admin Features

- ✅ **Create Coupons** - Generate new discount coupons with various parameters
- ✅ **Edit Coupons** - Update existing coupon details
- ✅ **Delete Coupons** - Remove coupons from the system
- ✅ **Toggle Status** - Activate/deactivate coupons
- ✅ **Search & Filter** - Find coupons by code, description, or status
- ✅ **Pagination** - Handle large numbers of coupons efficiently

### Customer Features

- ✅ **Apply Coupons** - Enter coupon codes during checkout
- ✅ **Real-time Validation** - Instant feedback on coupon validity
- ✅ **Discount Calculation** - Automatic price adjustments
- ✅ **Order Summary** - Clear display of applied discounts

## Database Schema

### Coupon Model (`/src/models/Coupon.js`)

```javascript
{
  couponCode: String (unique, uppercase, 3-20 chars),
  discountType: "amount" | "percentage",
  discountValue: Number (positive, ≤100 for percentage),
  status: Boolean (default: true),
  startDate: Date,
  endDate: Date (must be after startDate),
  usageLimit: Number (optional),
  perUserLimit: Number (optional),
  usedCount: Number (default: 0),
  description: String (optional, ≤200 chars),
  timestamps: { createdAt, updatedAt }
}
```

### Validation Rules

- Coupon codes are automatically converted to uppercase
- Percentage discounts cannot exceed 100%
- End date must be after start date
- Usage limits must be positive integers

## API Endpoints

### Admin APIs (Protected - Admin Only)

#### `GET /api/admin/coupons`

Fetch all coupons with pagination and filtering

- Query params: `page`, `limit`, `search`, `status`
- Returns: Paginated coupon list

#### `POST /api/admin/coupons`

Create a new coupon

- Body: Coupon data (see schema above)
- Returns: Created coupon

#### `GET /api/admin/coupons/[id]`

Get single coupon by ID

- Returns: Coupon details

#### `PUT /api/admin/coupons/[id]`

Update existing coupon

- Body: Updated coupon data
- Returns: Updated coupon

#### `DELETE /api/admin/coupons/[id]`

Delete a coupon

- Returns: Success message

### Public APIs

#### `POST /api/coupons/validate`

Validate and calculate discount for a coupon

- Body: `{ couponCode, orderTotal, userId? }`
- Returns: Discount calculation or error

#### `GET /api/coupons/validate?code=SAVE10`

Get coupon details by code

- Returns: Limited coupon information

#### `POST /api/coupons/use`

Record coupon usage (called after order completion)

- Body: `{ couponId, userId?, orderId? }`
- Returns: Success confirmation

## Components

### Admin Components

#### `CouponsPage` (`/src/app/admin/coupons/page.js`)

Main admin interface for coupon management

- Features: CRUD operations, search, filter, pagination
- Real-time status updates
- Form validation

### Customer Components

#### `CouponInput` (`/src/components/checkout/CouponInput.jsx`)

Coupon input component for checkout

- Real-time validation
- Visual feedback for applied coupons
- Easy removal of applied coupons

#### `OrderSummary` (`/src/components/checkout/CouponInput.jsx`)

Order summary with discount display

- Itemized breakdown
- Discount line items
- Final total calculation

## Usage Examples

### 1. Admin - Create a Coupon

```javascript
// Navigate to /admin/coupons
// Click "Add Coupon"
// Fill form:
{
  couponCode: "SAVE20",
  discountType: "percentage",
  discountValue: 20,
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  usageLimit: 100,
  description: "20% off all items"
}
```

### 2. Customer - Apply Coupon

```javascript
// In checkout component
const [appliedCoupon, setAppliedCoupon] = useState(null);

return (
  <CouponInput
    orderTotal={199.99}
    onCouponApplied={setAppliedCoupon}
    onCouponRemoved={() => setAppliedCoupon(null)}
    appliedCoupon={appliedCoupon}
  />
);
```

### 3. Order Processing with Coupon

```javascript
// When order is completed
if (appliedCoupon) {
  await fetch("/api/coupons/use", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      couponId: appliedCoupon.coupon.id,
      userId: user.id,
      orderId: order.id,
    }),
  });
}
```

## Integration Guide

### 1. Admin Setup

1. Admin can access coupon management at `/admin/coupons`
2. The sidebar includes a "Coupons" navigation item
3. Full CRUD operations available

### 2. Checkout Integration

```javascript
import CouponInput, { OrderSummary } from "@/components/checkout/CouponInput";

// In your checkout component
const [appliedCoupon, setAppliedCoupon] = useState(null);

// Include in your checkout form
<CouponInput
  orderTotal={orderTotal}
  onCouponApplied={setAppliedCoupon}
  onCouponRemoved={() => setAppliedCoupon(null)}
  appliedCoupon={appliedCoupon}
  userId={currentUser?.id}
/>

// Include in order summary
<OrderSummary
  items={cartItems}
  appliedCoupon={appliedCoupon}
  shipping={shipping}
  tax={tax}
/>
```

### 3. Order Completion

After successful order creation, record coupon usage:

```javascript
if (appliedCoupon) {
  await fetch("/api/coupons/use", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      couponId: appliedCoupon.coupon.id,
      userId: user.id,
      orderId: newOrder.id,
    }),
  });
}
```

## Security Features

- **Admin-only access** to coupon management APIs
- **Input validation** on all coupon data
- **Duplicate prevention** for coupon codes
- **Usage tracking** to prevent over-use
- **Date validation** to prevent invalid periods

## Error Handling

The system provides clear error messages for common scenarios:

- Invalid coupon codes
- Expired coupons
- Usage limits exceeded
- Invalid discount values
- Date validation errors

## Test Page

A test checkout page is available at `/checkout-test` to demonstrate the coupon functionality in action.

## Future Enhancements

Potential improvements that could be added:

- Per-user usage tracking with a separate CouponUsage model
- Category-specific coupons
- Minimum order value requirements
- First-time customer coupons
- Bulk coupon generation
- Analytics and reporting
- Email integration for coupon distribution

## Dependencies

- Next.js 15
- MongoDB with Mongoose
- React Hook Form (for admin forms)
- shadcn/ui components
- react-hot-toast for notifications
