import api from "../services/api";

export default function getImageUrl(filePath) {
  if (!filePath) return "";

  const path = String(filePath)
    .trim()
    .replace(/\\/g, "/");

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseURL = String(api.defaults.baseURL || "").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${baseURL}/${cleanPath}`;
}