### **Sample API Requests**
---

#### API Endpoints

1. **Get All Transactions**
   ```
   GET /api/transactions
   ```

2. **Get Transactions by Customer Name**
   ```
   GET /api/transactions/customer/name/{name}
   ```

3. **Get Transactions by Customer ID**
   ```
   GET /api/transactions/customer/id/{id}
   ```

4. **Get Transactions by Date**
   ```
   GET /api/transactions/date/{date}
   ```
---

#### Add a New Transaction with Referral
```http
POST /api/transactions
Body:
{
    "customerName": "Alice",
    "date": "2024-12-02",
    "details": [
        { "productName": "Product A", "quantity": 2, "amount": 20.50 }
    ],
    "referredCustomerId1": "CUST-12402A" // Referral logic
}
```
---

#### Update a Transaction (Including Customer Info)
```http
PUT /api/transactions/1
Body:
{
    "customerName": "Updated Customer Name",
    "customerId": "CUST-12402A",
    "referralId": "020521A",
    "referredCustomerId1": "CUST-12402B",
    "referredCustomerId2": "CUST-12402C",
    "date": "2024-12-02",
    "details": [
        { "productName": "Updated Product A", "quantity": 5, "amount": 50.00 }
    ]
}
```
---

#### Delete a Transaction
```http
DELETE /api/transactions/1
```

#### Delete All Transactions for a Customer
```http
DELETE /api/transactions/customer/CUST-12402A
```
