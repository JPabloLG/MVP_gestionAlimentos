# 🥑 GESTIONALO
 
> Sabe qué tienes, cuándo vence y qué cocinar con ello.
 
**GESTIONALO** es una aplicación web que ayuda a las personas a controlar los alimentos que tienen en casa, saber cuáles están próximos a vencer y recibir recetas para aprovecharlos antes de que se desperdicien.
 
Es el Producto Mínimo Viable (MVP) del proyecto final de **Formulación de Proyectos** de la Universidad del Quindío (2026-2).
 
---
 
## 🎯 ¿Qué problema resuelve?
 
En Colombia se pierden y desperdician cerca de 9,76 millones de toneladas de alimentos al año, y una parte importante ocurre en los hogares. Muchas veces la comida se daña simplemente porque no sabemos qué tenemos, se nos olvida la fecha de vencimiento o no se nos ocurre qué cocinar con lo que sobra.
 
GESTIONALO ataca ese punto: **la cocina del hogar**, con una herramienta simple, visual y de uso diario.
 
## 👥 ¿Para quién es?
 
- Personas que viven solas, jóvenes profesionales y estudiantes.
- Parejas y familias pequeñas (hasta cuatro integrantes) que hacen compras semanales o quincenales.
---
 
## ✨ ¿Qué hace la aplicación?
 
### 1. Registra tus alimentos
Agrega cada producto con su **nombre, cantidad, unidad, categoría y fecha de vencimiento** (o fecha estimada de deterioro). Puedes editarlo o eliminarlo cuando quieras, y marcarlo como **consumido** o **desechado**.
 
### 2. Te avisa con un semáforo
Cada alimento se clasifica automáticamente según los días que le quedan:
 
| Estado | Días restantes | Significado |
|---|---|---|
| 🟢 Fresco | más de 5 | Sin afán |
| 🟡 Pronto | 3 a 5 | Planea usarlo |
| 🟠 Úsalo ya | 0 a 2 | Prioridad máxima |
| 🔴 Vencido | ya pasó la fecha | Revísalo antes de consumirlo |
 
Los alimentos siempre se muestran ordenados del más urgente al menos urgente.
 
### 3. Te recomienda recetas
Con base en lo que tienes registrado, la app sugiere recetas que **usan primero los alimentos más próximos a vencer**. Cada receta muestra qué ingredientes ya tienes, cuáles te faltan, el tiempo de preparación, las porciones y los pasos para cocinarla.
 
- **Para rescatar hoy:** recetas que aprovechan alimentos urgentes.
- **Con lo que tienes:** recetas que puedes preparar con la mayoría de tus ingredientes.
### 4. Te motiva a volver cada día
- Saludo según la hora del día.
- Tarjeta **"Hoy cocina con…"** con la mejor receta del momento.
- Contador de **alimentos rescatados**.
- Un consejo diario para reducir el desperdicio.
---
 
## 🧭 Pantallas principales
 
| Ruta | Qué encuentras |
|---|---|
| `/` | Página de presentación de la app |
| `/registro` y `/login` | Crear cuenta e iniciar sesión |
| `/dashboard` | Resumen, alimentos prioritarios, receta del día y recetas sugeridas |
| `/inventario` | Lista completa con búsqueda, filtros y ordenamiento |
| `/recetas` | Todas las recomendaciones |
| `/recetas/[id]` | Detalle de una receta: ingredientes y pasos |
| `/terminos` | Términos y condiciones |
| 404 | Página de error personalizada |
 
La aplicación es **responsive**: en celular usa una barra de navegación inferior y en computador una barra superior.
 
---
 
## 🛠️ Tecnologías
 
- [Next.js](https://nextjs.org/) (App Router) y [React](https://react.dev/)
- TypeScript
- Tailwind CSS
- Framer Motion (animaciones)
- React Hook Form + Zod (formularios y validación)
- date-fns, lucide-react
- Vitest (pruebas de la lógica de negocio)
---
 
## 🚀 Cómo ejecutarla
 
Necesitas tener instalado [Node.js](https://nodejs.org/) (versión LTS).
 
```bash
# 1. Instalar dependencias
npm install
 
# 2. Iniciar en modo desarrollo
npm run dev
```
 
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
 
Otros comandos:
 
```bash
npm run build   # Compilar para producción
npm run start   # Servir la versión compilada
npm run lint    # Revisar el código
npm run test    # Ejecutar las pruebas
```
 
> 💡 **Para probarla rápido:** crea una cuenta y usa el botón **"Cargar alimentos de ejemplo"** en el inventario. Verás el semáforo y las recetas funcionando de inmediato.
 
---
 
## 📁 Estructura del proyecto
 
```
src/
├── app/          # Páginas y rutas (cada página solo ensambla secciones)
├── components/   # Componentes organizados por sección (ui, layout, dashboard, inventory, recipes…)
├── context/      # Estado global: sesión, alimentos, notificaciones
├── hooks/        # Hooks reutilizables
├── lib/          # Lógica de negocio: vencimientos, recomendación de recetas, estadísticas
├── data/         # Recetas, consejos y categorías
├── types/        # Tipos de TypeScript
└── config/       # Nombre y textos de la app (site.ts)
```
 
> 🏷️ **Cambiar el nombre de la app:** el nombre y el eslogan viven en `src/config/site.ts`.
 
---
 
## ⚠️ Limitaciones de esta versión (MVP)
 
- **La sesión es simulada y los datos se guardan en el navegador** (`localStorage`), no en un servidor. Esto permite probar toda la experiencia sin configurar nada, pero no es seguro para producción y los datos no se comparten entre dispositivos.
- Cada usuario ve solo sus propios alimentos, incluso si varios usan el mismo navegador.
- Las recetas son un catálogo local, no provienen de un servicio externo.
- Las fechas de vencimiento las ingresa el usuario: **la app no garantiza la inocuidad de los alimentos**. Siempre verifica el estado real antes de consumirlos.
## 🔮 Posibles mejoras futuras
 
- Backend real con base de datos y autenticación segura.
- Notificaciones cuando un alimento esté por vencer.
- Escaneo de códigos de barras o cámara para registrar productos.
- Recomendaciones con inteligencia artificial.
- Lista de compras inteligente.
- Integración con supermercados.
- Modo oscuro.
---
 
## 🎓 Contexto académico
 
Proyecto final de **Formulación de Proyectos**
Ingeniería de Sistemas y Computación · Facultad de Ingeniería · Universidad del Quindío · 2026-2
 
**Profesor:** Alejandro Urrea Ospina
 
**Equipo:**
- Helen Xiomara Giraldo Libreros
- Laura Valentina Gómez Alzate
- Juan Esteban Maya Sanchez
- Juan Pablo López Gómez
---
 
<sub>Hecho con 💚 para que ningún alimento se pierda.</sub>
