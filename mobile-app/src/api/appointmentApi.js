import { apiGet, apiPost } from "./client";

export async function getAppointments() {
  return apiGet("/appointments");
}

export async function createAppointment(data) {
  return apiPost("/appointments", data);
}