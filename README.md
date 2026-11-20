# 6 meses a tu lado ♡ — página web romántica

Una web de aniversario en **HTML, CSS y JavaScript**, sin necesidad de instalar librerías. Preparada para abrir en **Visual Studio Code**.

## Abrirla en Visual Studio Code

1. Descomprime `medio-ano-web.zip`.
2. En VS Code elige **Archivo → Abrir carpeta** y selecciona `medio-ano-web`.
3. Abre `index.html` y ejecútalo con la extensión **Live Server** (clic derecho → **Open with Live Server**). Si no tienes esa extensión, puedes abrir `index.html` en Chrome, aunque para guardar archivos es más fiable Live Server.
4. Verás la página en tu navegador. Puedes probarla en el teléfono si usas una dirección HTTP accesible desde tu red, o cuando se publique.

## Funciones implementadas

- **Inicio:** foto principal seleccionable y reproductor con lista de hasta 40 canciones. Presiona **Añadir canciones**, selecciona varios audios MP3, M4A, WAV u OGG, cambia de canción desde la playlist y usa anterior/siguiente. La reproducción pasa automáticamente a la próxima canción. Puedes eliminar canciones; el botón de repetición reinicia la lista al terminar. Por las reglas de los navegadores, el sonido no empieza sin interacción.
- **Nuestra historia:** sección con tarjetas cronológicas y una fotografía personal seleccionable.
- **Razones:** pulsa **«¿Quieres ver las razones por las que te amo?»**, después pulsa la razón que aparezca para ver la siguiente; las ocho razones se muestran de una en una. En la última puedes volver a empezar.
- **Momentos especiales:** haz clic en **«Agregar fotos»** o en cualquier Polaroid vacía. Hay 4 espacios iniciales y se admiten hasta 24 fotos. Puedes cambiar cualquier fotografía pulsándola y deslizar la galería con las flechas.
- **Sorpresa después de momentos especiales:** botón «¿Quieres ver algo increíble?», primera foto con «Así es como mi cámara te ve» y, tras 6 segundos, segunda foto con «Así es como te miran mis ojos siempre». Puedes subir y guardar las dos imágenes en este navegador.
- **Cartita para ti:** pulsa **«Leer mi cartita»** para desplegarla, y ciérrala cuando quieras.
- **Animaciones:** entrada progresiva de tarjetas al desplazarte, detalles flotantes y movimiento ligero del decorado. Respeta la configuración de *reducir movimiento* del dispositivo.
- **Pantallas:** diseño adaptable a PC y celulares.

## Editar las razones y la carta

- Edita la lista `RAZONES` al principio de `app.js` (puedes añadir o quitar tantas como necesites).
- Edita el texto de la carta al final de `index.html`, dentro del elemento `id="letter-body"`.
- Cambia los textos del apartado **Nuestra historia** en `index.html`.

## Importante para compartir la página con tu pareja

Las fotografías y el audio que elijas desde los botones **se guardan únicamente en el navegador donde los subiste**, si el navegador permite el almacenamiento local. **No viajan automáticamente con el ZIP ni aparecerán en el teléfono de tu pareja**. Para la versión definitiva, envíame aquí tus fotos y el archivo de audio para integrarlos físicamente en el proyecto; así podrán verse y sonar al compartir o publicar la web. No subas música con derechos de autor a un sitio público sin tener permiso de uso.

Si abres la web en otro navegador, borras datos del sitio o cambias de dirección local, el contenido cargado podría no aparecer. Guarda copias de tus archivos originales.

## Subir a GitHub

Este proyecto está pensado para publicarse mediante GitHub Pages. **Ojo:** las imágenes y audios elegidos desde el navegador se guardan con IndexedDB en ese dispositivo, pero **no se añaden automáticamente al repositorio** ni son visibles para otros visitantes. Para una publicación definitiva con medios de ambos, intégralos como archivos del proyecto y comprueba que tienes derecho a distribuirlos.


## Fotos integradas
- Portada: selfie al aire libre.
- Nuestra historia: foto sentados con polos azules.
- Momentos especiales: 11 fotos cargadas en el orden indicado por el usuario.
- Sorpresa final: 2 fotos en orden para "Así es como mi cámara te ve" y luego "Así es como te miran mis ojos siempre".


## Nuestra playlist (versión local)
Las cinco canciones suministradas para uso local están dentro de `assets/music/` y se reproducen en este orden:

1. The Neighbourhood — Compass (primera pista al entrar)
2. Águilas de América — No Me Olvides
3. Selena Gomez — Who Says
4. Selena Gomez — Love You Like a Love Song
5. Zaperoko — Tú y Yo

Puedes añadir más canciones desde la interfaz; estas pistas adicionales se guardan en el navegador. Por las políticas de reproducción de los navegadores, el usuario debe tocar **Reproducir** para iniciar la primera canción.

**Sobre GitHub público:** los MP3 comerciales del paquete local no se deben subir al repositorio público sin los permisos correspondientes. Si se publica solo el código sin los archivos de `assets/music/`, las cinco canciones integradas no se escucharán; para compartir el regalo en línea se necesita música que tengas permiso de distribuir o un servicio con reproducción autorizada.
