# Fornax (MiniCRM IA)

## 📖 Descripción
Fornax es un potente CRM industrial local con capacidades de Inteligencia Artificial integradas. Diseñado para optimizar el flujo de trabajo en ventas, gestiona cotizaciones, clientes, proveedores y un catálogo de productos inteligente. Utiliza tecnologías avanzadas como **LanceDB** para búsquedas vectoriales, **DuckDB** para analítica rápida y **Ollama** para asistencia inteligente.

## 📑 Tabla de Contenidos
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Guía de Uso](#-guía-de-uso)
- [Demostración](#-demostración)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🛠️ Tecnologías Utilizadas

**Frontend:**
- React 19 + Vite
- TailwindCSS v4
- jsPDF & html2canvas (para generación de documentos)
- Lucide React (Iconos)

**Backend:**
- Python 3 & FastAPI
- Uvicorn (Servidor ASGI)
- LanceDB (Base de datos vectorial) & DuckDB (Analítica)
- Sentence Transformers & Pandas

## 📋 Requisitos Previos
Asegúrate de contar con lo siguiente antes de empezar:
- **Node.js** (v18+) y npm.
- **Python** (v3.9 a v3.11 recomendado).
- **Ollama** (si deseas ejecutar modelos de IA locales).
- **Git**

## 🚀 Instalación

Sigue estos pasos para configurar tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Fornax
   ```

2. **Configuración del Frontend:**
   ```bash
   # Instalar las dependencias de Node
   npm install
   ```

3. **Configuración del Backend:**
   ```bash
   cd backend
   
   # Crear un entorno virtual de Python
   python -m venv venv
   
   # Activar el entorno virtual
   # En Windows: venv\Scripts\activate
   # En Linux/Mac: source venv/bin/activate
   
   # Instalar los requerimientos
   pip install -r requirements.txt
   ```

## 💻 Guía de Uso

Para probar la aplicación en tu entorno de desarrollo, debes correr los servicios de backend y frontend simultáneamente.

**1. Iniciar la API Backend:**
```bash
cd backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
La documentación interactiva (Swagger UI) estará en: `http://localhost:8000/docs`.

**2. Iniciar el servidor Frontend:**
En otra ventana de terminal, en la raíz del proyecto:
```bash
npm run dev
```
La interfaz de usuario estará disponible en `http://localhost:5173`.

## 📸 Demostración
![Logo Fornax](./logo_fornax.png)

*(Si tienes capturas de pantalla de los módulos de cotización, analíticas o catálogo, colócalas en este espacio).*

## 🤝 Contribución
¡Toda ayuda es bienvenida para mejorar Fornax! Para contribuir:
1. Haz un *Fork* del proyecto.
2. Crea tu rama de características (`git checkout -b feature/CaracteristicaIncreible`).
3. Confirma tus cambios (`git commit -m 'Agrega una característica increíble'`).
4. Haz push a la rama (`git push origin feature/CaracteristicaIncreible`).
5. Abre un **Pull Request**.

## 📄 Licencia
Este proyecto es privado/interno. (Modificar según aplique o agregar un archivo de licencia como MIT si se planea hacer de código abierto).
