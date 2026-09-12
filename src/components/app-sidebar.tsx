"use client"

import * as React from "react"

import { NavLinks } from "@/components/nav-links"
import { ZelligeMark } from "@/components/branding/zellige-mark"
import { ZelligePattern } from "@/components/branding/zellige-pattern"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, HeartIcon, ScaleIcon, SparklesIcon } from "lucide-react"

const navMain = [
  { title: "Overview", url: "/", icon: <LayoutDashboardIcon /> },
  { title: "Listings", url: "/listings", icon: <ListIcon /> },
  { title: "Favorites", url: "/favorites", icon: <HeartIcon /> },
  { title: "Compare", url: "/compare", icon: <ScaleIcon /> },
  { title: "Assistant", url: "/assistant", icon: <SparklesIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="relative overflow-hidden">
        <ZelligePattern
          seed="daridash-brand"
          color="var(--primary)"
          cols={4}
          rows={2}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35] group-data-[collapsible=icon]:opacity-20"
        />
        <SidebarMenu className="relative">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ZelligeMark className="size-4" />
              </div>
              <div className="grid flex-1 text-left">
                <span className="truncate font-heading text-sm font-semibold tracking-tight">
                  Daridash
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Real estate, Morocco
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavLinks label="Dashboard" items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
