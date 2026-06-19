import type { SimInput, SimOutput } from '../types';

function formatRupiah(valueInMillions: number): string {
  const raw = Math.round(valueInMillions * 1_000_000);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(raw).replace(/\u00a0/g, ' ');
}

const VARIETY_BASE: Record<string, number> = {
  'Cigelis': 6.4,
  'Ciherang': 6.8,
  'Inpari 32': 7.2,
  'Sertani': 6.6,
};

const SYSTEM_FACTOR: Record<string, number> = {
  'Jajar Legowo': 1.12,
  'Tegel/Konvensional': 1.08,
  'Double Transplant': 1.0,
  'SRI': 1.15,
};

export function calculate(input: SimInput): SimOutput {
  const base = VARIETY_BASE[input.varietasPadi] ?? 6.5;
  const sysFactor = SYSTEM_FACTOR[input.sistemTanam] ?? 1.0;
  const areaFactor = Math.min(1 + input.lahanLuas * 0.01, 1.08);

  const densityPerHa = input.jumlahBebek / input.lahanLuas;
  const optimalDensity = 80;

  const duckFactor = densityPerHa > 200
    ? 0.9
    : densityPerHa > 120
    ? 0.97
    : densityPerHa >= 60
    ? 1.08
    : 0.95;

  const currentYield = +(base * sysFactor * areaFactor * duckFactor).toFixed(1);
  const optimalYield = +(base * sysFactor * areaFactor * 1.08).toFixed(1);

  const densityStatus = densityPerHa > 180 ? 'danger' : densityPerHa < 50 ? 'warning' : 'ok';
  const risikoHama = densityStatus === 'danger' || densityStatus === 'warning' ? 'Tinggi' : 'Rendah';
  
  const isTooYoung = input.umurBebek < 14;
  const isTooOld = input.umurBebek > 30;
  const agePenalty = isTooYoung ? 15 : isTooOld ? 10 : 0;

  const sustainabilityScore = Math.max(0, Math.min(100, Math.round(
    60 + (duckFactor - 0.9) * 200 + (sysFactor - 1) * 60 - agePenalty
  )));

  const biayaPupuk = densityPerHa >= 60 ? -0.8 : -1.45;
  const optBiayaPupuk = -0.8;
  const revenue = +(currentYield * input.lahanLuas * 5.2).toFixed(1);
  const optRevenue = +(optimalYield * input.lahanLuas * 5.2).toFixed(1);
  
  const actualProfitMargin = densityPerHa >= 60 && densityPerHa <= 120 ? 0.78 : 0.72;
  const profit = +(revenue * actualProfitMargin).toFixed(1);
  const optProfit = +(optRevenue * 0.78).toFixed(1);

  const isOptimalBebek = densityPerHa >= 60 && densityPerHa <= 120 && input.umurBebek >= 14 && input.umurBebek <= 28;
  const durasiRekomendasi = 60;
  const durasiAktual = isOptimalBebek ? 60 : Math.max(30, Math.min(75, 80 - input.umurBebek));

  const hematPupukRekomendasi = 50;
  const hematPupukAktual = densityPerHa >= 75 && densityPerHa <= 90 ? 50 : densityPerHa >= 60 && densityPerHa <= 120 ? 45 : densityPerHa < 50 ? 15 : densityPerHa > 180 ? 25 : 35;

  const hematGulmaRekomendasi = 80;
  const hematGulmaAktual = densityPerHa >= 75 && densityPerHa <= 90 ? 80 : densityPerHa >= 60 && densityPerHa <= 120 ? 75 : densityPerHa < 50 ? 30 : densityPerHa > 180 ? 85 : 55;

  const dampakLingkunganAktual = sustainabilityScore >= 85 ? 'Sangat Baik (A)' : sustainabilityScore >= 70 ? 'Baik (B+)' : sustainabilityScore >= 55 ? 'Cukup (B)' : 'Kurang (C)';

  // Detailed yield calculations (convert tons/ha to kg/a by multiplying by 10)
  const berasYield = +(currentYield * 10 * 0.6).toFixed(1);
  const optimalBerasYield = +(optimalYield * 10 * 0.6).toFixed(1);

  // Duck weight growth: base 0.5kg + age*0.02 + duration*0.015, capped between 1.0 - 2.2 kg
  const densityPenalty = densityPerHa > 150 ? -0.15 : densityPerHa < 40 ? 0.05 : 0;
  const optimalDuckYield = +(Math.max(1.0, Math.min(2.2, 0.5 + (21 * 0.02) + (durasiRekomendasi * 0.015)))).toFixed(2);
  const duckYield = isOptimalBebek ? optimalDuckYield : +(Math.max(1.0, Math.min(2.2, 0.5 + (input.umurBebek * 0.02) + (durasiAktual * 0.015) + densityPenalty))).toFixed(2);

  // Detailed profit calculations
  const profitGabah = profit;
  const optProfitGabah = optProfit;

  // beras price is 12.0 (millions/unit), profit margin is 70% for actual, 76% for optimal
  const actualBerasMargin = densityPerHa >= 60 && densityPerHa <= 120 ? 0.76 : 0.70;
  const profitBeras = +(currentYield * input.lahanLuas * 0.6 * 12.0 * actualBerasMargin).toFixed(1);
  const optProfitBeras = +(optimalYield * input.lahanLuas * 0.6 * 12.0 * 0.76).toFixed(1);

  // duck price is 0.04 (40,000 IDR/kg), cost is 0.015 (15,000 IDR/duckling + feed)
  const profitBebek = +(input.jumlahBebek * (Number(duckYield) * 0.04 - 0.015)).toFixed(1);
  const optJumlahBebek = Math.round(80 * input.lahanLuas);
  const optProfitBebek = +(optJumlahBebek * (Number(optimalDuckYield) * 0.04 - 0.015)).toFixed(1);

  const profitGabahFormatted = formatRupiah(profitGabah);
  const optProfitGabahFormatted = formatRupiah(optProfitGabah);
  const profitBebekFormatted = formatRupiah(profitBebek);
  const optProfitBebekFormatted = formatRupiah(optProfitBebek);
  const profitBerasFormatted = formatRupiah(profitBeras);
  const optProfitBerasFormatted = formatRupiah(optProfitBeras);

  // Weeds labor cost savings (Rp/hari)
  // Baseline weeding requires 0.4 worker-days per are of land, paid 120,000 IDR/day
  const savingGulmaHariActualVal = Math.round(120000 * input.lahanLuas * 0.4 * (hematGulmaAktual / 100));
  const savingGulmaHariOptimalVal = Math.round(120000 * input.lahanLuas * 0.4 * (hematGulmaRekomendasi / 100));
  const formatRupiahHari = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val).replace(/\u00a0/g, ' ') + '/hari';
  };
  const savingGulmaHariActual = formatRupiahHari(savingGulmaHariActualVal);
  const savingGulmaHariOptimal = formatRupiahHari(savingGulmaHariOptimalVal);

  // Fertilizer N-P-K savings (in kg)
  // Baseline per hectare: N=150kg, P=75kg, K=75kg
  const hematN_Actual = +(150 * input.lahanLuas * (hematPupukAktual / 100)).toFixed(1);
  const hematP_Actual = +(75 * input.lahanLuas * (hematPupukAktual / 100)).toFixed(1);
  const hematK_Actual = +(75 * input.lahanLuas * (hematPupukAktual / 100)).toFixed(1);

  const hematN_Optimal = +(150 * input.lahanLuas * (hematPupukRekomendasi / 100)).toFixed(1);
  const hematP_Optimal = +(75 * input.lahanLuas * (hematPupukRekomendasi / 100)).toFixed(1);
  const hematK_Optimal = +(75 * input.lahanLuas * (hematPupukRekomendasi / 100)).toFixed(1);

  // Environmental emissions (CO2 and CH4)
  // Baseline: CO2e = 5.5 tons/ha, CH4 = 180 kg/ha
  const baselineCO2e = 5.5 * input.lahanLuas;
  const baselineCH4 = 180 * input.lahanLuas;

  const reduksiCO2_Actual = +(baselineCO2e * (sustainabilityScore / 100) * 0.40).toFixed(2);
  const reduksiCO2_Optimal = +(baselineCO2e * 1.0 * 0.40).toFixed(2);

  const reduksiCH4_Actual = +(baselineCH4 * (sustainabilityScore / 100) * 0.45).toFixed(1);
  const reduksiCH4_Optimal = +(baselineCH4 * 1.0 * 0.45).toFixed(1);

  const emisiCO2_Actual = +(baselineCO2e - reduksiCO2_Actual).toFixed(2);
  const emisiCO2_Optimal = +(baselineCO2e - reduksiCO2_Optimal).toFixed(2);

  const emisiCH4_Actual = +(baselineCH4 - reduksiCH4_Actual).toFixed(1);
  const emisiCH4_Optimal = +(baselineCH4 - reduksiCH4_Optimal).toFixed(1);

  const financials = [
    { metric: 'Biaya Pupuk Kimia', actual: formatRupiah(biayaPupuk), optimal: formatRupiah(optBiayaPupuk), actualIsNegative: true },
    { metric: 'Revenue Gabah', actual: formatRupiah(revenue), optimal: formatRupiah(optRevenue) },
    { metric: 'Profit Bersih Gabah', actual: profitGabahFormatted, optimal: optProfitGabahFormatted },
    { metric: 'Profit Bersih Beras', actual: profitBerasFormatted, optimal: optProfitBerasFormatted },
    { metric: 'Profit Bersih Bebek', actual: profitBebekFormatted, optimal: optProfitBebekFormatted },
  ];

  const ecological = [
    { metric: 'Penghematan N (Nitrogen)', actual: `${hematN_Actual} kg`, optimal: `${hematN_Optimal} kg` },
    { metric: 'Penghematan P (Fosfor)', actual: `${hematP_Actual} kg`, optimal: `${hematP_Optimal} kg` },
    { metric: 'Penghematan K (Kalium)', actual: `${hematK_Actual} kg`, optimal: `${hematK_Optimal} kg` },
    { metric: 'Reduksi Emisi CO2e', actual: `${reduksiCO2_Actual} ton CO2e`, optimal: `${reduksiCO2_Optimal} ton CO2e` },
    { metric: 'Reduksi Emisi Metana', actual: `${reduksiCH4_Actual} kg CH4`, optimal: `${reduksiCH4_Optimal} kg CH4` },
    { metric: 'Emisi CO2e Tersisa', actual: `${emisiCO2_Actual} ton CO2e`, optimal: `${emisiCO2_Optimal} ton CO2e` },
    { metric: 'Emisi Metana Tersisa', actual: `${emisiCH4_Actual} kg CH4`, optimal: `${emisiCH4_Optimal} kg CH4` },
    { metric: 'Reduksi Pestisida', actual: `${densityPerHa > 100 ? 72 : 45}%`, optimal: '82%' },
    { metric: 'Indeks Biodiversitas', actual: `${densityPerHa > 100 ? 7.2 : 5.8}`, optimal: '8.4' },
    { metric: 'Karbon Tanah', actual: '+1.2%', optimal: '+2.1%' },
  ];

  const rekomendasi = [];

  if (densityPerHa > 180) {
    rekomendasi.push({
      kategori: 'Manajemen Bebek',
      tindakan: `Kurangi populasi bebek ke ${Math.round(optimalDensity * input.lahanLuas)} ekor (80 ekor/ha)`,
      dampak: 'Cegah kerusakan akar padi muda, +8% yield',
      prioritas: 'high' as const,
    });
  } else if (densityPerHa < 50) {
    rekomendasi.push({
      kategori: 'Manajemen Bebek',
      tindakan: `Tambah bebek ke ${Math.round(optimalDensity * input.lahanLuas)} ekor optimal`,
      dampak: 'Optimalkan bio-fertilisasi alami, +12% yield',
      prioritas: 'high' as const,
    });
  }

  if (isTooYoung) {
    rekomendasi.push({
      kategori: 'Manajemen Bebek',
      tindakan: 'Tunda pelepasan bebek hingga umur bebek mencapai 14–21 hari',
      dampak: 'Mencegah kematian tinggi bebek muda akibat predator, suhu ekstrem, dan kelelahan',
      prioritas: 'high' as const,
    });
  } else if (isTooOld) {
    rekomendasi.push({
      kategori: 'Manajemen Bebek',
      tindakan: 'Gunakan bebek yang lebih muda (14–25 hari) untuk lahan baru tanam',
      dampak: 'Menghindari kerusakan fisik pada anakan padi muda karena bobot bebek yang terlalu besar',
      prioritas: 'medium' as const,
    });
  } else {
    rekomendasi.push({
      kategori: 'Manajemen Bebek',
      tindakan: 'Pertahankan pelepasan bebek pada umur ideal (14–28 hari)',
      dampak: 'Bebek cukup kuat mencari makan mandiri tanpa merusak padi muda',
      prioritas: 'low' as const,
    });
  }

  if (input.varietasPadi === 'Ciherang') {
    rekomendasi.push({
      kategori: 'Varietas Padi',
      tindakan: 'Pertimbangkan beralih ke Sertani untuk premium market',
      dampak: 'Harga jual 15–20% lebih tinggi',
      prioritas: 'medium' as const,
    });
  }

  rekomendasi.push({
    kategori: 'Sistem Tanam',
    tindakan: input.sistemTanam !== 'Jajar Legowo'
      ? 'Gunakan Jajar Legowo untuk penetrasi cahaya optimal'
      : 'Pertahankan Jajar Legowo, hasil optimal',
    dampak: 'Tingkatkan produktivitas 10–15% vs tanam biasa',
    prioritas: input.sistemTanam !== 'Jajar Legowo' ? 'medium' as const : 'low' as const,
  });

  rekomendasi.push({
    kategori: 'Rotasi Tanam',
    tindakan: 'Rencanakan rotasi varietas pada musim tanam berikutnya',
    dampak: 'Cegah resistensi hama dan pertahankan kesuburan tanah',
    prioritas: 'low' as const,
  });

  return {
    currentDensity: Math.round(densityPerHa),
    currentYield,
    optimalDensity,
    optimalYield,
    sustainabilityScore,
    risikoHama,
    kategori: currentYield >= 6.5 ? 'Optimal' : 'Perlu Perhatian',
    densityStatus,
    financials,
    ecological,
    rekomendasi,

    durasiAktual,
    durasiRekomendasi,
    profitRaw: profit,
    optProfitRaw: optProfit,
    profitFormatted: formatRupiah(profit),
    optProfitFormatted: formatRupiah(optProfit),
    selisihProfitFormatted: formatRupiah(optProfit - profit),
    hematPupukAktual,
    hematPupukRekomendasi,
    hematGulmaAktual,
    hematGulmaRekomendasi,
    dampakLingkunganAktual,

    berasYield,
    optimalBerasYield,
    duckYield,
    optimalDuckYield,

    profitGabah,
    optProfitGabah,
    profitBebek,
    optProfitBebek,
    profitBeras,
    optProfitBeras,

    profitGabahFormatted,
    optProfitGabahFormatted,
    profitBebekFormatted,
    optProfitBebekFormatted,
    profitBerasFormatted,
    optProfitBerasFormatted,

    savingGulmaHariActual,
    savingGulmaHariOptimal,

    hematN_Actual,
    hematP_Actual,
    hematK_Actual,
    hematN_Optimal,
    hematP_Optimal,
    hematK_Optimal,

    emisiCO2_Actual,
    emisiCO2_Optimal,
    emisiCH4_Actual,
    emisiCH4_Optimal,
    reduksiCO2_Actual,
    reduksiCO2_Optimal,
    reduksiCH4_Actual,
    reduksiCH4_Optimal,
  };
}