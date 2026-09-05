# Feature 005: Galería y persistencia (guardar/listar dibujos, IndexedDB)

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/models/Dibujo.test.js`, `tests/unit/services/galeria.test.js`,
`tests/unit/stores/galeria.test.js`, `tests/unit/components/Galeria.test.js`,
`tests/unit/components/Toolbar.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#6](https://github.com/cristianmolinag/pixel-art/issues/6)
**Depende de:** F04 Undo/Redo (#13, implementada)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **guardar mis dibujos y volver a verlos en una galería**, para
> **no perder mi trabajo y poder retomarlo después**.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Guardar el dibujo actual con un nombre (Priority: P1)

Como usuario, quiero guardar el dibujo en que estoy trabajando dándole un nombre.

**Por qué esta prioridad:** es la base de la persistencia: sin guardar no hay galería.

**Test independiente:** puede probarse dibujando, guardando y viendo el dibujo en la lista.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que dibujé algo, **When** toco "Guardar" y escribo un nombre, **Then** el dibujo
   queda almacenado (IndexedDB) y aparece en la galería con su thumbnail.
2. **Given** que abro el formulario de guardado, **When** miro el campo de nombre, **Then**
   hay un nombre sugerido por defecto con la fecha actual (editable).
3. **Given** que guardo con un nombre vacío, **When** intento confirmar, **Then** se indica
   que el nombre es obligatorio y no se guarda.

---

### User Story 2 — Ver mis dibujos guardados en la galería (Priority: P1)

Como usuario, quiero abrir una galería que liste mis dibujos guardados con su thumbnail.

**Por qué esta prioridad:** sin lista visible no hay forma de recuperar un dibujo.

**Test independiente:** puede probarse guardando dos dibujos y abriendo la galería.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que guardé dibujos, **When** toco "Galería", **Then** veo una lista de tarjetas
   con thumbnail, nombre y fecha de guardado.
2. **Given** que no he guardado nada aún, **When** abro la galería, **Then** veo un mensaje
   de estado vacío ("Aún no has guardado dibujos").
3. **Given** que la galería está abierta, **When** toco cerrar, **Then** el editor sigue
   intacto y la galería desaparece.

---

### User Story 3 — Cargar un dibujo desde la galería (Priority: P1)

Como usuario, quiero cargar un dibujo de la galería de vuelta al editor.

**Por qué esta prioridad:** es la otra mitad de la persistencia: sin cargar, guardar no
serviría para retomar trabajo.

**Test independiente:** puede probarse guardando un dibujo, cambiando el lienzo y cargándolo.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** un dibujo en la galería, **When** toco su tarjeta, **Then** el lienzo muestra
   ese dibujo (píxeles y dimensiones restaurados) y la galería se cierra.
2. **Given** que el lienzo tenía otro dibujo sin guardar, **When** cargo uno de la galería,
   **Then** el lienzo se reemplaza por el guardado (el trabajo anterior sigue en el lienzo
   hasta que se guarde o se descarte).

---

### User Story 4 — Empezar un dibujo nuevo (Priority: P2)

Como usuario, quiero limpiar el lienzo y empezar un dibujo nuevo.

**Por qué esta prioridad:** complementa la galería (típico flujo: nuevo → dibujar → guardar),
pero no es imprescindible para recuperar trabajo.

**Test independiente:** puede probarse pintando y tocando "Nuevo" (con confirmación).

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que pinté en el lienzo, **When** toco "Nuevo" y confirmo, **Then** el lienzo
   queda en blanco y el historial de undo/redo se reinicia.
2. **Given** que toco "Nuevo", **When** la app pregunta si estoy seguro y respondo que no,
   **Then** el lienzo no cambia.

---

### User Story 5 — Eliminar un dibujo guardado (Priority: P2)

Como usuario, quiero borrar un dibujo de la galería que ya no necesito.

**Por qué esta prioridad:** mantener la galería ordenada, sin acumular basura. No es base
de la persistencia.

**Test independiente:** puede probarse guardando un dibujo y eliminándolo desde su tarjeta.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** un dibujo en la galería, **When** toco su botón de eliminar y confirmo, **Then**
   el dibujo desaparece de la galería y del almacenamiento.
2. **Given** que toco eliminar, **When** respondo que no a la confirmación, **Then** el
   dibujo permanece.

---

## Requisitos funcionales

- **FR-001**: El sistema DEBE ofrecer un botón **Guardar** que abra el formulario para
  guardar el dibujo actual con un nombre.
- **FR-002**: Al guardar, el sistema DEBE persistir en **IndexedDB** el dibujo completo:
  nombre, dimensiones (cols/rows), píxeles, un thumbnail y el timestamp de guardado.
- **FR-003**: El sistema DEBE ofrecer un botón **Galería** que abra un **modal** listando los
  dibujos guardados como tarjetas con **thumbnail**, **nombre** y **fecha**, ordenados del
  más reciente al más antiguo.
- **FR-004**: El sistema DEBE permitir **cargar** un dibujo tocando su tarjeta: el lienzo
  restaura píxeles y dimensiones, y el modal se cierra.
- **FR-005**: El sistema DEBE ofrecer un botón **Nuevo** que, tras confirmar, deje el lienzo
  en blanco y reinicie el historial de undo/redo.
- **FR-006**: El sistema DEBE ofrecer un botón **Eliminar** por tarjeta que, tras confirmar,
  borre el dibujo de la galería y del almacenamiento.
- **FR-007**: El nombre de un dibujo DEBE ser obligatorio (no se guarda un dibujo sin nombre).
- **FR-008**: El estado de la galería (lista cargada, modal visible, errores) DEBE vivir en
  el **store central** `galeria.svelte.js` (runes), por la arquitectura uni-direccional.
- **FR-009**: La persistencia DEBE sobrevivir a recargar la página (IndexedDB, no memoria).
- **FR-010**: La UI DEBE estar en **español** y funcionar en móvil (modal mobile-first).

## Success Criteria

- **SC-001**: Al guardar un dibujo, aparece en la galería con thumbnail, nombre y fecha.
- **SC-002**: Al recargar la página, los dibujos guardados siguen en la galería.
- **SC-003**: Tocar una tarjeta restaura el dibujo en el lienzo y cierra el modal.
- **SC-004**: Nuevo y Eliminar funcionan con confirmación (aceptar → aplica, cancelar → no).
- **SC-005**: Los escenarios Given/When/Then de las US se verifican con tests.

## Assumptions

- **Solo guardado manual** (decisión de producto tomada con el usuario). El auto-guardado del
  borrador actual queda fuera de alcance; se puede revisar después de F06 (#14).
- **Galería como modal/overlay** (decisión de producto tomada con el usuario), sin navegación
  entre vistas.
- El lienzo sigue siendo **16×16 fijo** y 1 celda = 1 píxel real (sin cambios).
- Al **cargar** o crear un dibujo **nuevo** se reinicia el historial de undo/redo (el trabajo
  del lienzo anterior queda descartado a nivel de historial).
- **Exportar/importar JSON** (antiguo issue #2) NO entra en esta feature; es candidato a
  issue futuro.
- **UI en español** (principio del proyecto).

---

## Decisiones (cómo — tecnología)

*Sección separada del "qué" para que la spec no dependa de la implementación.*

- **Modelo puro `Dibujo`** (`src/lib/models/Dibujo.js`): `desdeModelo(model, nombre)` serializa
  el snapshot del lienzo (`snapshot()` → array plano de píxeles RGBA), genera un **thumbnail**
  como dataURL a partir del OffscreenCanvas (canvas temporal + `drawImage` + `toDataURL`) y
  agrega timestamps; `aCanvas(record)` restaura píxeles/dimensiones en un `Canvas` nuevo.
  La serialización es un array plano (JSON-portable) sin datos del historial de undo.
- **Service `galeria`** (`src/lib/services/galeria.js`): wrapper mínimo de **IndexedDB** —
  DB `pixel-art-studio`, store `dibujos` con `keyPath: "id"` autoincrement e índice por
  `createdAt`. Expone `guardarDibujo`, `listarDibujos` (más recientes primero) y
  `eliminarDibujo` como Promesas. Aislar IndexedDB en un servicio mantiene los stores puros
  de DOM/browser APIs.
- **Store `galeria.svelte.js`** (runes, singleton): `dibujos`, `visible`, `enfocarGuardar`,
  `error`, `guardando`; métodos `listar()`, `guardar(nombre)`, `cargar(dibujo)`,
  `nuevo()`, `eliminar(id)`, `abrir(opciones)`/`cerrar()`. Conecta con el store `editor`:
  lee `editor.model` al guardar y reemplaza `editor.model` (+ resetea `undoStack`/`redoStack`
  y sube `version`) al cargar o crear nuevo.
- **Componente `Galeria.svelte`**: overlay modal fijo (backdrop + panel) con dos secciones:
  "Guardar dibujo actual" (input de nombre + botón) y "Mis dibujos" (grilla de tarjetas:
  thumbnail `<img>`, nombre, fecha, botón eliminar; la tarjeta entera carga el dibujo).
  Estado vacío con mensaje en español. `window.confirm` para Nuevo/Eliminar.
- **Toolbar**: tres botones nuevos con iconos de **lucide-svelte** — **Nuevo** (`file-plus-2`),
  **Guardar** (`save`) y **Galería** (`images`); el contenedor pasa a `flex-wrap` para no
  desbordar en móvil. Guardar y Galería abren el modal (Guardar enfocando el campo de nombre).
- **Tests con `fake-indexeddb`** (devDependency): jsdom no implementa IndexedDB; se importa
  `fake-indexeddb/auto` en `tests/setup.js` y cada suite refresca la DB en `beforeEach`.

## Relacionado con

- Anterior: F04 Undo/Redo (#13).
- Siguiente: feature 06 (color picker → #14).
- Backlog: atajos de teclado (#10) podrá traducir "Guardar/Cargar" a atajos; el antigo
  issue #2 queda absorbido por esta feature salvo export/import JSON.