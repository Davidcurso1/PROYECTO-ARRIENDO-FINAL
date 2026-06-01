import React, { useState, useEffect } from "react";
import { Property, InterestPlace, ModelVersion } from "./types";
import { 
  Building2, 
  LayoutDashboard, 
  Calculator, 
  Map, 
  ShieldAlert, 
  BrainCircuit, 
  User, 
  Compass, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Mail,
  Shield,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DashboardTab from "./components/DashboardTab";
import PredictionTab from "./components/PredictionTab";
import MapComponent from "./components/MapComponent";
import AdministrativeTab from "./components/AdministrativeTab";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "prediccion" | "mapas" | "admin">("prediccion");
  
  // Dark mode / light mode state
  const [theme, setTheme] = useState<"light" | "dark" >(() => {
    return (localStorage.getItem("rentia-theme") as "light" | "dark") || "light";
  });

  // Administrative login unlock state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("rentia-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === "Admin" && adminPassword === "Medellin123") {
      setIsAdminUnlocked(true);
      setLoginError("");
    } else {
      setLoginError("Usuario o contraseña incorrectos");
    }
  };

  // Shared database resource states
  const [properties, setProperties] = useState<Property[]>([]);
  const [places, setPlaces] = useState<InterestPlace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>("");

  // Simulated active user configurations (SaaS context toggle)
  const [activeRole, setActiveRole] = useState<"Administrador" | "Analista">("Administrador");
  const [userEmail, setUserEmail] = useState<string>("talentoiacurso@gmail.com");

  // Interlinkages state: Property loaded from Map/Dashboard into Prediction Form
  const [interloadedProperty, setInterloadedProperty] = useState<Property | null>(null);

  // City synchronisation state across tabs
  const [selectedCity, setSelectedCity] = useState<string>("Bogotá");

  // Keep selectedCity synced when a property is loaded / selected from another tab
  useEffect(() => {
    if (interloadedProperty && interloadedProperty.municipality) {
      setSelectedCity(interloadedProperty.municipality);
    }
  }, [interloadedProperty]);

  // Load properties and landmarks coordinates from server
  const fetchLocalAssets = async () => {
    setIsLoading(true);
    setErrorText("");
    try {
      const propertiesRes = await fetch("/api/properties");
      if (!propertiesRes.ok) throw new Error("No se pudo iniciar contacto con la base de datos local.");
      const props = await propertiesRes.json();
      setProperties(props);

      const placesRes = await fetch("/api/places");
      if (placesRes.ok) {
        const plc = await placesRes.json();
        setPlaces(plc);
      }
    } catch (err: any) {
      setErrorText(err.message || "Fallo en la comunicación full-stack.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalAssets();
  }, []);

  // Handler to link Property selecting in Dash/Map to Predict Tab
  const handleSelectPropertyToPredict = (prop: Property) => {
    setInterloadedProperty(prop);
    setActiveTab("prediccion");
  };

  const handleClearInterloadedProperty = () => {
    setInterloadedProperty(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex flex-col selection:bg-blue-500/20 selection:text-blue-800" id="rentia-saas-root">
      
      {/* SaaS Global Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-850 tracking-tight">RentIA</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-1.5 py-0.5 rounded-md">COLOMBIA</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">SaaS Predictivo e Inmobiliario ML</p>
            </div>
          </div>          {/* Interactive Navigation tab items */}
          <nav className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-290/20">
            <button
              onClick={() => setActiveTab("prediccion")}
              id="menu-tab-prediccion"
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "prediccion" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-blue-500" />
              Predicción de Arriendo
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              id="menu-tab-dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "dashboard" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Vista Analítica
            </button>
            <button
              onClick={() => setActiveTab("mapas")}
              id="menu-tab-mapas"
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "mapas" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Map className="w-3.5 h-3.5 text-emerald-500" />
              Mapa
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              id="menu-tab-admin"
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "admin" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-505 hover:text-slate-800"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Panel Administrativo
            </button>
          </nav>

          {/* Simulated SaaS User credentials switch parameters */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl px-3 py-1.5 text-right hidden sm:flex items-center gap-2.5">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <User className="w-2.5 h-2.5" /> Evaluador SaaS
                </span>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as any)}
                  id="select-user-role-simulator"
                  className="bg-transparent border-none text-slate-700 font-bold text-xs p-0 m-0 focus:outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="Administrador">Rol: Administrador</option>
                  <option value="Analista">Rol: Analista</option>
                </select>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <button
              onClick={toggleTheme}
              id="btn-toggle-theme"
              title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition border border-slate-100 flex items-center justify-center cursor-pointer"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            <button
              onClick={fetchLocalAssets}
              id="btn-manual-sync-db"
              title="Sincronizar base de datos"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition border border-slate-100"
            >
              <RefreshCw className="w-4 h-4 animate-spin hover:animate-none" style={{ animationDuration: "10s" }} />
            </button>
          </div>

        </div>
      </header>

      {/* Main SaaS Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8" id="saas-workspace-container">
        
        {/* Loading overlay */}
        {isLoading && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Sincronizando con base de datos RentIA...</p>
          </div>
        )}

        {/* Error Notification Alert */}
        {errorText && (
          <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-xs font-bold text-rose-800">Fallo de Comunicación Base de Datos</span>
                <p className="text-[11px] text-rose-600 mt-1">{errorText}</p>
              </div>
            </div>
            <button
              onClick={fetchLocalAssets}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-all shadow-xs shrink-0 self-start sm:self-center cursor-pointer"
            >
              Reintentar Conexión
            </button>
          </div>
        )}

        {/* Dynamic Display of active workspace Tabs */}
        {!isLoading && properties.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "dashboard" && (
                <DashboardTab 
                  properties={properties} 
                  onSelectProperty={handleSelectPropertyToPredict}
                />
              )}

              {activeTab === "prediccion" && (
                <PredictionTab 
                  initialPropertyToLoad={interloadedProperty}
                  onClearLoadedProperty={handleClearInterloadedProperty}
                  selectedCity={selectedCity}
                  onSelectCity={setSelectedCity}
                />
              )}

              {activeTab === "mapas" && (
                <MapComponent 
                  properties={properties} 
                  places={places}
                  selectedProperty={interloadedProperty}
                  onSelectProperty={handleSelectPropertyToPredict}
                  selectedCity={selectedCity}
                  onSelectCity={setSelectedCity}
                />
              )}

              {activeTab === "admin" && (
                isAdminUnlocked ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50/50 border border-blue-100 p-4 rounded-2xl gap-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-900 font-bold">Sesión autorizada como Administrador</p>
                          <p className="text-[10px] text-blue-400">Tienes acceso de lectura y escritura para reentrenar modelos y de base de datos.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsAdminUnlocked(false);
                          setAdminPassword("");
                          setAdminUsername("");
                        }}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-slate-200 text-[11px] font-bold rounded-xl transition cursor-pointer"
                      >
                        Cerrar Sesión Admin
                      </button>
                    </div>
                    <AdministrativeTab 
                      properties={properties}
                      onRefreshProperties={fetchLocalAssets}
                      activeRole={activeRole}
                      userEmail={userEmail}
                    />
                  </div>
                ) : (
                  <div className="max-w-md mx-auto my-12 bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
                      <ShieldAlert className="w-7 h-7 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Portal Administrativo Protegido</h2>
                    <p className="text-xs text-slate-500 mt-2 mb-6 font-medium leading-relaxed">
                      El acceso a esta suite está restringido a administradores autorizados. Por favor, introduzca las credenciales de seguridad.
                    </p>
                    
                    <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Usuario de Acceso</label>
                        <input
                          type="text"
                          required
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="Admin"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Contraseña de Seguridad</label>
                        <input
                          type="password"
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {loginError && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-semibold border border-rose-100">
                          {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Shield className="w-4 h-4" />
                        Desbloquear Funciones
                      </button>
                    </form>
                    
                    <div className="mt-6 pt-5 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      RentIA v1.4.2 Secure Layer • Medellin Cluster
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </main>

      {/* SaaS Modern humble footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-300" />
            <span>© 2026 RentIA Colombia SaaS. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              Rol Activo: <strong className="text-slate-650">{activeRole}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-350" />
              Licencia: <strong className="text-slate-650">Corporativa Premium</strong>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
