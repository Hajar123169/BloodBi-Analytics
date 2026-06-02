import { apiGet, apiPost } from "./client";

export async function getRequests() {
  return apiGet("/requests");
}

export async function createRequest(data) {
  return apiPost("/requests", data);
}