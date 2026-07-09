"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardChartsProps {
  projectStatusData: { name: string; total: number }[];
  taskCompletionData: { name: string; completas: number; pendentes: number }[];
}

export function DashboardCharts({ projectStatusData, taskCompletionData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 dark:bg-black/50">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Status dos Projectos</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Visão geral do estado actual</p>
        </div>
        <div className="h-50 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity="0.4" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#6B7280" }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#6B7280" }} 
              />
              <Tooltip 
                cursor={{ fill: "#E5E7EB", opacity: 0.4 }} 
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "none", 
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  backgroundColor: "#FFFFFF",
                  color: "#111827"
                }}
                labelStyle={{ color: "#111827" }}
              />
              <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 dark:bg-black/50">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Evolução de Tarefas</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Tarefas completas vs pendentes por projecto</p>
        </div>
        <div className="h-50 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={taskCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompletas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPendentes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity="0.4" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#6B7280" }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#6B7280" }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "none", 
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  backgroundColor: "#FFFFFF",
                  color: "#111827"
                }}
                labelStyle={{ color: "#111827" }}
              />
              <Area type="monotone" dataKey="completas" stroke="#10B981" fillOpacity={1} fill="url(#colorCompletas)" />
              <Area type="monotone" dataKey="pendentes" stroke="#F59E0B" fillOpacity={1} fill="url(#colorPendentes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}