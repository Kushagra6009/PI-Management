from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_full_api_flow():
    print("1. Testing Login with valid credentials...")
    res = client.post("/auth/login", json={"email": "pi@example.com", "password": "your-password"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    token = data["token"]
    assert "name" in data
    headers = {"Authorization": f"Bearer {token}"}
    print("   Login SUCCESS. Token obtained.")

    print("2. Testing Login with invalid password...")
    res_bad = client.post("/auth/login", json={"email": "pi@example.com", "password": "wrongpassword"})
    assert res_bad.status_code == 401
    print("   Invalid login correctly rejected.")

    print("3. Testing Dashboard endpoint...")
    res_dash = client.get("/dashboard", headers=headers)
    assert res_dash.status_code == 200
    dash_data = res_dash.json()
    assert dash_data["course"] == "Master of Computer Applications"
    assert len(dash_data["batches"]) == 2
    print(f"   Dashboard SUCCESS. Course: {dash_data['course']}, Batches: {len(dash_data['batches'])}")

    batch1_id = dash_data["batches"][0]["id"]

    print("4. Testing Batch Students endpoint...")
    res_students = client.get(f"/batches/{batch1_id}/students", headers=headers)
    assert res_students.status_code == 200
    students_data = res_students.json()
    assert len(students_data["students"]) > 0
    print(f"   Batch Students SUCCESS. Count: {len(students_data['students'])}")

    print("5. Testing Search Students...")
    res_search = client.get(f"/batches/{batch1_id}/students?search=Alex", headers=headers)
    assert res_search.status_code == 200
    search_data = res_search.json()
    assert len(search_data["students"]) >= 1
    print(f"   Search Students SUCCESS. Found: {len(search_data['students'])}")

    student_id = students_data["students"][0]["id"]

    print("6. Testing Student Profile endpoint...")
    res_profile = client.get(f"/students/{student_id}", headers=headers)
    assert res_profile.status_code == 200
    profile_data = res_profile.json()
    assert profile_data["name"] == students_data["students"][0]["name"]
    print(f"   Student Profile SUCCESS. Name: {profile_data['name']}")

    print("7. Testing Mentors List endpoint...")
    res_mentors = client.get("/mentors", headers=headers)
    assert res_mentors.status_code == 200
    mentors_data = res_mentors.json()
    assert len(mentors_data) > 0
    print(f"   Mentors List SUCCESS. Count: {len(mentors_data)}")

    new_mentor = mentors_data[1]  # Pick 2nd mentor

    print("8. Testing Mentor Change endpoint...")
    res_change = client.put(
        f"/batches/{batch1_id}/mentor",
        headers=headers,
        json={"new_mentor_id": new_mentor["id"], "reason": "Academic schedule reorganization"}
    )
    assert res_change.status_code == 200
    print("   Mentor Change SUCCESS.")

    print("9. Testing Mentor History endpoint...")
    res_history = client.get(f"/batches/{batch1_id}/mentor-history", headers=headers)
    assert res_history.status_code == 200
    history_data = res_history.json()
    assert len(history_data) >= 1
    assert history_data[0]["reason"] == "Academic schedule reorganization"
    print(f"   Mentor History SUCCESS. Latest entry: {history_data[0]['new_mentor_name']}")

    print("10. Testing Course Isolation (Accessing unauthorized batch 3)...")
    res_iso = client.get("/batches/3/students", headers=headers)
    assert res_iso.status_code == 404
    print("   Course Isolation SUCCESS! Unauthorized batch returned 404 Not Found.")

    print("\nALL BACKEND API TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_full_api_flow()
