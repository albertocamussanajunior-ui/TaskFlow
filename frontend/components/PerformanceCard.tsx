import type { ReactNode } from "react";

type PerformanceCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconClassName?: string;
  compact?: boolean;
};

export default function PerformanceCard({
  icon,
  label,
  value,
  sub,
  iconClassName = "text-gray-600 dark:text-gray-400",
  compact = false,
}: PerformanceCardProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-4 dark:bg-white/5">
      <div className={`flex gap-2 items-center ${iconClassName}`}>
        {icon}
        <p
          className={
            compact
              ? "text-xs text-gray-500 font-medium uppercase tracking-wider dark:text-gray-400"
              : "text-sm dark:text-gray-300"
          }
        >
          {label}
        </p>
      </div>
      <p className={
        compact 
          ? "text-2xl font-bold text-gray-800 dark:text-white" 
          : "text-5xl font-light dark:text-white"
      }>
        {value}
      </p>
      {sub ? <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p> : null}
    </div>
  );
}