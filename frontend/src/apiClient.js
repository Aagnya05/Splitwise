// src/apiClient.js

const API = "http://127.0.0.1:8000"; // FastAPI backend

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  // Some DELETE endpoints may return empty body
  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export const PersonAPI = {
  list() {
    return request("/people/");
  },
  create(data) {
    // data should look like:
    // { name, email, phone, avatar_color }
    return request("/people/", {
      method: "POST",
      body: data,
    });
  },
  delete(id) {
    return request(`/people/${id}`, {
      method: "DELETE",
    });
  },
};

export const ExpenseAPI = {
  list() {
    return request("/expenses/");
  },
  create(data) {
    return request("/expenses/", {
      method: "POST",
      body: data,
    });
  },
};
