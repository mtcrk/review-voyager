import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { PerformanceData } from "@/hooks/useGooglePerformance";

interface Props {
  keywords: PerformanceData["searchKeywords"];
}

export function SearchKeywordsTable({ keywords }: Props) {
  const maxImpressions = keywords.length > 0 ? keywords[0].impressions : 1;

  return (
    <Card className="rounded-xl bg-card shadow-sm border border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Search className="h-5 w-5 text-amber-600" />
          Arama Anahtar Kelimeleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        {keywords.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Henüz anahtar kelime verisi yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-2 w-8">#</th>
                  <th className="text-left py-2 pr-4">Anahtar Kelime</th>
                  <th className="text-right py-2 pr-4 w-24">Gösterim</th>
                  <th className="py-2 w-32"></th>
                </tr>
              </thead>
              <tbody>
                {keywords.slice(0, 20).map((kw, i) => {
                  const pct = (kw.impressions / maxImpressions) * 100;
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-2 text-muted-foreground font-medium">{i + 1}</td>
                      <td className="py-2.5 pr-4 text-foreground">{kw.keyword}</td>
                      <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                        {kw.impressions.toLocaleString("tr-TR")}
                      </td>
                      <td className="py-2.5">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#6C50FF] to-[#9B7FFF]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
