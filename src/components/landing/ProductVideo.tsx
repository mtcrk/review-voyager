import { Play, Pause } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProductVideo() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {t('landing.video.title', 'Discover VoyageRespond')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('landing.video.subtitle', 'See how the platform works in 30 seconds')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-blue-500/5">
          {/* Video Placeholder - Gerçek video eklendiğinde değiştirilecek */}
          {!isPlaying ? (
            <>
              {/* Thumbnail/Preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-blue-500/10">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Mock Dashboard Preview */}
                  <div className="w-4/5 h-3/4 bg-card rounded-lg shadow-lg border border-border p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="flex-1 bg-muted rounded h-4 ml-4" />
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-muted rounded-lg h-16 animate-pulse" />
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/3 bg-muted rounded-lg h-32" />
                      <div className="flex-1 bg-muted rounded-lg h-32" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 rounded-full gradient-primary text-white shadow-2xl hover:scale-110 transition-transform duration-300"
                >
                  <Play className="w-8 h-8 ml-1" />
                </Button>
              </div>

              {/* Coming Soon Badge */}
              <div className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-black/60 text-white text-sm backdrop-blur-sm">
                {t('landing.video.comingSoon', 'Demo Video Coming Soon')}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {/* Video player placeholder */}
              <div className="text-center text-white">
                <Pause className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-70">{t('landing.video.loading', 'Loading video...')}</p>
                <Button
                  variant="ghost"
                  className="mt-4 text-white"
                  onClick={() => setIsPlaying(false)}
                >
                  {t('landing.video.goBack', 'Go Back')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Video Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-primary mb-1">0:08</div>
            <div className="text-sm text-muted-foreground">{t('landing.video.step1', 'Account Connection')}</div>
          </div>
          <div className="text-center p-4 border-x border-border">
            <div className="text-2xl font-bold text-primary mb-1">0:15</div>
            <div className="text-sm text-muted-foreground">{t('landing.video.step2', 'AI Reply Generation')}</div>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-primary mb-1">0:25</div>
            <div className="text-sm text-muted-foreground">{t('landing.video.step3', 'Reply Submission')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
