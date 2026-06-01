export interface Property {
  id: string;
  department: string;
  municipality: string;
  neighborhood: string;
  address: string;
  estrato: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parserData?: string;
  parking: number;
  administration: number;
  propertyType: "Apartamento" | "Casa" | "Apartaestudio" | "Oficina";
  price: number;
  latitude: number;
  longitude: number;
  publishDate: string;
  agency: string;
  ageYears: number;
}

export interface NeighborhoodStats {
  neighborhood: string;
  avgPrice: number;
  avgPricePerM2: number;
  propertyCount: number;
  growthRate: number;
}

export interface InterestPlace {
  id: string;
  name: string;
  category: "Universidad" | "Colegio" | "Centro Comercial" | "Hospital" | "Clinica" | "Transporte" | "Supermercado" | "Parque" | "Restaurante";
  latitude: number;
  longitude: number;
}

export interface PredictionResult {
  estimatedValue: number;
  confidenceLower: number;
  confidenceUpper: number;
  neighborhoodAvg: number;
  comparables: Property[];
  factors: {
    basePrice: number;
    areaEffect: number;
    estratoEffect: number;
    roomsEffect: number;
    bathsEffect: number;
    parkingEffect: number;
    locationEffect: number;
  };
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  trainedAt: string;
  trainedOnCount: number;
}

export interface ModelVersion {
  version: string;
  isActive: boolean;
  metrics: ModelMetrics;
  coefficients: {
    intercept: number;
    areaCoef: number;
    estratoCoef: number;
    bedroomsCoef: number;
    bathroomsCoef: number;
    parkingCoef: number;
    locationOffsets: Record<string, number>;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: "Administrador" | "Analista";
  action: string;
  details: string;
}

export interface ETLFeed {
  portal: string;
  url: string;
  status: "active" | "inactive";
  lastRun: string;
  extractedCount: number;
}
