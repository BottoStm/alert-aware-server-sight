
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Server,
  Activity,
  HardDrive,
  Network,
  Bell,
  Settings,
  Gauge,
  Database,
  Wifi,
  Signal
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Overview", url: "/", icon: Gauge, group: "Dashboard" },
  { title: "Servers", url: "/servers", icon: Server, group: "Monitoring" },
  { title: "Processes", url: "/processes", icon: Activity, group: "Monitoring" },
  { title: "Containers", url: "/containers", icon: Database, group: "Monitoring" },
  { title: "Network", url: "/network", icon: Network, group: "Monitoring" },
  { title: "Storage", url: "/storage", icon: HardDrive, group: "Monitoring" },
  { title: "Website Checks", url: "/website-checks", icon: Wifi, group: "Services" },
  { title: "SSL Monitoring", url: "/ssl", icon: Signal, group: "Services" },
  { title: "Alerts", url: "/alerts", icon: Bell, group: "Management" },
  { title: "Settings", url: "/settings", icon: Settings, group: "Management" },
];

const groupedItems = navigationItems.reduce((acc, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, typeof navigationItems>);

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `transition-all duration-200 ${
      isActive 
        ? "bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/20" 
        : "hover:bg-accent/50 hover:text-accent-foreground border-transparent"
    } border rounded-lg`;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-border/50`} collapsible="icon">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Server className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                ServerWatch
              </h1>
              <p className="text-xs text-muted-foreground">Monitoring Dashboard</p>
            </div>
          )}
        </div>
        {collapsed && <SidebarTrigger className="mt-2" />}
      </div>

      <SidebarContent className="px-2">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                {groupName}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
