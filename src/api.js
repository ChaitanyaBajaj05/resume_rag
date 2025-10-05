const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ------------------ LOGIN ------------------
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
  }
  return data;
}

// ------------------ TOKEN REFRESH ------------------
async function refreshToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return false;

  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("access", data.access);
    return data.access;
  } else {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return false;
  }
}

// ------------------ AUTH HELPERS ------------------
function getAuthHeaders() {
  const token = localStorage.getItem("access");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithAuth(url, options = {}) {
  options.headers = { ...(options.headers || {}), ...getAuthHeaders() };
  let res = await fetch(url, options);

  if (res.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      options.headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, options);
    }
  }

  if (!res.ok) {
    let errDetail = "Request failed";
    try {
      const data = await res.json();
      errDetail = data.detail || errDetail;
    } catch {}
    throw new Error(errDetail);
  }
  return res;
}

// ------------------ API FUNCTIONS ------------------

// ✅ Resume Upload
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetchWithAuth(`${API_BASE}/resumes/upload/`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

// ✅ Resume List
export async function listResumes(q = "", limit = 10, offset = 0) {
  const url = new URL(`${API_BASE}/resumes/`);
  url.searchParams.set("limit", limit);
  url.searchParams.set("offset", offset);
  if (q) url.searchParams.set("q", q);
  const res = await fetchWithAuth(url.toString());
  return res.json();
}

// ✅ Resume Detail
export async function getResume(id) {
  const res = await fetchWithAuth(`${API_BASE}/resumes/${id}/`);
  return res.json();
}

// ✅ Ask AI
export async function ask(query, k = 5) {
  const res = await fetchWithAuth(`${API_BASE}/ask/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, k }),
  });
  return res.json();
}

// ✅ Job Create
export async function createJob(data, idempotencyKey = null) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const res = await fetchWithAuth(`${API_BASE}/jobs/`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
}

// ✅ Job List
export async function listJobs() {
  const res = await fetchWithAuth(`${API_BASE}/jobs/list/`);
  const data = await res.json();
  return data.results || [];
}

// ✅ Job Match
export async function matchJob(id, top_n = 10) {
  const res = await fetchWithAuth(`${API_BASE}/jobs/${id}/match/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ top_n }),
  });
  return res.json();
}
