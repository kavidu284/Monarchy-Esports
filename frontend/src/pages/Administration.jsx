import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAdminSession } from "../utils/auth";

export default function Administration() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  // Form State for Creating New Staff
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "full_access_staff",
    email: "",
    permissions: {},
  });

  // State for Edit Rights Modal
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editRole, setEditRole] = useState("full_access_staff");
  const [editPermissions, setEditPermissions] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  // Re-authentication Deletion Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");

  // 1. Fetch Administration Settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/administration");
      setSettings(response.data);

      setForm((prev) => ({
        ...prev,
        role: response.data?.roles
          ? Object.keys(response.data.roles)[1] || "full_access_staff"
          : "full_access_staff",
        permissions: {},
      }));
    } catch (error) {
      console.error("Failed to load settings:", error);
      if (error?.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        clearAdminSession();
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) await fetchSettings();
    };
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchSettings]);

  const roleOptions = useMemo(() => {
    return settings?.roles
      ? Object.entries(settings.roles).map(([key, value]) => ({
          key,
          ...value,
        }))
      : [];
  }, [settings]);

  // 2. Handle Logout Action
  const handleLogout = async () => {
    try {
      await api.post("/administration/logout");
    } catch (err) {
      console.error("Logout API call error:", err);
    } finally {
      clearAdminSession();
      navigate("/administration/login");
    }
  };

  // 3. Create Staff Account
  const handleCreateStaff = async (event) => {
    event.preventDefault();
    try {
      await api.post("/administration/staff", {
        username: form.username,
        password: form.password,
        email: form.email,
        role: form.role,
        permissions: form.permissions,
      });

      setForm({
        username: "",
        password: "",
        role: form.role,
        email: "",
        permissions: {},
      });

      await fetchSettings();
      alert("Staff account created successfully");
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.detail || "Unable to create staff account"
      );
    }
  };

  // 4. Open Edit Rights Modal
const openEditModal = (admin) => {
  setEditingAdmin(admin);
  setEditRole(admin.role || "full_access_staff");
  setEditPermissions(admin.permissions || {});
  setEditPassword(""); // Clear password field when opening
};
  // 5. Save Updated Staff Rights
const handleSaveRights = async (e) => {
  e.preventDefault();
  if (!editingAdmin) return;

  try {
    setSavingEdit(true);
    await api.patch(`/administration/staff/${editingAdmin.id}/permissions`, {
      role: editRole,
      permissions: editPermissions,
      password: editPassword, // Pass new password if entered
    });

    alert(`Account updated for ${editingAdmin.username}`);
    setEditingAdmin(null);
    await fetchSettings();
  } catch (error) {
    console.error("Failed to update rights:", error);
    alert(
      error?.response?.data?.detail || "Failed to update staff permissions"
    );
  } finally {
    setSavingEdit(false);
  }
};

  // 6. Delete Target Modal Handlers
  const openDeleteModal = (adminId) => {
    setDeleteTarget(adminId);
    setModalOpen(true);
    setReauth({ username: "", password: "" });
    setReauthMessage("");
  };

  const confirmReauth = async () => {
    if (!deleteTarget) return;

    try {
      const response = await api.post("/administration/verify-credentials", {
        username: reauth.username,
        password: reauth.password,
      });

      if (response.data.success) {
        await api.delete(`/administration/staff/${deleteTarget}`);
        setModalOpen(false);
        await fetchSettings();
        alert("Staff account removed successfully");
      }
    } catch (error) {
      console.error(error);
      setReauthMessage(
        error?.response?.data?.detail || "Re-authentication failed"
      );
    }
  };

  const togglePermission = (permissionName) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionName]: !prev.permissions[permissionName],
      },
    }));
  };

  const toggleEditPermission = (permissionName) => {
    setEditPermissions((prev) => ({
      ...prev,
      [permissionName]: !prev[permissionName],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">
            Loading administration control...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* HEADER BAR */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
              Administration
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black">
              Staff RBAC & Security Console
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-400">
              Configure staff roles, edit user rights, require re-authentication for sensitive actions, and review audit activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-zinc-800"
            >
              Back to Dashboard
            </button>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-500/30 bg-red-600/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* CREATE STAFF FORM */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create Staff Account</h2>
              <p className="text-sm text-gray-400">
                Assign a custom role to manage the platform safely.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                {roleOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Permission Overrides
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {settings?.roles?.[form.role]?.permissions &&
                  Object.entries(
                    settings.roles[form.role].permissions
                  ).map(([name, enabled]) => (
                    <label
                      key={name}
                      className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-gray-300"
                    >
                      <span>{name.replace(/_/g, " ")}</span>
                      <input
                        type="checkbox"
                        checked={form.permissions[name] ?? enabled}
                        onChange={() => togglePermission(name)}
                        className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                      />
                    </label>
                  ))}
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Create Staff Account
            </button>
          </form>
        </div>

        {/* SIDEBAR: ROLES & STAFF DIRECTORY */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold">Available Roles</h2>
            <div className="mt-4 space-y-3">
              {roleOptions.map((role) => (
                <div
                  key={role.key}
                  className="rounded-2xl border border-zinc-800 bg-black p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{role.label}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-blue-400">
                      {role.key}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* STAFF DIRECTORY WITH EDIT RIGHTS BUTTON */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold">Staff Directory</h2>
            <div className="mt-4 space-y-3">
              {settings?.staff?.map((admin) => (
                <div
                  key={admin.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {admin.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {admin.role_label || admin.role}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* EDIT RIGHTS BUTTON */}
                      <button
                        onClick={() => openEditModal(admin)}
                        className="rounded-xl border border-blue-500/30 bg-blue-600/10 px-3 py-1.5 text-xs font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                      >
                        ✏️ Edit Rights
                      </button>

                      <button
                        onClick={() => openDeleteModal(admin.id)}
                        className="rounded-xl bg-red-600/80 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-gray-500">
                    <p>
                      Last Login:{" "}
                      {admin.last_login
                        ? new Date(admin.last_login).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY AUDIT LOG */}
      <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-2xl font-bold">Security Audit Log</h2>
        <div className="mt-4 space-y-3">
          {settings?.security_events?.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-gray-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-white">
                  {event.event_type}
                </span>
                <span className="text-xs text-gray-500">
                  {event.created_at}
                </span>
              </div>
              <p className="mt-2 text-gray-400">
                {event.details || "No details"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: EDIT STAFF RIGHTS */}
     {/* MODAL: EDIT STAFF RIGHTS + PASSWORD */}
{editingAdmin && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            Edit Staff Account & Password
          </h3>
          <p className="text-xs text-blue-400 font-semibold">
            Target Account: {editingAdmin.username}
          </p>
        </div>
        <button
          onClick={() => setEditingAdmin(null)}
          className="text-gray-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSaveRights} className="space-y-4">
        {/* NEW PASSWORD FIELD */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
            Reset Password (Optional)
          </label>
          <input
            type="password"
            placeholder="Leave blank to keep existing password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* SELECT ROLE */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
            Select Role
          </label>
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            {roleOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* PERMISSION OVERRIDES */}
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            Permission Overrides
          </h4>
          <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
            {settings?.roles?.[editRole]?.permissions &&
              Object.entries(
                settings.roles[editRole].permissions
              ).map(([name, enabled]) => (
                <label
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-xs text-gray-300"
                >
                  <span>{name.replace(/_/g, " ")}</span>
                  <input
                    type="checkbox"
                    checked={editPermissions[name] ?? enabled}
                    onChange={() => toggleEditPermission(name)}
                    className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                  />
                </label>
              ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setEditingAdmin(null)}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={savingEdit}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {savingEdit ? "Saving Changes..." : "Save Updated Rights & Password"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* MODAL 2: RE-AUTHENTICATION DELETION */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-2xl font-bold">Re-authentication Required</h3>
            <p className="mt-2 text-sm text-gray-400">
              Enter your credentials to authorize account deletion.
            </p>

            <div className="mt-5 space-y-4">
              <input
                value={reauth.username}
                onChange={(e) =>
                  setReauth({ ...reauth, username: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Username"
              />
              <input
                type="password"
                value={reauth.password}
                onChange={(e) =>
                  setReauth({ ...reauth, password: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Password"
              />
            </div>

            {reauthMessage && (
              <p className="mt-4 text-sm text-red-400">{reauthMessage}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-gray-300 hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmReauth}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}