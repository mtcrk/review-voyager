import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function Testimonials() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: t('landing.testimonials.testimonial1.name', 'Ahmet Y.'),
      role: t('landing.testimonials.testimonial1.role', 'Business Owner'),
      avatar: "AY",
      quote: t('landing.testimonials.testimonial1.quote', 'I now respond to Google reviews in 30 seconds instead of 5 minutes. The AI suggestions are really professional and the tone settings work perfectly.'),
      rating: 5,
    },
    {
      name: t('landing.testimonials.testimonial2.name', 'Zeynep K.'),
      role: t('landing.testimonials.testimonial2.role', 'Marketing Director'),
      avatar: "ZK",
      quote: t('landing.testimonials.testimonial2.quote', 'Responding to TikTok comments instantly increased our sales by 40%. With Story Kit, our customers create content, we just share it.'),
      rating: 5,
    },
    {
      name: t('landing.testimonials.testimonial3.name', 'Mehmet D.'),
      role: t('landing.testimonials.testimonial3.role', 'General Manager'),
      avatar: "MD",
      quote: t('landing.testimonials.testimonial3.quote', "We manage all reviews of our 3 hotels from a single panel. Thanks to the AI Visibility score, we've climbed to the top of Google."),
      rating: 5,
    },
    {
      name: t('landing.testimonials.testimonial4.name', 'Elif Ö.'),
      role: t('landing.testimonials.testimonial4.role', 'Founder'),
      avatar: "EÖ",
      quote: t('landing.testimonials.testimonial4.quote', "I didn't know how to respond to negative reviews. The AI's empathetic tone suggestion won back the customer."),
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {t('landing.testimonials.title', 'What Our Customers Say')}
          </h2>
          <p className="text-muted-foreground">
            {t('landing.testimonials.subtitle', 'Trusted by 850+ businesses')}
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
            <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/20" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                "{testimonials[activeIndex].quote}"
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {testimonials[activeIndex].avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonials[activeIndex].name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[activeIndex].role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                index === activeIndex
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
