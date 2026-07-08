import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PUBLISHED_BROKER_ORIGIN = "https://voyagerespondcom.lovable.app";

export default function OAuthInitiateRedirect() {
  useEffect(() => {
    const { origin, search } = window.location;

    if (origin === PUBLISHED_BROKER_ORIGIN) {
      return;
    }

    window.location.replace(`${PUBLISHED_BROKER_ORIGIN}/~oauth/initiate${search}`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Google yönlendirmesi başlatılıyor</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Lütfen birkaç saniye bekleyin.
        </CardContent>
      </Card>
    </div>
  );
}