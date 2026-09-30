// 年収の壁・年末調整サイトのツール一覧（このサイト専用。ほかのサイトとは別管理）
const TOOLS = [
  { path: "/nenmatsu/", name: "年収の壁 シミュレーター（2026年）", desc: "パート・アルバイトの年収ごとに、本人と家族の手取りがどう変わるかを計算" },
  { path: "/nenmatsu/haiguusha/", name: "配偶者控除・配偶者特別控除 計算", desc: "配偶者の年収から、控除額と節税額を計算（136万円・207万円の壁）" },
  { path: "/nenmatsu/fuyo/", name: "扶養に入れる？判定", desc: "税金の扶養と社会保険の扶養を、家族の年齢と年収から判定" },
  { path: "/nenmatsu/seiho/", name: "生命保険料控除・地震保険料控除 計算", desc: "年末調整の申告書に書く控除額を、保険料から自動計算" },
  { path: "/nenmatsu/kanpu/", name: "年末調整 還付金 計算", desc: "年末調整でいくら戻ってくるか（追加で引かれるか）の目安" },
];

const yen = n => Math.round(n).toLocaleString("ja-JP") + "円";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("related");
  if (!el) return;
  const here = location.pathname.replace(/index\.html$/, "");
  el.innerHTML = `<h2>ほかのツール</h2><ul class="tools">${TOOLS.filter(t => t.path !== here)
    .map(t => `<li><a href="${t.path}"><b>${t.name}</b><span>${t.desc}</span></a></li>`).join("")}</ul>`;
});
