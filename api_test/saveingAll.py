url = "http://127.0.0.1:8090/api/transactions/all"
data = [
    {
        "customerName": "Alice Smith",
        "date": "04/12/2024",
        "customerId":"12RM45",
        "mobile": "9752647892",
        "referralId":"12504A",
        "details": [
            {
                "productName": "Laptop",
                "quantity": 1,
                "amount": 59000,
                "cost": 52000,
                "date": "04/12/2024"
            },
            {
                "productName": "Mouse",
                "quantity": 1,
                "amount": 1200,
                "cost": 980,
                "date": "06/12/2023"
            },
            {
                "productName": "Keyboard",
                "quantity": 1,
                "amount": 900,
                "cost": 760,
                "date": "07/12/2023"
            },
            {
                "productName": "earphone",
                "quantity": 1,
                "amount": 1180,
                "cost": 300,
                "date": "07/12/2023"
            }
        ],
        "referredCustomerId1": "12402A"
    },
    {
        "customerName": "Bob Brown",
        "date": "02/01/2024",
        "mobile": "8989764532",
        "customerId":"12402A",
        "referralId":"12504B",
        "details": [
            {
                "productName": "bag",
                "quantity": 5,
                "amount": 6000,
                "cost": 4800,
                "date":"02/01/2024"
            },
            {
                "productName": "sun glasses",
                "quantity": 11,
                "amount": 6600,
                "cost": 1800,
                "date":"02/01/2024"
            }
        ],
        "referredCustomerId1": "12504B"
    },
    {
        "customerName": "Charlie Davis",
        "date": "18/04/2024",
        "mobile": "9097225789",
        "customerId":"12504B",
        "details": [
            {
                "productName": "watch",
                "quantity": 2,
                "amount": 6000,
                "cost": 3600,
                "date":"18/04/2024"
            },
            {
                "productName": "smart watch",
                "quantity": 2,
                "amount": 9000,
                "cost": 6800,
                "date":"19/04/2024"
            },
            {
                "productName": "laptop",
                "quantity": 1,
                "amount": 80000,
                "cost": 69000,
                "date":"12/06/2024"
            }
        ]
    }
]

import requests
try:
    res = requests.post(url=url, json=data)
    # res = requests.get(url="127.0.0.1:8090/api/transactions")

    if res.status_code==200:
        print(res.text)
    elif res:
        print(res.text)

except Exception as e:
    print(e)
