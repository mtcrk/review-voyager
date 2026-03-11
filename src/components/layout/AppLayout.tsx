import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ReviewFetchBanner } from "./ReviewFetchBanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Mobile header with sidebar trigger */}
          <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background px-4 md:hidden">
            <SidebarTrigger />
            <span className="ml-3 text-sm font-semibold text-foreground">VoyageRespond</span>
          </header>
          <ReviewFetchBanner />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
