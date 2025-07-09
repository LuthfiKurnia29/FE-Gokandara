# Konsumen API Documentation

This API provides CRUD operations for managing konsumen (customers) data, following Laravel REST API conventions.

## Base URL

```
/api/konsumen
```

## Endpoints

### 1. Get All Konsumen (Index with Pagination)

**GET** `/api/konsumen`

Retrieve a paginated list of all konsumen with optional search functionality.

#### Query Parameters

| Parameter  | Type    | Default | Description                                           |
| ---------- | ------- | ------- | ----------------------------------------------------- |
| `page`     | integer | 1       | Page number                                           |
| `per_page` | integer | 10      | Number of items per page                              |
| `search`   | string  | -       | Search term (searches in name, email, phone, address) |

#### Example Request

```bash
GET /api/konsumen?page=1&per_page=5&search=john
```

#### Response (200 OK)

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "no": 1001,
      "name": "John Doe",
      "description": "Regular customer from Jakarta",
      "phone": "+62812-3456-7890",
      "email": "john.doe@email.com",
      "address": "Jl. Sudirman No. 123, Jakarta Selatan"
    }
  ],
  "first_page_url": "http://localhost:3000/api/konsumen?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "http://localhost:3000/api/konsumen?page=1",
  "links": [
    {
      "url": null,
      "label": "&laquo; Previous",
      "active": false
    },
    {
      "url": "http://localhost:3000/api/konsumen?page=1",
      "label": "1",
      "active": true
    },
    {
      "url": null,
      "label": "Next &raquo;",
      "active": false
    }
  ],
  "next_page_url": null,
  "path": "http://localhost:3000/api/konsumen",
  "per_page": 5,
  "prev_page_url": null,
  "to": 1,
  "total": 1
}
```

### 2. Create New Konsumen (Store)

**POST** `/api/konsumen`

Create a new konsumen record.

#### Request Body

```json
{
  "name": "string (required)",
  "phone": "string (required)",
  "email": "string (required, unique)",
  "address": "string (required)",
  "description": "string (optional)"
}
```

#### Example Request

```bash
POST /api/konsumen
Content-Type: application/json

{
  "name": "Jane Smith",
  "phone": "+62813-9876-5432",
  "email": "jane.smith@example.com",
  "address": "Jl. Braga No. 45, Bandung",
  "description": "VIP customer from Bandung"
}
```

#### Response (201 Created)

```json
{
  "message": "Konsumen created successfully.",
  "data": {
    "id": 6,
    "no": 1006,
    "name": "Jane Smith",
    "description": "VIP customer from Bandung",
    "phone": "+62813-9876-5432",
    "email": "jane.smith@example.com",
    "address": "Jl. Braga No. 45, Bandung"
  }
}
```

#### Error Response (422 Unprocessable Entity)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email has already been taken."]
  }
}
```

### 3. Get Konsumen by ID (Show)

**GET** `/api/konsumen/{id}`

Retrieve a specific konsumen by ID.

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Konsumen ID |

#### Example Request

```bash
GET /api/konsumen/1
```

#### Response (200 OK)

```json
{
  "message": "Konsumen retrieved successfully.",
  "data": {
    "id": 1,
    "no": 1001,
    "name": "John Doe",
    "description": "Regular customer from Jakarta",
    "phone": "+62812-3456-7890",
    "email": "john.doe@email.com",
    "address": "Jl. Sudirman No. 123, Jakarta Selatan"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Konsumen not found."
}
```

### 4. Update Konsumen (Complete Update)

**PUT** `/api/konsumen/{id}`

Update all fields of a specific konsumen.

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Konsumen ID |

#### Request Body

```json
{
  "name": "string (required)",
  "phone": "string (required)",
  "email": "string (required, unique)",
  "address": "string (required)",
  "description": "string (optional)"
}
```

#### Example Request

```bash
PUT /api/konsumen/1
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+62812-3456-7890",
  "email": "john.doe.updated@email.com",
  "address": "Jl. Sudirman No. 123, Jakarta Selatan",
  "description": "Updated regular customer from Jakarta"
}
```

#### Response (200 OK)

```json
{
  "message": "Konsumen updated successfully.",
  "data": {
    "id": 1,
    "no": 1001,
    "name": "John Doe Updated",
    "description": "Updated regular customer from Jakarta",
    "phone": "+62812-3456-7890",
    "email": "john.doe.updated@email.com",
    "address": "Jl. Sudirman No. 123, Jakarta Selatan"
  }
}
```

### 5. Partial Update Konsumen

**PATCH** `/api/konsumen/{id}`

Update specific fields of a konsumen (partial update).

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Konsumen ID |

#### Request Body (all fields optional)

```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional, unique)",
  "address": "string (optional)",
  "description": "string (optional)"
}
```

#### Example Request

```bash
PATCH /api/konsumen/1
Content-Type: application/json

{
  "name": "John Doe Partially Updated",
  "description": "Partially updated description"
}
```

#### Response (200 OK)

```json
{
  "message": "Konsumen updated successfully.",
  "data": {
    "id": 1,
    "no": 1001,
    "name": "John Doe Partially Updated",
    "description": "Partially updated description",
    "phone": "+62812-3456-7890",
    "email": "john.doe@email.com",
    "address": "Jl. Sudirman No. 123, Jakarta Selatan"
  }
}
```

### 6. Delete Konsumen (Destroy)

**DELETE** `/api/konsumen/{id}`

Delete a specific konsumen.

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Konsumen ID |

#### Example Request

```bash
DELETE /api/konsumen/1
```

#### Response (200 OK)

```json
{
  "message": "Konsumen deleted successfully.",
  "data": {
    "id": 1,
    "no": 1001,
    "name": "John Doe",
    "description": "Regular customer from Jakarta",
    "phone": "+62812-3456-7890",
    "email": "john.doe@email.com",
    "address": "Jl. Sudirman No. 123, Jakarta Selatan"
  }
}
```

## Error Codes

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 200         | Success                                  |
| 201         | Created                                  |
| 400         | Bad Request (Invalid ID format)          |
| 404         | Not Found                                |
| 422         | Unprocessable Entity (Validation errors) |
| 500         | Internal Server Error                    |

## Data Model

### KonsumenData Interface

```typescript
interface KonsumenData {
  id: number; // Auto-generated unique identifier
  no: number; // Auto-generated konsumen number
  name: string; // Konsumen full name
  description: string; // Optional description
  phone: string; // Phone number
  email: string; // Email address (must be unique)
  address: string; // Full address
}
```

## Testing with curl

### Create a new konsumen

```bash
curl -X POST http://localhost:3000/api/konsumen \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+62812-1234-5678",
    "email": "test@example.com",
    "address": "Test Address",
    "description": "Test description"
  }'
```

### Get all konsumen with pagination

```bash
curl "http://localhost:3000/api/konsumen?page=1&per_page=5"
```

### Get konsumen by ID

```bash
curl http://localhost:3000/api/konsumen/1
```

### Update konsumen

```bash
curl -X PUT http://localhost:3000/api/konsumen/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "+62812-1234-5678",
    "email": "updated@example.com",
    "address": "Updated Address",
    "description": "Updated description"
  }'
```

### Delete konsumen

```bash
curl -X DELETE http://localhost:3000/api/konsumen/1
```
