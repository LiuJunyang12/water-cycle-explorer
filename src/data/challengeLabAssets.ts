import { BASE_URL } from '../config/baseUrl';

/**
 * Optional hand-drawn pictures for station 6.
 *
 * Each question lists the files to try in order; the first one that loads wins.
 * `.jpg` is the optimised copy shipped with the site, `.png` is what you get
 * when a new illustration is dropped in by hand. If none of them load, the page
 * quietly falls back to the SVG scene drawn in `QuizArt.tsx`.
 *
 * Drop artwork into `public/assets/images/challenge-lab/`.
 */
const CHALLENGE_LAB_DIR = `${BASE_URL}assets/images/challenge-lab/`;

function artCandidates(name: string): readonly string[] {
  return [`${CHALLENGE_LAB_DIR}${name}.jpg`, `${CHALLENGE_LAB_DIR}${name}.png`];
}

export const QUIZ_ART: Record<string, readonly string[]> = {
  q1: artCandidates('soalan-1'), // 太阳加热湖面，水变成看不见的水蒸气
  q2: artCandidates('soalan-2'), // 太阳是水的能量来源
  q3: artCandidates('soalan-3'), // 热茶杯的白雾是微小水滴，水蒸气不可见
  q4: artCandidates('soalan-4'), // 水蒸气在天空冷却成微小水滴，聚成云
  q5: artCandidates('soalan-5'), // 云由微小水滴与冰晶组成
  q6: artCandidates('soalan-6'), // 雨从云落到地上（Kerpasan）
  q7: artCandidates('soalan-7'), // 雨水流进河、湖、海（Pengumpulan）
  q8: artCandidates('soalan-8'), // 完整的水循环
};
