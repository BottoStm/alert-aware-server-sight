
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
  Signal,
  ChevronDown,
  ChevronRight
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
  {
    title: "Servers",
    icon: Server,
    group: "Infrastructure",
    children: [
      { title: "Server List", url: "/servers", icon: Server },
      { title: "Processes", url: "/servers/processes", icon: Activity },
      { title: "Containers", url: "/servers/containers", icon: Database },
      { title: "Network", url: "/servers/network", icon: Network },
      { title: "Storage", url: "/servers/storage", icon: HardDrive },
    ]
  },
  {
    title: "Monitoring",
    icon: Activity,
    group: "Services",
    children: [
      { title: "Website Checks", url: "/monitoring/websites", icon: Wifi },
      { title: "SSL Monitoring", url: "/monitoring/ssl", icon: Signal },
    ]
  },
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
  const [expandedSections, setExpandedSections] = useState<string[]>(["Servers", "Monitoring"]);

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");
  const isChildActive = (children: any[]) => children.some(child => isActive(child.url));
  
  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

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
                    {item.children ? (
                      <div>
                        <SidebarMenuButton 
                          onClick={() => toggleSection(item.title)}
                          className={`w-full justify-between ${isChildActive(item.children) ? 'bg-primary/10 text-primary' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4 shrink-0" />
                            {!collapsed && <span className="font-medium">{item.title}</span>}
                          </div>
                          {!collapsed && (
                            expandedSections.includes(item.title) ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                          )}
                        </SidebarMenuButton>
                        {!collapsed && expandedSections.includes(item.title) && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <SidebarMenuButton key={child.title} asChild>
                                <NavLink to={child.url} end className={getNavCls}>
                                  <child.icon className="w-4 h-4 shrink-0" />
                                  <span className="font-medium text-sm">{child.title}</span>
                                </NavLink>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className={getNavCls}>
                          <item.icon className="w-4 h-4 shrink-0" />
                          {!collapsed && <span className="font-medium">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
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
