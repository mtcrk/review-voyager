export function ClientLogos() {
  // Placeholder logo/company names - gerçek logolar eklendiğinde güncellenecek
  const clients = [
    { name: "Cafe Botanica", initial: "CB" },
    { name: "Fitness Plus", initial: "FP" },
    { name: "Demir Grup", initial: "DG" },
    { name: "Ela Beauty", initial: "EB" },
    { name: "Lezzet Durağı", initial: "LD" },
    { name: "Tech Store", initial: "TS" },
    { name: "Moda Evi", initial: "ME" },
    { name: "Pet Palace", initial: "PP" },
  ];

  return (
    <section className="container mx-auto px-6 py-12 border-t border-border">
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
          Bize Güvenen İşletmeler
        </p>
      </div>

      <div className="relative overflow-hidden">
        {/* Gradient overlays for smooth scrolling effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling logos */}
        <div className="flex animate-scroll gap-12 py-4">
          {[...clients, ...clients].map((client, index) => (
            <div
              key={index}
              className="flex items-center gap-3 flex-shrink-0 px-6 py-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                {client.initial}
              </div>
              <span className="font-medium text-foreground whitespace-nowrap">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
