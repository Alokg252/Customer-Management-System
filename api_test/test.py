import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8090/api"

def test_create_transaction():
    print("\n=== Testing Create Transaction ===")
    url = f"{BASE_URL}/transactions"
    data = {
        "customerName": "Alice Smith",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "details": [
            {
                "productName": "Laptop",
                "quantity": 1,
                "amount": 999.99,
                "cost": 799.99
            },
            {
                "productName": "Mouse",
                "quantity": 2,
                "amount": 29.99,
                "cost": 19.99
            }
        ],
        "referredBy":"NA",
        "referredCustomerId1": "CUST-12402A"
    }
    
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response:", json.dumps(response.json(), indent=2))
        return response.json()
    else:
        print("Error:", response.text)
        return None

def test_get_all_transactions():
    print("\n=== Testing Get All Transactions ===")
    url = f"{BASE_URL}/transactions"
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response:", json.dumps(response.json(), indent=2))
        return response.json()
    else:
        print("Error:", response.text)
        return None

def test_get_transaction_by_customer(customer_name):
    print(f"\n=== Testing Get Transaction by Customer Name: {customer_name} ===")
    url = f"{BASE_URL}/transactions/customer/name/{customer_name}"
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response:", json.dumps(response.json(), indent=2))
        return response.json()
    else:
        print("Error:", response.text)
        return None

def test_update_transaction(transaction_id):
    print(f"\n=== Testing Update Transaction ID: {transaction_id} ===")
    url = f"{BASE_URL}/transactions/{transaction_id}"
    data = {
        "customerName": "Updated Alice Smith",
        "customerId": "CUST-12402A",
        "referralId": "020521A",
        "referredBy":"NA",
        "referredCustomerId1": "CUST-12402B",
        "referredCustomerId2": "CUST-12402C",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "details": [
            {
                "productName": "Updated Laptop Pro",
                "quantity": 1,
                "amount": 1499.99,
                "cost": 1199.99
            }
        ]
    }
    
    response = requests.put(url, json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response:", json.dumps(response.json(), indent=2))
        return response.json()
    else:
        print("Error:", response.text)
        return None


def run_all_tests():
    # Create a new transaction
    created_transaction = test_create_transaction()
    if created_transaction:
        transaction_id = created_transaction.get('id')
        
        # Get all transactions
        test_get_all_transactions()
        
        # Get transaction by customer name
        test_get_transaction_by_customer("Alice Smith")
        
        # Update the transaction
        if transaction_id:
            test_update_transaction(transaction_id)
            
            # Get updated transaction by customer name
            test_get_transaction_by_customer("Updated Alice Smith")

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to the server. Make sure the Spring Boot application is running on port 5000.")