import React, { useState, useEffect } from "react";
import { Property, PredictionResult } from "../types";
import { 
  Sparkles, 
  MapPin, 
  Calculator, 
  Home, 
  Search, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  BrainCircuit, 
  Users, 
  MapPinHouse, 
  ExternalLink,
  Milestone
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

interface PredictionTabProps {
  initialPropertyToLoad?: Property | null;
  onClearLoadedProperty?: () => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

// Colombian hierarchy metadata for form dropdown cascades
const COLOMBIAN_STRUCTURE: Record<string, Record<string, string[]>> = {
  "Bogotá D.C.": {
    "Bogotá": [
      "Chapinero Alto", "Chapinero Central", "Rosales", "Chicó", "Cedritos", 
      "San Patricio", "Bella Suiza", "Colina Campestre", "La Esmeralda", "Teusaquillo"
    ]
  },
  "Antioquia": {
    "Medellín": ["El Poblado", "Castropol", "Loma del Indio", "Las Lomas", "Laureles", "Conquistadores", "La Castellana", "Belén"],
    "Envigado": ["Las Antillas", "La Sebastiana", "Alcalá"],
    "Sabaneta": ["Aves María", "La Doctora", "Las Lomitas"]
  },
  "Valle del Cauca": {
    "Cali": ["Ciudad Jardín", "El Peñón", "Pance", "San Fernando", "Versalles", "San Antonio"]
  },
  "Atlántico": {
    "Barranquilla": ["Alto Prado", "El Golf", "Villa Santos", "Boston", "Miramar"]
  },
  "Santander": {
    "Bucaramanga": ["Cabecera del Llano", "Sotomayor", "Real de Minas", "San Alonso"]
  },
  "Bolívar": {
    "Cartagena": ["Bocagrande", "Castillogrande", "Manga", "Getsemaní", "Crespo"]
  }
};

export default function PredictionTab({ 
  initialPropertyToLoad, 
  onClearLoadedProperty,
  selectedCity,
  onSelectCity
}: PredictionTabProps) {
  // Input form states
  const [department, setDepartment] = useState<string>("Bogotá D.C.");
  const [municipality, setMunicipality] = useState<string>("Bogotá");
  const [neighborhood, setNeighborhood] = useState<string>("Chapinero Alto");
  const [estrato, setEstrato] = useState<number>(5);
  const [area, setArea] = useState<number>(85);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [parking, setParking] = useState<number>(1);
  const [propertyType, setPropertyType] = useState<string>("Apartamento");

  // Output response states
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<any | null>(null);
  const [geminiInsights, setGeminiInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);

  // Cascading choices calculations
  const availableMunicipalities = Object.keys(COLOMBIAN_STRUCTURE[department] || {});
  const availableNeighborhoods = COLOMBIAN_STRUCTURE[department]?.[municipality] || [];

  // Sync municipality & neighborhood if department changes
  useEffect(() => {
    const defaultMuni = Object.keys(COLOMBIAN_STRUCTURE[department] || {})[0] || "";
    setMunicipality(defaultMuni);
  }, [department]);

  useEffect(() => {
    const defaultBarrios = COLOMBIAN_STRUCTURE[department]?.[municipality] || [];
    setNeighborhood(defaultBarrios[0] || "");
  }, [municipality, department]);

  // Synchronise local municipality with selectedCity prop
  useEffect(() => {
    if (selectedCity && selectedCity !== municipality) {
      const foundDept = Object.keys(COLOMBIAN_STRUCTURE).find((deptKey) => {
        return Object.keys(COLOMBIAN_STRUCTURE[deptKey]).some(
          (muniKey) => muniKey.toLowerCase() === selectedCity.toLowerCase()
        );
      });
      if (foundDept) {
        setDepartment(foundDept);
        const canonicalMuni = Object.keys(COLOMBIAN_STRUCTURE[foundDept]).find(
          (muniKey) => muniKey.toLowerCase() === selectedCity.toLowerCase()
        );
        if (canonicalMuni) {
          setMunicipality(canonicalMuni);
        }
      }
    }
  }, [selectedCity]);

  // Notify parent component of municipality change
  useEffect(() => {
    if (onSelectCity && municipality && municipality !== selectedCity) {
      onSelectCity(municipality);
    }
  }, [municipality, onSelectCity, selectedCity]);

  // Handle properties passed from GIS mapper
  useEffect(() => {
    if (initialPropertyToLoad) {
      setDepartment(initialPropertyToLoad.department);
      setTimeout(() => {
        setMunicipality(initialPropertyToLoad.municipality);
        setTimeout(() => {
          setNeighborhood(initialPropertyToLoad.neighborhood);
        }, 50);
      }, 50);
      setEstrato(initialPropertyToLoad.estrato);
      setArea(initialPropertyToLoad.area);
      setBedrooms(initialPropertyToLoad.bedrooms);
      setBathrooms(initialPropertyToLoad.bathrooms);
      setParking(initialPropertyToLoad.parking);
      setPropertyType(initialPropertyToLoad.propertyType);
    }
  }, [initialPropertyToLoad]);

  const triggerPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setPredictionData(null);
    setGeminiInsights("");

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          municipality,
          neighborhood,
          estrato,
          area,
          bedrooms,
          bathrooms,
          parking,
          propertyType
        })
      });

      const data = await response.json();
      setPredictionData(data);
      setIsPredicting(false);

      // Trigger server-side Gemini analytical insight commentary
      setIsLoadingInsights(true);
      const geminiRes = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptContext: {
            ubicacion: `${neighborhood}, ${municipality}, ${department}`,
            estrato,
            m_cuadrados: area,
            habitaciones: bedrooms,
            baños: bathrooms,
            estacionamiento: parking,
            valorEstimado: data.valor_estimado
          }
        })
      });

      const geminiData = await geminiRes.json();
      setGeminiInsights(geminiData.insights);
      setIsLoadingInsights(false);

    } catch (err) {
      console.error("Prediction failed:", err);
      setIsPredicting(false);
      setIsLoadingInsights(false);
    }
  };

  // Convert factor coefficients into a visual Chart payload
  const getFactorsChartData = () => {
    if (!predictionData || !predictionData.factors) return [];
    const f = predictionData.factors;
    return [
      { name: "Área", valor: f.areaEffect, fill: "#3b82f6" },
      { name: "Estrato", valor: f.estratoEffect, fill: "#10b981" },
      { name: "Habitaciones", valor: f.roomsEffect, fill: "#f59e0b" },
      { name: "Baños", valor: f.bathsEffect, fill: "#ec4899" },
      { name: "Parqueadero", valor: f.parkingEffect, fill: "#8b5cf6" },
      { name: "Ajuste Base", valor: f.basePrice + f.locationEffect, fill: "#64748b" }
    ].sort((a,b) => Math.abs(b.valor) - Math.abs(a.valor));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="prediction-tab-module">
      
      {/* LEFT: Input Form */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Parámetros Catastrales</h3>
              <p className="text-xs text-slate-500">Diligencia los atributos físicos del inmueble</p>
            </div>
          </div>
          {initialPropertyToLoad && (
            <button
              onClick={onClearLoadedProperty}
              id="btn-clear-property"
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-semibold transition"
            >
              Limpiar Mapper
            </button>
          )}
        </div>

        <form onSubmit={triggerPrediction} className="flex flex-col gap-4">
          
          {/* Location Cascades */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Departamento
              </label>
              <select
                id="select-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(COLOMBIAN_STRUCTURE).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Municipio
              </label>
              <select
                id="select-municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableMunicipalities.map((muni) => (
                  <option key={muni} value={muni}>{muni}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <MapPinHouse className="w-3.5 h-3.5 text-slate-400" /> Barrio / Sector
            </label>
            <select
              id="select-neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableNeighborhoods.map((barrio) => (
                <option key={barrio} value={barrio}>{barrio}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Tipo Inmueble</label>
              <select
                id="select-property-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Apartaestudio">Apartaestudio</option>
                <option value="Oficina">Oficina</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Estrato Macrozona</label>
              <select
                id="select-estrato"
                value={estrato}
                onChange={(e) => setEstrato(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>Estrato {num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-600">Área Privada ({area} m²)</label>
              <span className="text-slate-400">Entre 20m² y 400m²</span>
            </div>
            <input
              type="range"
              id="input-area"
              min="20"
              max="400"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Habitaciones</label>
              <select
                id="select-bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Baños</label>
              <select
                id="select-bathrooms"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Parqueadero</label>
              <select
                id="select-parking"
                value={parking}
                onChange={(e) => setParking(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[0, 1, 2, 3].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            id="btn-predict-arriendo"
            disabled={isPredicting}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-semibold rounded-2xl py-3.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 transition-all"
          >
            {isPredicting ? (
              <>
                <BrainCircuit className="w-4 h-4 animate-spin" />
                Procesando Algoritmo...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                CALCULAR VALOR ESTIMADO
              </>
            )}
          </button>
        </form>
      </div>

      {/* RIGHT: Results panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* State: No prediction generated yet */}
        {!isPredicting && !predictionData && (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4 min-h-[460px]">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <BrainCircuit className="w-8 h-8 animate-pulse text-blue-500" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-700">Estimación Predictiva Listo</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Ingresa los atributos de tu inmueble en la izquierda y presiona calcular. RentIA procesará los coeficientes óptimos.
              </p>
            </div>
          </div>
        )}

        {/* State: Loading prediction */}
        {isPredicting && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col gap-8 animate-pulse min-h-[460px]">
            <div className="flex flex-col gap-3">
              <div className="h-4 bg-slate-100 rounded-full w-24" />
              <div className="h-8 bg-slate-200 rounded-xl w-64" />
              <div className="h-4 bg-slate-100 rounded-full w-48" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-slate-50 rounded-2xl" />
              <div className="h-24 bg-slate-50 rounded-2xl" />
            </div>
            
            <div className="h-40 bg-slate-50 rounded-2xl" />
          </div>
        )}

        {/* State: Display fully generated prediction output */}
        {!isPredicting && predictionData && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Price block */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                <Home className="w-64 h-64 text-slate-350" />
              </div>

              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block">
                  ANÁLISIS COMPLETO GENERADO
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> IA Activa
                </span>
              </div>

              <div className="mt-6">
                <p className="text-xs text-slate-350">Valor Estimado Sugerido</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tight mt-1 font-sans">
                  ${predictionData.valor_estimado.toLocaleString("es-CO")} COP
                  <span className="text-sm font-medium text-slate-400"> / Mes</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-slate-800 pt-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Rango de Confianza (XGBoost - Estimado)</p>
                  <p className="font-semibold text-slate-200 font-mono mt-1 text-sm">{predictionData.intervalo_confianza} COP</p>
                </div>
                <div className="md:border-l md:border-slate-800 md:pl-4">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Precio Promedio de Referencia Sector</p>
                  <p className="font-semibold text-slate-200 font-mono mt-1 text-sm">
                    ${predictionData.neighborhoodAvg.toLocaleString("es-CO")} COP
                  </p>
                </div>
              </div>
            </div>

            {/* Layout tabs for visual breakdown & comparables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Factors weight diagram (Recharts) */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
                <label className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wider">
                  Contribución de Variables en Canon
                </label>
                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getFactorsChartData()}
                      layout="vertical"
                      margin={{ top: 5, right: 15, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" fontSize={9} stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" fontSize={9} width={80} stroke="#94a3b8" />
                      <Tooltip 
                        formatter={(val: any) => [`$${val.toLocaleString()} COP`, "Aporte"]}
                        contentStyle={{ fontSize: 10, borderRadius: 8, borderColor: "#e2e8f0" }}
                      />
                      <Bar dataKey="valor">
                        {getFactorsChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Nearby Interest Places with walking distances */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-55 pb-2">
                  Sitios de Interés Cercanos Detectados
                </label>
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[200px]">
                  {predictionData.nearbyPlaces?.map((plc: any) => (
                    <div key={plc.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Milestone className="w-3.5 h-3.5 text-blue-500" />
                          {plc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">{plc.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-800 font-semibold">{plc.distanceMeters} m</span>
                        <span className="text-[10px] text-slate-400 block">~{plc.walkingTimeMinutes} min caminata</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Comparables lists */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
              <label className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wider">
                Inmuebles Comparables en {municipality}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {predictionData.comparables?.map((comp: Property) => (
                  <div key={comp.id} className="bg-slate-50 hover:bg-slate-100/60 rounded-2xl p-3 text-xs border border-slate-120/40 relative flex flex-col gap-2 transition">
                    <span className="font-semibold text-slate-800 truncate block">{comp.neighborhood}</span>
                    <p className="text-slate-500 text-[11px] font-medium">{comp.propertyType} • {comp.area}m² • Estrato {comp.estrato}</p>
                    <span className="text-emerald-600 font-bold font-mono text-[12px] block mt-auto">
                      ${comp.price.toLocaleString("es-CO")} / Mes
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gemini AI Executive Insights */}
            <div className="bg-gradient-to-br from-blue-50/70 to-blue-200/20 border border-blue-100 rounded-3xl p-5 shadow-xs relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-blue-600 animate-pulse" />
                  Reporte Ejecutivo RentIA
                </span>
                {isLoadingInsights && (
                  <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                     Consultando IA...
                  </span>
                )}
              </div>
              
              {isLoadingInsights ? (
                <div className="space-y-2 py-2">
                  <div className="h-3.5 bg-blue-100/60 rounded-full w-full animate-pulse" />
                  <div className="h-3.5 bg-blue-100/60 rounded-full w-5/6 animate-pulse" />
                  <div className="h-3.5 bg-blue-100/60 rounded-full w-4/5 animate-pulse" />
                </div>
              ) : (
                <div className="text-slate-700 text-xs leading-relaxed space-y-2 whitespace-pre-line font-medium">
                  {geminiInsights || "Copia tu API Key en la barra superior en Ajustes > Secretos para habilitar comentarios detallados."}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
