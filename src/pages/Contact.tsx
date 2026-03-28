 import { Mail, MapPin, Clock, ArrowLeft } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
 
 const Contact = () => {
   const navigate = useNavigate();
  const { t } = useTranslation();
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
         <div className="container mx-auto px-4 sm:px-6 py-4">
           <div className="flex items-center gap-4">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => navigate("/")}
               className="gap-2"
             >
               <ArrowLeft className="w-4 h-4" />
              {t('contact.backToHome', 'Ana Sayfa')}
             </Button>
           </div>
         </div>
       </header>
 
       <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
         <div className="max-w-2xl mx-auto text-center">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
             <Mail className="w-10 h-10 text-primary" />
           </div>
           
           <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('contact.title', 'Bize Ulaşın')}
           </h1>
           <p className="text-lg text-muted-foreground mb-12">
            {t('contact.subtitle', 'Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçin.')}
           </p>
 
           {/* Email Card */}
           <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg mb-8">
             <div className="flex flex-col items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                 <Mail className="w-7 h-7 text-primary" />
               </div>
               <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">{t('contact.email', 'E-posta')}</h2>
                 <a 
                   href="mailto:support@voyagerespond.com"
                   className="text-lg sm:text-2xl font-medium text-primary hover:underline transition-colors break-all"
                 >
                   support@voyagerespond.com
                 </a>
               </div>
               <Button 
                 size="lg"
                 className="gradient-primary text-white mt-4"
                 onClick={() => window.location.href = "mailto:support@voyagerespond.com"}
               >
                 <Mail className="w-5 h-5 mr-2" />
                {t('contact.sendEmail', 'E-posta Gönder')}
               </Button>
             </div>
           </div>
 
           {/* Additional Info */}
           <div className="grid sm:grid-cols-2 gap-6 mt-12">
             <div className="p-6 rounded-xl border border-border bg-card/50">
               <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{t('contact.responseTime', 'Yanıt Süresi')}</h3>
              <p className="text-sm text-muted-foreground">{t('contact.responseTimeDesc', 'Genellikle 24 saat içinde yanıt veriyoruz')}</p>
             </div>
             <div className="p-6 rounded-xl border border-border bg-card/50">
               <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{t('contact.location', 'Konum')}</h3>
              <p className="text-sm text-muted-foreground">{t('contact.locationValue', 'Türkiye')}</p>
             </div>
           </div>
         </div>
       </main>
     </div>
   );
 };
 
 export default Contact;