import React from "react";
import { Property } from "../types";
import { 
  Building, 
  Map, 
  DollarSign, 
  TrendingUp, 
  ChevronRight, 
  Flame, 
  Percent, 
  Sparkles,
  SearchCode
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import MetricCard from "./MetricCard";

interface DashboardTabProps {
  properties: Property[];
  onSelectProperty?: (prop: Property) => void;
}

export default function DashboardTab({ properties, onSelectProperty }: DashboardTabProps) {
  const propertyCount = properties.length;
  
  // Calculate average rental price
  const avgPrice = propertyCount > 0 
    ? properties.reduce((sum, p) => sum + p.price, 0) / propertyCount 
    : 0;

  // Calculate average price per square meter
  const avgPricePerM2 = propertyCount > 0
    ? properties.reduce((sum, p) => sum + (p.price / p.area), 0) / propertyCount
    : 0;

  // Calculate average administration cost
  const avgAdmin = propertyCount > 0
    ? properties.reduce((sum, p) => sum + p.administration, 0) / propertyCount
    : 0;

  // Calculate Average Pricing by Estrato Level (1 - 6)
  const estratoAverages = [1, 2, 3, 4, 5, 6].map(est => {
    const list = properties.filter(p => p.estrato === est);
    return {
      name: `Est. ${est}`,
      Promedio: list.length > 0 
        ? Math.round(list.reduce((sum, p) => sum + p.price, 0) / list.length) 
        : 0,
      Count: list.length
    };
  }).filter(e => e.Count > 0);

  // Group trends by municipality (Bogotá, Medellín, etc.)
  const cityDistribution = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena"].map(city => {
    const list = properties.filter(p => p.municipality.toLowerCase() === city.toLowerCase());
    const mean = list.length > 0 ? Math.round(list.reduce((sum, p) => sum + p.price, 0) / list.length) : 0;
    const count = list.length;
    return {
      name: city,
      ValorPromedio: mean,
      Propiedades: count,
      Growth: city === "Bogotá" ? 11.8 : city === "Medellín" ? 14.2 : city === "Cali" ? 8.9 : 10.1
    };
  }).filter(c => c.Propiedades > 0);

  // Order properties for listings
  const premiumProperties = [...properties]
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);

  const economicalProperties = [...properties]
    .filter(p => p.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 5);

  // Growth percentages timeline mock for Recharts area charts split by top cities
  const timelineData = [
    { name: "Ene", Bogotá: 2100000, Medellín: 1950000, Cali: 1650000 },
    { name: "Feb", Bogotá: 2150000, Medellín: 2000000, Cali: 1680000 },
    { name: "Mar", Bogotá: 2200000, Medellín: 2100000, Cali: 1700000 },
    { name: "Abr", Bogotá: 2280000, Medellín: 2250000, Cali: 1750000 },
    { name: "May", Bogotá: 2350000, Medellín: 2380000, Cali: 1780000 },
    { name: "Jun", Bogotá: 2420000, Medellín: 2500000, Cali: 1820000 }
  ];

  const pieColors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b"];

  return (
    <div className="flex flex-col gap-8" id="dashboard-tab-module">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          id="kpi-count"
          title="Total Inmuebles"
          value={propertyCount}
          subtitle="Registros depurados en ETL"
          trend={{ value: "12%", isPositive: true }}
          icon={Building}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />

        <MetricCard
          id="kpi-avg-price"
          title="Canon Promedio"
          value={`$${(avgPrice / 1000000).toFixed(2)}M COP`}
          subtitle="Arriendo mensual promedio"
          trend={{ value: "4.8%", isPositive: true }}
          icon={DollarSign}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <MetricCard
          id="kpi-avg-m2"
          title="Arriendo por m²"
          value={`$${Math.round(avgPricePerM2).toLocaleString("es-CO")}`}
          subtitle="Valor m² rentable"
          trend={{ value: "2.4%", isPositive: true }}
          icon={TrendingUp}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />

        <MetricCard
          id="kpi-avg-admin"
          title="Administración"
          value={`$${Math.round(avgAdmin).toLocaleString("es-CO")}`}
          subtitle="Expensa común promedio"
          trend={{ value: "5.1%", isPositive: false }}
          icon={Map}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Visual Charts: Recharts Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart A: Price history trends by Metropolitan area */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-850 uppercase tracking-wide">
                Series de Canon por Municipio (Semestre)
              </h4>
              <p className="text-xs text-slate-400">Arriendo mensual mediano - Bogotá vs Medellín vs Cali</p>
            </div>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded inline-block text-slate-650 font-bold tracking-wider">
              VALORES INDEXADOS
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorBta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMde" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis 
                  fontSize={11} 
                  stroke="#94a3b8" 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} 
                />
                <Tooltip 
                  formatter={(val: any) => [`$${val.toLocaleString()} COP`, "Canon"]}
                  contentStyle={{ borderRadius: 10, borderColor: "#cbd5e1" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Bogotá" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBta)" />
                <Area type="monotone" dataKey="Medellín" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMde)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Distribution Pie/Donut of Listing Areas */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-850 uppercase tracking-wide mb-1">
              Participación de Oferta
            </h4>
            <p className="text-xs text-slate-400">Porcentaje de inmuebles según su estrato</p>
          </div>

          <div className="h-[210px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estratoAverages}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="Count"
                >
                  {estratoAverages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} propiedades`, "Cantidad"]}
                  contentStyle={{ borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute inset-x-0 bottom-1/2 transform translate-y-1/2 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-800">{properties.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Unidades</span>
            </div>
          </div>

          {/* Table Legend */}
          <div className="grid grid-cols-3 gap-1 pt-2">
            {estratoAverages.map((entry, index) => (
              <div key={entry.name} className="flex flex-col text-center">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                  {entry.name}
                </span>
                <span className="text-xs font-bold text-slate-700">{entry.Count} props</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart C: Estrato Average price histogram */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
          <label className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wider">
            Canon Promedio por Estrato
          </label>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estratoAverages} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis 
                  fontSize={10} 
                  stroke="#94a3b8" 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} 
                />
                <Tooltip 
                  formatter={(val: any) => [`$${val.toLocaleString()} COP`, "Promedio"]}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar dataKey="Promedio" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Price averages by city */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
          <label className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wider">
            Comparativo de Volúmenes por Ciudad Principal
          </label>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis 
                  yAxisId="left"
                  fontSize={10} 
                  stroke="#3b82f6" 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  fontSize={10} 
                  stroke="#f59e0b" 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: 8 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="ValorPromedio" name="Arriendo Medio (COP)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="Propiedades" name="Propiedades en BD" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Extreme Sectors: High pricing vs Cheap pricing list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PREMIUM */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Top 5 Sectores Exclusivos / Mayor Canon
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            {premiumProperties.map((p, idx) => (
              <div 
                key={p.id}
                id={`premium-item-${idx}`}
                onClick={() => onSelectProperty && onSelectProperty(p)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 font-extrabold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-755">{p.neighborhood}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{p.municipality} • {p.propertyType}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 font-mono">${p.price.toLocaleString("es-CO")}</span>
                  <span className="text-[9px] text-slate-400 block">{p.area} m² ({Math.round(p.price / p.area).toLocaleString()} / m²)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ECONOMICAL */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Top 5 Sectores de Alta Oportunidad / Arriendos Económicos
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            {economicalProperties.map((p, idx) => (
              <div 
                key={p.id}
                id={`cheap-item-${idx}`}
                onClick={() => onSelectProperty && onSelectProperty(p)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-emerald-55 text-emerald-700 font-extrabold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-755">{p.neighborhood}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{p.municipality} • {p.propertyType}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 font-mono">${p.price.toLocaleString("es-CO")}</span>
                  <span className="text-[9px] text-slate-400 block">{p.area} m² ({Math.round(p.price / p.area).toLocaleString()} / m²)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
