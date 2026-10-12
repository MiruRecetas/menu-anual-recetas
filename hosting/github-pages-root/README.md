# Acceso por la dirección raíz de MiruRecetas

Estos archivos sirven `https://mirurecetas.github.io/` desde el repositorio público
`MiruRecetas/mirurecetas.github.io`. Abrirán automáticamente la web existente,
sin duplicar recetas, menús ni mantenimiento. La barra de direcciones pasa a la
URL canónica actual después de la redirección.

Publicar `index.html` y `.nojekyll` en la raíz de la rama `main` del repositorio
`mirurecetas.github.io` y activar GitHub Pages: Deploy from a branch, main, /(root).
Crear la rama y PR de publicación en ese repositorio una vez inicializado.
Los cambios de la web seguirán publicándose en `menu-anual-recetas`.

La redirección con JavaScript conserva parámetros y fragmento; el reemplazo del
historial evita un bucle con el botón Atrás. Sin JavaScript existe meta refresh
y un enlace explícito. El destino es fijo y nunca depende de parámetros del usuario.
