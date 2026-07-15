import { apiFetch } from "../lib/http";
import type {
  DssOptionsResponse,
  DssSimulationRequest,
  DssSimulationResponse,
  HistoryListResponse,
  VisualizationResponse,
} from "../types/api";

const DSS_PREFIX = "/api/v1/dss";

export function getDssOptions() {
  return apiFetch<DssOptionsResponse>(`${DSS_PREFIX}/options`);
}

export function simulateDss(payload: DssSimulationRequest) {
  const normalizedPayload = {
    ...payload,
    ...(payload.duck_buy_price_rp_per_duck == null
      ? {}
      : { duck_buy_price_rp_per_duck: payload.duck_buy_price_rp_per_duck }),
  };

  return apiFetch<DssSimulationResponse>(`${DSS_PREFIX}/simulate`, {
    method: "POST",
    authMode: "optional",
    body: JSON.stringify(normalizedPayload),
  });
}

export function getDssVisualization(payload: DssSimulationRequest) {
  const normalizedPayload = {
    ...payload,
    ...(payload.duck_buy_price_rp_per_duck == null
      ? {}
      : { duck_buy_price_rp_per_duck: payload.duck_buy_price_rp_per_duck }),
  };

  return apiFetch<VisualizationResponse>(`${DSS_PREFIX}/visualize`, {
    method: "POST",
    authMode: "optional",
    body: JSON.stringify(normalizedPayload),
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
