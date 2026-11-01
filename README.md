# Motor de simulaciones de estrategia empresarial

**Versión 0.4: generador de simulaciones con biblioteca de escenarios reutilizables.**

Aplicación educativa de 4 empresas y 5 rondas, con escenarios de **Porter**, **expansión internacional** e **innovación y disrupción**. Cada escenario cuenta con narrativas, eventos, estrategias, coeficientes y etiquetas de decisiones propios. Puedes crear hasta 50 escenarios adicionales, duplicar plantillas y guardarlos como archivos JSON. El motor integra decisiones de precios, marketing, calidad, eficiencia, innovación y capacidad productiva. El motor transforma inversiones en capacidades acumuladas, calcula demanda competitiva, ventas, beneficios, tesorería y puntuaciones.

## Abrir la demostración

Una vez activado GitHub Pages en la rama `main` y carpeta raíz:

- Alumnado: https://pericoff.github.io/motor-simulaciones-estrategia/
- Profesor: https://pericoff.github.io/motor-simulaciones-estrategia/profesor.html

También puedes servir los archivos con un servidor web local. **No abras directamente `index.html` mediante file://**, porque el navegador puede bloquear los módulos JavaScript.

## Prueba rápida

1. En `profesor.html`, selecciona un escenario desde **Elegir simulación estratégica**. Elige **Mi cuarto escenario · Estrategia corporativa** para acceder al formulario de configuración. Cada escenario conserva una partida local independiente. Si estás migrando desde la versión 0.1, el escenario Porter conserva los datos locales existentes.
2. En `profesor.html`, observa los códigos `EQUIPO1` a `EQUIPO4`.
3. Abre el portal de alumnos en el **mismo navegador y dispositivo**.
4. Accede sucesivamente a los cuatro equipos, toma las decisiones y envíalas.
5. Regresa al profesor y recarga la página: pulsa **Calcular y publicar resultados**.
6. Consulta la clasificación, avanza a la siguiente ronda y repite hasta la quinta.
7. Exporta los resultados CSV desde el panel docente.

## Limitaciones de seguridad y sincronización

**Modo demostración local.** La partida se guarda en `localStorage`. No existe base de datos, usuarios reales ni sincronización entre diferentes ordenadores. Los códigos son identificadores de demostración; el panel docente NO está protegido. No utilizar como competición remota real ni para calificaciones oficiales sin desarrollar autenticación, persistencia y autorización en backend.

Las fórmulas son un modelo docente simplificado, no predicciones económicas. Los coeficientes necesitan calibración pedagógica antes de utilizar los resultados para evaluar alumnado.

## Archivos

- `scenarios.js`: catálogo de Porter, expansión internacional, innovación y plantilla editable.
- `scenario-editor.js`: formulario del profesor para personalizar escenarios creados.
- `scenario-library.js`: biblioteca local, duplicación, exportación, importación y borrado.
- `config.js`: activa las reglas y parámetros del escenario seleccionado.
- `engine.js`: motor de cálculo separado de la interfaz.
- `app.js`: navegación, decisiones, resultados y guardado local.
- `index.html` / `profesor.html`: portales.
- `styles.css`: diseño compartido.
- `pruebas/engine.test.mjs`: pruebas automatizadas.

## Pruebas

Con Node.js instalado, ejecuta `npm test`. Las pruebas comprueban validaciones y partidas completas de cinco rondas para los tres escenarios. Un workflow de GitHub Actions también ejecuta pruebas y análisis de sintaxis al subir cambios. Los resultados deben verificarse también manualmente en el navegador.

## Próxima iteración

Ampliar el catálogo de escenarios, incorporar vídeos docentes, descarga/importación de partidas, edición de nombres y acceso multiusuario seguro mediante backend.

### Crear otro escenario

Duplica una entrada en `scenarios.js`, asigna un `id` único y adapta los nombres de rondas, eventos, estrategias, decisiones y parámetros `model`. El motor reutiliza las seis dimensiones de decisión y sus capacidades; un escenario con otras variables o ecuaciones requerirá ampliar también `engine.js`. Cambiar el escenario desde el panel docente guarda cada partida en una clave local separada. El cambio no implica acceso compartido entre dispositivos.

## Cuarto escenario editable

En el panel docente, selecciona **Mi cuarto escenario · Estrategia corporativa**. Podrás cambiar nombre, sector, descripción, cinco rondas, nombres de tres estrategias, etiquetas de seis decisiones, eventos de mercado y once parámetros cuantitativos. Pulsa **Guardar configuración del escenario**.

La configuración se guarda en `localStorage` del navegador actual. No se sube automáticamente a GitHub y no es accesible desde otros dispositivos. Reinicia la partida para poder editar cuando ya haya decisiones entregadas o resultados. Las variables internas del motor (precio, marketing, calidad, eficiencia, innovación, capacidad) siguen siendo las mismas: cambiar una etiqueta no introduce una variable nueva ni cambia las ecuaciones salvo que modifiques los parámetros expuestos.

El formulario es una primera herramienta de autoría docente y no sustituye una solución multiusuario con base de datos.

## Generador de simulaciones: biblioteca (versión 0.4)

En el panel docente, sección **Biblioteca de simulaciones**:

1. Selecciona una de las tres plantillas o el cuarto escenario editable.
2. Pulsa **Crear nueva desde la actual**. El sistema crea un escenario con identificador propio y partida independiente.
3. Utiliza el editor para cambiar el nombre, sector, cinco rondas, tres opciones estratégicas, etiquetas de decisiones, eventos y once parámetros del motor.
4. Pulsa **Guardar configuración del escenario**.
5. Para trasladar el diseño a otro ordenador, pulsa **Exportar JSON** y conserva el archivo; en el otro ordenador usa **Importar simulación desde archivo JSON**.
6. Si ya no necesitas un escenario, utiliza **Eliminar escenario**. Los tres modelos predefinidos no pueden borrarse desde la interfaz.

El sistema crea un identificador nuevo para cada importación y evita sobrescribir diseños anteriores. Las partidas también se almacenan de manera independiente por escenario. El editor bloquea cambios cuando existen decisiones entregadas o resultados, por coherencia didáctica.

**Limitaciones:** almacenamiento local por navegador (hasta 50 diseños adicionales), sin sincronización en la nube. Crea copias JSON periódicamente. El motor comparte seis variables económicas fijas; un cambio de etiquetas no añade nuevas ecuaciones. Para un sistema multiusuario con usuarios reales y biblioteca docente compartida hace falta un servidor o base de datos con autorización.

## Simulación de repaso de los temas 2-5 (versión 0.5)

Se añade el escenario **Reto de repaso · Estrategia y Dirección de Empresas** a partir del material docente facilitado (Tema 2, Tema 3, Tema 4 y Tema 5).

**Cinco rondas y contenidos:**
1. Entorno genérico y específico, cinco fuerzas competitivas y turbulencia (Tema 2).
2. Cadena de valor, DAFO, capacidades distintivas, RSC y economía circular (Tema 2).
3. Misión, objetivos SMART, rentabilidad económica y apalancamiento financiero (Tema 3).
4. Liderazgo en costes, diferenciación, segmentación y coherencia de implantación (Tema 4).
5. Factores ponderados, árbol de decisión y criterios en incertidumbre (Tema 5).

**Uso:**
1. En el portal del profesor, en el selector, elige **Reto de repaso · Estrategia y Dirección de Empresas**.
2. En la misma computadora y navegador, entra con el código EQUIPO1 desde el portal del alumnado.
3. Contesta las cuatro cuestiones del reto académico. Al pulsar **Corregir mi repaso**, verás la corrección razonada y la referencia a las diapositivas originales.
4. Cuando termines el repaso, podrás enviar las decisiones económicas de la ronda.
5. Repite con EQUIPO2, EQUIPO3 y EQUIPO4. En el panel docente, actualiza la página si es necesario, comprueba los aciertos y calcula los resultados.
6. Avanza de ronda hasta la quinta. La exportación CSV incorpora un resumen de las puntuaciones académicas y los resultados financieros.

**Interpretación:** hay dos resultados diferentes: puntuación de repaso (aciertos sobre las preguntas) y puntuación económica de la simulación (motor competitivo). Las respuestas al repaso no alteran arbitrariamente las ventas ni la tesorería; funcionan como requisito de aprendizaje previo a la decisión. Todas las preguntas ofrecen feedback y referencia a la unidad docente.

La simulación representa un caso industrial ficticio de TECNOVA y usa coeficientes de un modelo docente, no datos empresariales reales. El repaso se basa en los temas facilitados; no reproduce literalmente sus diapositivas.

**Limitación:** al igual que las demás simulaciones de la versión actual, esta actividad es una **demostración local**. Los equipos no pueden enviar sus respuestas desde equipos independientes a un profesor en otro ordenador sin implementar primero el backend multiusuario.

## Vídeos docentes: presentación y cinco rondas (versión 0.6)

Se añade reproducción integrada en el portal de los equipos y en el repaso individual de los temas 2–5.

### Configuración desde el panel docente

1. Accede a [profesor.html](https://pericoff.github.io/motor-simulaciones-estrategia/profesor.html) y selecciona la simulación.
2. Busca **Vídeos docentes · Presentación y cinco rondas**.
3. Pega hasta seis enlaces (presentación general y vídeos de las rondas 1 a 5). Puedes dejar los demás vacíos.
4. Pulsa **Guardar enlaces de vídeos**. Aparecerá una vista previa y los vídeos se reproducirán en las páginas de estudiante de **ese mismo navegador**.
5. Pulsa **Exportar configuración JSON** para conservar la lista. En otro navegador usa **Importar configuración de vídeos (.json)**.

Admite enlaces HTTPS de YouTube (incluidos youtu.be y shorts), Vimeo, archivos individuales de Google Drive y archivos MP4 directos. No admite carpetas de Drive ni otros proveedores. El enlace de Drive debe permitir a los alumnos visualizar el archivo. Algunos vídeos tienen restricciones de inserción o permisos y pueden requerir abrir el vídeo directamente en otra pestaña.

Los seis campos son independientes para cada escenario. El vídeo de presentación se muestra en la primera ronda; el de cada ronda aparece cuando corresponde. **No se exige ver un vídeo para responder al repaso o enviar decisiones**, y la reproducción es manual.

### Publicar vídeos para todos los estudiantes mediante GitHub Pages

**Los cambios realizados en el panel se guardan solo en `localStorage` y no escriben en GitHub.** Para que todos los navegadores reciban los enlaces automáticamente, edita el archivo [videos.json](https://github.com/pericoff/motor-simulaciones-estrategia/blob/main/videos.json) de la rama principal y añade los enlaces en el bloque del identificador del escenario:

```json
{
  "repaso-temas-2-5": {
    "presentation": "https://youtu.be/VIDEO_PRESENTACION",
    "round1": "https://youtu.be/VIDEO_1",
    "round2": "",
    "round3": "",
    "round4": "",
    "round5": ""
  }
}
```

El ejemplo anterior muestra solo el bloque de una simulación: **mantén los demás escenarios del archivo** al editarlo y usa enlaces reales válidos. Guarda los cambios con **Commit changes** en GitHub. Los estudiantes que abran la página después de la publicación cargarán esos enlaces; aquellos que tengan una configuración local anterior de ese mismo escenario seguirán viendo sus enlaces locales, que tienen prioridad.

No hace falta instalar nada. La publicación es estática; no incorpora autenticación ni sincronización de decisiones. El panel del profesor no permite publicar los enlaces directamente en GitHub por razones de seguridad.

Archivos: `video-config.js`, `video-ui.js`, `videos.json` y `pruebas/videos.test.mjs`.
