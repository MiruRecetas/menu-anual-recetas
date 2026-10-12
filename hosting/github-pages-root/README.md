# Acceso por la dirección raíz de MiruRecetas

Estos archivos sirven `https://mirurecetas.github.io/` desde el repositorio público
`MiruRecetas/mirurecetas.github.io`. Abrirán automáticamente la web existente,
sin duplicar recetas, menús ni mantenimiento. La barra de direcciones pasa a la
URL canónica actual después de la redirección.

Publicar `index.html` y `.nojekyll` en la raíz de la rama `main` del repositorio
`mirurecetas.github.io` y activar GitHub Pages: Deploy from a branch, main, /(root).
El repositorio ya está creado, Pages activado y la redirección publicada mediante PR. Estos archivos son el modelo preparado; el despliegue vigente se mantiene en aquel repositorio, sin sincronización automática.
Los cambios de la web seguirán publicándose en `menu-anual-recetas`.

La redirección con JavaScript conserva parámetros y fragmento; el reemplazo del
historial evita un bucle con el botón Atrás. Sin JavaScript existe meta refresh
y un enlace explícito. El destino es fijo y nunca depende de parámetros del usuario.

Una futura landing se implementará en `mirurecetas.github.io`, sustituyendo su redirección y enlazando a la aplicación existente. Actualizar también las pruebas que hoy esperan redirigir; no duplicar datos ni recetario.
