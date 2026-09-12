import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { DemoDataBanner } from "@/components/demo-data-banner";
import { CommandPalette } from "@/components/command-palette";
import { CommandPaletteTrigger } from "@/components/command-palette-trigger";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createBrowserClient } from "@/lib/supabase/client";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Daridash — Morocco Real Estate Dashboard",
  description: "AI-assisted dashboard over Moroccan real estate listings.",
};

async function hasSeedData(): Promise<boolean> {
  // Defensive: this runs in the root layout, which Next also renders while
  // statically prerendering fallback pages like /_not-found at build time —
  // a context where env vars (or the DB) may not be available. Never let
  // that crash the whole build; just skip the banner if we can't tell.
  try {
    const supabase = createBrowserClient();
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("source", "seed");
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const showDemoBanner = await hasSeedData();

  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {showDemoBanner && <DemoDataBanner />}
            <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                />
              </div>
              <div className="px-4">
                <CommandPaletteTrigger />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
        <CommandPalette />
      </body>
    </html>
  );
}
