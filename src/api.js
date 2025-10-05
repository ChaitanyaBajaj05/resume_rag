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

// ------------------ AUTH HEADERS ------------------
function getAuthHeaders() {
  const token = localStorage.getItem("access");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ------------------ FETCH WITH AUTH ------------------
async function fetchWithAuth(url, options = {}) {
  // Attach auth header to every request
  options.headers = { ...(options.headers || {}), ...getAuthHeaders() };

  let res = await fetch(url, options);

  if (res.status === 401) {
    // Try refresh token
    const newToken = await refreshToken();
    if (newToken) {
      options.headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, options);
    }
  }

  // Uniform error handling
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

// Upload resume
export async function uploadResume(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetchWithAuth(`${API_BASE}/resumes/upload/`, {
    method: "POST",
    body: fd,
  });
  return res.json();
}

// List resumes
export async function listResumes(q = "", limit = 10, offset = 0) {
  const url = new URL(`${API_BASE}/resumes/`);
  url.searchParams.set("limit", limit);
  url.searchParams.set("offset", offset);
  if (q) url.searchParams.set("q", q);
  const res = await fetchWithAuth(url.toString());
  return res.json();
}

// Get a single resume
export async function getResume(id) {
  const res = await fetchWithAuth(`${API_BASE}/resumes/${id}/`);
  return res.json();
}

// Ask query
export async function ask(query, k = 5) {
  const res = await fetchWithAuth(`${API_BASE}/ask/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, k }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Ask query failed");
  }
  return res.json();
}

// Create job
export async function createJob(data, idempotencyKey = null) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  };

  const res = await fetchWithAuth(`${API_BASE}/jobs/`, options);
  return res.json();
}

// List jobs
export async function listJobs() {
  const res = await fetchWithAuth(`${API_BASE}/jobs/list/`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch jobs");
  }
  const data = await res.json();
  return data.results || [];
}

// Match job
export async function matchJob(id, top_n = 10) {
  const res = await fetchWithAuth(`${API_BASE}/jobs/${id}/match/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ top_n }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Match job failed");
  }
  return res.json();
}
