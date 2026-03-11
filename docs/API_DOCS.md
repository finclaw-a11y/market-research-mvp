# API Documentation

## Base URL

```
http://localhost:8000
# Production: https://api.market-research.example.com
```

## Authentication

All endpoints (except `/health` and `/`) require Bearer token authentication:

```
Authorization: Bearer {JWT_TOKEN}
```

Token is obtained from Supabase Auth after login.

## Response Format

All responses are JSON format:

### Success (2xx)
```json
{
  "id": "123",
  "name": "example",
  "status": "active",
  ...
}
```

### Error (4xx/5xx)
```json
{
  "detail": "Error message"
}
```

---

## User Endpoints

### Signup

Create a new user after Supabase signup.

**Endpoint:** `POST /api/users/signup`

**Request Body:**
```json
{
  "user_id": "string (UUID)",
  "email": "string (email)",
  "full_name": "string (optional)"
}
```

**Response:** User object with subscription_status

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "subscription_status": "free",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Get Profile

Get user profile information.

**Endpoint:** `GET /api/users/profile/{user_id}`

**Response:** User object

### Update Profile

Update user profile.

**Endpoint:** `PUT /api/users/profile/{user_id}`

**Request Body:**
```json
{
  "full_name": "string (optional)"
}
```

**Response:** Updated user object

### Create Subscription

Create subscription with 7-day free trial.

**Endpoint:** `POST /api/users/subscription/create/{user_id}`

**Response:**
```json
{
  "message": "Subscription created with 7-day free trial",
  "subscription": {
    "subscription_id": "string",
    "status": "trial",
    "trial_end": 1234567890,
    "current_period_end": 1234567890
  }
}
```

### Get Subscription

Get user subscription status.

**Endpoint:** `GET /api/users/subscription/{user_id}`

**Response:**
```json
{
  "status": "free|trial|active|cancelled",
  "subscription_id": "string",
  "trial_end": 1234567890,
  "current_period_end": 1234567890,
  "cancel_at": 1234567890
}
```

### Get Billing Portal

Get Stripe customer portal URL.

**Endpoint:** `GET /api/users/billing-portal/{user_id}`

**Response:**
```json
{
  "portal_url": "https://billing.stripe.com/..."
}
```

---

## Upload Endpoints

### Upload CSV

Upload and process a CSV file.

**Endpoint:** `POST /api/uploads/csv/{user_id}`

**Request:** Multipart form-data

```
file: File (CSV, max 50MB)
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "filename": "data.csv",
  "status": "completed",
  "row_count": 1000,
  "columns": ["name", "email", "age"],
  "preview": {
    "columns": ["name", "email", "age"],
    "data": [...],
    "row_count": 1000,
    "column_count": 3
  },
  "message": "File uploaded successfully"
}
```

### List Uploads

Get list of user uploads.

**Endpoint:** `GET /api/uploads/list/{user_id}`

**Query Parameters:**
- `skip` (optional, default: 0) - Offset for pagination
- `limit` (optional, default: 10) - Number of results

**Response:**
```json
{
  "uploads": [
    {
      "id": "string",
      "filename": "string",
      "status": "string",
      "row_count": 1000,
      "columns": ["col1", "col2"],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 25
}
```

### Get Upload Detail

Get detailed information about an upload.

**Endpoint:** `GET /api/uploads/detail/{upload_id}`

**Response:**
```json
{
  "id": "string",
  "filename": "string",
  "status": "string",
  "row_count": 1000,
  "columns": ["col1", "col2"],
  "created_at": "2024-01-15T10:30:00Z",
  "preview": {...},
  "statistics": {
    "total_rows": 1000,
    "total_columns": 2,
    "columns": ["col1", "col2"],
    "dtypes": {...},
    "missing_values": {...}
  }
}
```

### Delete Upload

Delete an upload and associated data.

**Endpoint:** `DELETE /api/uploads/delete/{upload_id}`

**Query Parameters:**
- `user_id` (required) - User ID for authorization

**Response:**
```json
{
  "message": "Upload deleted"
}
```

---

## Insights Endpoints

### Generate Insights

Generate AI insights for an uploaded dataset.

**Endpoint:** `POST /api/insights/generate/{upload_id}`

**Request Body:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "message": "Insights generated successfully",
  "insights": {
    "summary": "Dataset contains...",
    "key_findings": [
      "Finding 1",
      "Finding 2"
    ],
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2"
    ],
    "trends": ["Trend 1"],
    "opportunities": ["Opportunity 1"],
    "api_tokens_used": 450,
    "api_cost": 0.0032
  }
}
```

### Get Insight Detail

Get detailed information about insights.

**Endpoint:** `GET /api/insights/detail/{insight_id}`

**Response:**
```json
{
  "id": "string",
  "upload_id": "string",
  "summary": "string",
  "key_findings": [...],
  "recommendations": [...],
  "api_tokens_used": 450,
  "api_cost": 0.0032,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

### Get Insights by Upload

List all insights for a specific upload.

**Endpoint:** `GET /api/insights/by-upload/{upload_id}`

**Query Parameters:**
- `user_id` (required) - User ID for authorization

**Response:**
```json
{
  "upload_id": "string",
  "insights": [...],
  "total": 3
}
```

### Export Insights

Export insights in JSON or CSV format.

**Endpoint:** `POST /api/insights/export/{insight_id}`

**Request Body:**
```json
{
  "format": "json|csv"
}
```

**Response:**
```json
{
  "format": "json",
  "data": {
    "summary": "...",
    "key_findings": [...],
    "recommendations": [...],
    "generated_at": "...",
    "api_cost": 0.0032
  }
}
```

### Delete Insights

Delete insights for a dataset.

**Endpoint:** `DELETE /api/insights/delete/{insight_id}`

**Query Parameters:**
- `user_id` (required) - User ID for authorization

**Response:**
```json
{
  "message": "Insight deleted"
}
```

---

## Subscription Endpoints

### Webhook

Handle Stripe webhook events.

**Endpoint:** `POST /api/subscriptions/webhook`

**Headers:**
```
stripe-signature: {signature}
```

**Events Handled:**
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Mark as cancelled
- `invoice.paid` - Log successful payment
- `invoice.payment_failed` - Log failed payment

**Response:**
```json
{
  "received": true
}
```

### Start Free Trial

Start a 7-day free trial for a user.

**Endpoint:** `POST /api/subscriptions/trial/{user_id}`

**Response:**
```json
{
  "message": "Free trial started",
  "subscription": {...}
}
```

### Get Subscription Status

Get current subscription status.

**Endpoint:** `GET /api/subscriptions/status/{user_id}`

**Response:**
```json
{
  "subscription_status": "free|trial|active|cancelled",
  "details": {
    "stripe_subscription_id": "string",
    "current_period_start": "2024-01-15T10:30:00Z",
    "current_period_end": "2024-02-15T10:30:00Z",
    "trial_end": "2024-01-22T10:30:00Z",
    "cancel_at": null
  }
}
```

### Cancel Subscription

Cancel user subscription.

**Endpoint:** `POST /api/subscriptions/cancel/{user_id}`

**Response:**
```json
{
  "message": "Subscription cancelled"
}
```

---

## Health Check

Check API health status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "market-research-api",
  "version": "1.0.0"
}
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not authorized to access resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Validation Error | Invalid request body |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

Rate limits (per minute):
- Free tier: 100 requests/min
- Trial: 500 requests/min
- Paid: 1000 requests/min

Limits are per user and reset every minute.

---

## Pagination

List endpoints support pagination with query parameters:

```
GET /api/uploads/list/{user_id}?skip=0&limit=10
```

- `skip` - Number of items to skip (default: 0)
- `limit` - Number of items to return (default: 10, max: 100)

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-01-15T10:30:00Z
```

---

## API Client Examples

### JavaScript/Node.js

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Upload file
const formData = new FormData()
formData.append('file', file)
const response = await api.post(`/uploads/csv/${userId}`, formData)

// Get insights
const insights = await api.get(`/insights/detail/${insightId}`)
```

### Python

```python
import requests

headers = {'Authorization': f'Bearer {token}'}

# Upload file
files = {'file': open('data.csv', 'rb')}
response = requests.post(
    f'http://localhost:8000/uploads/csv/{user_id}',
    files=files,
    headers=headers
)

# Get insights
response = requests.get(
    f'http://localhost:8000/insights/detail/{insight_id}',
    headers=headers
)
```

### cURL

```bash
# Upload file
curl -X POST http://localhost:8000/uploads/csv/{user_id} \
  -H "Authorization: Bearer {token}" \
  -F "file=@data.csv"

# Get insights
curl -X GET http://localhost:8000/insights/detail/{insight_id} \
  -H "Authorization: Bearer {token}"
```

---

For more information, visit [README.md](../README.md)
