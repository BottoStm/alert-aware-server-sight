
import { CpuUsageChart } from "./CpuUsageChart";
import { MemoryUsageChart } from "./MemoryUsageChart";
import { NetworkUsageChart } from "./NetworkUsageChart";
import { DiskUsageChart } from "./DiskUsageChart";

export function UsageOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CpuUsageChart />
        <MemoryUsageChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetworkUsageChart />
        <DiskUsageChart />
      </div>
    </div>
  );
}
