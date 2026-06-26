import { type ReactNode } from "react";
import { formatNumber, formatPercentage } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: ReactNode;
  suffix?: string;
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  suffix,
  className,
  loading,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-growthscape-sm transition-normal",
        "hover:shadow-growthscape-md hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      {loading ? (
        <div className="h-8 w-24 rounded bg-muted animate-pulse" />
      ) : (
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold tracking-tight">{formatNumber(value)}</p>
          {suffix && (
            <span className="text-sm text-muted-foreground mb-0.5">{suffix}</span>
          )}
        </div>
      )}
      {change !== undefined && !loading && (
        <p
          className={cn(
            "text-xs font-medium mt-2",
            isPositive && "text-success",
            isNegative && "text-destructive"
          )}
        >
          {formatPercentage(change)}
        </p>
      )}
    </div>
  );
}
