// src/utils/api.js
import { API_BASE as CFG_BASE } from "@/config";

const BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  CFG_BASE ||
  "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) msg += ` — ${text}`;
    } catch {}
    throw new Error(msg);
  }
  return res;
}

export async function apiGet(path) {
  const res = await request(path, { method: "GET" });
  return res.json();
}

export async function apiPost(path, body) {
  const res = await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body == null ? undefined : JSON.stringify(body),
  });
  return res.json();
}

export async function apiPatch(path, body) {
  const res = await request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body == null ? undefined : JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete(path) {
  await request(path, { method: "DELETE" });
  return null;
}

// Generic JSON sender, if you want it
export async function apiSend(path, method, body) {
  const res = await request(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body == null ? undefined : JSON.stringify(body),
  });
  // most of your endpoints return JSON; adjust if any return empty body
  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : null;
}

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

  const res = await request(path, { method: "POST", body: form });
  return res.json(); // { url: "/uploads/..." }
}

// Optional: export the resolved base for debugging
export { BASE as API_BASE };
