import {
  getToken,
} from "../services/authService";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://192.168.1.15:8081/api";

async function request(
  path,
  options = {}
) {
  try {

    const url =
      `${API_URL}${path}`;

    const token =
      await getToken();

    console.log(
      "REQUEST URL:",
      url
    );

    const response =
      await fetch(url, {
        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),

          ...(options.headers || {}),
        },

        ...options,
      });

    if (!response.ok) {

      const errorText =
        await response.text();

      console.log(
        "SERVER RESPONSE:",
        errorText
      );

      throw new Error(
        `HTTP Error ${response.status}`
      );
    }

    const text =
      await response.text();

    if (!text) {
      return null;
    }

    return JSON.parse(text);

  } catch (error) {

    console.log(
      "API ERROR:",
      error.message
    );

    throw error;
  }
}

export async function apiGet(
  path
) {
  return request(path);
}

export async function apiPost(
  path,
  data
) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiPut(
  path,
  data
) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiDelete(
  path
) {
  return request(path, {
    method: "DELETE",
  });
}

export { API_URL };