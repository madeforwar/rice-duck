export interface SimInput {
  lahanLuas: number;
  jumlahBebek: number;
  varietasPadi: string;
  sistemTanam: string;
  tanggalTanam: string;
  umurBebek: number;
}

export interface SimOutput {
  currentDensity: number;
  currentYield: number;
  optimalDensity: number;
  optimalYield: number;
  sustainabilityScore: number;
  risikoHama: 'Rendah' | 'Sedang' | 'Tinggi';
  kategori: string;
  densityStatus: 'ok' | 'warning' | 'danger';
  financials: FinancialRow[];
  ecological: EcologicalRow[];
  rekomendasi: Rekomendasi[];

  durasiAktual: number;
  durasiRekomendasi: number;
  profitRaw: number;
  optProfitRaw: number;
  profitFormatted: string;
  optProfitFormatted: string;
  selisihProfitFormatted: string;
  hematPupukAktual: number;
  hematPupukRekomendasi: number;
  hematGulmaAktual: number;
  hematGulmaRekomendasi: number;
  dampakLingkunganAktual: string;

  // Detailed yield metrics
  berasYield: number;
  optimalBerasYield: number;
  duckYield: number;
  optimalDuckYield: number;

  // Detailed profit metrics
  profitGabah: number;
  optProfitGabah: number;
  profitBebek: number;
  optProfitBebek: number;
  profitBeras: number;
  optProfitBeras: number;

  profitGabahFormatted: string;
  optProfitGabahFormatted: string;
  profitBebekFormatted: string;
  optProfitBebekFormatted: string;
  profitBerasFormatted: string;
  optProfitBerasFormatted: string;

  // Detailed weed savings
  savingGulmaHariActual: string;
  savingGulmaHariOptimal: string;

  // Detailed fertilizer savings
  hematN_Actual: number;
  hematP_Actual: number;
  hematK_Actual: number;
  hematN_Optimal: number;
  hematP_Optimal: number;
  hematK_Optimal: number;

  // Detailed emissions metrics
  emisiCO2_Actual: number;
  emisiCO2_Optimal: number;
  emisiCH4_Actual: number;
  emisiCH4_Optimal: number;
  reduksiCO2_Actual: number;
  reduksiCO2_Optimal: number;
  reduksiCH4_Actual: number;
  reduksiCH4_Optimal: number;
}

export interface FinancialRow {
  metric: string;
  actual: string;
  optimal: string;
  actualIsNegative?: boolean;
}

export interface EcologicalRow {
  metric: string;
  actual: string;
  optimal: string;
}

export interface Rekomendasi {
  kategori: string;
  tindakan: string;
  dampak: string;
  prioritas: 'high' | 'medium' | 'low';
}

export type Page = 'dashboard' | 'simulasi' | 'laporan';