import { apiFetch } from "../lib/http";
import type {
  DssOptionsResponse,
  DssSimulationRequest,
  DssSimulationResponse,
  HistoryListResponse,
} from "../types/api";

const DSS_PREFIX = "/api/v1/dss";

export function getDssOptions() {
  return apiFetch<DssOptionsResponse>(`${DSS_PREFIX}/options`);
}

export function simulateDss(payload: DssSimulationRequest) {
  return apiFetch<DssSimulationResponse>(`${DSS_PREFIX}/simulate`, {
    method: "POST",
    authMode: "optional",
    body: JSON.stringify(payload),
  });
}

export function listDssHistories() {
  return apiFetch<HistoryListResponse>(`${DSS_PREFIX}/histories`, {
    authMode: "required",
  });
}

export function getDssHistoryDetail(historyId: string) {
  return apiFetch<DssSimulationResponse>(`${DSS_PREFIX}/histories/${historyId}`, {
    authMode: "required",
  });
}

export function deleteDssHistory(historyId: string) {
  return apiFetch<{ message: string }>(`${DSS_PREFIX}/histories/${historyId}`, {
    method: "DELETE",
    authMode: "required",
  });
}
