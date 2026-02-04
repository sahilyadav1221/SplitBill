import requests

API_URL = "http://127.0.0.1:8000"

def run():
    # 1. Login to get token
    print("--- 1. Logging in as Alice ---")
    resp = requests.post(f"{API_URL}/auth/token", data={"username": "alice@test.com", "password": "password123"})
    if resp.status_code != 200:
        print("Login failed:", resp.text)
        return
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get Group ID (Goa Trip)
    print("--- 2. Fetching Groups ---")
    resp = requests.get(f"{API_URL}/groups/", headers=headers)
    groups = resp.json()
    if not groups:
        print("No groups found. Please run seed_and_verify.py first.")
        # Try creating one?
        # Assuming seed ran.
        return
    
    group_id = groups[0]["id"]
    print(f"Using Group ID: {group_id}")

    # 3. Test AI Parse
    print("--- 3. Testing MintSense AI Parse ---")
    payload = {
        "text": "Dinner 3000 paid by Alice for everyone",
        "group_id": group_id
    }
    
    try:
        resp = requests.post(f"{API_URL}/api/parse-expense", json=payload, headers=headers)
        if resp.status_code == 200:
            print("SUCCESS! Parsed Data:")
            print(resp.json())
        else:
            print(f"FAILED: {resp.status_code}")
            print(resp.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    run()
