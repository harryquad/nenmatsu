// 2026年（令和8年分所得税・令和9年度分住民税）の税金・控除の計算
// 出典：国税庁「源泉所得税の改正のあらまし（令和8年4月）」、名古屋市「令和9年度以降適用される市民税・県民税に関する主な税制改正」

const BRACKETS = [
  [1949000, 0.05, 0], [3299000, 0.10, 97500], [6949000, 0.20, 427500], [8999000, 0.23, 636000],
  [17999000, 0.33, 1536000], [39999000, 0.40, 2796000], [Infinity, 0.45, 4796000],
];
const floor1000 = n => Math.max(0, Math.floor(n / 1000) * 1000);
const MAN = 10000;

// 給与所得（令和8・9年分は最低保障額74万円。所得税・住民税とも同じ）
function salaryIncome(a) {
  let d;
  if (a <= 3600000) d = a * 0.3 + 80000;
  else if (a <= 6600000) d = a * 0.2 + 440000;
  else if (a <= 8500000) d = a * 0.1 + 1100000;
  else d = 1950000;
  return Math.max(0, a - Math.max(740000, d));
}

// 所得税の基礎控除（令和8年分）
function basicIT(income) {
  if (income <= 4890000) return 1040000;
  if (income <= 6550000) return 670000;
  if (income <= 23500000) return 620000;
  if (income <= 24000000) return 480000;
  if (income <= 24500000) return 320000;
  if (income <= 25000000) return 160000;
  return 0;
}
// 住民税の基礎控除（43万円のまま）
const basicRT = income => (income <= 24000000 ? 430000 : income <= 24500000 ? 290000 : income <= 25000000 ? 150000 : 0);

// 課税所得から所得税（復興特別所得税を含む）
function incomeTaxOf(taxable) {
  if (taxable <= 0) return 0;
  const [, rate, minus] = BRACKETS.find(b => taxable <= b[0]);
  return Math.floor(Math.round(taxable * rate - minus) * 1021 / 1000);
}
const marginalRate = taxable => (taxable > 0 ? BRACKETS.find(b => taxable <= b[0])[1] : 0);

// 社会保険料の目安（会社の健康保険・厚生年金に入っている場合）
const socialEstimate = (annual, over40) =>
  Math.min(annual / 12, 650000) * 0.0915 * 12 + annual * (0.05 + (over40 ? 0.008 : 0)) + annual * 0.0055;

// 配偶者控除・配偶者特別控除（本人の合計所得 selfIncome、配偶者の合計所得 spIncome）
// 戻り値 { it: 所得税の控除額, rt: 住民税の控除額, type }
const SPOUSE_SPECIAL = [
  // [配偶者の合計所得の上限, 所得税(900万以下,950万以下,1000万以下), 住民税(同)]
  [950000, [380000, 260000, 130000], [330000, 220000, 110000]],
  [1000000, [360000, 240000, 120000], [330000, 220000, 110000]],
  [1050000, [310000, 210000, 110000], [310000, 210000, 110000]],
  [1100000, [260000, 180000, 90000], [260000, 180000, 90000]],
  [1150000, [210000, 140000, 70000], [210000, 140000, 70000]],
  [1200000, [160000, 110000, 60000], [160000, 110000, 60000]],
  [1250000, [110000, 80000, 40000], [110000, 80000, 40000]],
  [1300000, [60000, 40000, 20000], [60000, 40000, 20000]],
  [1330000, [30000, 20000, 10000], [30000, 20000, 10000]],
];
function spouseDeduction(selfIncome, spIncome, spOver70 = false) {
  const col = selfIncome <= 9000000 ? 0 : selfIncome <= 9500000 ? 1 : selfIncome <= 10000000 ? 2 : -1;
  if (col < 0) return { it: 0, rt: 0, type: "なし（本人の所得が1,000万円超）" };
  if (spIncome <= 620000) {
    const it = spOver70 ? [480000, 320000, 160000][col] : [380000, 260000, 130000][col];
    const rt = spOver70 ? [380000, 260000, 130000][col] : [330000, 220000, 110000][col];
    return { it, rt, type: spOver70 ? "配偶者控除（老人）" : "配偶者控除" };
  }
  const row = SPOUSE_SPECIAL.find(r => spIncome <= r[0]);
  if (!row) return { it: 0, rt: 0, type: "なし" };
  return { it: row[1][col], rt: row[2][col], type: "配偶者特別控除" };
}

// 特定親族特別控除（19〜22歳で合計所得62万円超123万円以下）
const TOKUTEI_SHINZOKU = [
  [850000, 630000, 450000], [900000, 610000, 450000], [950000, 510000, 450000], [1000000, 410000, 410000],
  [1050000, 310000, 310000], [1100000, 210000, 210000], [1150000, 110000, 110000], [1200000, 60000, 60000], [1230000, 30000, 30000],
];

// 扶養している家族1人分の控除（age: 12月31日時点の年齢、income: その人の合計所得、live: 同居の親か）
function dependentDeduction(age, income, live = false) {
  if (age < 16) return { it: 0, rt: 0, type: "なし（16歳未満は扶養控除の対象外）" };
  if (age >= 19 && age <= 22) {
    if (income <= 620000) return { it: 630000, rt: 450000, type: "特定扶養控除" };
    const row = TOKUTEI_SHINZOKU.find(r => income <= r[0]);
    return row ? { it: row[1], rt: row[2], type: "特定親族特別控除" } : { it: 0, rt: 0, type: "なし" };
  }
  if (income > 620000) return { it: 0, rt: 0, type: "なし" };
  if (age >= 70) return live ? { it: 580000, rt: 450000, type: "老人扶養控除（同居老親等）" } : { it: 480000, rt: 380000, type: "老人扶養控除" };
  return { it: 380000, rt: 330000, type: "一般の扶養控除" };
}

// 給与収入だけの人の所得税・住民税（本人の分。扶養家族なしの想定）
function personTax(salary, social) {
  const inc = salaryIncome(salary);
  const incomeTax = incomeTaxOf(floor1000(inc - social - basicIT(inc)));
  let residentTax = 0;
  if (inc > 450000) { // 住民税の非課税限度（単身の目安：合計所得45万円）
    const taxable = floor1000(inc - social - basicRT(inc));
    const adjust = taxable <= 2000000 ? Math.min(50000, taxable) * 0.05 : Math.max((50000 - (taxable - 2000000)) * 0.05, 2500);
    residentTax = Math.max(0, Math.floor(taxable * 0.1 - adjust)) + 5000;
  }
  return { income: inc, incomeTax, residentTax };
}

// 扶養する側（給与収入 annual）の所得税率（扶養の控除を最大に受けている状態で判定）
function supporterRate(annual, over40, maxDedIT) {
  const inc = salaryIncome(annual);
  return marginalRate(floor1000(inc - socialEstimate(annual, over40) - basicIT(inc) - maxDedIT));
}
