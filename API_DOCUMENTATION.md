# AmpEdge API Documentation

## Base URL
`http://localhost:5000/api/v1`

## Authentication

### 1. Verify OTP & Login
**POST** `/auth/verify-otp`
Verifies a Firebase Phone Auth Token and provisions our custom JWT for session handling. Registers the user if they don't exist.

**Request Body:**
```json
{
  "idToken": "firebase_or_mock_token_string",
  "role": "CUSTOMER" // Or "TECHNICIAN" / "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": { }
}
```

### 2. Get Current User
**GET** `/auth/me`
Requires `Authorization: Bearer <token>`. Returns user profile.

---

## Users & Technicians

### 1. Update Technician Location
**PUT** `/users/location`
Updates the GPS coordinates for a technician.
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090
}
```

---

## Services

### 1. Get Services Catalog
**GET** `/services?category=REPAIR`
Returns available services, filtered by category (`REPAIR`, `INSTALLATION`, `EMERGENCY`, `COMMERCIAL`).

### 2. Create Service (Admin Only)
**POST** `/services`
**Headers:** `Authorization: Bearer <admin_token>`

---

## Bookings

### 1. Create Booking (Customer)
**POST** `/bookings`
Creates a brand new booking request in `PENDING` state.
**Headers:** `Authorization: Bearer <customer_token>`
**Request Body:**
```json
{
  "serviceId": "mongo_id",
  "scheduledTime": "2026-03-20T10:00:00Z",
  "serviceAddress": {
    "addressText": "123 Main St",
    "lat": 0,
    "lng": 0
  }
}
```

### 2. Get Bookings
**GET** `/bookings`
Context-aware: Returns Customer's bookings, or Available/Assigned jobs for a Technician, or All for Admin.

### 3. Update Booking Status (Technician/Admin)
**PUT** `/bookings/:id`
Accept, Reject, or Complete a job.
**Request Body:**
```json
{
  "status": "ACCEPTED" // Or "COMPLETED", "CANCELLED", "ON_THE_WAY"
}
```

---

## Payments (Razorpay)

### 1. Create Order
**POST** `/payments/create-order`
Creates a unique Razorpay tracking Order ID linked to a booking.
**Request Body:**
```json
{
  "bookingId": "mongo_booking_id"
}
```

### 2. Verify Payment
**POST** `/payments/verify`
Finalizes the checkout transaction using digital signatures.
**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_hex"
}
```
