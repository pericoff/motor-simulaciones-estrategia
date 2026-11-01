# Motor de simulaciones de estrategia empresarial

**Versión 0.1: demostración funcional de estrategias competitivas de Porter.**

Aplicación educativa de 4 empresas y 5 rondas con decisiones de precios, marketing, calidad, eficiencia, innovación y capacidad productiva. El motor transforma inversiones en capacidades acumuladas, calcula demanda competitiva, ventas, beneficios, tesorería y puntuaciones.

## Abrir la demostración

Una vez activado GitHub Pages en la rama `main` y carpeta raíz:

- Alumnado: https://pericoff.github.io/motor-simulaciones-estrategia/
- Profesor: https://pericoff.github.io/motor-simulaciones-estrategia/profesor.html

También puedes servir los archivos con un servidor web local. **No abras directamente `index.html` mediante file://**, porque el navegador puede bloquear los módulos JavaScript.

## Prueba rápida

1. En `profesor.html`, observa los códigos `EQUIPO1` a `EQUIPO4`.
2. Abre el portal de alumnos en el **mismo navegador y dispositivo**.
3. Accede sucesivamente a los cuatro equipos, toma las decisiones y envíalas.
4. Regresa al profesor y recarga la página: pulsa **Calcular y publicar resultados**.
5. Consulta la clasificación, avanza a la siguiente ronda y repite hasta la quinta.
6. Exporta los resultados CSV desde el panel docente.

## Limitaciones de seguridad y sincronización

**Modo demostración local.** La partida se guarda en `localStorage`. No existe base de datos, usuarios reales ni sincronización entre diferentes ordenadores. Los códigos son identificadores de demostración; el panel docente NO está protegido. No utilizar como competición remota real ni para calificaciones oficiales sin desarrollar autenticación, persistencia y autorización en backend.

Las fórmulas son un modelo docente simplificado, no predicciones económicas. Los coeficientes necesitan calibración pedagógica antes de utilizar los resultados para evaluar alumnado.

## Archivos

- `config.js`: escenario configurable de Porter, eventos, rondas, decisiones.
- `engine.js`: motor de cálculo separado de la interfaz.
- `app.js`: navegación, decisiones, resultados y guardado local.
- `index.html` / `profesor.html`: portales.
- `styles.css`: diseño compartido.
- `pruebas/engine.test.mjs`: pruebas automatizadas.

## Pruebas

Con Node.js instalado, ejecuta `npm test`. Los tests comprueban validaciones y una partida de cinco rondas. Los resultados deben verificarse también manualmente en el navegador.

## Próxima iteración

Introducir escenarios adicionales mediante módulos, vídeos docentes, descarga/importación de partidas, ajustes de nombres y acceso multiusuario seguro mediante backend.
