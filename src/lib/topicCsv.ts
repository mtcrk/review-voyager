/**
 * Frontend-only CSV export of the topic comparison table.
 * Semicolon separated + UTF-8 BOM so Excel (TR locale) parses it correctly.
 */
import {
  DEPARTMENT_LABELS,
  departmentOf,
  sentimentToIndex100,
} from "@/lib/topicDepartments";

export type CsvTopicRow = {
  topic_id: string;
  review_source: "own" | "competitor";
  sentiment: number;
};

const MIN_MENTIONS = 3;
/** Rakip tarafında bu sayının altındaki bahislerde fark hesaplanmaz. */
const MIN_COMP_MENTIONS = 5;

function cell(v: string | number | null) {
  if (v == null) return "";
  const s = String(v).replace(/"/g, '""');
  return /[;\n"]/.test(s) ? `"${s}"` : s;
}

function num(v: number | null) {
  return v == null ? "veri yok" : v.toFixed(1).replace(".", ",");
}

export function buildTopicCsv(
  rows: CsvTopicRow[],
  topicNames: Record<string, string>,
): string {
  const agg = new Map<
    string,
    { ownSum: number; ownN: number; compSum: number; compN: number }
  >();
  for (const r of rows) {
    const e = agg.get(r.topic_id) ?? { ownSum: 0, ownN: 0, compSum: 0, compN: 0 };
    if (r.review_source === "own") {
      e.ownSum += r.sentiment;
      e.ownN++;
    } else {
      e.compSum += r.sentiment;
      e.compN++;
    }
    agg.set(r.topic_id, e);
  }
  const total = rows.length;

  const table = Array.from(agg.entries())
    .map(([topicId, e]) => {
      const mentions = e.ownN + e.compN;
      const own = e.ownN ? sentimentToIndex100(e.ownSum / e.ownN) : null;
      const comp = e.compN ? sentimentToIndex100(e.compSum / e.compN) : null;
      return {
        topicId,
        mentions,
        share: total ? (mentions / total) * 100 : 0,
        ownN: e.ownN,
        compN: e.compN,
        own,
        comp,
        delta:
          own != null && comp != null && e.compN >= MIN_COMP_MENTIONS ? own - comp : null,
      };
    })
    .filter((r) => r.mentions >= MIN_MENTIONS)
    .sort((a, b) => (a.delta ?? 999) - (b.delta ?? 999));

  const header = [
    "Konu",
    "Departman",
    "Bahis",
    "Pay (%)",
    "Sizin bahis",
    "Rakip bahis",
    "Siz",
    "Rakip ort.",
    "Fark",
  ];
  const lines = [header.join(";")];
  for (const r of table) {
    lines.push(
      [
        cell(topicNames[r.topicId] ?? r.topicId),
        cell(DEPARTMENT_LABELS[departmentOf(r.topicId)]),
        cell(r.mentions),
        cell(r.share.toFixed(1).replace(".", ",")),
        cell(r.ownN),
        cell(r.compN),
        cell(num(r.own)),
        cell(num(r.comp)),
        cell(r.delta == null ? "yeterli rakip verisi yok" : num(r.delta)),
      ].join(";"),
    );
  }
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
