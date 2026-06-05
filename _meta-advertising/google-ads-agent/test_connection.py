"""Test de connexion Google Ads API."""

import os
from dotenv import load_dotenv
from google.ads.googleads.client import GoogleAdsClient

load_dotenv()

# Test 1: Sans login_customer_id
print("=== Test 1: Sans login_customer_id ===")
try:
    credentials = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
        "use_proto_plus": True,
    }
    client = GoogleAdsClient.load_from_dict(credentials)

    # Test listAccessibleCustomers (ne nécessite pas de customer_id)
    customer_service = client.get_service("CustomerService")
    response = customer_service.list_accessible_customers()
    print("Comptes accessibles :")
    for rn in response.resource_names:
        print(f"  - {rn}")
except Exception as e:
    print(f"Erreur: {e}")

# Test 2: Avec login_customer_id
print("\n=== Test 2: Avec login_customer_id ===")
try:
    credentials2 = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
        "login_customer_id": os.getenv("GOOGLE_ADS_CUSTOMER_ID"),
        "use_proto_plus": True,
    }
    client2 = GoogleAdsClient.load_from_dict(credentials2)
    customer_service2 = client2.get_service("CustomerService")
    response2 = customer_service2.list_accessible_customers()
    print("Comptes accessibles :")
    for rn in response2.resource_names:
        print(f"  - {rn}")
except Exception as e:
    print(f"Erreur: {e}")

# Test 3: Search query
print("\n=== Test 3: Search query ===")
try:
    customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
    service = client.get_service("GoogleAdsService")
    query = "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1"
    response3 = service.search(customer_id=customer_id, query=query)
    for row in response3:
        print(f"  ID: {row.customer.id}")
        print(f"  Nom: {row.customer.descriptive_name}")
except Exception as e:
    print(f"Erreur: {e}")
