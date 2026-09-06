/**
 * report.ts — practice session report export.
 *
 * WHAT: Turns saved progress (accuracy timeline, vocal range, weak points and
 *       next steps) into a printable PDF or a plain-text / JSON download.
 * WHY:  Learners want to keep, print or share their progress with a teacher.
 * HOW:  Browser-only. jsPDF is imported dynamically inside the export call so
 *       nothing heavy (or DOM-dependent) is evaluated during SSR.
 */

import { CATEGORIES } from "./exercises";
import {
  dailySeries,
  weakAreas,
  weeklyPlan,
  type SwaramState,
} from "./store";

export interface ReportModel {
  generatedAt: string;
  range: string;
  voiceType: string;
  steadiness: number;
  streak: number;
  stars: number;
  minutes: number;
  sessions: number;
  todayAccuracy: number;
  averageAccuracy: number;
  timeline: { date: string; accuracy: number; minutes: number }[];
  weakPoints: { area: string; accuracy: number }[];
  nextSteps: string[];
}

function catName(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

/** WHAT: Gathers every number the report shows, in one plain object. */
export function buildReport(state: SwaramState): ReportModel {
  const timeline = dailySeries(state, 14);
  const withData = timeline.filter((p) => p.accuracy > 0);
  const average = withData.length
    ? Math.round(withData.reduce((a, p) => a + p.accuracy, 0) / withData.length)
    : 0;
  const weak = weakAreas(state).slice(0, 4);
  const plan = weeklyPlan(state);
  const d = state.diagnostic;

  const nextSteps = [
    ...plan.map((p) => `${p.day}: ${catName(p.focus)} — ${p.minutes} minutes`),
    weak[0]
      ? `Give extra care to ${catName(weak[0].kind)} — it is currently your lowest scoring drill type.`
      : "Complete a few lessons so Swaram can spot your weak points.",
    "Warm up first: smell the flower, blow out the candle. Never push a sore throat.",
  ];

  return {
    generatedAt: new Date().toLocaleString(),
    range: d ? `${d.lowName} – ${d.highName}` : "Not measured yet",
    voiceType: d ? d.voiceType : "Not measured yet",
    steadiness: d ? d.steadiness : 0,
    streak: state.streak,
    stars: state.stars,
    minutes: Math.round(state.sessions.reduce((a, s) => a + s.seconds, 0) / 60),
    sessions: state.sessions.length,
    todayAccuracy: timeline[timeline.length - 1]?.accuracy ?? 0,
    averageAccuracy: average,
    timeline,
    weakPoints: weak.map((w) => ({ area: catName(w.kind), accuracy: w.accuracy })),
    nextSteps,
  };
}

/** WHAT: A readable text version, used for the .txt download and screen readers. */
export function reportToText(r: ReportModel): string {
  const lines: string[] = [];
  lines.push("SWARAM — PRACTICE SESSION REPORT");
  lines.push(`Generated: ${r.generatedAt}`);
  lines.push("");
  lines.push("SUMMARY");
  lines.push(`Vocal range: ${r.range}`);
  lines.push(`Voice type: ${r.voiceType}`);
  lines.push(`Steadiness: ${r.steadiness}%`);
  lines.push(`Day streak: ${r.streak}`);
  lines.push(`Stars earned: ${r.stars}`);
  lines.push(`Minutes practised: ${r.minutes}`);
  lines.push(`Sessions completed: ${r.sessions}`);
  lines.push(`Latest accuracy: ${r.todayAccuracy}%   Average: ${r.averageAccuracy}%`);
  lines.push("");
  lines.push("ACCURACY TIMELINE (last 14 days)");
  r.timeline.forEach((p) => {
    lines.push(`  ${p.date}  ${String(p.accuracy).padStart(3)}%   ${p.minutes} min`);
  });
  lines.push("");
  lines.push("WEAK POINTS");
  if (r.weakPoints.length === 0) lines.push("  Not enough practice data yet.");
  r.weakPoints.forEach((w) => lines.push(`  ${w.area}: ${w.accuracy}%`));
  lines.push("");
  lines.push("NEXT STEPS");
  r.nextSteps.forEach((s) => lines.push(`  • ${s}`));
  return lines.join("\n");
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** WHAT: Saves the report as a plain-text file (works everywhere, offline). */
export function exportReportText(state: SwaramState) {
  const text = reportToText(buildReport(state));
  download(new Blob([text], { type: "text/plain;charset=utf-8" }), `swaram-report-${stamp()}.txt`);
}

/** WHAT: Saves the raw numbers as JSON, for teachers or spreadsheets. */
export function exportReportJson(state: SwaramState) {
  const data = JSON.stringify({ ...buildReport(state), sessionsRaw: state.sessions }, null, 2);
  download(new Blob([data], { type: "application/json" }), `swaram-report-${stamp()}.json`);
}

/**
 * WHAT: Renders a tidy one/two page PDF with a drawn accuracy timeline chart.
 * HOW:  jsPDF is loaded on demand; all drawing uses millimetre coordinates.
 */
export async function exportReportPdf(state: SwaramState) {
  const r = buildReport(state);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 18;
  let y = 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Swaram — Practice Report", left, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Generated ${r.generatedAt}`, left, y);
  doc.setTextColor(20);
  y += 10;

  const rows: [string, string][] = [
    ["Vocal range", r.range],
    ["Voice type", r.voiceType],
    ["Steadiness", `${r.steadiness}%`],
    ["Latest accuracy", `${r.todayAccuracy}%`],
    ["Average accuracy", `${r.averageAccuracy}%`],
    ["Day streak", `${r.streak}`],
    ["Stars earned", `${r.stars}`],
    ["Minutes practised", `${r.minutes}`],
    ["Sessions completed", `${r.sessions}`],
  ];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Summary", left, y);
  y += 6;
  doc.setFontSize(11);
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
    doc.text(k, left, y);
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.text(v, left + 55, y);
    y += 6;
  });

  // Accuracy timeline chart.
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Accuracy timeline (last 14 days)", left, y);
  y += 5;
  const chartW = 174;
  const chartH = 45;
  doc.setDrawColor(210);
  doc.rect(left, y, chartW, chartH);
  [0, 25, 50, 75, 100].forEach((pct) => {
    const gy = y + chartH - (pct / 100) * chartH;
    doc.setDrawColor(235);
    doc.line(left, gy, left + chartW, gy);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`${pct}`, left - 5, gy + 1);
  });
  doc.setDrawColor(14, 165, 164);
  const stepX = chartW / Math.max(1, r.timeline.length - 1);
  let prev: [number, number] | null = null;
  r.timeline.forEach((p, i) => {
    const px = left + i * stepX;
    const py = y + chartH - (p.accuracy / 100) * chartH;
    if (prev) doc.line(prev[0], prev[1], px, py);
    prev = [px, py];
    doc.setFontSize(6);
    doc.setTextColor(140);
    if (i % 2 === 0) doc.text(p.date, px - 4, y + chartH + 4);
  });
  y += chartH + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Weak points", left, y);
  y += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  if (r.weakPoints.length === 0) {
    doc.text("Not enough practice data yet.", left, y);
    y += 6;
  }
  r.weakPoints.forEach((w) => {
    doc.setTextColor(110);
    doc.text(w.area, left, y);
    doc.setTextColor(20);
    doc.text(`${w.accuracy}%`, left + 55, y);
    doc.setFillColor(14, 165, 164);
    doc.rect(left + 72, y - 3, (w.accuracy / 100) * 90, 3, "F");
    y += 6;
  });

  y += 6;
  if (y > 250) {
    doc.addPage();
    y = 22;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Next steps", left, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  r.nextSteps.forEach((s) => {
    const wrapped = doc.splitTextToSize(`• ${s}`, 174) as string[];
    wrapped.forEach((linetext) => {
      if (y > 280) {
        doc.addPage();
        y = 22;
      }
      doc.text(linetext, left, y);
      y += 5.5;
    });
  });

  doc.save(`swaram-report-${stamp()}.pdf`);
}
