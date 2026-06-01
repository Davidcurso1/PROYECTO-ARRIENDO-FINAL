import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

import { 
  readProperties, 
  writeProperties, 
  readPlaces, 
  readModels, 
  readAuditLogs, 
  addAuditLog, 
  estimateRentalPrice, 
  trainModelOnProperties,
  calculateDistance
} from "./src/db.js";
import { Property, InterestPlace } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize AI Client with Telemetry User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// REST APIs (SaaS Backends)
// ----------------------------------------------------

// Prediccción API Endpoint
app.post("/api/predict", (req, res) => {
  try {
    const { department, municipality, neighborhood, estrato, area, bedrooms, bathrooms, parking } = req.body;
    
    if (!department || !municipality || !neighborhood || !estrato || !area) {
      return res.status(400).json({ error: "Faltan parámetros obligatorios para realizar el pronóstico." });
    }

    const prediction = estimateRentalPrice(
      department,
      municipality,
      neighborhood,
      Number(estrato),
      Number(area),
      Number(bedrooms || 1),
      Number(bathrooms || 1),
      Number(parking || 0)
    );

    // Calculate nearest interest places
    const places = readPlaces();
    const targetLat = prediction.comparables[0]?.latitude || 4.60971;
    const targetLon = prediction.comparables[0]?.longitude || -74.08175;

    const placesWithDistance = places.map(p => {
      const distanceMeters = calculateDistance(targetLat, targetLon, p.latitude, p.longitude);
      const walkingTimeMinutes = Math.round(distanceMeters / 80); // ~80m per minute walk speed
      return {
        ...p,
        distanceMeters,
        walkingTimeMinutes
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 5); // Return top 5 nearby locations

    res.json({
      valor_estimado: prediction.estimatedValue,
      intervalo_confianza: `$${prediction.confidenceLower.toLocaleString()} - $${prediction.confidenceUpper.toLocaleString()}`,
      neighborhoodAvg: prediction.neighborhoodAvg,
      comparables: prediction.comparables,
      factors: prediction.factors,
      nearbyPlaces: placesWithDistance
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Property CRUD API
app.get("/api/properties", (req, res) => {
  try {
    res.json(readProperties());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/properties", (req, res) => {
  try {
    const properties = readProperties();
    const newPropObj: Property = {
      ...req.body,
      id: `prop_${Date.now()}`,
      publishDate: new Date().toISOString()
    };

    properties.unshift(newPropObj);
    writeProperties(properties);

    addAuditLog(
      req.get("x-user-email") || "admin@rentia.co",
      (req.get("x-user-role") as any) || "Administrador",
      "Creado inmueble de arriendo",
      `Agregada propiedad Tipo ${newPropObj.propertyType} en ${newPropObj.neighborhood}, ${newPropObj.municipality} por $${newPropObj.price.toLocaleString()} COP.`
    );

    res.json(newPropObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/properties/:id", (req, res) => {
  try {
    const { id } = req.params;
    const properties = readProperties();
    const index = properties.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Propiedad no encontrada." });
    }

    properties[index] = {
      ...properties[index],
      ...req.body
    };

    writeProperties(properties);

    addAuditLog(
      req.get("x-user-email") || "admin@rentia.co",
      (req.get("x-user-role") as any) || "Administrador",
      "Editado inmueble de arriendo",
      `Actualizada propiedad con ID: ${id} en ${properties[index].neighborhood} por valor de $${properties[index].price.toLocaleString()} COP.`
    );

    res.json(properties[index]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/properties/:id", (req, res) => {
  try {
    const { id } = req.params;
    let properties = readProperties();
    const propToDelete = properties.find(p => p.id === id);

    if (!propToDelete) {
      return res.status(404).json({ error: "Propiedad no encontrada." });
    }

    properties = properties.filter(p => p.id !== id);
    writeProperties(properties);

    addAuditLog(
      req.get("x-user-email") || "admin@rentia.co",
      (req.get("x-user-role") as any) || "Administrador",
      "Eliminado inmueble de arriendo",
      `Removida propiedad en ${propToDelete.neighborhood}, ${propToDelete.municipality} ($${propToDelete.price.toLocaleString()} COP).`
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Automated ETL Scraper Pipeline Stimulation
app.post("/api/crawl", (req, res) => {
  try {
    const { portal } = req.body;
    if (!portal) {
      return res.status(400).json({ error: "No se especificó portal para realizar el scraping." });
    }

    const properties = readProperties();
    const seedBarrios = [
      { neighborhood: "Chapinero Alto", lat: 4.6465, lon: -74.0585, city: "Bogotá", dept: "Bogotá D.C." },
      { neighborhood: "Cedritos", lat: 4.7218, lon: -74.0431, city: "Bogotá", dept: "Bogotá D.C." },
      { neighborhood: "El Poblado", lat: 6.2081, lon: -75.5683, city: "Medellín", dept: "Antioquia" },
      { neighborhood: "Laureles", lat: 6.2443, lon: -75.5891, city: "Medellín", dept: "Antioquia" },
      { neighborhood: "Ciudad Jardín", lat: 3.3644, lon: -76.5332, city: "Cali", dept: "Valle del Cauca" },
      { neighborhood: "Bocagrande", lat: 10.3995, lon: -75.5562, city: "Cartagena", dept: "Bolívar" }
    ];

    // Simulate scraping 3 properties
    const scrapedList: Property[] = [];
    const beforeCount = properties.length;
    let duplicatesRemoved = 0;
    
    for (let k = 0; k < 3; k++) {
      const selectedSeed = seedBarrios[Math.floor(Math.random() * seedBarrios.length)];
      
      // Random variance variables
      const estrato = Math.floor(Math.random() * 3) + 4; // 4, 5, 6
      const area = Math.floor(Math.random() * 80) + 45; // 45 - 125 m2
      const bedrooms = Math.floor(Math.random() * 3) + 1; // 1 - 3
      const bathrooms = Math.max(1, bedrooms - (Math.random() > 0.5 ? 1 : 0));
      const parking = Math.random() > 0.4 ? 1 : 0;
      
      // Check for outlier duplicates using street address (simulated with randomized string but overlapping check)
      const streetNum = Math.floor(Math.random() * 150) + 1;
      const streetCol = Math.floor(Math.random() * 80) + 1;
      const addressStr = `Calle ${streetCol} # ${streetNum}-${Math.floor(Math.random() * 90) + 1}`;
      
      const duplicate = properties.some(p => p.address === addressStr && p.neighborhood === selectedSeed.neighborhood);
      if (duplicate) {
        duplicatesRemoved++;
        continue;
      }

      // Base pricing calculations
      const baseRentPrice = (area * 26000) + (estrato * 180000) + (bedrooms * 50000) + (bathrooms * 80000);
      const randomizedPrice = Math.round((baseRentPrice * (0.85 + Math.random() * 0.3)) / 50000) * 50000;

      const newListing: Property = {
        id: `prop_etl_${Date.now()}_${k}`,
        department: selectedSeed.dept,
        municipality: selectedSeed.city,
        neighborhood: selectedSeed.neighborhood,
        address: addressStr,
        estrato,
        area,
        bedrooms,
        bathrooms,
        parking,
        administration: Math.round((area * 3200) / 10000) * 10000,
        propertyType: "Apartamento",
        price: Math.max(1200000, randomizedPrice),
        latitude: selectedSeed.lat + (Math.random() - 0.5) * 0.005,
        longitude: selectedSeed.lon + (Math.random() - 0.5) * 0.005,
        publishDate: new Date().toISOString(),
        agency: `Agencia ${portal}`,
        ageYears: Math.floor(Math.random() * 15)
      };

      scrapedList.push(newListing);
      properties.unshift(newListing);
    }

    writeProperties(properties);
    addAuditLog(
      req.get("x-user-email") || "admin@rentia.co",
      (req.get("x-user-role") as any) || "Administrador",
      "Ejecución de ETL Inmobiliario",
      `Scraping finalizado en portal ${portal}. Extraídas ${scrapedList.length + duplicatesRemoved} fuentes, agregados ${scrapedList.length} registros válidos, filtrados ${duplicatesRemoved} duplicados por calidad.`
    );

    res.json({
      success: true,
      scrapedCount: scrapedList.length,
      duplicatesRemoved,
      addedItems: scrapedList
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Retrain Machine Learning Model
app.post("/api/model/retrain", (req, res) => {
  try {
    const userEmail = req.get("x-user-email") || "admin@rentia.co";
    const userRole = (req.get("x-user-role") as any) || "Administrador";

    const trainedModel = trainModelOnProperties(userEmail, userRole);
    res.json(trainedModel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download Machine Learning model coefficients
app.get("/api/model/download", (req, res) => {
  try {
    const models = readModels();
    const activeModel = models.find(m => m.isActive) || models[0];
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=rentia_model_coefficients.json");
    res.send(JSON.stringify(activeModel, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/model/metrics", (req, res) => {
  try {
    const models = readModels();
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit log list
app.get("/api/audit-logs", (req, res) => {
  try {
    res.json(readAuditLogs());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Places of interest in Colombia
app.get("/api/places", (req, res) => {
  try {
    res.json(readPlaces());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Server-side Gemini AI Integration (Executive Analysis)
app.post("/api/gemini/insights", async (req, res) => {
  try {
    const aiClient = getGeminiClient();
    if (!aiClient) {
      return res.json({
        insights: `**[Aviso: Gemini API no configurada]** Para ver análisis en tiempo real dinámicos y completos de la inteligencia artificial, por favor ingresa tu API Key en la barra lateral superior de **Ajustes > Secretos** de AI Studio.\n\n### Análisis de Tendencia General (SaaS Manual)\nEl mercado de arriendos en Bogotá y Medellín reporta un incremento promedio anual de un **12.4%** debido a la inflación de propiedades multifamiliares y el crecimiento de arriendos de corta estadía. El **Estrato 5** sigue reportando la mejor relación de velocidad de arriendo en barrios consolidados.`
      });
    }

    const { promptContext } = req.body;
    
    const contentsPrompt = `Actúa como un Economista Senior y Consultor Inmobiliario de RentIA Colombia. Analiza estas condiciones inmobiliarias colombianas y proporciona un reporte ejecutivo perspicaz en español estructurado elegantemente que incluya:
- Un diagnóstico corto del mercado.
- Explicación de por qué el estrato y el área tienen tal peso en esta combinación de parámetros.
- Recomendación crítica para el precio sugerido de arriendo (estabilización vs rentabilidad).
- Recomendación de zonas de valorización colombiana en alza.

Datos de la consulta:
${JSON.stringify(promptContext, null, 2)}
`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPrompt
    });

    res.json({
      insights: response.text || "No se ha podido procesar el reporte en este momento."
    });

  } catch (error: any) {
    res.json({
      insights: `**[Error al contactar con la IA]** ${error.message}. Mostrando análisis de contingencia estructurada: El arriendo en Colombia se rige por la Ley 820 de 2003, la cual establece un límite máximo para el canon de arrendamiento mensual equivalente a un **1%** del valor comercial del inmueble.`
    });
  }
});

// ----------------------------------------------------
// Mounting Vite Middleware & Static Serves
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RentIA Colombia backend running on port ${PORT}`);
  });
}

startServer();
