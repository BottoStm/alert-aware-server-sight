
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline" | "warning" | "maintenance";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusStyles = {
    online: "bg-green-500/20 text-green-400 border-green-500/30",
    offline: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    maintenance: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border",
      statusStyles[status],
      className
    )}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "online" && "bg-green-400 animate-pulse",
        status === "offline" && "bg-red-400",
        status === "warning" && "bg-amber-400 animate-pulse",
        status === "maintenance" && "bg-blue-400"
      )} />
      {children}
    </span>
  );
}
