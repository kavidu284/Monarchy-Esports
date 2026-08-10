export const ADMIN_SESSION_DURATION_MS = 60 * 60 * 1000;
export const ADMIN_TOKEN_KEY = "token";
export const ADMIN_SESSION_EXPIRES_AT_KEY = "adminSessionExpiresAt";
export const ADMIN_ROLE_KEY = "adminRole";
export const ADMIN_PERMISSIONS_KEY = "adminPermissions";
export const ADMIN_USERNAME_KEY = "adminUsername";

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_SESSION_EXPIRES_AT_KEY);
  localStorage.removeItem(ADMIN_ROLE_KEY);
  localStorage.removeItem(ADMIN_PERMISSIONS_KEY);
  localStorage.removeItem(ADMIN_USERNAME_KEY);
};

export const setAdminSession = (token, admin = null) => {
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION_MS;

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_SESSION_EXPIRES_AT_KEY, String(expiresAt));

  if (admin) {
    localStorage.setItem(ADMIN_USERNAME_KEY, admin.username || "");
    localStorage.setItem(ADMIN_ROLE_KEY, admin.role || "");
    localStorage.setItem(
      ADMIN_PERMISSIONS_KEY,
      JSON.stringify(admin.permissions || {})
    );
  }

  return expiresAt;
};

export const getValidAdminToken = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(ADMIN_SESSION_EXPIRES_AT_KEY));

  if (!token || !expiresAt || Date.now() >= expiresAt) {
    clearAdminSession();
    return null;
  }

  return token;
};

export const isLoggedIn = () => {
  return !!getValidAdminToken();
};

export const isSuperAdmin = () => {
  if (!isLoggedIn()) return false;
  const role = localStorage.getItem(ADMIN_ROLE_KEY);
  return role === "super_admin" || role === "Super Admin";
};

export const getAdminPermissions = () => {
  if (!isLoggedIn()) return {};
  try {
    const raw = localStorage.getItem(ADMIN_PERMISSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const canAccess = (permissionKey) => {
  if (!isLoggedIn()) return false;
  if (isSuperAdmin()) return true;
  if (!permissionKey) return true;

  const permissions = getAdminPermissions();
  return Boolean(permissions[permissionKey]);
};