export type SearchRequest = {
  logic: "AND" | "OR";
  page: number;
  pageSize: number;
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  position?: string;
  company?: string;
  companyPhone?: string;
  website?: string;
  domain?: string;
  facebook?: string;
  linkedinCompanyPage?: string;
};

export type ContactRow = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  position: string;
  company: string;
  companyPhone: string;
  website: string;
  domain: string;
  facebook: string;
  twitter: string;
  linkedinCompanyPage: string;
  country: string;
  state: string;
};

const env = (
  import.meta as unknown as { env: Record<string, string | undefined> }
).env;
const BASE_URL = env.VITE_API_URL || "http://localhost:8080";

function getDeviceFingerprint(): string {
  const ua = navigator.userAgent;
  const plat: string =
    (navigator as Navigator & { platform?: string }).platform || "";
  return btoa(`${ua}|${plat}`);
}

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function authHeaders(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Device-Fingerprint": getDeviceFingerprint(),
  };
  const tok = getToken();
  if (tok) h["Authorization"] = `Bearer ${tok}`;
  return h;
}

async function parseJsonOrThrow(res: Response) {
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!res.ok) {
    const err: any = new Error(
      data?.error || data?.message || res.statusText || `HTTP ${res.status}`
    );
    if (data) {
      err.data = data;
    }
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Fingerprint": getDeviceFingerprint(),
    },
    body: JSON.stringify({
      email,
      password,
      deviceFingerprint: getDeviceFingerprint(),
    }),
  });
  return parseJsonOrThrow(res);
}

export function logoutLocal() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_expires");
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  await parseJsonOrThrow(res);
  logoutLocal();
}

export async function searchApi(
  req: SearchRequest
): Promise<{ rows: ContactRow[]; total: number }> {
  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  return parseJsonOrThrow(res);
}

export type UploadRecord = {
  id: number;
  original_filename: string;
  safe_name: string;
  serial_number: number | null;
  status: string;
  size_bytes: number | null;
  row_count: number | null;
  processed_rows?: number | null;
  progress_pct?: number | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export async function listUploads(): Promise<{ uploads: UploadRecord[] }> {
  const res = await fetch(`${BASE_URL}/admin/uploads`, {
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res);
}

export async function uploadCsv(
  file: File
): Promise<{ file_id: number; status: string }> {
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {
    "X-Device-Fingerprint": getDeviceFingerprint(),
  };
  const tok = getToken();
  if (tok) headers["Authorization"] = `Bearer ${tok}`;
  const res = await fetch(`${BASE_URL}/admin/uploads`, {
    method: "POST",
    headers,
    body: form,
  });
  return parseJsonOrThrow(res);
}

export async function createRegistrationRequest(input: {
  name: string;
  email: string;
  phone_number: string;
  state?: string;
  requested_searches: number;
}) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(res);
}

export async function adminCreateUser(input: {
  email: string;
  password: string;
  role?: "ADMIN" | "USER";
  name?: string;
  dailySearchLimit?: number;
}) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(res);
}

export async function adminListRegistrationRequests(page = 1, limit = 50) {
  const res = await fetch(
    `${BASE_URL}/admin/registration-requests?page=${page}&limit=${limit}`,
    {
      headers: authHeaders(),
    }
  );
  return parseJsonOrThrow(res);
}

export async function adminUpdateRegistrationRequest(
  id: string,
  input: { status: "APPROVED" | "REJECTED"; admin_notes?: string }
) {
  const res = await fetch(`${BASE_URL}/admin/registration-requests/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(res);
}

export async function adminListUsers() {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res) as Promise<{
    users: Array<{
      id: string;
      email: string;
      role: "ADMIN" | "USER";
      name: string;
      dailySearchLimit: number;
      is_active: boolean;
      created_at: string;
    }>;
  }>;
}

export async function adminUpdateUser(
  id: string,
  input: Partial<{
    name: string;
    role: "ADMIN" | "USER";
    dailySearchLimit: number;
    is_active: boolean;
    password: string;
  }>
) {
  const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(res);
}

export async function adminListUserSessions(userId: string) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/sessions`, {
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res) as Promise<{
    sessions: Array<{
      id: string;
      ip: string;
      user_agent: string;
      device_fingerprint: string;
      created_at: string;
      expires_at: string;
      is_active?: boolean;
      logged_out_at?: string | null;
    }>;
  }>;
}

export async function adminLogoutSession(sessionId: string) {
  const res = await fetch(`${BASE_URL}/admin/sessions/${sessionId}/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res);
}

export async function logoutSessionByCredentials(
  sessionId: string,
  email: string,
  password: string
) {
  const res = await fetch(
    `${BASE_URL}/auth/sessions/${sessionId}/logout-by-credentials`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );
  return parseJsonOrThrow(res);
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
  return parseJsonOrThrow(res) as Promise<{
    id: string;
    email: string;
    role: "ADMIN" | "USER";
    name: string;
    searches_today: number;
    daily_limit: number;
  }>;
}

export async function getUserHistory(page = 1, limit = 25) {
  const res = await fetch(
    `${BASE_URL}/user/history?page=${page}&limit=${limit}`,
    { headers: authHeaders() }
  );
  return parseJsonOrThrow(res) as Promise<{
    items: Array<{
      id: string;
      params: string;
      total: number;
      created_at: string;
    }>;
    total_count: number;
    page: number;
    limit: number;
  }>;
}

export async function getUserLastSearch() {
  const res = await fetch(`${BASE_URL}/user/last-search`, {
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res) as Promise<{
    rows: ContactRow[];
    total: number;
    params: any;
  }>;
}

export async function adminGetUserSearches(
  userId: string,
  page = 1,
  limit = 25
) {
  const res = await fetch(
    `${BASE_URL}/admin/users/${userId}/searches?page=${page}&limit=${limit}`,
    { headers: authHeaders() }
  );
  return parseJsonOrThrow(res) as Promise<{
    items: Array<{
      id: string;
      device: string;
      ip: string;
      agent: string;
      params: string;
      total: number;
      created_at: string;
    }>;
    total_count: number;
    page: number;
    limit: number;
  }>;
}

export async function adminDeleteUser(userId: string) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res);
}
