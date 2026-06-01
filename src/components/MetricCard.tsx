import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export default function MetricCard({
  id,
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600"
}: MetricCardProps) {
  return (
    <div 
      id={id}
      className="bg-white border border-slate-100/80 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md hover:border-slate-200/60"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-sans">{value}</span>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded-md font-semibold font-mono ${
              trend.isPositive ? "bg-emerald-55 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
              {trend.isPositive ? "+" : ""}{trend.value}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
