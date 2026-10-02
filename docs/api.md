# HEAT - API Reference

- **Base URL (Local):** `http://localhost:3000/api/v1`
- **Base URL (Live):** `https://heat.metesirin.dev/api/v1`
- **Content-Type:** `application/json` (for all POST / PATCH requests)
- **CORS:** Configured for frontend with `credentials: true`

---

## Authentication & Headers

Protected routes use the `protect` middleware. They require a valid JWT via one of two methods:
1. **Cookie (Default/Recommended):** `access_token` (HTTP-only cookie set automatically on login/signup/password change, valid for 7 days).
2. **Authorization Header:** `Authorization: Bearer <jwt_token>`

---

## Global Response & Error Formats

### Validation Errors (`400 Bad Request`)
```json
{
  "status": "error",
  "message": "Validation error.",
  "errors": [
    {
      "field": "passwordConfirm",
      "message": "Passwords don't match."
    }
  ]
}
```

### Duplicate Entry (`409 Conflict`)
```json
{
  "status": "error",
  "message": "The provided value already exists in the database."
}
```

### Rate Limiting (`429 Too Many Requests`)
- Auth Limiter: 50 requests per 15 minutes.
- Mail Limiter: 10 email requests per 60 minutes.
```json
{
  "status": "error",
  "message": "Too many requests, please try again later."
}
```

### Unauthorized (`401 Unauthorized`)
```json
{
  "status": "error",
  "message": "No JWT provided."
}
```

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### 1.1 Sign Up
* **Address:** `POST /api/v1/auth/signup`
* **Access:** Public (Rate limited: 50 req / 15 min)
* **Request Body:**
  ```json
  {
    "fullName": "Mete Şirin",           // String, 1–100 chars (Required)
    "email": "user@example.com",        // Valid email (Required)
    "password": "Password123!",         // String, 8–64 chars (Required)
    "passwordConfirm": "Password123!",  // Must match password (Required)
    "timeZone": "Europe/Istanbul"       // IANA timezone string (Optional, default: "Europe/Istanbul")
  }
  ```
* **Returns:**
  * `201 Created`
    ```json
    {
      "status": "success",
      "data": {
        "id": 1,
        "fullName": "Mete Şirin",
        "email": "user@example.com"
      },
      "warning": "Optional warning if verification email failed to send"
    }
    ```
  * `400 Bad Request`: Validation failure.
  * `409 Conflict`: Email already exists.

---

### 1.2 Login
* **Address:** `POST /api/v1/auth/login`
* **Access:** Public (Rate limited: 50 req / 15 min)
* **Request Body:**
  ```json
  {
    "email": "user@example.com", // Valid email (Required)
    "password": "Password123!"   // String, 8–64 chars (Required)
  }
  ```
* **Response Headers:** Sets `Set-Cookie: access_token=<jwt>; HttpOnly; Path=/; Max-Age=604800`
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "id": 1,
        "fullName": "Mete Şirin",
        "email": "user@example.com"
      }
    }
    ```
  * `400 Bad Request`: "Email is not verified."
  * `401 Unauthorized`: "Incorrect credentials."

---

### 1.3 Sign Out
* **Address:** `POST /api/v1/auth/signout`
* **Access:** Public / Authenticated (Clears cookie regardless)
* **Response Headers:** Clears cookie `access_token`
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "User signout successful."
    }
    ```

---

### 1.4 Get Current User Profile
* **Address:** `GET /api/v1/auth/me`
* **Access:** Protected
* **Expects:** `access_token` cookie or Bearer token
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "id": 1,
        "fullName": "Mete Şirin",
        "email": "user@example.com",
        "balance": 1250.50,
        "budget": 3000.00,
        "isVerified": true,
        "createdAt": "2026-09-04 18:13",
        "time_zone": "Europe/Istanbul"
      }
    }
    ```

---

### 1.5 Update User Information
* **Address:** `PATCH /api/v1/auth/updateuser`
* **Access:** Protected
* **Request Body (at least one required):**
  ```json
  {
    "fullName": "New Name",      // Optional, 1–100 chars
    "timeZone": "America/New_York", // Optional, valid IANA timezone
    "budget": 4500.00            // Optional, positive number
  }
  ```
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "id": 1,
          "fullName": "New Name",
          "budget": 4500.00
        }
      }
    }
    ```
  * `400 Bad Request`: "At least one field value must be provided."

---

### 1.6 Change Password
* **Address:** `POST /api/v1/auth/changepassword`
* **Access:** Protected
* **Request Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "newPasswordConfirm": "NewPassword123!"
  }
  ```
* **Returns:**
  * `200 OK` (Refreshes `access_token` cookie)
    ```json
    {
      "status": "success",
      "message": "Password updated successfully."
    }
    ```
  * `400 Bad Request`: Missing fields or passwords do not match.
  * `401 Unauthorized`: "Incorrect current password."

---

### 1.7 Verify Email
* **Address:** `GET /api/v1/auth/verifymail?token=<verification_token>`
* **Access:** Public (Rate limited: 50 req / 15 min)
* **Query Parameters:**
  * `token`: 64-character raw hex token from email link
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "Email has been successfully verified."
    }
    ```
  * `400 Bad Request`: "Invalid or already used verification link."

---

### 1.8 Resend Email Verification
* **Address:** `POST /api/v1/auth/resendmail`
* **Access:** Public (Rate limited: 10 emails / 60 min)
* **Request Body:** (or Query `?email=...`)
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "If an account with this email exists and is not yet verified, a verification email has been sent."
    }
    ```

---

### 1.9 Request Password Reset Email
* **Address:** `POST /api/v1/auth/resetpassword`
* **Access:** Public (Rate limited: 10 emails / 60 min)
* **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "If an account with this email exists, a password reset email has been sent."
    }
    ```

---

### 1.10 Reset Password with Token
* **Address:** `PATCH /api/v1/auth/resetpassword?token=<reset_token>`
* **Access:** Public (Rate limited: 50 req / 15 min)
* **Query Parameters:**
  * `token`: Raw reset token from the email link
* **Request Body:**
  ```json
  {
    "password": "BrandNewPassword123!",
    "passwordConfirm": "BrandNewPassword123!"
  }
  ```
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "Account password has been succesfully changed."
    }
    ```

---

## 2. Spendings Endpoints (`/api/v1/spendings`)

*All Spendings routes are **Protected**.*

### 2.1 Get Spendings List
* **Address:** `GET /api/v1/spendings`
* **Query Parameters (all optional):**
  * `spending_category`: Filter by category (e.g. `Groceries`)
  * `payment_method`: Filter by method: `cash` | `creditCard` | `qr` | `debitCard`
  * `amount_gte`: Minimum amount
  * `amount_lte`: Maximum amount
  * `start_date`: `YYYY-MM-DD`
  * `end_date`: `YYYY-MM-DD`
  * `sort`: `amount` | `created_at` | `spending_category` (Default: `created_at`)
  * `sort_order`: `asc` | `desc` (Default: `desc`)
  * `page`: Integer $\ge 1$ (Default: `1`)
  * `limit`: Integer between $1$ and $100$ (Default: `20`)
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "spendings": [
          {
            "id": 14,
            "user_id": 1,
            "spending_name": "Grocery Store",
            "spending_category": "Food",
            "amount": 84.50,
            "payment_method": "creditCard",
            "created_at": "2026-09-20 14:30"
          }
        ]
      },
      "pagination": {
        "totalCount": 42,
        "pageSize": 20,
        "currentPage": 1,
        "totalPages": 3,
        "hasNextPage": true,
        "hasPrevPage": false
      }
    }
    ```

---

### 2.2 Create Spending
* **Address:** `POST /api/v1/spendings`
* **Side Effect:** Automatically adds `amount` to user's `balance`.
* **Request Body:**
  ```json
  {
    "spendingName": "Dinner with friends", // String, min 1 char (Required)
    "amount": 65.00,                      // Positive number (Required)
    "spendingCategory": "Restaurants",    // String (Optional, default: "Generic")
    "paymentMethod": "creditCard"         // "cash" | "creditCard" | "qr" | "debitCard" (Optional, default: "cash")
  }
  ```
* **Returns:**
  * `201 Created`
    ```json
    {
      "status": "success",
      "message": "Spending successfully added",
      "data": {
        "spending": {
          "id": 15,
          "spendingName": "Dinner with friends",
          "spendingCategory": "Restaurants",
          "amount": 65.00,
          "paymentMethod": "creditCard"
        },
        "userBalance": 1315.50
      }
    }
    ```

---

### 2.3 Update Spending
* **Address:** `PATCH /api/v1/spendings/:id`
* **URL Param:** `:id` (Positive integer ID)
* **Special Rule:** If `amount` is updated, **`currentAmount`** must also be provided in the payload to calculate the balance difference.
* **Design Decision:** In this single-user personal budget tracker, accepting previous state from the client is an intentional performance optimization to compute the balance delta without requiring an extra blocking `SELECT ... FOR UPDATE` database lock. Each user's data is isolated; see [Architectural Trade-offs](../README.md#1-client-assisted-balance-deltas).
* **Request Body (at least one field):**
  ```json
  {
    "spendingName": "Updated Name",       // Optional
    "spendingCategory": "Updated Cat",    // Optional
    "paymentMethod": "debitCard",         // Optional
    "amount": 50.00,                      // Optional (requires currentAmount)
    "currentAmount": 65.00                // Required if amount is provided
  }
  ```
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "Spending successfully updated",
      "data": {
        "spending": {
          "id": 15,
          "spendingName": "Updated Name",
          "amount": 50.00
        },
        "userBalance": 1300.50
      }
    }
    ```

---

### 2.4 Delete Spending
* **Address:** `DELETE /api/v1/spendings/:id`
* **URL Param:** `:id` (Positive integer ID)
* **Side Effect:** Decreases user's `balance` by the deleted spending's amount.
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "Spending successfully deleted",
      "data": {
        "spendingId": 15,
        "userBalance": 1250.50
      }
    }
    ```

---

## 3. Subscriptions Endpoints (`/api/v1/subscriptions`)

*All Subscriptions routes are **Protected**.*

### 3.1 Get Subscriptions List
* **Address:** `GET /api/v1/subscriptions`
* **Query Parameters (all optional):**
  * `subscription_category`: Filter by category
  * `amount_gte`: Minimum amount
  * `amount_lte`: Maximum amount
  * `sort`: `subscription_category` | `amount` | `start_date` (Default: `amount`)
  * `sort_order`: `asc` | `desc` (Default: `desc`)
  * `page`: Integer $\ge 1$ (Default: `1`)
  * `limit`: Integer between $1$ and $100$ (Default: `20`)
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "subscriptions": [
          {
            "id": 4,
            "user_id": 1,
            "subscription_name": "Spotify",
            "subscription_category": "Entertainment",
            "amount": 10.99,
            "length": 30,
            "start_date": "2026-09-01",
            "next_billing_date": "2026-10-01",
            "created_at": "2026-09-01 10:00"
          }
        ]
      },
      "pagination": {
        "totalCount": 3,
        "pageSize": 20,
        "currentPage": 1,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
    ```

---

### 3.2 Create Subscription
* **Address:** `POST /api/v1/subscriptions`
* **Side Effect:** If `startDate` $\le$ today in user's timezone, adds `amount` to user `balance`. Calculates `next_billing_date = startDate + length (days)`.
* **Request Body:**
  ```json
  {
    "subscriptionName": "Netflix",     // String (Required)
    "amount": 19.99,                  // Positive number (Required)
    "length": 30,                     // Positive integer cycle in days (Required)
    "startDate": "2026-09-23",        // ISO Date YYYY-MM-DD (Required)
    "subscriptionCategory": "Streaming" // String (Optional, default: "generic")
  }
  ```
* **Returns:**
  * `201 Created`
    ```json
    {
      "status": "success",
      "message": "Subscription successfully added",
      "data": {
        "subscription": {
          "id": 5,
          "subscriptionName": "Netflix",
          "subscriptionCategory": "Streaming",
          "amount": 19.99,
          "startDate": "2026-09-23",
          "length": 30,
          "nextBillingDateValue": "2026-10-23"
        },
        "userBalance": 1270.49
      }
    }
    ```

---

### 3.3 Update Subscription
* **Address:** `PATCH /api/v1/subscriptions/:id`
* **URL Param:** `:id` (Positive integer ID)
* **Special Rule:** If `amount` is updated, **`currentAmount`** must also be provided.
* **Design Decision:** In this single-user personal budget tracker, accepting previous state from the client is an intentional performance optimization to compute the balance delta without requiring an extra blocking `SELECT ... FOR UPDATE` database lock. Each user's data is isolated; see [Architectural Trade-offs](../README.md#1-client-assisted-balance-deltas).
* **Request Body (at least one field):**
  ```json
  {
    "subscriptionName": "Updated Name",    // Optional
    "subscriptionCategory": "Updated Cat", // Optional
    "length": 30,                          // Optional
    "amount": 15.99,                       // Optional (requires currentAmount)
    "currentAmount": 19.99                 // Required if amount is provided
  }
  ```
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "Subscription successfully updated",
      "data": {
        "subscription": {
          "id": 5,
          "subscriptionName": "Updated Name",
          "amount": 15.99
        },
        "userBalance": 1266.49
      }
    }
    ```

---

### 3.4 Delete Subscription
* **Address:** `DELETE /api/v1/subscriptions/:id`
* **URL Param:** `:id` (Positive integer ID)
* **Side Effect:** Decreases user's `balance` by the subscription's amount.
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "message": "Subscription successfully deleted",
      "data": {
        "subscriptionId": 5,
        "userBalance": 1250.50
      }
    }
    ```

---

## 4. Summary Endpoint (`/api/v1/summary`)

*All Summary routes are **Protected**.*

### 4.1 Get Dashboard / Monthly Summary
* **Address:** `GET /api/v1/summary`
* **Access:** Protected
* **Description:** Retrieves the user's budget and balance, current month's spendings (filtered by user's timezone month boundaries), and all subscriptions ordered by amount descending.
* **Returns:**
  * `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "full_name": "Mete Şirin",
          "budget": 3000.00,
          "balance": 1250.50
        },
        "spendings": [
          {
            "id": 14,
            "spending_name": "Grocery Store",
            "spending_category": "Food",
            "amount": 84.50,
            "payment_method": "creditCard",
            "created_at": "2026-09-20 14:30"
          }
        ],
        "subscriptions": [
          {
            "id": 4,
            "subscription_name": "Spotify",
            "subscription_category": "Entertainment",
            "amount": 10.99,
            "next_billing_date": "2026-10-01"
          }
        ]
      }
    }
    ```

---

## 5. Health Endpoints (`/api/v1/health`)

*Public server monitoring endpoints.*

### 5.1 Liveness Probe
* **Address:** `GET /api/v1/health/liveness`
* **Returns:** `200 OK` `{"status": "ok"}`

### 5.2 Readiness Probe (Database Check)
* **Address:** `GET /api/v1/health/readiness`
* **Description:** Executes `SELECT 1` against the MySQL database.
* **Returns:** `200 OK` `{"status": "ok"}`

---

## Other Docs

- ⚙️ [**Root README (Project Overview)**](../README.md)
- 🛠️ [**Backend & VPS Setup Deep-Dive**](../server/README.md)
- 💻 [**Frontend README**](../client/README.md)
