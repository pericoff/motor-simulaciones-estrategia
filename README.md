# Motor de simulaciones de estrategia empresarial

**Versión 0.2: demostración funcional con tres escenarios configurables.**

Aplicación educativa de 4 empresas y 5 rondas, con escenarios de **Porter**, **expansión internacional** e **innovación y disrupción**. Cada escenario cuenta con narrativas, eventos, estrategias, coeficientes y etiquetas de decisiones propios. El motor integra decisiones de precios, marketing, calidad, eficiencia, innovación y capacidad productiva. El motor transforma inversiones en capacidades acumuladas, calcula demanda competitiva, ventas, beneficios, tesorería y puntuaciones.

## Abrir la demostración

Una vez activado GitHub Pages en la rama `main` y carpeta raíz:

- Alumnado: https://pericoff.github.io/motor-simulaciones-estrategia/
- Profesor: https://pericoff.github.io/motor-simulaciones-estrategia/profesor.html

También puedes servir los archivos con un servidor web local. **No abras directamente `index.html` mediante file://**, porque el navegador puede bloquear los módulos JavaScript.

## Prueba rápida

1. En `profesor.html`, selecciona un escenario desde **Elegir simulación estratégica**. Cada escenario conserva una partida local independiente. Si estás migrando desde la versión 0.1, el escenario Porter conserva los datos locales existentes.
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

- `scenarios.js`: catálogo de Porter, expansión internacional e innovación.
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
