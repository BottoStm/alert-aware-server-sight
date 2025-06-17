
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Server,
  Bell,
  Settings,
  Gauge,
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
  { title: "Servers", url: "/servers", icon: Server, group: "Infrastructure" },
  { title: "Website Checks", url: "/website-checks", icon: Wifi, group: "Monitoring" },
  { title: "SSL Monitoring", url: "/ssl", icon: Signal, group: "Monitoring" },
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
    `transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/30 shadow-lg shadow-blue-500/10" 
        : "hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 border-transparent"
    } border rounded-xl mx-2 my-1`;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} border-r border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl`} collapsible="icon">
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Server className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                ServerWatch
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Monitoring Dashboard
              </p>
            </div>
          )}
        </div>
        {collapsed && <SidebarTrigger className="mt-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2" />}
      </div>

      <SidebarContent className="px-3 py-4">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName} className="mb-6">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
                {groupName}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavCls}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && (
                          <span className="font-semibold text-sm ml-3">
                            {item.title}
                          </span>
                        )}
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
