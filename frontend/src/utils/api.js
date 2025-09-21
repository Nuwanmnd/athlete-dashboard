// frontend/src/utils/api.js
import { API_BASE as CFG_BASE } from "@/config";

/**
 * Resolve API base:
 * - Prefer VITE_API_BASE if set (make sure it ENDS WITH /api if your backend mounts /api)
 * - Else take from config.js
 * - Else default to "/api" (dev proxy / nginx prefix)
 *
 * We also strip trailing slashes to avoid // in URLs.
 */
const RAW_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  CFG_BASE ||
  "/api";

export const API_BASE = String(RAW_BASE).replace(/\/+$/, "");

/** Build a full URL from a relative API path */
function buildUrl(path) {
  if (!path) throw new Error("Missing path");
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

/** Single internal fetch helper (no duplicate names) */
async function _req(
  path,
  { method = "GET", body, headers = {}, auth = true } = {}
) {
  const init = {
    method,
    headers: { ...headers },
    credentials: "include", // cookie-based auth
  };

  if (body instanceof FormData) {
    init.body = body; // browser sets multipart boundary
  } else if (body != null) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path), init);
  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = ct.includes("application/json")
        ? await res.json()
        : await res.text();
      if (typeof data === "string" && data) msg += ` — ${data}`;
      else if (data?.detail) msg += ` — ${data.detail}`;
      else if (data?.message) msg += ` — ${data.message}`;
    } catch {}
    throw new Error(msg);
  }

  return ct.includes("application/json") ? res.json() : res.text();
}

/* -----------------------------
 * Simple REST helpers (JSON)
 * ---------------------------*/
export const apiGet = (path, opts) =>
  _req(path, { ...(opts || {}), method: "GET" });

export const apiPost = (path, body, opts) =>
  _req(path, { ...(opts || {}), method: "POST", body });

export const apiPatch = (path, body, opts) =>
  _req(path, { ...(opts || {}), method: "PATCH", body });

export const apiDelete = (path, opts) =>
  _req(path, { ...(opts || {}), method: "DELETE" });

/**
 * Flexible upload helper:
 * - apiUpload(file) -> POST /upload with file
 * - apiUpload(FormData) -> POST /upload with your FormData
 * - apiUpload("/some/endpoint", FormData) -> custom endpoint
 */
export async function apiUpload(arg1, arg2) {
  let path = "/upload";
  let form;

  if (typeof arg1 === "string") {
    path = arg1 || "/upload";
    form = arg2;
  } else if (arg1 instanceof FormData) {
    form = arg1;
  } else if (arg1) {
    form = new FormData();
    form.append("file", arg1);
  } else {
    throw new Error("apiUpload needs a File/Blob or FormData");
  }

  return _req(path, { method: "POST", body: form });
}

/* -----------------------------
 * Auth endpoints (cookie based)
 * ---------------------------*/
export const auth = {
  me: () => _req("/auth/me"),
  login: (data) => _req("/auth/login", { method: "POST", body: data, auth: false }),
  logout: () => _req("/auth/logout", { method: "POST", auth: false }),
  register: (data) =>
    _req("/auth/register", { method: "POST", body: data, auth: false }),
  requestReset: (data) =>
    _req("/auth/request-reset", { method: "POST", body: data, auth: false }),
  // ✅ match backend route (/auth/reset), not /auth/reset-password
  resetPassword: (data) =>
    _req("/auth/reset", { method: "POST", body: data, auth: false }),
};

/* ---------------------------------
 * Convenience namespace
 * --------------------------------*/
export const api = {
  ...auth,

  athletes: {
    list: () => _req("/athletes/"),
    get: (id) => _req(`/athletes/${id}`),
    create: (body) => _req("/athletes/", { method: "POST", body }),
    update: (id, body) => _req(`/athletes/${id}`, { method: "PATCH", body }),
    remove: (id) => _req(`/athletes/${id}`, { method: "DELETE" }),
  },

  assessments: {
    listForAthlete: (id) => _req(`/assessments/athlete/${id}`),
    create: (body) => _req("/assessments/", { method: "POST", body }),
  },

  movement: {
    listForAthlete: (id) => _req(`/movement-assessments/athlete/${id}`),
    create: (body) => _req("/movement-assessments/", { method: "POST", body }),
  },

  injuries: {
    listForAthlete: (id) => _req(`/injuries/${id}`),
    create: (body) => _req("/injuries/", { method: "POST", body }),
  },

  notes: {
    listForAthlete: (id) => _req(`/athletes/${id}/notes`),
  },

  upload: (pathOrForm, maybeForm) =>
    typeof pathOrForm === "string"
      ? _req(pathOrForm || "/upload", { method: "POST", body: maybeForm })
      : apiUpload(pathOrForm),
};
