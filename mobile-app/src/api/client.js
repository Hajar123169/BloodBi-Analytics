export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api';

export async function apiGet(path, fallback) {
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (error) {
    return fallback;
  }
}
