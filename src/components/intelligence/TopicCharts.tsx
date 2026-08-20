/**
 * Konu / Dönem / Rakip analizi sayfalarının paylaştığı recharts bileşenleri.
 * Tek görsel dil: 0-100 skor ekseni, aynı renk mantığı, aynı tooltip biçimi.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

export function scoreColor(score: number) {
  if (score >= 70) return "hsl(var(--success))";
  if (score >= 55) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

export type ScoreBarDatum = { key: string; label: string; score: number; mentions: number };

/** Yatay tek bar: departman/konu skorları. */
export function ScoreBars({ data }: { data: ScoreBarDatum[] }) {
  if (!data.length) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center text-sm text-muted-foreground">
        Grafik için yeterli veri yok
      </div>
    );
  }
  return (
    <div className={`w-full min-w-0 ${data.length > 7 ? "h-[360px]" : "h-[280px]"}`}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 10 }} interval={0} />
        <RTooltip
          formatter={(v: any, _n: any, p: any) => [
            `${Number(v).toFixed(1)} / 100 · ${p?.payload?.mentions} bahis`,
            "Skor",
          ]}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell key={d.key} fill={scoreColor(d.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

export type CompareBarDatum = {
  key: string;
  label: string;
  prev: number;
  cur: number;
  curN: number;
  prevN: number;
};

/** Yatay gruplu bar: kıyas dönem vs bu dönem. */
export function CompareBars({ data }: { data: CompareBarDatum[] }) {
  if (!data.length) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center text-sm text-muted-foreground">
        Grafik için yeterli veri yok
      </div>
    );
  }
  return (
    <div className={`w-full min-w-0 ${data.length > 5 ? "h-[360px]" : "h-[280px]"}`}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 10 }} interval={0} />
        <RTooltip
          formatter={(v: any, n: any, p: any) => [
            `${Number(v).toFixed(1)} / 100 · ${
              n === "Bu dönem" ? p?.payload?.curN : p?.payload?.prevN
            } bahis`,
            n,
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar
          dataKey="prev"
          name="Kıyas dönem"
          fill="hsl(var(--muted-foreground))"
          radius={[0, 3, 3, 0]}
        />
        <Bar dataKey="cur" name="Bu dönem" radius={[0, 3, 3, 0]}>
          {data.map((d) => (
            <Cell
              key={d.key}
              fill={d.cur < d.prev ? "hsl(var(--destructive))" : "hsl(var(--success))"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

export type TrendPoint = {
  bucket: string;
  label: string;
  score: number | null;
  mentions: number;
};

/** Zaman içindeki 0-100 skor çizgisi. `boundaryLabel` verilirse dikey sınır çizilir. */
export function TrendLine({
  data,
  boundaryLabel,
  height = 220,
}: {
  data: TrendPoint[];
  boundaryLabel?: string | null;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} width={34} tick={{ fontSize: 10 }} />
        <RTooltip
          formatter={(v: any, _n: any, p: any) => [
            `${Number(v).toFixed(1)} / 100 · ${p?.payload?.mentions} bahis`,
            "Skor",
          ]}
        />
        {boundaryLabel && (
          <ReferenceLine
            x={boundaryLabel}
            stroke="hsl(var(--primary))"
            strokeDasharray="4 4"
            label={{ value: "bu dönem", fontSize: 10, position: "insideTopRight" }}
          />
        )}
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Bahis hacmi bar grafiği (skor grafiğinin altında ikincil bilgi). */
export function MentionBars({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return (
      <div className="h-[140px] w-full flex items-center justify-center text-sm text-muted-foreground">
        Grafik için yeterli veri yok
      </div>
    );
  }
  return (
    <div className="w-full min-w-0 h-[140px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis width={34} domain={[0, "dataMax"]} tick={{ fontSize: 10 }} allowDecimals={false} />
        <RTooltip formatter={(v: any) => [`${v} bahis`, "Bahis"]} />
        <Bar dataKey="mentions" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}