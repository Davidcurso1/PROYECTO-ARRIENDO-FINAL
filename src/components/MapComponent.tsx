import React, { useState } from "react";
import { Property, InterestPlace } from "../types";
import { MapPin, Compass, Eye, Flame, Landmark, Train, GraduationCap, Building, Trash2, Sliders, Info, Map as MapIcon } from "lucide-react";

interface MapComponentProps {
  properties: Property[];
  places: InterestPlace[];
  selectedProperty?: Property | null;
  onSelectProperty?: (prop: Property) => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

// Interactive neighborhood geometry details for all supported Colombian cities (coordinates mapped in a 100x100 SVG space)
interface NeighborhoodRegion {
  name: string;
  points: string;
  centerX: number;
  centerY: number;
  description: string;
  avgRentBonus: string;
  estratoDefault: number;
}

const NEIGHBORHOOD_MAPS: Record<string, NeighborhoodRegion[]> = {
  "Bogotá": [
    { name: "Chicó", points: "55,20 80,18 85,38 60,40", centerX: 70, centerY: 29, description: "Sector corporativo exclusivo con excelente seguridad y restaurantes de lujo.", avgRentBonus: "+15% vs general", estratoDefault: 6 },
    { name: "Rosales", points: "75,38 95,36 95,54 75,54", centerX: 85, centerY: 45, description: "La zona más prestigiosa junto a los Cerros Orientales, preferida por diplomáticos.", avgRentBonus: "+24% vs general", estratoDefault: 6 },
    { name: "Chapinero Alto", points: "70,54 95,54 90,72 65,70", centerX: 80, centerY: 62, description: "Área bohemia con amplia oferta gastronómica, de diseño y vida universitaria.", avgRentBonus: "+8% vs general", estratoDefault: 4 },
    { name: "Chapinero Central", points: "45,54 70,54 65,72 40,70", centerX: 55, centerY: 62, description: "Corazón comercial y de servicios de la ciudad con acceso a transporte masivo.", avgRentBonus: "-4% vs general", estratoDefault: 4 },
    { name: "Cedritos", points: "50,5 95,5 95,20 50,18", centerX: 72, centerY: 11, description: "Barrio residencial familiar por excelencia, plano, rodeado de parques y cafés.", avgRentBonus: "-10% vs general", estratoDefault: 4 },
    { name: "San Patricio", points: "25,10 50,10 50,28 25,28", centerX: 37, centerY: 19, description: "Tranquilo sector residencial de estrato 6 con amplias zonas peatonales.", avgRentBonus: "+12% vs general", estratoDefault: 6 },
    { name: "Bella Suiza", points: "75,5 95,5 95,20 75,20", centerX: 87, centerY: 12, description: "Zona residencial tranquila con espectacular microclima y clínicas de alta calidad.", avgRentBonus: "+5% vs general", estratoDefault: 5 },
    { name: "Colina Campestre", points: "5,10 25,10 25,35 5,35", centerX: 15, centerY: 22, description: "Desarrollos de modernos conjuntos cerrados de gran expansión familiar.", avgRentBonus: "-8% vs general", estratoDefault: 5 },
    { name: "Teusaquillo", points: "20,70 50,70 45,95 15,95", centerX: 32, centerY: 82, description: "Arquitectura arquitectónica patrimonial de conservación, áreas verdes y teatros.", avgRentBonus: "-15% vs general", estratoDefault: 4 },
    { name: "La Esmeralda", points: "5,50 35,50 35,70 5,70", centerX: 20, centerY: 60, description: "Excelente seguridad gubernamental, adyacente al Parque Metropolitano Simón Bolívar.", avgRentBonus: "-12% vs general", estratoDefault: 4 }
  ],
  "Medellín": [
    { name: "El Poblado", points: "50,60 95,55 95,95 45,95", centerX: 72, centerY: 77, description: "Financiero, hotelero y centro nocturno de Medellín. Alta plusvalía.", avgRentBonus: "+28% vs general", estratoDefault: 6 },
    { name: "Castropol", points: "50,40 90,38 95,60 50,60", centerX: 70, centerY: 49, description: "Laderas residenciales con espectaculares panorámicas de la ciudad.", avgRentBonus: "+14% vs general", estratoDefault: 6 },
    { name: "Loma del Indio", points: "75,20 95,20 90,40 70,40", centerX: 82, centerY: 30, description: "Fácil acceso a Las Palmas con un clima de montaña más fresco.", avgRentBonus: "+5% vs general", estratoDefault: 5 },
    { name: "Las Lomas", points: "70,60 95,60 95,85 70,85", centerX: 82, centerY: 72, description: "Sectores boscosos pacíficos a minutos de centros de entretenimiento.", avgRentBonus: "+22% vs general", estratoDefault: 6 },
    { name: "Laureles", points: "10,35 45,35 40,65 5,65", centerX: 22, centerY: 50, description: "Zona plana de parques circulares, caminabilidad y un auge gastronómico fantástico.", avgRentBonus: "+5% vs general", estratoDefault: 5 },
    { name: "Conquistadores", points: "40,35 60,35 50,60 35,60", centerX: 47, centerY: 47, description: "Bordeando Parques del Río, plano, céntrico y de vibraciones hogareñas.", avgRentBonus: "+2% vs general", estratoDefault: 5 },
    { name: "La Castellana", points: "5,15 35,15 35,35 5,35", centerX: 20, centerY: 25, description: "Tranquilo residencial con baja densidad y casas unifamiliares de gran tamaño.", avgRentBonus: "-5% vs general", estratoDefault: 5 },
    { name: "Belén", points: "5,65 40,65 35,95 5,95", centerX: 20, centerY: 80, description: "Tradición y comercio diverso con escenarios deportivos de clase mundial.", avgRentBonus: "-12% vs general", estratoDefault: 4 }
  ],
  "Cali": [
    { name: "Ciudad Jardín", points: "35,70 85,70 75,95 25,95", centerX: 55, centerY: 82, description: "El sur sofisticado con campus universitarios, lagos y mansiones.", avgRentBonus: "+25% vs general", estratoDefault: 6 },
    { name: "El Peñón", points: "30,25 70,25 65,50 25,50", centerX: 47, centerY: 37, description: "Gourmet, de diseño y hotelero, favorito de extranjeros y peatones.", avgRentBonus: "+18% vs general", estratoDefault: 6 },
    { name: "Pance", points: "5,70 35,70 25,95 5,95", centerX: 20, centerY: 82, description: "Condominios campestres con río natural e increíbles vistas a los Farallones.", avgRentBonus: "+20% vs general", estratoDefault: 6 },
    { name: "San Fernando", points: "20,50 65,50 60,70 15,70", centerX: 40, centerY: 60, description: "Zona médica tradicional de gran arraigo cerca al estadio Pascual Guerrero.", avgRentBonus: "+3% vs general", estratoDefault: 5 },
    { name: "Versalles", points: "40,5 85,5 80,30 35,30", centerX: 60, centerY: 17, description: "Norte corporativo plano muy activo con excelente conexión vial.", avgRentBonus: "+5% vs general", estratoDefault: 5 },
    { name: "San Antonio", points: "5,25 30,25 25,50 5,50", centerX: 17, centerY: 37, description: "Arquitectura colonial, mirador icónico de la ciudad y centros artísticos.", avgRentBonus: "+10% vs general", estratoDefault: 4 }
  ],
  "Barranquilla": [
    { name: "Alto Prado", points: "35,30 80,30 75,65 30,65", centerX: 55, centerY: 47, description: "Epicentro de finanzas y gastronomía gourmet de la Región Caribe.", avgRentBonus: "+22% vs general", estratoDefault: 6 },
    { name: "El Golf", points: "40,5 90,5 85,30 35,30", centerX: 62, centerY: 17, description: "La cima residencial de lujo con los apartamentos más amplios y exclusivos.", avgRentBonus: "+30% vs general", estratoDefault: 6 },
    { name: "Villa Santos", points: "5,10 35,10 30,45 5,45", centerX: 20, centerY: 27, description: "Alturas ventiladas con gran expansión comercial y hermosas vistas.", avgRentBonus: "+15% vs general", estratoDefault: 5 },
    { name: "Boston", points: "25,65 75,65 70,95 20,95", centerX: 47, centerY: 80, description: "Tradición e historia envueltos en robles amarillos centenarios.", avgRentBonus: "-15% vs general", estratoDefault: 4 },
    { name: "Miramar", points: "5,45 35,45 30,75 5,75", centerX: 20, centerY: 60, description: "Conjuntos familiares altos que capturan la fuerte brisa de la llanura norte.", avgRentBonus: "-8% vs general", estratoDefault: 4 }
  ],
  "Bucaramanga": [
    { name: "Cabecera del Llano", points: "55,30 95,30 95,75 50,75", centerX: 75, centerY: 52, description: "El barrio más representativo, de compras y financiero de Santander.", avgRentBonus: "+24% vs general", estratoDefault: 6 },
    { name: "Sotomayor", points: "15,30 55,30 50,75 10,75", centerX: 35, centerY: 52, description: "Hermosos parques emblemáticos (San Pío), arborización y clínicas especializadas.", avgRentBonus: "+12% vs general", estratoDefault: 5 },
    { name: "Real de Minas", points: "10,75 80,75 75,98 5,98", centerX: 45, centerY: 86, description: "Planificación urbana de primer nivel con universidades, parques y colegios.", avgRentBonus: "-14% vs general", estratoDefault: 4 },
    { name: "San Alonso", points: "15,5 85,5 80,30 10,30", centerX: 47, centerY: 17, description: "Tradicionalmente deportivo y familiar, excelente cercanía a la Villa Olímpica.", avgRentBonus: "-8% vs general", estratoDefault: 4 }
  ],
  "Cartagena": [
    { name: "Bocagrande", points: "10,40 50,40 45,95 5,95", centerX: 27, centerY: 67, description: "Modernos rascacielos frente al Mar Caribe con hoteles de nivel global.", avgRentBonus: "+28% vs general", estratoDefault: 6 },
    { name: "Castillogrande", points: "45,60 95,60 90,95 45,95", centerX: 70, centerY: 77, description: "Zonas peatonales silenciosas frente a la bahía de descarga comercial.", avgRentBonus: "+35% vs general", estratoDefault: 6 },
    { name: "Manga", points: "50,20 95,20 95,60 45,55", centerX: 72, centerY: 37, description: "Isla residencial con casonas republicanas señoriales y muelles deportivos.", avgRentBonus: "+10% vs general", estratoDefault: 5 },
    { name: "Getsemaní", points: "15,5 60,5 50,40 10,40", centerX: 35, centerY: 22, description: "Barrio histórico lleno de color, galerías, cafés callejeros y ambiente bohemio.", avgRentBonus: "+15% vs general", estratoDefault: 4 },
    { name: "Crespo", points: "60,5 98,5 95,30 55,30", centerX: 79, centerY: 17, description: "Barrio costero pacífico cerca al aeropuerto con parques lineales frente al mar.", avgRentBonus: "-5% vs general", estratoDefault: 4 }
  ]
};

export default function MapComponent({ 
  properties, 
  places, 
  selectedProperty, 
  onSelectProperty,
  selectedCity,
  onSelectCity
}: MapComponentProps) {
  const [activeCity, setActiveCity] = useState<string>(selectedCity || "Bogotá");
  const [viewMode, setViewMode] = useState<"pins" | "heatmap">("pins");
  const [selectedPin, setSelectedPin] = useState<Property | null>(null);

  // Advanced neighborhood-level interactivity states
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<string | null>(null);

  // Focus coordinates for different Colombian major cities
  const cityFocalPoints: Record<string, { lat: number, lon: number, zoomScale: number }> = {
    "Bogotá": { lat: 4.6097, lon: -74.0817, zoomScale: 1.1 },
    "Medellín": { lat: 6.2518, lon: -75.5635, zoomScale: 1.2 },
    "Cali": { lat: 3.4516, lon: -76.5320, zoomScale: 1.1 },
    "Barranquilla": { lat: 10.9639, lon: -74.7964, zoomScale: 1.3 },
    "Bucaramanga": { lat: 7.1193, lon: -73.1227, zoomScale: 1.15 },
    "Cartagena": { lat: 10.3910, lon: -75.4794, zoomScale: 1.05 }
  };

  // Sync activeCity state when selectedCity prop changes
  React.useEffect(() => {
    if (selectedCity && selectedCity !== activeCity) {
      const matchedCity = Object.keys(cityFocalPoints).find(
        key => key.toLowerCase() === selectedCity.toLowerCase()
      );
      if (matchedCity) {
        setActiveCity(matchedCity);
        setSelectedNeighborhood(null); // Reset neighborhood state on city change
      }
    }
  }, [selectedCity]);

  // Sync parent when activeCity changes
  React.useEffect(() => {
    if (onSelectCity && activeCity && activeCity !== selectedCity) {
      onSelectCity(activeCity);
    }
  }, [activeCity, onSelectCity, selectedCity]);

  // Reset neighborhood filter on city change by clicking sidebar buttons
  const handleCityChange = (city: string) => {
    setActiveCity(city);
    setSelectedPin(null);
    setSelectedNeighborhood(null);
    setHoveredNeighborhood(null);
  };

  // Filter properties and places based on active city
  const cityProperties = properties.filter(
    p => p.municipality.toLowerCase() === activeCity.toLowerCase()
  );

  // Filter properties additionally based on active neighborhood if selected
  const visibleProperties = selectedNeighborhood
    ? cityProperties.filter(p => {
        // Broad matches for neighborhood strings to match partial titles
        return p.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase()) || 
               selectedNeighborhood.toLowerCase().includes(p.neighborhood.toLowerCase());
      })
    : cityProperties;

  const cityPlaces = places.filter(p => {
    if (activeCity === "Bogotá" && p.latitude < 5 && p.latitude > 4.5 && p.longitude < -74) return true;
    if (activeCity === "Medellín" && p.latitude > 6 && p.latitude < 6.5) return true;
    if (activeCity === "Cali" && p.latitude > 3 && p.latitude < 3.8 && p.longitude < -76) return true;
    if (activeCity === "Barranquilla" && p.latitude > 10.8 && p.latitude < 11.1 && p.longitude > -74.9) return true;
    if (activeCity === "Cartagena" && p.latitude > 10.3 && p.latitude < 10.5 && p.longitude < -75.4) return true;
    if (activeCity === "Bucaramanga" && p.latitude > 7 && p.latitude < 7.2) return true;
    return false;
  });

  // Calculate coordinates in our custom SVG GIS frame
  const cityBounds: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
    "Bogotá": { minLat: 4.61, maxLat: 4.74, minLon: -74.09, maxLon: -74.02 },
    "Medellín": { minLat: 6.14, maxLat: 6.29, minLon: -75.61, maxLon: -75.54 },
    "Cali": { minLat: 3.33, maxLat: 3.46, minLon: -76.55, maxLon: -76.51 },
    "Barranquilla": { minLat: 10.97, maxLat: 11.03, minLon: -74.86, maxLon: -74.78 },
    "Cartagena": { minLat: 10.38, maxLat: 10.43, minLon: -75.57, maxLon: -75.49 },
    "Bucaramanga": { minLat: 7.09, maxLat: 7.15, minLon: -73.14, maxLon: -73.10 }
  };

  const getCoordinates = (lat: number, lon: number, city: string) => {
    const bounds = cityBounds[city] || cityBounds["Bogotá"];
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 100;
    const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    };
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "Universidad": return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case "Hospital":
      case "Clinica": return <Building className="w-4 h-4 text-red-500" />;
      case "Transporte": return <Train className="w-4 h-4 text-blue-500" />;
      default: return <Landmark className="w-4 h-4 text-amber-500" />;
    }
  };

  // Get active city neighborhoods from our local list
  const activeCityNeighborhoods = NEIGHBORHOOD_MAPS[activeCity] || [];

  // Metrics for statistics calculated dynamically based on filtered level
  const statsProperties = selectedNeighborhood ? visibleProperties : cityProperties;
  const avgPrice = statsProperties.reduce((sum, p) => sum + p.price, 0) / (statsProperties.length || 1);
  const avgAdmin = statsProperties.reduce((sum, p) => sum + p.administration, 0) / (statsProperties.length || 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="rentia-maps-dashboard">
      {/* Sidebar: Cities, list, filters */}
      <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: "12s" }} />
            Geolocalización de Arriendos
          </h3>
          <p className="text-xs text-slate-500 mt-1">Navega y analiza por ciudades principales en Colombia</p>
        </div>

        {/* City Selectors */}
        <div className="grid grid-cols-2 gap-1.5">
          {Object.keys(cityFocalPoints).map((city) => (
            <button
              key={city}
              id={`btn-city-${city.toLowerCase()}`}
              onClick={() => handleCityChange(city)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                activeCity === city
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Dynamic Neighborhood List Selector */}
        {activeCityNeighborhoods.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapIcon className="w-3 h-3 text-blue-500" />
                Colección de Barrios
              </label>
              {selectedNeighborhood && (
                <button
                  onClick={() => setSelectedNeighborhood(null)}
                  className="text-[10px] text-rose-500 hover:underline font-bold flex items-center gap-0.5"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-[110px] overflow-y-auto pr-1">
              {activeCityNeighborhoods.map((n) => {
                const count = cityProperties.filter(p => p.neighborhood.toLowerCase().includes(n.name.toLowerCase()) || n.name.toLowerCase().includes(p.neighborhood.toLowerCase())).length;
                const isSelected = selectedNeighborhood === n.name;
                return (
                  <button
                    key={n.name}
                    onClick={() => setSelectedNeighborhood(isSelected ? null : n.name)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50"
                    }`}
                  >
                    <span>{n.name}</span>
                    <span className={`px-1 py-0.25 rounded text-[8px] ${isSelected ? "bg-blue-700 text-blue-100" : "bg-slate-200 text-slate-600"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3">
          <label className="text-xs font-semibold text-slate-700 block mb-2">Capa Visual</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("pins")}
              id="map-mode-pins"
              className={`py-1.5 text-[11px] font-medium rounded flex items-center justify-center gap-1.5 transition-all ${
                viewMode === "pins" 
                  ? "bg-white shadow-xs text-slate-800" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Eye className="w-3 h-3" />
              Inmuebles
            </button>
            <button
              onClick={() => setViewMode("heatmap")}
              id="map-mode-heatmap"
              className={`py-1.5 text-[11px] font-medium rounded flex items-center justify-center gap-1.5 transition-all ${
                viewMode === "heatmap" 
                  ? "bg-white shadow-xs text-slate-850" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Flame className="w-3 h-3 text-orange-500" />
              Calor Precios
            </button>
          </div>
        </div>

        {/* Selected Property / Neighborhood statistics bar */}
        <div className="border-t border-slate-100 pt-3 flex-1 flex flex-col justify-between">
          <div className="bg-slate-50 rounded-xl p-3 text-xs flex flex-col gap-2">
            <span className="font-semibold text-slate-800 block flex justify-between items-center">
              <span>Métricas {selectedNeighborhood ? `Barrio: ${selectedNeighborhood}` : activeCity}</span>
              <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.25 rounded">
                {selectedNeighborhood ? "Zona" : "Global"}
              </span>
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500">Inmuebles Activos:</span>
              <span className="font-medium text-slate-800">{statsProperties.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valor Promedio:</span>
              <span className="font-semibold text-emerald-600 font-mono">
                ${(avgPrice / 1000000).toFixed(2)}M COP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gasto de Administración:</span>
              <span className="font-medium text-slate-800">
                ${avgAdmin.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
              </span>
            </div>

            {selectedNeighborhood && (
              <div className="mt-1 pt-1.5 border-t border-dashed border-slate-200 text-[10px] text-slate-400">
                Comparado con {activeCity}:{" "}
                <span className="font-semibold text-slate-600">
                  {((avgPrice / (cityProperties.reduce((s, p) => s + p.price, 0) / (cityProperties.length || 1)) - 1) * 100).toFixed(1)}% de variación
                </span>
              </div>
            )}
          </div>

          {selectedProperty && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs">
              <p className="font-semibold text-blue-900">Inmueble Seleccionado:</p>
              <p className="text-blue-700 mt-1 font-mono text-[10px] truncate">{selectedProperty.address}</p>
              <div className="flex justify-between text-blue-800 font-semibold mt-1">
                <span>{selectedProperty.neighborhood}</span>
                <span>${selectedProperty.price.toLocaleString("es-CO")} COP</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Box */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl relative shadow-md overflow-hidden min-h-[500px] flex flex-col">
        {/* Map Header details */}
        <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-xs flex flex-col gap-1 max-w-[280px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-350 font-medium">Mapa Catastral de {activeCity}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium leading-tight">
            {selectedNeighborhood 
              ? `Barrio seleccionado: ${selectedNeighborhood}` 
              : "Interactúa haciendo clic en las zonas de los barrios sobre el mapa"
            }
          </span>
        </div>

        {/* Clear Neighborhood selection badge top right */}
        {selectedNeighborhood && (
          <button
            onClick={() => setSelectedNeighborhood(null)}
            className="absolute top-4 right-4 z-10 bg-blue-650/90 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition hover:bg-rose-600"
          >
            <Trash2 className="w-3 h-3" />
            Ver Ciudad Completa
          </button>
        )}

        {/* Map Vector Grid Canvas */}
        <div className="flex-1 w-full bg-slate-950 relative flex items-center justify-center p-4">
          {/* Radial Grid Backdrop */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="w-full h-full max-h-[420px] max-w-[540px] relative">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full text-slate-800 drop-shadow-lg"
              style={{ stroke: "rgba(51, 65, 85, 0.45)", strokeWidth: 0.15 }}
            >
              {/* INTERACTIVE NEIGHBORHOOD POLYGONS */}
              {activeCityNeighborhoods.map((n) => {
                const isSelected = selectedNeighborhood === n.name;
                const isHovered = hoveredNeighborhood === n.name;
                return (
                  <g key={`poly-${n.name}`}>
                    <polygon
                      points={n.points}
                      onClick={() => setSelectedNeighborhood(isSelected ? null : n.name)}
                      onMouseEnter={() => setHoveredNeighborhood(n.name)}
                      onMouseLeave={() => setHoveredNeighborhood(null)}
                      className="cursor-pointer transition-all duration-300"
                      fill={
                        isSelected 
                          ? "rgba(59, 130, 246, 0.32)" 
                          : isHovered 
                            ? "rgba(59, 130, 246, 0.15)" 
                            : "rgba(30, 41, 59, 0.25)"
                      }
                      stroke={
                        isSelected 
                          ? "#3b82f6" 
                          : isHovered 
                            ? "rgba(59, 130, 246, 0.6)" 
                            : "rgba(51, 65, 85, 0.4)"
                      }
                      strokeWidth={isSelected ? 0.6 : isHovered ? 0.35 : 0.18}
                      strokeDasharray={isSelected ? "none" : isHovered ? "1 0.5" : "none"}
                    />
                    
                    {/* Floating label center text */}
                    <text
                      x={n.centerX}
                      y={n.centerY}
                      onClick={() => setSelectedNeighborhood(isSelected ? null : n.name)}
                      onMouseEnter={() => setHoveredNeighborhood(n.name)}
                      onMouseLeave={() => setHoveredNeighborhood(null)}
                      className={`text-[3.2px] font-semibold cursor-pointer select-none transition-all duration-300 ${
                        isSelected 
                          ? "fill-blue-400 font-bold drop-shadow-xs" 
                          : isHovered 
                            ? "fill-white" 
                            : "fill-slate-500 hover:fill-slate-350"
                      }`}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {n.name}
                    </text>
                  </g>
                );
              })}

              {/* Heatmap blur spots */}
              {viewMode === "heatmap" && visibleProperties.map((p, idx) => {
                const { x, y } = getCoordinates(p.latitude, p.longitude, activeCity);
                const isHighPrice = p.price > 3000000;
                return (
                  <circle
                    key={`heat-${idx}`}
                    cx={x}
                    cy={y}
                    r={isHighPrice ? 12 : 8}
                    fill={isHighPrice ? "rgba(239, 68, 68, 0.45)" : "rgba(249, 115, 22, 0.35)"}
                    className="pointer-events-none animate-pulse"
                    style={{ filter: "blur(4px)" }}
                  />
                );
              })}

              {/* Compass grid concentric circles for points of interest center */}
              <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(30, 41, 59, 0.35)" strokeDasharray="1 1" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(30, 41, 59, 0.35)" strokeDasharray="1 1" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(30, 41, 59, 0.35)" strokeDasharray="1 1" />
            </svg>

            {/* Render Property Pins */}
            {viewMode === "pins" && cityProperties.map((p) => {
              const { x, y } = getCoordinates(p.latitude, p.longitude, activeCity);
              const isSelected = selectedProperty?.id === p.id || selectedPin?.id === p.id;
              
              // If a neighborhood is selected, dim pins outside of it to highlight focus
              const isMatchWithSelectedNeighborhood = selectedNeighborhood 
                ? p.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase()) || 
                  selectedNeighborhood.toLowerCase().includes(p.neighborhood.toLowerCase())
                : true;

              return (
                <div
                  key={p.id}
                  id={`map-pin-${p.id}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => {
                    setSelectedPin(p);
                    if (onSelectProperty) onSelectProperty(p);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 transition-all duration-300 ${
                    isMatchWithSelectedNeighborhood 
                      ? "opacity-100 scale-100" 
                      : "opacity-15 scale-75 hover:opacity-50"
                  }`}
                >
                  <div className={`relative flex items-center justify-center p-1 rounded-full transition-all ${
                    isSelected 
                      ? "bg-blue-600 ring-4 ring-blue-500/30 scale-125 z-30 animate-bounce" 
                      : isMatchWithSelectedNeighborhood
                        ? "bg-slate-800 hover:bg-slate-700 hover:scale-110"
                        : "bg-slate-900"
                  }`}>
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-white" : isMatchWithSelectedNeighborhood ? "text-emerald-400" : "text-slate-500"}`} />
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-950 border border-slate-800 shadow-xl px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-40 whitespace-nowrap text-left">
                      <p className="text-[11px] font-semibold text-white">{p.neighborhood}</p>
                      <p className="text-[10px] text-slate-400">{p.propertyType} • {p.area} m²</p>
                      <p className="text-emerald-400 font-mono font-semibold text-xs mt-0.5">${p.price.toLocaleString("es-CO")} COP</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Interest Place markers */}
            {cityPlaces.map((pl) => {
              const { x, y } = getCoordinates(pl.latitude, pl.longitude, activeCity);
              return (
                <div
                  key={pl.id}
                  id={`map-place-${pl.id}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30 hover:opacity-90 group"
                >
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800">
                    {getCategoryIcon(pl.category)}
                    
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {pl.name} ({pl.category})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Neighborhood Insight banner overlay */}
        {(selectedNeighborhood || hoveredNeighborhood) && (
          <div className="absolute bottom-[72px] left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl z-20 transition-all duration-300">
            {(() => {
              const activeNeighName = selectedNeighborhood || hoveredNeighborhood;
              const nData = activeCityNeighborhoods.find(item => item.name === activeNeighName);
              if (!nData) return null;
              
              return (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <Info className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">Insight de Barrio: {nData.name}</h4>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.25 rounded-full font-semibold">
                        {nData.avgRentBonus}
                      </span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.25 rounded-full font-semibold">
                        Estrato {nData.estratoDefault}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {nData.description} Haga clic en el mapa para {selectedNeighborhood ? "desmarcar" : "filtrar ofertas"} de este sector.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Selected Marker Details Drawer at bottom of map */}
        {(selectedPin || selectedProperty) && (
          <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {(() => {
              const currentItem = selectedProperty || selectedPin;
              if (!currentItem) return null;
              
              return (
                <>
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-blue-500 uppercase">INMUEBLE DEL SECTOR</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">{currentItem.neighborhood}, {currentItem.municipality}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <span>{currentItem.address}</span> • 
                      <span>{currentItem.area} m²</span> • 
                      <span>{currentItem.bedrooms} Hab</span> • 
                      <span>{currentItem.bathrooms} Baños</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block">Canon Mensual</span>
                      <span className="text-emerald-400 font-mono font-bold text-lg">${currentItem.price.toLocaleString("es-CO")} COP</span>
                    </div>
                    {onSelectProperty && (
                      <button
                        onClick={() => onSelectProperty(currentItem)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        Cargar en Predictor
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
