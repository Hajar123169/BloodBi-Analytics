import { apiGet, apiPut } from "./client";

export async function getDonors() {
  return apiGet("/donors");
}

export async function getDonorById(id) {
  return apiGet(`/donors/${id}`);
}

export async function updateDonor(id, data) {
  return apiPut(`/donors/${id}`, data);
}