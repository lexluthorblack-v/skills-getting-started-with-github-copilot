from fastapi.testclient import TestClient
import pytest

from src.app import app, activities

client = TestClient(app)


def test_basic_get(some_activity=None):
    resp = client.get("/activities")
    assert resp.status_code == 200


@pytest.fixture()
def some_activity():
    return next(iter(activities.keys()))


def test_signup_delete_flow(some_activity):
    activity = some_activity
    email = "ci-repl@example.com"
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)

    r = client.post(f"/activities/{activity}/signup?email={email}")
    assert r.status_code == 200
    assert email in activities[activity]["participants"]

    r2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert r2.status_code == 400

    r3 = client.delete(f"/activities/{activity}/participants?email={email}")
    assert r3.status_code == 200
    assert email not in activities[activity]["participants"]
