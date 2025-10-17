from fastapi.testclient import TestClient
import pytest

from src.app import app, activities

client = TestClient(app)


def test_get_activities_returns_dict():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)


@pytest.fixture()
def sample_activity_name():
    # pick a known activity from initial data
    return next(iter(activities.keys()))


def test_signup_and_remove_participant(sample_activity_name):
    activity = sample_activity_name
    test_email = "teststudent_fixed2@example.com"

    # Ensure test_email not present
    if test_email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(test_email)

    # Signup
    resp = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert resp.status_code == 200
    assert test_email in activities[activity]["participants"]

    # Duplicate signup should fail
    resp2 = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert resp2.status_code == 400

    # Remove participant
    resp3 = client.delete(f"/activities/{activity}/participants?email={test_email}")
    assert resp3.status_code == 200
    assert test_email not in activities[activity]["participants"]


def test_remove_nonexistent_participant(sample_activity_name):
    activity = sample_activity_name
    fake_email = "noone_fixed2@nowhere.test"

    # Ensure not present
    if fake_email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(fake_email)

    resp = client.delete(f"/activities/{activity}/participants?email={fake_email}")
    assert resp.status_code == 404
