# **Sample API Requests**
---

## API Endpoints

1. **Get All Transactions**
   <br><span style="color:lightgreen">**GET**</span> 
   ```
   /api/transactions
   ```

2. **Get Transactions by Customer Name**
   <br><span style="color:lightgreen">**GET**</span>
   ```
   /api/transactions/customer/name/{name}
   ```

3. **Get Transactions by Customer ID**
   <br><span style="color:lightgreen">**GET**</span> 
   ```
   /api/transactions/customer/id/{id}
   ```

4. **Get Transactions by Date**
   <br><span style="color:lightgreen">**GET**</span> 
   ```
   /api/transactions/date/{date}
   ```

5. **Get Transactions by Referrals**
   <br><span style="color:lightgreen">**GET**</span> 
   ```http
   /api/transactions/referrals/{referralId}
   ```

6. **Get Transactions by First Referred Customer**
   <br><span style="color:lightgreen">**GET**</span> 
   ```http
   /api/transactions/referred1/{customerId}
   ```
   Example: /api/transactions/referred1/CUST-030524A
   Response: List of transactions where the specified ID is referredCustomerId1

7. **Get Transactions by Second Referred Customer**
   <br><span style="color:lightgreen">**GET**</span> 
   ```http
   /api/transactions/referred2/{customerId}
   ```
   Example: /api/transactions/referred2/CUST-030524A
   Response: List of transactions where the specified ID is referredCustomerId2

8. **Get Transactions by Referral ID**
   <br><span style="color:lightgreen">**GET**</span> 
   ```http
   /api/transactions/referralid/{referralId}
   ```
   Example: /api/transactions/referralid/030524A
   Response: List of transactions with the exact referral ID

9. **Get New Referral ID**
   <br><span style="color:lightgreen">**GET**</span> 
   ```http
   /api/transactions/customerid/new   
   ```

10. **Get New Customer ID**
   <br><span style="color:lightgreen">**GET**</span> 
   ```http
   /api/transactions/referralid/new
   ```
---

#### Add a New Transaction with Referral
<span style="color:yellow">**POST**</span> 
```http
/api/transactions
```
```json
Body:
{
    "customerName": "Alice",
    "customerId": "123ABCD",
    "referralId": "01501A",
    "date": "2024-12-02",
    "details": [
        { "productName": "Product A", "quantity": 2, "amount": 20.50, "cost": 10.25 },
        { "productName": "Product B", "quantity": 3, "amount": 30.75, "cost": 15.50 }
    ],
    "referredCustomerId1": "1234ABC"
}
```

#### Add a New Many Transactions
<span style="color:yellow">**POST**</span> 
```http
/api/transactions/all
```
```json
Body:
[
   {
       "customerName": "Alice",
      "customerId": "123ABCD",
      "referralId": "01501A",
      "date": "2024-12-02",
      "details": [
         { "productName": "Product A", "quantity": 2, "amount": 20.50, "cost": 10.25 },
         { "productName": "Product B", "quantity": 3, "amount": 30.75, "cost": 15.50 }
      ],
      "referredCustomerId1": "1234ABC"
   },
   {
      <!-- details -->
   },
   {
      <!-- details -->
   }
]
```
---

#### Update a Transaction (Including Customer Info)
<span style="color:ORANGE">**PUT**</span> 
```http
/api/transactions/1
```
```json
Body:
{
    "customerName": "Arvind",
    "customerId": "12402A",
    "referralId": "020521A",
    "referredCustomerId1": "12402B",
    "referredCustomerId2": "12402C",
    "date": "2024-12-02",
    "details": [
        { "productName": "Updated Product A", "quantity": 5, "amount": 50.00, "cost": 25.00 }
    ]
}
```
---

#### Delete a Transaction
<span style="color:#FF5555">**DELETE**</span> 
```http
/api/transactions/1
```

#### Delete All Transactions for a Customer
<span style="color:#FF5555">**DELETE**</span> 
```http
/api/transactions/customer/CUST-12402A
```
