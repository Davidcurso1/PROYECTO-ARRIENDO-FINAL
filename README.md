# RentIA Colombia 🇨🇴 — SaaS Predictivo Inmobiliario

RentIA Colombia es una plataforma SaaS de alto rendimiento diseñada para el análisis comparativo, geolocalización y pronóstico automatizado de precios de arrendamiento en las principales ciudades de Colombia. La solución incorpora un pipeline ETL simulado, un resolvedor de Machine Learning multivariable, herramientas de administración de datos, e interactividades de mapas geolocalizados.

---

## 🚀 Características Clave

### 1. Motor Predictivo (Machine Learning)
Implementa un modelo de regresión multivariable entrenado mediante Batch Gradient Descent en TypeScript sobre un catálogo inicial de 50 propiedades en Colombia (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cartagena). 
- Calibra coeficientes optimizados para **Estrato (1 a 6)**, **Área construida**, **Número de habitaciones / baños / parqueaderos** y **Ajustes de localización municipal**.
- Evalúa y reporta dinámicamente métricas científicas: Error Absoluto Medio (**MAE**), Error Cuadrático Medio de la Raíz (**RMSE**), y Coeficiente de Determinación (**R²**).

### 2. Pipeline de Datos Inmobiliarios (ETL)
- Robots automáticos de scraping que extraen y depuran listados de portales inmobiliarios tradicionales (Finca Raíz, Metrocuadrado, Ciencuadras, Properati).
- Flujo integrado de **Control de Calidad**:
  - *De-duplicación*: rechazo de propiedades con direcciones o geolocalizaciones idénticas.
  - *Filtrado de Outliers*: exclusión automática de registros con inconsistencias catastrales.
  - *Imputación de Vacíos*: completitud mediante algoritmos basados en estrato.

### 3. Sistemas de Mapas (GIS de Arriendo)
- Mapa dinámico basado en capas vectoriales con heatmaps para rastrear la plusvalía por barrios consolidando puntos de cercanía.
- Algoritmo de distancia basado en la **Fórmula del Haversine**, arrojando el cálculo exacto de distancias en metros y tiempos de caminata de los predios a estaciones de transporte, universidades, clínicas, parques y centros comerciales locales.

### 4. Dashboard de Negocios
- Visualizaciones interactivas de series temporales, diagramas de barras de promedios de arriendo por estrato, distribuciones de oferta de mercado por ciudad, y métricas KPI integradas (Canon promedio, Valor m² rentable) en tiempo real mediante `recharts`.

---

## 🛠️ Estructura del Proyecto

```
├── .env.example              # Declaración de variables de base de datos y llaves de IA
├── prisma/
│   └── schema.prisma         # Esquema Prisma relacional listo para PostgreSQL Supabase/Neon
├── data/                     # Base de datos local JSON (Properties, Places, Models, Audits)
├── server.ts                 # Servidor backend de Express con APIs REST e integración de Vite
├── src/
│   ├── types.ts              # Declaración general de tipos y esquemas de interfaces
│   ├── db.ts                 # Motor de base de datos, Haversine y optimizador de ML
│   ├── main.tsx              # Inicializador React 19
│   ├── App.tsx               # Orquestador del front-end, panel de navegación y simulador de roles
│   └── components/
│       ├── DashboardTab.tsx  # KPI y métricas gráficas interactivas
│       ├── PredictionTab.tsx # Formulario catastral cascading e integración con Gemini AI
│       ├── MapComponent.tsx  # GIS de mapas regionales, calor y georeferencias de interés
│       ├── AdministrativeTab.tsx # CRUD propiedades, ETL control panel, Retrainer IA de pesaje
│       └── MetricCard.tsx    # Tarjeta de KPI reutilizable
└── package.json              # Configuración Node y dependencias de compilación
```

---

## 📁 Modelo de Base de Datos (Prisma Relacional)

El esquema `/prisma/schema.prisma` incluye los siguientes modelos listos para migrarse en PostgreSQL comercial:
- `User`: Roles de Administrador y Analista.
- `Property`: Registros catastrales catastrados con sus respectivos precios, áreas, y coordenadas.
- `Neighborhood`: Barrios agrupados con métricas de plusvalía anual (`growthRate`).
- `Prediction`: Historial de consultas predictivas.
- `ModelVersion`: Historial de coeficientes y métricas RMSE/R² de cada reentrenamiento.
- `InterestPlace`: Localizaciones de referencia urbana.
- `AuditLog`: Registro para garantizar la trazabilidad corporativa en base de datos.

---

## 🔌 API REST Completa (Endpoints)

El servidor Express expone las siguientes rutas:

- **Predicción Catastral**  
  `POST /api/predict`  
  *Cuerpo:* `{ department, municipality, neighborhood, estrato, area, bedrooms, bathrooms, parking }`  
  *Respuesta:* Retorna valor estimado, rango de confianza, listado de comparables, factores de contribución monetaria y un listado de los 5 puntos de interés urbanos más cercanos con m² y caminatas calculadas.

- **Catastro (CRUD)**  
  `GET /api/properties` - Listar todas las propiedades.  
  `POST /api/properties` - Registrar una nueva propiedad.  
  `PUT /api/properties/:id` - Actualizar una propiedad existente.  
  `DELETE /api/properties/:id` - Eliminar un registro catastral.

- **Pipeline Automatizado ETL**  
  `POST /api/crawl`  
  *Cuerpo:* `{ portal: "Finca Raíz" }`  
  *Respuesta:* Ejecuta scraping simulado de 3 propiedades, realiza limpia de anomalías por duplicado y las incorpora a la base de datos indexada.

- **Modelos IA**  
  `POST /api/model/retrain` - Reruta un entrenamiento de regresión de gradiente sobre los datos actuales.  
  `GET /api/model/metrics` - Listar versiones de coeficientes.  
  `GET /api/model/download` - Descarga el archivo de coeficientes JSON optimizados del modelo activo.

- **Gemini Insights**  
  `POST /api/gemini/insights`  
  Envía el contexto físico del inmueble al consultor virtual soportado por `gemini-3.5-flash` para devolver un reporte ejecutivo de valorización y canon de arrendamiento en idioma español.

---

## 🏃 Lanzamiento Local en Entorno de Desarrollo

1. Instalar dependencias del proyecto:
   ```bash
   npm install
   ```

2. Configurar variables de entorno copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```

3. Correr en el entorno integrado (Express + Vite cargado de forma simultánea en puerto 3000):
   ```bash
   npm run dev
   ```

4. Compilar para producción (esbuild + Vite build):
   ```bash
   npm run build
   ```

5. Iniciar servidor compilado:
   ```bash
   npm start
   ```
