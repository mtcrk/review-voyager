import { AlertTriangle } from "lucide-react";

export default function DraftBanner() {
  return (
    <div className="mb-8 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 tracking-wide">
          TASLAK — HUKUKİ İNCELEME BEKLİYOR
        </p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
          Bu sayfa iskelet niteliğindedir. Nihai metin hukuk danışmanı tarafından hazırlanacaktır.
          Köşeli parantezli ([...]) alanlar doldurulacaktır.
        </p>
      </div>
    </div>
  );
}