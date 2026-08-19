import { useEffect, useState } from "react";
import api from "../services/api";
import { isSuperAdmin } from "../utils/auth";

export default function AdministratorUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Toast / Notification State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title: string, message: string }

  // Create Staff Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "full_access_staff",
    permissions: {
      can_view_dashboard: true,
      can_view_tournaments: true,
      can_create_tournaments: false,
      can_edit_tournaments: false,
      can_delete_tournaments: false,
      can_manage_news: false,
      can_view_contact_messages: false,
      can_manage_matches: false,
      can_publish_results: false,
      can_manage_gallery: false,
      can_manage_users: false,
    },
  });
  const [creating, setCreating] = useState(false);

  // Edit Rights Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editPermissions, setEditPermissions] = useState({});
  const [editRole, setEditRole] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // SECURITY RE-AUTHENTICATION POPUP STATE
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [pendingAction, setDeletePendingAction] = useState(null); // { type: 'DELETE' | 'SAVE_RIGHTS', payload: ... }
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Helper to show styled notifications
  const showNotification = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Re-fetch helper function
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/administration/staff");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch administrator users:", error);
      showNotification("error", "Data Load Failure", "Unable to fetch staff user directory.");
    } finally {
      setLoading(false);
    }
  };

  // Safe initial fetch pattern
  useEffect(() => {
    let isMounted = true;

    const fetchUsersData = async () => {
      try {
        const response = await api.get("/administration/staff");
        if (isMounted) {
          setUsers(response.data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch administrator users:", error);
        if (isMounted) {
          setLoading(false);
          showNotification("error", "Data Load Failure", "Unable to fetch staff user directory.");
        }
      }
    };

    fetchUsersData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-fill modal state for selected user
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditRole(user.role || "staff");
    setEditEmail(user.email || "");
    setNewPassword("");
    setEditPermissions({
      can_view_dashboard: user.can_view_dashboard ?? true,
      can_view_tournaments: user.can_view_tournaments ?? true,
      can_create_tournaments: user.can_create_tournaments ?? false,
      can_edit_tournaments: user.can_edit_tournaments ?? false,
      can_delete_tournaments: user.can_delete_tournaments ?? false,
      can_manage_news: user.can_manage_news ?? false,
      can_view_contact_messages: user.can_view_contact_messages ?? false,
      can_manage_matches: user.can_manage_matches ?? false,
      can_publish_results: user.can_publish_results ?? false,
      can_manage_gallery: user.can_manage_gallery ?? false,
      can_manage_users: user.can_manage_users ?? false,
    });
  };

  const handleTogglePermission = (key) => {
    setEditPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleCreatePermission = (key) => {
    setCreateForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  // Trigger Security Verification Modal for Deletion
  const triggerDeleteVerification = (userId, username) => {
    setDeletePendingAction({
      type: "DELETE_USER",
      userId,
      username,
    });
    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

  // Trigger Security Verification Modal for Sensitive User Rights
  const handleSaveUserSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Require authorization popup if changing passwords or granting user management rights
    const isSensitive = newPassword.trim().length > 0 || editPermissions.can_manage_users;

    if (isSensitive) {
      setDeletePendingAction({
        type: "SAVE_RIGHTS",
        userId: selectedUser.id,
        username: selectedUser.username,
      });
      setReauth({ username: "", password: "" });
      setReauthMessage("");
      setSecurityModalOpen(true);
    } else {
      executeSaveUser();
    }
  };

  // Execute Actual User Rights Save
  const executeSaveUser = async () => {
    try {
      setSaving(true);
      const payload = {
        email: editEmail,
        role: editRole,
        permissions: editPermissions,
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      await api.patch(`/administration/staff/${selectedUser.id}`, payload);
      showNotification(
        "success",
        "Rights Updated",
        `Successfully updated account settings for "${selectedUser.username}".`
      );
      setSelectedUser(null);
      setSecurityModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      showNotification(
        "error",
        "Update Failed",
        error?.response?.data?.detail || "Failed to update user rights."
      );
    } finally {
      setSaving(false);
    }
  };

  // Execute Actual Deletion
  const executeDeleteUser = async (userId, username) => {
    try {
      await api.delete(`/administration/staff/${userId}`);
      showNotification(
        "success",
        "Account Deleted",
        `Staff account "${username}" has been permanently removed.`
      );
      setSecurityModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      showNotification(
        "error",
        "Deletion Denied",
        error?.response?.data?.detail || "Failed to delete account."
      );
    }
  };

  // Confirm Re-authentication Form
  const handleConfirmReauth = async (e) => {
    e.preventDefault();
    if (!reauth.username.trim() || !reauth.password.trim()) {
      setReauthMessage("Username and password are required.");
      return;
    }

    try {
      setVerifying(true);
      setReauthMessage("");
      const response = await api.post("/administration/verify-credentials", {
        username: reauth.username.trim(),
        password: reauth.password.trim(),
      });

      if (response.data?.success) {
        if (pendingAction?.type === "DELETE_USER") {
          await executeDeleteUser(pendingAction.userId, pendingAction.username);
        } else if (pendingAction?.type === "SAVE_RIGHTS") {
          await executeSaveUser();
        }
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setReauthMessage(
        error?.response?.data?.detail || "Invalid credentials or unauthorized action."
      );
    } finally {
      setVerifying(false);
    }
  };

  // Submit NEW Staff Account
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.post("/administration/staff", {
        username: createForm.username.trim(),
        password: createForm.password,
        email: createForm.email.trim() || null,
        role: createForm.role,
        permissions: createForm.permissions,
      });

      showNotification(
        "success",
        "Staff Created",
        `New staff account "${createForm.username}" registered successfully!`
      );
      setShowCreateModal(false);
      setCreateForm({
        username: "",
        password: "",
        email: "",
        role: "full_access_staff",
        permissions: {
          can_view_dashboard: true,
          can_view_tournaments: true,
          can_create_tournaments: false,
          can_edit_tournaments: false,
          can_delete_tournaments: false,
          can_manage_news: false,
          can_view_contact_messages: false,
          can_manage_matches: false,
          can_publish_results: false,
          can_manage_gallery: false,
          can_manage_users: false,
        },
      });
      loadUsers();
    } catch (error) {
      console.error("Failed to create staff account:", error);
      showNotification(
        "error",
        "Creation Failed",
        error?.response?.data?.detail || "Failed to create staff account."
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">
            Loading user permissions...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-sans text-white selection:bg-blue-600 selection:text-white">
      {/* BEAUTIFUL NOTIFICATION TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] max-w-md w-full animate-slide-in">
          <div
            className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all ${
              toast.type === "success"
                ? "border-emerald-500/40 bg-zinc-950/95 text-emerald-400 shadow-emerald-500/10"
                : "border-red-500/40 bg-zinc-950/95 text-red-400 shadow-red-500/10"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl ${
                toast.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {toast.type === "success" ? "✓" : "⚠️"}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-gray-300 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-blue-600/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Super Admin Control
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              User Rights & Staff Accounts
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage accounts, assign roles, reset passwords, and configure module-level access flags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin() && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:-translate-y-0.5"
              >
                ➕ Create Staff Account
              </button>
            )}
            <span className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-xs font-bold text-blue-400 shadow-lg shadow-blue-600/10">
              {users.length} Registered Accounts
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="🔍 Search users by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <span className="text-xs font-bold text-gray-400">
          Showing {filteredUsers.length} accounts
        </span>
      </div>

      {/* USER LIST CARDS */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center text-gray-400">
          👤 No user accounts found matching "{search}".
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col justify-between space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl transition hover:border-zinc-700"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">ID #{user.id}</span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      user.is_super_admin
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                        : "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {user.is_super_admin ? "👑 Super Admin" : "🛡️ Staff Member"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{user.username}</h3>
                <p className="mt-1 text-xs text-gray-400">{user.email || "No email registered"}</p>

                <div className="mt-4 space-y-1.5 border-t border-zinc-900 pt-3 text-xs text-gray-400">
                  <p>
                    Role: <span className="font-semibold text-gray-200">{user.role || "Staff"}</span>
                  </p>
                  <p>
                    Last Login: <span className="text-gray-300">{user.last_login || "Never"}</span>
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {isSuperAdmin() && (
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                  <button
                    onClick={() => openEditModal(user)}
                    className="flex-1 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-xs font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-600/10"
                  >
                    ✏️ Edit Rights
                  </button>
                  {!user.is_super_admin && (
                    <button
                      onClick={() => triggerDeleteVerification(user.id, user.username)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition"
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  New Staff Onboarding
                </p>
                <h3 className="text-2xl font-bold text-white">Create Staff Account</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-2 text-xl font-bold text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. tournament_manager"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="staff@monarchy.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Role Preset
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="full_access_staff">Full Access Staff</option>
                    <option value="tournament_editor">Tournament Editor</option>
                    <option value="news_editor">News & Media Editor</option>
                    <option value="tournament_viewer">Tournament Viewer</option>
                    <option value="match_results_manager">Match Results Manager</option>
                    <option value="gallery_manager">Gallery Manager</option>
                  </select>
                </div>
              </div>

              {/* INITIAL PERMISSIONS TOGGLE */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-400">
                  Initial Module Permissions
                </h4>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { key: "can_view_dashboard", label: "View Dashboard Stats" },
                    { key: "can_view_tournaments", label: "View Tournaments" },
                    { key: "can_create_tournaments", label: "Create Tournaments" },
                    { key: "can_edit_tournaments", label: "Edit Tournament Details" },
                    { key: "can_delete_tournaments", label: "Delete Tournaments" },
                    { key: "can_manage_news", label: "Manage News & Announcements" },
                    { key: "can_view_contact_messages", label: "View Contact Messages" },
                    { key: "can_manage_matches", label: "Manage Match Fixtures" },
                    { key: "can_publish_results", label: "Publish Final Match Results" },
                    { key: "can_manage_gallery", label: "Upload / Delete Gallery" },
                    { key: "can_manage_users", label: "User Management Access" },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-black p-3 text-xs font-semibold text-gray-300 transition hover:border-zinc-700"
                    >
                      <span>{perm.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(createForm.permissions[perm.key])}
                        onChange={() => handleToggleCreatePermission(perm.key)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  Edit Account Privileges
                </p>
                <h3 className="text-2xl font-bold text-white">{selectedUser.username}</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-2 text-xl font-bold text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
       
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Role Title
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="full_access_staff">Full Access Staff</option>
                    <option value="tournament_editor">Tournament Editor</option>
                    <option value="news_editor">News & Media Editor</option>
                    <option value="tournament_viewer">Tournament Viewer</option>
                    <option value="match_results_manager">Match Results Manager</option>
                    <option value="gallery_manager">Gallery Manager</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Reset Password (Optional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {/* MODULE ACCESS FLAGS */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-400">
                  Module Access Flags
                </h4>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { key: "can_view_dashboard", label: "View Dashboard Stats" },
                    { key: "can_view_tournaments", label: "View Tournaments" },
                    { key: "can_create_tournaments", label: "Create Tournaments" },
                    { key: "can_edit_tournaments", label: "Edit Tournament Details" },
                    { key: "can_delete_tournaments", label: "Delete Tournaments" },
                    { key: "can_manage_news", label: "Manage News & Announcements" },
                    { key: "can_view_contact_messages", label: "View Contact Messages" },
                    { key: "can_manage_matches", label: "Manage Match Fixtures" },
                    { key: "can_publish_results", label: "Publish Final Match Results" },
                    { key: "can_manage_gallery", label: "Upload / Delete Gallery" },
                    { key: "can_manage_users", label: "User Management Access" },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-black p-3 text-xs font-semibold text-gray-300 transition hover:border-zinc-700"
                    >
                      <span>{perm.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(editPermissions[perm.key])}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Rights"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY RE-AUTHENTICATION POPUP MODAL */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-red-500/10 space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl text-red-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Authorization Required
                </h3>
                <p className="text-xs text-red-400 font-semibold">
                  Confirm credentials for target: {pendingAction?.username}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {pendingAction?.type === "DELETE_USER"
                ? `You are deleting staff user account "${pendingAction?.username}". Enter your Super Admin credentials to authorize.`
                : `You are modifying password or administrative rights for "${pendingAction?.username}". Please re-authenticate.`}
            </p>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Super Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={reauth.username}
                  onChange={(e) => setReauth({ ...reauth, username: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={reauth.password}
                  onChange={(e) => setReauth({ ...reauth, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {reauthMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-500 shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}