# Auditoría del PMV GESTIONALO

Fecha: 2026-11-13 · Fases 0 y 1 (solo lectura; no se modificó código de la aplicación).
Base auditada: `main` en `5894e8d` + `README.md` con cambios sin confirmar (ver D1).

Método: lectura completa de `src/` (73 archivos, ~4.150 líneas), ejecución de tipos / lint / pruebas / build,
y pruebas desechables de Vitest (creadas y borradas en la misma ejecución) para confirmar con datos los
hallazgos de recetas, validación y formulario. **No se abrió un navegador**: lo que depende de render real
está marcado como "No verificable".

---

## 1. Línea base

Gestor: **npm** (`package-lock.json`). Next 16.4.3 (Turbopack), React 19.3.0, TypeScript 5 (`strict`),
Tailwind 4, Zod 3, Vitest 2.1.9 (jsdom), ESLint 9 con `eslint-config-next`.

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errores |
| `npm run lint` | ❌ **9 errores, 10 advertencias** (previos a cualquier cambio) |
| `npm test` | ✅ 2 archivos, 7 pruebas (5 de `expiry`, 2 de `recipes`) |
| `npm run build` | ✅ compila; 9 rutas (8 estáticas, `/recetas/[id]` dinámica) |

Errores de lint previos:

| Archivo:línea | Regla |
|---|---|
| `components/auth/LoginForm.tsx:30`, `RegisterForm.tsx:31`, `inventory/FoodFormModal.tsx:115`, `ui/Button.tsx:36`, `ui/Card.tsx:21` | `no-explicit-any` (5) |
| `app/terminos/page.tsx:37` | `react/no-unescaped-entities` (2) |
| `components/ui/AnimatedNumber.tsx:12` | `react-hooks/set-state-in-effect` |
| `components/ui/AnimatedNumber.tsx:15` | `prefer-const` |

Advertencias: variables e imports sin usar en `error.tsx:7`, `PriorityList.tsx:8`, `AnimatedNumber.tsx:15`,
`AuthProvider.tsx:32`, `FoodsProvider.tsx:27`, `lib/stats.ts:1`, `localAuthRepository.ts:94,131`.

Tamaño: `.next/static` = 1,2 MB sin comprimir; chunk mayor 230 KB. Next 16 ya no imprime el tamaño por ruta.
Sin señales de problema para un PMV.

---

## 2. Matriz de trazabilidad

Rutas relativas a `src/`. Estado: C = Cumple, P = Parcial, N = No cumple, NV = No verificable sin navegador.

| ID | Estado | Evidencia | Prueba que lo cubre | Hallazgo | Acción propuesta | Prio |
|---|---|---|---|---|---|---|
| RF-01 Registrar usuario | C | `lib/validation/auth.ts:8-21`, `lib/storage/localAuthRepository.ts:70-96` | Ninguna | Nombre de solo espacios pasa (H6). Correo con espacios se rechaza como "inválido" en vez de recortarse | `.trim()` en el esquema; prueba del repositorio | P1 |
| RF-02 Iniciar sesión | C | `localAuthRepository.ts:98-114`, `context/AuthProvider.tsx:23-39` | Ninguna | Error genérico "Credenciales inválidas" en ambos casos ✔. Sesión huérfana no se invalida (H8). Requiere contexto seguro (H13) | Prueba del repositorio; invalidar sesión huérfana | P1 |
| RF-03 Registrar alimento | P | `components/inventory/FoodFormModal.tsx:76-118`, `lib/validation/food.ts:18-30` | Ninguna | Atajos de fecha no se reflejan en el campo visible en escritorio (H3). Nombre vacío y fecha inválida pasan el esquema (H6). "Deterioro estimado" solo existe como texto de la etiqueta | H3, H6; M2 | **P0** |
| RF-04 Consultar alimentos | C | `app/(app)/inventario/page.tsx:23-39,146-150`, `components/dashboard/PriorityList.tsx:14` | Ninguna | Estado vacío engañoso con filtros (H9). Búsqueda no ignora tildes (H11) | H9, H11 | P0 / P1 |
| RF-05 Editar alimento | C | `FoodFormModal.tsx:47-65,78-89`, `context/FoodsProvider.tsx:94-98` | Ninguna | `updateFood` del repositorio crea el alimento si no existe (H8) | H8 | P1 |
| RF-06 Eliminar alimento | C | `components/inventory/FoodCard.tsx:55-63`, `localFoodRepository.ts:53-57` | Ninguna | Pide confirmación ✔ | Prueba del repositorio | P1 |
| RF-07 Controlar vencimiento | C | `lib/expiry.ts:17-33` | `expiry.test.ts:19-26` (los 6 límites) | Fecha inválida → `NaN` → se muestra como "fresco" (H6) | Validar fecha; prueba con reloj fijo | P0 |
| RF-08 Priorizar alimento | C | `lib/expiry.ts:47-62`, `inventario/page.tsx:33-34`, `PriorityList.tsx:14` | `expiry.test.ts:35-46` | Orden estable (empates conservan orden de entrada) | — | — |
| RF-09 Recomendar recetas | P | `lib/recipes.ts:71-88,103-197` | `recipes.test.ts:11-42` (un solo caso) | Coincidencia por subcadena con falsos positivos confirmados (H1) | H1 | **P0** |
| RF-10 Consulta de recetas | P | `app/(app)/recetas/[id]/page.tsx:19-36,69-101` | Ninguna | El detalle usa otra lógica de coincidencia: cuenta vencidos, sin sinónimos, más falsos positivos; `id` inexistente no lleva al 404 (H2) | H2 | **P0** |
| RNF-01 Usabilidad | P | `FoodFormModal.tsx:198-211`, `inventario/page.tsx:131-144` | Ninguna | H3, H9, estados vacíos sin acción (H19), salir sin confirmación (H18) | H3, H9, M8 | P0 / P1 |
| RNF-02 Responsive | NV | `layout/AppShell.tsx:30`, `BottomNav.tsx:23`, `ui/BottomSheet.tsx:48` | Ninguna | Por lectura: sin anchos fijos, `pb-20` reserva la barra inferior. `pb-20` (80 px) < barra 64 px + área segura de iPhone (~34 px). Zoom deshabilitado (H12) | Recorrido manual en 4 tamaños (Fase 5) | P1 |
| RNF-03 Seguridad | P | `localAuthRepository.ts:30-51`, `localFoodRepository.ts:8-14` | Ninguna | Contraseña **no** está en texto plano: PBKDF2-SHA-256, 100.000 iteraciones, sal de 16 bytes. Datos separados por clave `gestionalo:foods:<userId>`. Límite estructural: cualquiera con acceso al navegador lee todo `localStorage` | Documentar la limitación; H8 | P1 |
| RNF-04 Rendimiento | C | `hooks/useRecipes.ts:10-12` | Ninguna | Recomendaciones memorizadas, pero se calculan 2 veces en el dashboard; cada mutación relee `localStorage`; el ejemplo hace 11 lecturas y 11 escrituras (H15) | Menor | P2 |
| RNF-05 Persistencia | P | `localAuthRepository.ts:135-138`, `localFoodRepository.ts:16-25` | Ninguna | Cerrar sesión no borra alimentos ✔. JSON corrupto → lista vacía en silencio y la siguiente escritura lo sobrescribe (H5) | H5 | **P0** |
| RNF-06 Compatibilidad | NV | `tsconfig.json` (ES2017), `localAuthRepository.ts:33`, `FoodsProvider.tsx:84` | Ninguna | `crypto.subtle` y `crypto.randomUUID` solo existen en HTTPS o `localhost` (H13). Hidratación: por lectura no hay diferencias servidor/cliente | H13; revisar consola en Fase 5 | P1 |
| RNF-07 Mantenibilidad | P | Todo `src/` | — | Lint en rojo (H10), cero JSDoc, código muerto y duplicación (H15), README desactualizado (H16) | H10, H15, H16 | P0 / P2 |
| RN-01 Alimento asociado a usuario | C | `FoodsProvider.tsx:82-89` | Ninguna | `userId` sale de la sesión, nunca del formulario ✔ | Prueba | P1 |
| RN-02 Solo sus alimentos | C | `localFoodRepository.ts:8-10,41,55`, `FoodsProvider.tsx:32-54` | Ninguna | Clave por usuario + filtro por `userId` ✔. Al cambiar de cuenta el estado se limpia ✔. Excepción: H8 | Pruebas con `Storage` en memoria | P1 |
| RN-03 Días restantes | C | `lib/expiry.ts:17-25,35-45`, `inventory/ExpiryBadge.tsx:8-11` | `expiry.test.ts:5-17,28-33` | Texto "Vence hoy / mañana / en N días / Venció hace N días" ✔. Cálculo por día calendario local ✔ | Prueba con reloj a las 23:59 | P1 |
| RN-04 Mayor prioridad a próximos | C | `lib/expiry.ts:47-62` | `expiry.test.ts:35-46` | — | — | — |
| RN-05 Vencidos identificados | C | `lib/expiry.ts:28,36-40`, `ui/Badge.tsx:16` | `expiry.test.ts:20,29` | Texto "Venció hace…" además del color ✔ | — | — |
| RN-06 Recetas priorizan próximos a vencer | P | `lib/recipes.ts:156-164,190-194`, `dashboard/RecipeSuggestions.tsx:11` | `recipes.test.ts:11` (solo verifica la sección) | En el orden general, recetas con solo alimentos frescos superan a todas las de rescate (H4) | H4 (requiere aprobación) | **P0** |

---

## 3. Diferencias entre la sección 2 del prompt y el código real

| Hipótesis | Realidad |
|---|---|
| Contraseña posiblemente en texto plano | **Falso.** PBKDF2 con sal vía Web Crypto (`localAuthRepository.ts:30-51`). El paso 3 de la Fase 2 no aplica; no hay cuentas antiguas en texto plano que migrar |
| `lib/stats.ts` lleva los contadores rescued / wasted | Solo calcula el resumen. Los contadores viven en `FoodsProvider.tsx:106-123` y en `getStats` / `updateStats` de `LocalFoodRepository` (`:59-73`), **fuera de la interfaz** `FoodRepository`; el provider hace `foodRepo as LocalFoodRepository` (`FoodsProvider.tsx:24`) |
| "Con lo que tienes" exige cobertura ≥ 60 % | Cierto, e inclusivo (3 de 5 entra). Pero "Para rescatar hoy" **no tiene mínimo**: basta un alimento urgente, incluso si solo cubre un ingrediente opcional (cobertura 0 %) |
| Singular básico | Solo quita la `s` final: `panes→pane`, `nueces→nuece`, `arroces→arroce`, `limones→limone`. Hoy funcionan por casualidad gracias a la subcadena |
| Stack incluye date-fns | Instalado pero **no se importa en ningún archivo**. Igual con el paquete `motion` (se usa `framer-motion`) |
| README menciona `components/recipes` | Confirmado (`README.md:112`). Las tarjetas de receta están repetidas en línea en 3 archivos |
| M1 pendiente | Parcialmente hecho: ya existen atajos +3 días / +1 semana / +1 mes (`FoodFormModal.tsx:162-172`) y la casilla "Agregar otro después de guardar" (`:176-186`). Faltan "Hoy", "+2 semanas", recordar unidad y categoría, y foco inicial |
| RF-03 "deterioro estimado" | La etiqueta del campo ya dice "Fecha de vencimiento o deterioro estimado" (`:157`); no hay sugerencia ni marca |
| `Session` | Tiene un campo opcional `token` que nadie usa (`types/index.ts:70`) |
| `notes` opcional | Se guarda siempre como `""`, nunca `undefined` (`FoodsProvider.tsx:88`) |
| Pruebas actuales | Confirmado: 7 pruebas. Ninguna toca storage, validación, estadísticas ni componentes |
| Zona horaria | Sin usos de `new Date("YYYY-MM-DD")` ni `toISOString().slice`. `lib/expiry.ts:3-11` interpreta la fecha como local. Verificado en UTC−5 a las 23:59: correcto |

Lo demás de la sección 2 (rutas, modelo, umbrales, pesos, claves de `localStorage`, arquitectura) coincide con el código.

---

## 4. Hallazgos por prioridad

Riesgo = riesgo de regresión al corregir. Esfuerzo: S < 1 h, M = medio día, L > 1 día.

### P0 — incumplen un requisito o son errores reales

| # | Hallazgo | Evidencia | Requisito | Riesgo | Esf. |
|---|---|---|---|---|---|
| H1 | **Falsos positivos por subcadena en recetas.** Confirmado con prueba: `pan`↔Panela, `sal`↔Salchicha, `ajo`↔Ajonjolí, `res`↔Fresa, `col`↔Chocolate, `papa`↔Papaya y, **con los datos de ejemplo**, `agua`↔Aguacate (un aguacate hace que "Arepas con queso" y "Sopa de verduras" aparezcan en "Para rescatar hoy"). También en sentido inverso: tener Pan marca "Panela" como disponible. `té`↔tomate no ocurre solo porque se exige longitud ≥ 3 | `lib/recipes.ts:74-75,81,85` | RF-09, RN-06 | Medio: cambia qué recetas aparecen | M |
| H2 | **El detalle de receta no usa el motor de recomendación.** Tiene su propia coincidencia: cuenta alimentos vencidos como disponibles, ignora sinónimos, no exige longitud mínima (un alimento "Té" marca tomate, aceite y mantequilla) y no separa "lo que me falta". Un `id` inexistente muestra un texto suelto, no el 404 personalizado. La dificultad se muestra como `facil` | `app/(app)/recetas/[id]/page.tsx:19-36,64` | RF-10 | Bajo | S |
| H3 | **Formulario duplicado.** `FoodFormModal` renderiza el mismo formulario dos veces (Modal y BottomSheet) y oculta uno por CSS. React Hook Form solo controla el último. Confirmado: en escritorio, pulsar "+3 días" **no cambia el campo de fecha visible** (el valor sí se guarda). Además genera `id` duplicados, así que cada etiqueta apunta al campo oculto. Por la misma causa, "Agregar otro" probablemente deja valores viejos a la vista en escritorio (inferido, no probado) | `FoodFormModal.tsx:198-211` | RF-03, RNF-01 | Medio | M |
| H4 | **RN-06 en el orden general.** Caso: Tomate (vence hoy) + Yogurt, Papa y Leche frescos. Orden resultante: `puré de papa 12,00` > `yogurt con frutas 11,00` > `sopa de verduras 9,33` (primera de rescate). El dashboard toma las 4 primeras (`RecipeSuggestions.tsx:11`), así que "Recetas sugeridas" abre con dos recetas que no rescatan nada. **No afecta** a "Hoy cocina con…" (busca primero la sección de rescate, `TodayRecipeHighlight.tsx:12`) ni a `/recetas` (secciones separadas) | `lib/recipes.ts:164,190-194` | RN-06 | Bajo | S |
| H5 | **Lectura frágil de `localStorage`.** JSON corrupto → lista vacía sin aviso, y la siguiente escritura borra lo que había. Si el valor no es un arreglo, `foods.push` falla. Un alimento sin `category` válida rompe toda la pantalla (`categoryMeta[food.category].emoji`). Sin validación al leer, sin respaldo, sin aviso. Si `setItem` falla (cuota), "Consumido" y "Eliminar" lanzan una promesa rechazada sin manejar | `localFoodRepository.ts:16-30`, `localAuthRepository.ts:54-63`, `FoodCard.tsx:26` | RNF-05 | Medio | M |
| H6 | **Validación incompleta.** Un nombre de solo espacios pasa el mínimo de 2 y se guarda vacío. `expiresAt` solo exige "no vacío": una fecha inválida produce `NaN` días, estado "fresco" y texto "Vence en NaN días" | `lib/validation/food.ts:19-22,28`, `lib/expiry.ts:27-33` | RF-03, RF-07 | Bajo | S |
| H7 | **Estadísticas no garantizan "una sola vez".** `markConsumed` / `markWasted` suman antes de borrar y sin comprobar que el alimento exista; un doble toque suma 2 | `FoodsProvider.tsx:106-123` | Integridad de M7 | Bajo | S |
| H9 | **Estado vacío engañoso.** Si los filtros no devuelven nada, aparece "Tu inventario está vacío" con el botón de ejemplo, que agrega 11 alimentos más sobre el inventario real. Dos toques rápidos también duplican | `inventario/page.tsx:131-144`, `FoodsProvider.tsx:125-152` | RF-04, RNF-01 | Bajo | S |
| H10 | **Lint en rojo** (9 errores, 5 de ellos `any`). Impide cumplir "lint en verde" en cualquier commit | Sección 1 | RNF-07 | Bajo | S |

### P1 — mejoras necesarias, respaldadas por el documento

| # | Hallazgo | Evidencia | Requisito | Riesgo | Esf. |
|---|---|---|---|---|---|
| H8 | `updateFood` del repositorio inserta si no encuentra el alimento (upsert). Una sesión que apunta a un usuario inexistente redirige a `/login` pero la clave de sesión queda guardada | `localFoodRepository.ts:46-49`, `AuthProvider.tsx:26-31` | RN-02, RNF-03 | Bajo | S |
| H11 | La búsqueda ignora mayúsculas pero **no tildes** ("platano" no encuentra "Plátano") | `inventario/page.tsx:23` | RF-04 | Bajo | S |
| H12 | **Accesibilidad.** Zoom bloqueado (`userScalable: false`, `app/layout.tsx:30-31`). Modales sin foco inicial, sin trampa de foco, sin devolver el foco y sin nombre accesible (`ui/Modal.tsx`, `ui/BottomSheet.tsx`). Errores no asociados al campo (`ui/Input.tsx:24`). Selector de categoría sin grupo ni foco visible (`FoodFormModal.tsx:139-152`). Búsqueda y ordenamiento sin etiqueta (`inventario/page.tsx:52,120`). Filtros de ~32 px de alto y sin `aria-pressed`. Toasts sin `aria-live` y de 2,5 s. `<button>` dentro de `<a>` en 6 sitios. Contraste insuficiente: insignia fresco 2,66:1, insignia crítico 2,69:1, filtro activo "Pronto" 1,89:1, "Fresco" 2,96:1, "Úsalo ya" 3,06:1 (mínimo 4,5:1). El semáforo tiene texto y punto, pero no ícono distinto por estado | varios | RNF-01, RNF-02 | Medio (los colores tocan identidad visual → D10) | M |
| H13 | **Contexto seguro.** Registro, login y alta de alimentos usan `crypto.subtle` y `crypto.randomUUID`, que no existen en `http://` fuera de `localhost`. Si un hogar piloto abre la app desde el celular por IP local, no podrá registrarse y verá un error en inglés | `localAuthRepository.ts:33,78`, `FoodsProvider.tsx:84`, `ToastProvider.tsx:22` | RNF-06, validación | Bajo | S |
| H19 | Estados vacíos sin acción: `/recetas` sin coincidencias y las tarjetas del dashboard solo muestran texto. "Todo vencido" recibe el mismo mensaje genérico | `recetas/page.tsx:82-89`, `PriorityList.tsx:16-22`, `TodayRecipeHighlight.tsx:14-20` | RNF-01 | Bajo | S |
| H17 | `wasted` se registra pero no se muestra en ninguna pantalla (lo cubre M7) | `dashboard/StatsSummary.tsx:14-19` | Impacto medible | Bajo | S |
| H20 | La interfaz no menciona la inocuidad fuera de `/terminos`; el formulario solo dice que se aceptan fechas pasadas | `FoodFormModal.tsx:173`, `terminos/page.tsx:21-23` ✔ | Bloque F | Bajo | S |

### P2 — deuda menor

| # | Hallazgo | Evidencia |
|---|---|---|
| H14 | "Hoy" no se recalcula pasada la medianoche: las insignias cambian al siguiente render, pero las recomendaciones están memorizadas solo por `foods` | `hooks/useRecipes.ts:10-12` |
| H15 | Código muerto: `localFoodRepo` y `localAuthRepoInstance` (este último con `await` de nivel superior) sin uso (`localFoodRepository.ts:76-77`); dependencias `date-fns` y `motion` sin uso. Duplicación: carga de alimentos escrita dos veces (`FoodsProvider.tsx:32-75`), cálculo de fecha +N días en dos archivos, tarjeta de receta en tres, valores por defecto del formulario en tres. Cada `FoodCard` monta su propio formulario y su diálogo. Sin JSDoc en ningún módulo | varios |
| H16 | README: carpeta `components/recipes` inexistente; lista date-fns; dice "sesión simulada" sin aclarar que la contraseña sí se deriva; promete "cuáles te faltan" en la receta (H2); su eslogan difiere del de `config/site.ts`. `terminos` dice "Octubre 2026" | `README.md:3,41,76,112,127` |
| H18 | "Salir" en la barra inferior cierra sesión con un toque, sin confirmación, junto a la navegación | `layout/BottomNav.tsx:66-73` |
| H21 | `manifest.json` sin íconos; `public/` conserva los SVG de la plantilla de Next | `public/` |

### Verificado y correcto

- Los seis límites del semáforo (−1, 0, 2, 3, 5, 6) y el cálculo en UTC−5 a las 23:59.
- Vencidos fuera de las recomendaciones; opcionales fuera de la cobertura; umbral de 60 % inclusivo; empates deterministas (orden estable sobre el catálogo).
- Correo duplicado detectado sin distinguir mayúsculas ni espacios en el repositorio.
- `AuthGuard`: sin sesión redirige a `/login` y no pinta contenido protegido; con sesión, `/login` y `/registro` redirigen al dashboard.
- Cambio de cuenta en el mismo navegador: `FoodsProvider` limpia alimentos y estadísticas.
- Los alimentos de ejemplo usan fechas relativas a hoy y cubren los cuatro estados.
- Cierre con Escape en modales; botones e inputs de 44 px; `prefers-reduced-motion` respetado en CSS y en animaciones.
- Guardas `typeof window` en todo acceso a `localStorage` durante el render en servidor.
- La app no usa ninguna cifra en sus textos; el README usa solo "9,76 millones de toneladas" (permitida).

---

## 5. Decisiones pendientes

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| D1 | **El árbol de trabajo tiene cambios sin confirmar** (`README.md` modificado y `../README.md` borrado). La regla 11 me obliga a detenerme: no creé la rama ni hice commits | (a) Los confirmas tú en `main`; (b) los confirmo yo en `main` antes de crear la rama; (c) los llevo a la rama nueva | (a) |
| D2 | Ajuste de RN-06 (H4) | (a) Ordenar primero por sección (rescate antes) y luego por puntaje, sin tocar pesos; (b) cambiar la fórmula; (c) dejarlo | (a): es el cambio mínimo y no toca los pesos |
| D3 | Regla de coincidencia tras quitar la subcadena (H1) | (a) El alimento coincide si contiene **todas las palabras** del ingrediente ("Pechuga de pollo" sirve para `pollo`; "Maíz" no sirve para `harina de maíz`), más sinónimos; (b) igualdad exacta más sinónimos | (a). Requiere corregir el singular (`-es`) y ampliar sinónimos (p. ej. plátano / banano) |
| D4 | "Para rescatar hoy" sin cobertura mínima (receta con 0 % de obligatorios) | (a) Dejar como está; (b) exigir al menos un ingrediente obligatorio | (a): no está definido en el documento |
| D5 | Marcar como consumido un alimento ya vencido suma a `rescued`; el tipo dice "consumidos antes de vencer" | (a) Dejar; (b) no contarlo; (c) preguntar al marcar | (a), y aclararlo en el README |
| D6 | Lint: el código actual ya tiene `any` | (a) Corregir los 9 errores en el primer commit; (b) dejarlos | (a): sin eso ningún commit queda en verde |
| D7 | Cómo accederán los hogares piloto (H13) | (a) Despliegue con HTTPS; (b) solo `localhost`; (c) IP local por HTTP | (a), más un mensaje claro en español si falta `crypto.subtle`. Con (c) no hay forma de derivar la contraseña |
| D8 | Dependencias sin uso (`date-fns`, `motion`) | (a) Quitarlas; (b) dejarlas | (a): quitar no es agregar; el README deja de mentir |
| D9 | Días de deterioro por categoría (M2) | Los valores los valida el equipo | Propongo una tabla rotulada "orientativa" para que la revisen antes de fusionar |
| D10 | Contraste de insignias y filtros (H12) | (a) Oscurecer solo el **texto** sobre los fondos suaves; (b) no tocar colores | (a): cambia un tono de texto, no la paleta |
| D11 | Zoom bloqueado en el viewport | (a) Permitir zoom; (b) dejar | (a) |

---

## 6. Plan de implementación propuesto

Rama `mejoras/verificacion-pmv`, un commit por fila, cada uno con tipos, lint, pruebas y build en verde.

### Fase 2 — P0

| # | Commit | Cubre |
|---|---|---|
| 1 | `chore: fix pre-existing lint errors` — tipar `catch` con `unknown`, tipar props de motion, escapar comillas, corregir `AnimatedNumber` | H10 |
| 2 | `test: pin expiry boundaries with a fixed clock` — seis límites y 23:59 local | RF-07, RN-03 |
| 3 | `fix: validate food name and date` — `trim` y fecha real en Zod | H6 |
| 4 | `fix: match recipe ingredients by whole word` — singular correcto, sin subcadena, con las pruebas de los pares del prompt | H1 |
| 5 | `fix: rank rescue recipes before the rest` | H4 (tras D2) |
| 6 | `fix: recipe detail reuses the recommendation engine` — tengo / me falta, vencidos fuera, 404 real | H2 |
| 7 | `fix: render a single food form` — un solo contenedor según el ancho de pantalla | H3 |
| 8 | `fix: safe storage reads` — parseo seguro, Zod al leer, respaldo en `gestionalo:backup:<clave>`, aviso con Toast; pruebas con `Storage` en memoria | H5 |
| 9 | `fix: repository ownership and orphan session` — sin upsert, sesión huérfana invalidada; pruebas de aislamiento con dos usuarios | H8, RN-01, RN-02 |
| 10 | `fix: count consumed and wasted exactly once` | H7 |
| 11 | `fix: separate "no results" from "empty inventory"` y ejemplo sin duplicados | H9 |
| 12 | `docs: align README with the code` | H16 |

El paso 3 de la Fase 2 del prompt (contraseña en texto plano) **no aplica**.

### Fase 3 — P1

| # | Commit | Cubre |
|---|---|---|
| 13 | M1: atajos "Hoy" y "+2 semanas", recordar unidad y categoría, foco en el nombre | M1 |
| 14 | M2: sugerencia de fecha por categoría, `expiryIsEstimated?` opcional, marca "≈ estimada" | M2, RF-03 |
| 15 | M3: aviso de duplicados reutilizando `normalize` | M3 |
| 16 | M4: acciones por estado y desechar vencidos en grupo | M4 |
| 17 | M5: motivo de la recomendación e insignia en el detalle | M5 |
| 18 | M6: "Ya la cociné" | M6 |
| 19 | M7: porcentaje de aprovechamiento | M7, H17 |
| 20 | M8: accesibilidad (foco en modales, errores asociados, etiquetas, `aria-live`, zoom, contraste) y búsqueda sin tildes | H11, H12, H19, H20 |
| 21 | Mensaje claro cuando no hay contexto seguro | H13 |

### Fases 4 y 5

P2 solo con tu aprobación, una por una. Cierre: repetir la línea base, prueba de compatibilidad con un
`localStorage` de forma antigua, recorrido manual de flujos con dos usuarios y actualización de esta matriz.
