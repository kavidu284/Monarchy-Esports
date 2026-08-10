from app.routes import adminlogin
from app.routes.administration import get_permission_overview, should_log_security_event


class _FakeCursor:
    def __init__(self, fetch_result=None):
        self.fetch_result = fetch_result
        self.executed = []
        self.closed = False

    def execute(self, query, params=None):
        self.executed.append((query, params))

    def fetchone(self):
        return self.fetch_result

    def close(self):
        self.closed = True


class _FakeConnection:
    def __init__(self, admin_row):
        self.admin_row = admin_row
        self.select_cursor = _FakeCursor(fetch_result=admin_row)
        self.update_cursor = _FakeCursor()
        self.commit_called = False
        self.closed = False

    def cursor(self, dictionary=False):
        if dictionary:
            return self.select_cursor

        return self.update_cursor

    def commit(self):
        self.commit_called = True

    def close(self):
        self.closed = True


def test_permission_overview_enforces_expected_roles():
    overview = get_permission_overview()
    assert overview["super_admin"]["can_delete_tournaments"] is True
    assert overview["tournament_editor"]["can_edit_tournaments"] is True
    assert overview["tournament_viewer"]["can_view_tournaments"] is True
    assert overview["match_results_manager"]["can_publish_results"] is True
    assert overview["gallery_manager"]["can_manage_gallery"] is True


def test_only_super_admin_logins_are_recorded_in_security_audit():
    assert should_log_security_event({"is_super_admin": True}, "login") is True
    assert should_log_security_event({"is_super_admin": False}, "login") is False
    assert should_log_security_event({"is_super_admin": False}, "tournament_deleted") is True


def test_admin_login_rejects_non_super_admin(monkeypatch):
    fake_connection = _FakeConnection(
        {
            "id": 2,
            "username": "staff",
            "password_hash": "hashed-password",
            "is_super_admin": False,
        }
    )

    monkeypatch.setattr(adminlogin, "get_connection", lambda: fake_connection)
    monkeypatch.setattr(adminlogin, "ensure_admin_schema", lambda connection: None)
    monkeypatch.setattr(adminlogin.pwd_context, "verify", lambda password, password_hash: True)

    response = adminlogin.admin_login({"username": "staff", "password": "secret"})

    assert response == {
        "success": False,
        "message": "Super admin access only",
    }
    assert fake_connection.commit_called is False
    assert fake_connection.select_cursor.closed is True
    assert fake_connection.update_cursor.closed is False
    assert fake_connection.closed is True


def test_admin_login_allows_super_admin(monkeypatch):
    fake_connection = _FakeConnection(
        {
            "id": 1,
            "username": "superadmin",
            "password_hash": "hashed-password",
            "is_super_admin": True,
        }
    )

    monkeypatch.setattr(adminlogin, "get_connection", lambda: fake_connection)
    monkeypatch.setattr(adminlogin, "ensure_admin_schema", lambda connection: None)
    monkeypatch.setattr(adminlogin.pwd_context, "verify", lambda password, password_hash: True)
    monkeypatch.setattr(adminlogin, "create_access_token", lambda data: "token-123")
    monkeypatch.setattr(adminlogin, "log_security_event", lambda *args, **kwargs: None)

    response = adminlogin.admin_login({"username": "superadmin", "password": "secret"})

    assert response == {
        "success": True,
        "access_token": "token-123",
        "admin": {
            "id": 1,
            "username": "superadmin",
        },
    }
    assert fake_connection.commit_called is True
    assert fake_connection.select_cursor.closed is True
    assert fake_connection.update_cursor.closed is True
    assert fake_connection.closed is True
