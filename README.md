# Multi-Tenant Shopify Data Analytics Backend

## Overview
This backend service facilitates the integration of multiple Shopify stores (tenants) into a centralized analytics platform. It fetches and processes data from Shopify APIs, stores it in a relational database, and provides endpoints for analytics and reporting.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Saikethan-05/my-shopify-backend.git
cd my-shopify-backend

### 2. Install Dependencies
npm install

### 3. Configure Environment Variables
DB_NAME=shopify_db
DB_USER=root
DB_PASS=Saikethan@2005
DB_HOST=localhost
PORT=5000

ONBOARD_USER=admin
ONBOARD_PASS=supersecretpassword

SYNC_CRON=0 */1 * * *   # every hour

### 4. Start the Server
npm start



## 2 . Architecture diagram.

       Shopify Store (Tenant)
              |
              v
      ---------------------
      |  Backend Server   |
      |-------------------|
      | Sequelize ORM     |
      | MySQL Database    |
      | Cron Jobs         |
      ---------------------
      |    REST APIs      |
      ---------------------
              |
              v
        Frontend / Dashboard




## 3. API Endpoints

### 1. Tenant Onboarding

POST /onboard

Headers:

Authorization: Basic <Base64 of ONBOARD_USER:ONBOARD_PASS>
Content-Type: application/json 

Body:
{
  "name": "Xeno Store",
  "shop": "xeno-store.myshopify.com",
  "accessToken": "shpat_xxxxxxxxxxxxxxx"
}

Response:
{
  "message": "Tenant onboarded!",
  "tenant": { ... }
}

### 2. Sync Data (Products, Customers, Orders)

POST /sync/products

POST /sync/customers

POST /sync/orders

Response:

{
  "message": "Products/Customers/Orders synced for all tenants",
  "totalCount": 10
}

### 3. Fetch Data (for Frontend)
1 . Get all tenants

GET /tenants

Response:

[
  { "id": 1, "name": "Xeno Store 1", "shop": "xeno-store1.myshopify.com" },
  { "id": 2, "name": "Xeno Store 2", "shop": "xeno-store2.myshopify.com" }
]

2 . Get products

GET /products?tenantId=1

Response:

[
  { "shopifyId": 12345, "title": "Product A", "vendor": "Vendor1", "price": 100, "tenantId": 1 },
  ...
]

3 . Get customers

GET /customers?tenantId=1

Response:

[
  { "shopifyId": 54321, "first_name": "John", "last_name": "Doe", "email": "john@example.com", "tenantId": 1 },
  ...
]

4 . Get orders

GET /orders?tenantId=1

Response:

[
  { "shopifyId": 98765, "customer_id": 54321, "total_price": 200, "created_at": "2025-09-15T10:00:00Z", "tenantId": 1 },
  ...
]


## 4 . Database Schema

1 . Tenants Table

| Column      | Type     | Notes                |
| ----------- | -------- | -------------------- |
| id          | INT      | Primary Key          |
| name        | VARCHAR  | Tenant name          |
| shop        | VARCHAR  | Shopify store URL    |
| accessToken | VARCHAR  | Shopify access token |
| active      | BOOLEAN  | Is tenant active     |
| createdAt   | DATETIME | Created timestamp    |
| updatedAt   | DATETIME | Updated timestamp    |


2 . Products Table

| Column    | Type    | Notes                 |
| --------- | ------- | --------------------- |
| shopifyId | BIGINT  | Primary key           |
| title     | VARCHAR | Product title         |
| vendor    | VARCHAR | Vendor name           |
| price     | DECIMAL | Price of product      |
| tenantId  | INT     | Foreign key → tenants |


3 . Customers Table

| Column      | Type    | Notes                 |
| ----------- | ------- | --------------------- |
| shopifyId   | BIGINT  | Primary key           |
| first\_name | VARCHAR | First name            |
| last\_name  | VARCHAR | Last name             |
| email       | VARCHAR | Customer email        |
| tenantId    | INT     | Foreign key → tenants |


4. Orders Table

| Column       | Type     | Notes                 |
| ------------ | -------- | --------------------- |
| shopifyId    | BIGINT   | Primary key           |
| customer\_id | BIGINT   | Shopify customer ID   |
| total\_price | DECIMAL  | Order total           |
| created\_at  | DATETIME | Order creation date   |
| tenantId     | INT      | Foreign key → tenants |


## Known limitations or assumptions.

1 . Only supports Shopify tenants.

2 . Syncing assumes valid Shopify Admin API access tokens.

3 . Orders, products, and customers are synced once per hour by default.

4 . Onboarding requires basic authentication.

5 . Backend assumes single MySQL instance and does not support sharding or multi-region DB.

6 . Frontend must provide tenantId as query parameter to fetch tenant-specific data.

