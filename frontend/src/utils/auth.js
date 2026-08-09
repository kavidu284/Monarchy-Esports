export const ADMIN_SESSION_DURATION_MS = 60 * 60 * 1000;
export const ADMIN_TOKEN_KEY = "token";
export const ADMIN_SESSION_EXPIRES_AT_KEY = "adminSessionExpiresAt";

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_SESSION_EXPIRES_AT_KEY);
};

export const setAdminSession = (token) => {
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION_MS;

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_SESSION_EXPIRES_AT_KEY, String(expiresAt));

  return expiresAt;
};

export const getValidAdminToken = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(ADMIN_SESSION_EXPIRES_AT_KEY));

  if (!token || !expiresAt) {
    clearAdminSession();
    return null;
  }

  if (Date.now() >= expiresAt) {
    clearAdminSession();
    return null;
  }

  return token;
};

export const isLoggedIn = () => {
  return !!getValidAdminToken();
};