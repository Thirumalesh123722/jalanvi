"""
Marine AI - Comprehensive Multi-User Authentication & Data Ownership Isolation Test
Verifies all 12 points of authentication, session management, and IDOR prevention using FastAPI TestClient.
"""
import sys
import os
import time

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    ts = int(time.time())
    print("=" * 70)
    print("MARINE AI: AUTOMATED MULTI-USER AUTH & IDOR PROTECTION TEST SUITE")
    print("=" * 70)

    # 1. Demo User Login
    print("\n[TEST 1] Logging in with seeded default Demo account (demo@marine-ai.io)...")
    res = client.post("/api/auth/login", json={"email": "demo@marine-ai.io", "password": "marineai2026"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    demo_data = res.json()
    assert "token" in demo_data, "Expected token in response"
    demo_token = demo_data["token"]
    print(f"  [SUCCESS] Demo login successful. Token issued. Vessel: {demo_data['user']['vessel_name']}")

    # 2. Register User Alice
    alice_email = f"alice_{ts}@marine-ai.io"
    print(f"\n[TEST 2] Registering User Alice ({alice_email})...")
    res_alice = client.post("/api/auth/register", json={
        "name": "Captain Alice Varma",
        "email": alice_email,
        "password": "SecurePassword123!",
        "vessel_name": "Sea Queen IND-AP-01",
        "vessel_type": "Trawler",
        "base_port": "Visakhapatnam",
        "phone": "+91 98765 43210",
        "preferred_language": "te"
    })
    assert res_alice.status_code == 200, f"Expected 200, got {res_alice.status_code}: {res_alice.text}"
    alice_data = res_alice.json()
    alice_token = alice_data["token"]
    alice_id = alice_data["user"]["id"]
    alice_headers = {"Authorization": f"Bearer {alice_token}"}
    print(f"  [SUCCESS] Alice registered (User ID: {alice_id}, Vessel: {alice_data['user']['vessel_name']})")

    # 3. Register User Bob
    bob_email = f"bob_{ts}@marine-ai.io"
    print(f"\n[TEST 3] Registering User Bob ({bob_email})...")
    res_bob = client.post("/api/auth/register", json={
        "name": "Fisherman Bob Rao",
        "email": bob_email,
        "password": "SecurePassword123!",
        "vessel_name": "Ocean Hunter IND-KL-99",
        "vessel_type": "Motorized Boat",
        "base_port": "Kochi",
        "phone": "+91 91234 56789",
        "preferred_language": "ml"
    })
    assert res_bob.status_code == 200, f"Expected 200, got {res_bob.status_code}: {res_bob.text}"
    bob_data = res_bob.json()
    bob_token = bob_data["token"]
    bob_id = bob_data["user"]["id"]
    bob_headers = {"Authorization": f"Bearer {bob_token}"}
    print(f"  [SUCCESS] Bob registered (User ID: {bob_id}, Vessel: {bob_data['user']['vessel_name']})")

    # 4. Verify Alice's Profile via /me
    print("\n[TEST 4] Verifying Alice's Identity via GET /api/auth/me...")
    res_me = client.get("/api/auth/me", headers=alice_headers)
    assert res_me.status_code == 200 and res_me.json()["user"]["email"] == alice_email
    print(f"  [SUCCESS] Token valid for {res_me.json()['user']['name']} ({res_me.json()['user']['email']})")

    # 5. Alice creates a Family Contact
    print("\n[TEST 5] Alice creates Family Contact 'Dr. Ananya Varma'...")
    res_c_alice = client.post("/api/family-link/contacts", json={
        "name": "Dr. Ananya Varma",
        "relationship": "Spouse",
        "phone": "+91 98765 00001",
        "notes": "Emergency physician at Vizag Hospital"
    }, headers=alice_headers)
    assert res_c_alice.status_code == 200
    contact_alice_id = res_c_alice.json()["contact"]["id"]
    print(f"  [SUCCESS] Alice created contact ID: {contact_alice_id}")

    # 6. Verify Bob's Contacts isolation (Bob must have 0 contacts)
    print("\n[TEST 6] Bob checks his contacts (Data Isolation check)...")
    res_bob_contacts = client.get("/api/family-link/contacts", headers=bob_headers)
    assert res_bob_contacts.status_code == 200
    bob_contacts_list = res_bob_contacts.json()["contacts"]
    assert len(bob_contacts_list) == 0, f"Bob should have 0 contacts, found {len(bob_contacts_list)}"
    print("  [SUCCESS] Bob has 0 contacts. Alice's contact is NOT visible to Bob.")

    # 7. Bob creates his own Contact
    print("\n[TEST 7] Bob creates his own Family Contact 'Sita Rao'...")
    res_c_bob = client.post("/api/family-link/contacts", json={
        "name": "Sita Rao",
        "relationship": "Sister",
        "phone": "+91 91234 00002",
        "notes": "Kochi Harbor Cooperative"
    }, headers=bob_headers)
    assert res_c_bob.status_code == 200
    contact_bob_id = res_c_bob.json()["contact"]["id"]
    print(f"  [SUCCESS] Bob created contact ID: {contact_bob_id}")

    # 8. IDOR Prevention: Alice tries to delete Bob's Contact
    print("\n[TEST 8] IDOR Check: Alice attempts DELETE on Bob's Contact...")
    res_idor_del = client.delete(f"/api/family-link/contacts/{contact_bob_id}", headers=alice_headers)
    assert res_idor_del.status_code == 403, f"Expected 403 Forbidden, got {res_idor_del.status_code}: {res_idor_del.text}"
    print(f"  [SUCCESS] IDOR blocked with HTTP {res_idor_del.status_code} Forbidden: '{res_idor_del.json().get('detail')}'")

    # 9. IDOR Prevention: Bob tries to update Alice's Contact
    print("\n[TEST 9] IDOR Check: Bob attempts PUT on Alice's Contact...")
    res_idor_put = client.put(f"/api/family-link/contacts/{contact_alice_id}", json={
        "name": "Hacked Name"
    }, headers=bob_headers)
    assert res_idor_put.status_code == 403, f"Expected 403 Forbidden, got {res_idor_put.status_code}: {res_idor_put.text}"
    print(f"  [SUCCESS] IDOR blocked with HTTP {res_idor_put.status_code} Forbidden: '{res_idor_put.json().get('detail')}'")

    # 10. Profile Update & Persistence
    print("\n[TEST 10] Alice updates her vessel registration...")
    res_upd = client.put("/api/auth/profile", json={
        "vessel_name": "Sea Queen Flagship IX",
        "base_port": "Chennai Outer Port",
        "phone": "+91 98765 99999"
    }, headers=alice_headers)
    assert res_upd.status_code == 200
    assert res_upd.json()["user"]["vessel_name"] == "Sea Queen Flagship IX"
    # Re-verify persistence with /me
    res_me_check = client.get("/api/auth/me", headers=alice_headers)
    assert res_me_check.json()["user"]["vessel_name"] == "Sea Queen Flagship IX"
    print(f"  [SUCCESS] Profile updated and persisted. New vessel: {res_me_check.json()['user']['vessel_name']}")

    # 11. Logout & Revocation Check
    print("\n[TEST 11] Alice logs out (Token revocation check)...")
    res_logout = client.post("/api/auth/logout", headers=alice_headers)
    assert res_logout.status_code == 200
    print("  Alice logged out. Attempting to use Alice's token again on /api/auth/me...")
    res_revoked = client.get("/api/auth/me", headers=alice_headers)
    assert res_revoked.status_code == 401, f"Expected 401 Unauthorized for revoked token, got {res_revoked.status_code}"
    print(f"  [SUCCESS] Revoked token rejected with HTTP {res_revoked.status_code} Unauthorized: '{res_revoked.json().get('detail')}'")

    # 12. Password Reset Flow
    print("\n[TEST 12] Bob performs Password Reset flow...")
    res_forgot = client.post("/api/auth/forgot-password", json={"email": bob_email})
    assert res_forgot.status_code == 200
    reset_token = res_forgot.json().get("reset_token")
    assert reset_token, "Expected reset_token in response"
    print(f"  Password reset token issued for Bob: {reset_token[:10]}...")
    res_reset = client.post("/api/auth/reset-password", json={
        "token": reset_token,
        "new_password": "NewSecretPassword2026!"
    })
    assert res_reset.status_code == 200
    print("  Bob's password updated. Verifying login with new credentials...")
    res_new_login = client.post("/api/auth/login", json={
        "email": bob_email,
        "password": "NewSecretPassword2026!"
    })
    assert res_new_login.status_code == 200 and "token" in res_new_login.json()
    print("  [SUCCESS] Bob authenticated successfully with new password!")

    print("\n" + "=" * 70)
    print("ALL 12 MULTI-USER AUTHENTICATION & DATA OWNERSHIP TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
