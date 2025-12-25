import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // normalize error
    const e = err as any;
    const payload = { message: e.message, status: e.response?.status, data: e.response?.data };
    return Promise.reject(payload);
  }
);

export async function apiGet(path: string) {
  const res = await client.get(path);
  return res.data;
}

export async function apiPost(path: string, body: any) {
  const res = await client.post(path, body);
  return res.data;
}

// Convenience helpers
export async function getProgramsWellness() {
  // try compatibility path first
  try {
    return await apiGet('/api/programs/wellness');
  } catch (err) {
    return apiGet('/programs/?tag=wellness');
  }
}

export async function getProgramsActivities() {
  try {
    return await apiGet('/api/programs/activities');
  } catch (err) {
    return apiGet('/programs/?tag=activities');
  }
}

export default client;
