import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Server,
  Bell,
  Settings,
  Gauge,
  Globe
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
  { title: "Websites", url: "/websites", icon: Globe, group: "Monitoring" },
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
        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/30 shadow-sm" 
        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 border-transparent"
    } border rounded-lg mx-2 my-0.5`;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} layout-sidebar`} collapsible="icon">
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Server className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                ServerWatch
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitoring Dashboard
              </p>
            </div>
          )}
        </div>
        {collapsed && <SidebarTrigger className="mt-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5" />}
      </div>

      <SidebarContent className="px-2 py-3">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName} className="mb-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-3">
                {groupName}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavCls}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <span className="font-medium text-sm ml-2">
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
