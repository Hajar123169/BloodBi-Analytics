import { apiPost } from "./client";

export async function loginUser(data) {
  return apiPost(
    "/auth/login",
    data
  );
}

export async function registerUser(data) {
  return apiPost(
    "/auth/register-donor",
    data
  );
}