/*
  SEIS MESES A TU LADO ♡
  Cambia aquí los textos de las razones. Más adelante podemos adaptar
  toda la página con sus fotos y sus recuerdos reales.
*/
const RAZONES = [
  'Porque a tu lado puedo ser yo, sin miedo y sin filtros.',
  'Porque tienes esa manera tan tuya de sacarme una sonrisa.',
  'Porque hasta los momentos más sencillos contigo se vuelven especiales.',
  'Porque me escuchas, me acompañas y haces que me sienta querido.',
  'Porque a pesar de las peleas, siempre terminamos abrazados.',
  'Porque contigo quiero seguir viviendo primeras veces y nuevas aventuras.',
  'Porque estos seis meses me han regalado recuerdos que nunca cambiaría.',
  'Porque si tuviera que elegir de nuevo, volvería a elegirte a ti. ♡'
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let toastTimer;

function notify(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}

// Guarda fotos y música en ESTE navegador, incluso si actualizas la página.
// Al publicar la web para otra persona, las fotos deberán estar incluidas
// en el proyecto: los archivos guardados localmente no se comparten.
const DATABASE = 'recuerdos-medio-ano-v1';
let dbPromise;
function openDatabase() {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise(resolve => {
    try {
      const req = indexedDB.open(DATABASE, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbPromise;
}
async function getSaved(key) {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise(resolve => {
    try {
      const tx = db.transaction('assets', 'readonly');
      const request = tx.objectStore('assets').get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
async function saveAsset(key, value) {
  const db = await openDatabase();
  if (!db) return false;
  return new Promise(resolve => {
    try {
      const tx = db.transaction('assets', 'readwrite');
      tx.objectStore('assets').put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch { resolve(false); }
  });
}

async function deleteAsset(key) {
  const db = await openDatabase();
  if (!db) return false;
  return new Promise(resolve => {
    try {
      const tx = db.transaction('assets', 'readwrite');
      tx.objectStore('assets').delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch { resolve(false); }
  });
}

const objectURLs = new Map();
function setObjectURL(key, fileOrBlob) {
  if (objectURLs.has(key)) URL.revokeObjectURL(objectURLs.get(key));
  const url = URL.createObjectURL(fileOrBlob);
  objectURLs.set(key, url);
  return url;
}
function isPhoto(file) { return file && file.type.startsWith('image/'); }
function isMusic(file) { return file && (file.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|aac)$/i.test(file.name)); }
function resolveMediaSource(key, fileOrUrl) {
  return (typeof fileOrUrl === 'string') ? fileOrUrl : setObjectURL(key, fileOrUrl);
}
async function persistMedia(key, file) {
  const saved = await saveAsset(key, { blob: file, name: file.name, type: file.type });
  if (!saved) notify('Se muestra el archivo, pero no se pudo guardar en este navegador.');
}

const DEFAULT_MEDIA = {
  hero: 'assets/photos/hero.jpg',
  historia: 'assets/photos/story.jpg',
  gallery: [
    'assets/photos/moment-01.jpg',
    'assets/photos/moment-02.jpg',
    'assets/photos/moment-03.jpg',
    'assets/photos/moment-04.jpg',
    'assets/photos/moment-05.jpg',
    'assets/photos/moment-06.jpg',
    'assets/photos/moment-07.jpg',
    'assets/photos/moment-08.jpg',
    'assets/photos/moment-09.jpg',
    'assets/photos/moment-10.jpg',
    'assets/photos/moment-11.jpg',
  ],
  surprise: ['assets/photos/surprise-1.jpg', 'assets/photos/surprise-2.jpg']
};


// Foto de portada
function renderHeroPhoto(blob) {
  $('#hero-image').src = resolveMediaSource('hero', blob);
  $('#hero-empty').hidden = true;
  $('#hero-filled').hidden = false;
}
$('#hero-input').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!isPhoto(file)) return notify('Selecciona un archivo de imagen.');
  renderHeroPhoto(file);
  await persistMedia('hero', file);
  notify('¡Tu fotografía principal ya está aquí! ♡');
  event.target.value = '';
});

// Foto de la historia
function renderStoryPhoto(blob) {
  const img = document.createElement('img');
  img.alt = 'Nuestra historia en una fotografía';
  img.src = resolveMediaSource('historia', blob);
  $('#story-photo-box').replaceChildren(img);
}
$('#story-input').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!isPhoto(file)) return notify('Selecciona un archivo de imagen.');
  renderStoryPhoto(file);
  await persistMedia('historia', file);
  notify('¡Qué bonito recuerdo! ♡');
  event.target.value = '';
});

// Reproductor y playlist: 5 canciones incluidas localmente y pistas adicionales
// que el usuario añada en su propio navegador mediante IndexedDB.
const audio = $('#music-audio');
const playButton = $('#play-button');
const progress = $('#song-progress');
const loopButton = $('#loop-button');
const playlistList = $('#playlist-list');
const MAX_SONGS = 40;
const DEFAULT_PLAYLIST = [
  { name: 'The Neighbourhood — Compass', url: 'assets/music/01-compass.mp3' },
  { name: 'Águilas de América — No Me Olvides', url: 'assets/music/02-no-me-olvides.mp3' },
  { name: 'Selena Gomez — Who Says', url: 'assets/music/03-who-says.mp3' },
  { name: 'Selena Gomez — Love You Like a Love Song', url: 'assets/music/04-love-you-like-a-love-song.mp3' },
  { name: 'Zaperoko — Tú y Yo', url: 'assets/music/05-tu-y-yo-zaperoko.mp3' },
];
let playlist = []; // { name, url, blob? }
let currentTrack = -1;
let repeatPlaylist = false;
function setPlayIcon(isPlaying) {
  playButton.querySelector('use').setAttribute('href', isPlaying ? '#i-pause' : '#i-play');
  playButton.setAttribute('aria-label', isPlaying ? 'Pausar canción' : 'Reproducir canción');
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  return `${min}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
function renderPlaylist() {
  playlistList.replaceChildren();
  $('#playlist-empty').hidden = playlist.length > 0;
  $('#track-count').textContent = playlist.length ? `${playlist.length} ${playlist.length === 1 ? 'canción' : 'canciones'} en la lista` : 'Todavía no hay canciones';
  $('#previous-track').disabled = playlist.length === 0;
  $('#next-track').disabled = playlist.length === 0;
  playButton.disabled = playlist.length === 0;
  progress.disabled = playlist.length === 0;
  playlist.forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = index === currentTrack ? 'playlist-row selected' : 'playlist-row';
    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'playlist-select';
    select.textContent = `${index === currentTrack ? '♫' : String(index + 1).padStart(2, '0')}  ${entry.name.replace(/\.[^.]+$/, '')}`;
    select.setAttribute('aria-label', `Escuchar canción ${index + 1}: ${entry.name}`);
    select.addEventListener('click', () => selectTrack(index, true));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'playlist-delete';
    remove.setAttribute('aria-label', `Eliminar canción ${entry.name}`);
    remove.textContent = '×';
    remove.hidden = !entry.blob; // Las 5 canciones de la sorpresa son fijas.
    if (entry.blob) remove.addEventListener('click', () => removeTrack(index));
    li.append(select, remove);
    playlistList.appendChild(li);
  });
}
function selectTrack(index, shouldPlay = false) {
  if (index < 0 || index >= playlist.length) return;
  audio.pause();
  currentTrack = index;
  audio.src = playlist[index].url;
  audio.load();
  $('#song-title').textContent = playlist[index].name.replace(/\.[^.]+$/, '') || 'Nuestra canción ♡';
  $('#elapsed').textContent = '0:00';
  $('#duration').textContent = '0:00';
  progress.value = '0';
  setPlayIcon(false);
  renderPlaylist();
  if (shouldPlay) audio.play().catch(() => notify('Toca ▶ para reproducir la canción.'));
}
async function savePlaylistState() {
  await saveAsset('playlist-meta', { length: playlist.filter(item => item.blob).length, current: currentTrack });
}
async function addSongs(files) {
  const valid = [...files].filter(isMusic).slice(0, Math.max(0, MAX_SONGS - playlist.length));
  if (!valid.length) return notify('Selecciona archivos MP3, M4A, WAV u OGG.');
  const wasEmpty = playlist.length === 0;
  for (const file of valid) {
    const key = `playlist-${playlist.filter(item => item.blob).length}`;
    playlist.push({ name: file.name, blob: file, url: setObjectURL(key, file) });
    await persistMedia(key, file);
  }
  if (wasEmpty) selectTrack(0, false);
  await savePlaylistState();
  renderPlaylist();
  notify(`${valid.length} ${valid.length === 1 ? 'canción agregada' : 'canciones agregadas'} ♡`);
  if (valid.length < files.length) notify(`Se admiten hasta ${MAX_SONGS} canciones.`);
}
async function removeTrack(index) {
  if (index < 0 || index >= playlist.length || !playlist[index].blob) return;
  const wasPlaying = !audio.paused;
  const previousTrack = currentTrack;
  const remaining = playlist.filter((_, i) => i !== index);
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  const uploads = remaining.filter(item => item.blob);
  for (let i = 0; i < MAX_SONGS; i++) {
    const key = `playlist-${i}`;
    if (objectURLs.has(key)) {
      URL.revokeObjectURL(objectURLs.get(key));
      objectURLs.delete(key);
    }
    await deleteAsset(key);
  }
  for (let i = 0; i < uploads.length; i++) {
    const key = `playlist-${i}`;
    uploads[i].url = setObjectURL(key, uploads[i].blob);
    await saveAsset(key, { blob: uploads[i].blob, name: uploads[i].name, type: uploads[i].blob.type });
  }
  playlist = remaining;
  currentTrack = -1;
  const nextIndex = Math.max(0, Math.min(playlist.length - 1, previousTrack > index ? previousTrack - 1 : previousTrack));
  selectTrack(nextIndex, wasPlaying);
  await savePlaylistState();
  notify('Canción eliminada de tu lista ♡');
}
function changeTrack(direction) {
  if (!playlist.length) return;
  selectTrack((currentTrack + direction + playlist.length) % playlist.length, true);
  savePlaylistState();
}
$('#music-input').addEventListener('change', async (event) => {
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  await addSongs(files);
  event.target.value = '';
});
playButton.addEventListener('click', async () => {
  if (currentTrack < 0) return;
  if (audio.paused) {
    try { await audio.play(); }
    catch { notify('No se pudo reproducir el audio. Prueba con un MP3.'); }
  } else audio.pause();
});
audio.addEventListener('play', () => setPlayIcon(true));
audio.addEventListener('pause', () => setPlayIcon(false));
audio.addEventListener('ended', () => {
  if (currentTrack + 1 < playlist.length) changeTrack(1);
  else if (repeatPlaylist && playlist.length) selectTrack(0, true);
  else setPlayIcon(false);
});
audio.addEventListener('loadedmetadata', () => $('#duration').textContent = formatTime(audio.duration));
audio.addEventListener('timeupdate', () => {
  $('#elapsed').textContent = formatTime(audio.currentTime);
  progress.value = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.round((audio.currentTime / audio.duration) * 1000) : 0;
});
progress.addEventListener('input', () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
});
$('#previous-track').addEventListener('click', () => changeTrack(-1));
$('#next-track').addEventListener('click', () => changeTrack(1));
loopButton.addEventListener('click', () => {
  repeatPlaylist = !repeatPlaylist;
  loopButton.classList.toggle('is-active', repeatPlaylist);
  loopButton.setAttribute('aria-pressed', String(repeatPlaylist));
  loopButton.setAttribute('aria-label', repeatPlaylist ? 'Desactivar repetición de lista' : 'Repetir lista de canciones');
});
async function restorePlaylist() {
  // Las canciones del paquete siempre se muestran en el orden acordado.
  playlist = DEFAULT_PLAYLIST.map(item => ({ ...item }));
  const meta = await getSaved('playlist-meta');
  if (meta?.length) {
    for (let i = 0; i < Math.min(MAX_SONGS - playlist.length, meta.length); i++) {
      const saved = await getSaved(`playlist-${i}`);
      if (saved?.blob) playlist.push({
        name: saved.name || `Canción adicional ${i + 1}`,
        blob: saved.blob,
        url: setObjectURL(`playlist-${i}`, saved.blob)
      });
    }
  } else {
    // Compatibilidad con una canción agregada en la versión anterior.
    const oldSong = await getSaved('song');
    if (oldSong?.blob) {
      playlist.push({
        name: oldSong.name || 'Canción adicional',
        blob: oldSong.blob,
        url: setObjectURL('playlist-0', oldSong.blob)
      });
      await saveAsset('playlist-0', oldSong);
      await savePlaylistState();
    }
  }
  // Compass es siempre la pista inicial al abrir la página.
  selectTrack(0, false);
}

// Razones: muestra EXACTAMENTE una a la vez y avanza tocando la tarjeta.
function burstHearts() {
  const paper = $('.reasons-paper');
  if (!paper || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 8; i++) {
    const heart = document.createElement('span');
    heart.className = 'reason-burst';
    heart.textContent = i % 2 ? '✧' : '♡';
    heart.style.setProperty('--dx', `${(i - 3.5) * 29}px`);
    heart.style.setProperty('--dy', `${-65 - (i % 3) * 22}px`);
    heart.style.setProperty('--duration', `${650 + (i % 3) * 120}ms`);
    paper.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
  }
}
let reasonIndex = -1;
function showReason(index) {
  reasonIndex = index;
  $('#reason-intro').hidden = true;
  $('#reason-reveal').hidden = false;
  $('#reason-counter').textContent = `Razón ${index + 1} de ${RAZONES.length}`;
  $('#reason-number').textContent = String(index + 1).padStart(2, '0');
  $('#reason-text').textContent = RAZONES[index];
  burstHearts();
  const card = $('#next-reason');
  card.classList.remove('change-in');
  void card.offsetWidth;
  card.classList.add('change-in');
  const finished = index === RAZONES.length - 1;
  card.disabled = finished;
  card.classList.toggle('finished', finished);
  $('#reason-instruction').textContent = finished
    ? '♡ Y todavía me quedan miles de razones más para amarte ♡'
    : '♡ Presiona la razón para ver la siguiente ♡';
  $('#restart-reasons').hidden = !finished;
  $('#reason-dots').replaceChildren(...RAZONES.map((_, i) => {
    const dot = document.createElement('span');
    if (i === index) dot.classList.add('active');
    return dot;
  }));
}
$('#start-reasons').addEventListener('click', () => showReason(0));
$('#next-reason').addEventListener('click', () => {
  if (reasonIndex >= 0 && reasonIndex < RAZONES.length - 1) showReason(reasonIndex + 1);
});
$('#restart-reasons').addEventListener('click', () => showReason(0));

// Galería: 4 espacios vacíos y hasta 24 fotografías personales.
const DEFAULT_GALLERY_SLOTS = 4;
const MAX_GALLERY_SLOTS = 24;
let gallery = Array(DEFAULT_GALLERY_SLOTS).fill(null);
const galleryTrack = $('#gallery-track');
const replacePhotoInput = document.createElement('input');
replacePhotoInput.type = 'file';
replacePhotoInput.accept = 'image/*';
replacePhotoInput.className = 'visually-hidden';
replacePhotoInput.setAttribute('aria-label', 'Cambiar fotografía de este recuerdo');
document.body.appendChild(replacePhotoInput);
let editingPhotoIndex = null;
function updateGalleryDots() {
  const cards = $$('.polaroid-card');
  const total = cards.length;
  if (total === 0) return;
  const cardWidth = cards[0].getBoundingClientRect().width + 26;
  const active = Math.max(0, Math.min(total - 1, Math.round(galleryTrack.scrollLeft / cardWidth)));
  const wrapper = $('#gallery-dots');
  wrapper.replaceChildren(...Array.from({ length: Math.min(total, 12) }, (_, i) => {
    const dot = document.createElement('span');
    if (i === active || (total > 12 && i === Math.round(active / (total - 1) * 11))) dot.classList.add('active');
    return dot;
  }));
}
function renderGallery() {
  galleryTrack.replaceChildren();
  gallery.forEach((entry, i) => {
    const photoButton = document.createElement('button');
    photoButton.type = 'button';
    photoButton.className = 'polaroid-card';
    photoButton.style.setProperty('--tilt', `${[-5, 4, -3, 5, 2, -4][i % 6]}deg`);
    photoButton.setAttribute('aria-label', entry ? `Cambiar fotografía ${i + 1}` : `Agregar fotografía ${i + 1}`);
    const imageWrap = document.createElement('span');
    imageWrap.className = 'polaroid-image';
    if (entry) {
      const img = document.createElement('img');
      img.src = entry;
      img.alt = `Recuerdo especial ${i + 1}`;
      imageWrap.appendChild(img);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'gallery-placeholder';
      placeholder.innerHTML = '<svg><use href="#i-photo"/></svg><span>Agregar recuerdo</span>';
      imageWrap.appendChild(placeholder);
    }
    const caption = document.createElement('span');
    caption.className = 'polaroid-caption';
    caption.textContent = '♡';
    photoButton.append(imageWrap, caption);
    photoButton.addEventListener('click', () => {
      editingPhotoIndex = i;
      replacePhotoInput.click();
    });
    galleryTrack.appendChild(photoButton);
  });
  const count = gallery.filter(Boolean).length;
  $('#gallery-count').textContent = count === 0 ? 'Tus recuerdos empiezan aquí' : `${count} ${count === 1 ? 'recuerdo especial' : 'recuerdos especiales'} ♡`;
  updateGalleryDots();
}
async function addGalleryPhoto(file, index) {
  if (!isPhoto(file)) return;
  if (index >= MAX_GALLERY_SLOTS) return;
  while (gallery.length <= index) gallery.push(null);
  gallery[index] = resolveMediaSource(`gallery-${index}`, file);
  await persistMedia(`gallery-${index}`, file);
}
async function recordGalleryLength() {
  await saveAsset('gallery-length', { length: gallery.length });
}
$('#gallery-input').addEventListener('change', async (event) => {
  const images = [...(event.target.files || [])].filter(isPhoto);
  if (!images.length) return;
  let added = 0;
  for (const file of images) {
    let slot = gallery.findIndex(img => !img);
    if (slot < 0) slot = gallery.length;
    if (slot >= MAX_GALLERY_SLOTS) break;
    await addGalleryPhoto(file, slot);
    added++;
  }
  await recordGalleryLength();
  renderGallery();
  galleryTrack.scrollTo({ left: galleryTrack.scrollWidth, behavior: 'smooth' });
  notify(`${added} ${added === 1 ? 'recuerdo agregado' : 'recuerdos agregados'} ♡`);
  if (added < images.length) notify(`El máximo es de ${MAX_GALLERY_SLOTS} fotografías.`);
  event.target.value = '';
});
replacePhotoInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file || editingPhotoIndex === null) return;
  if (!isPhoto(file)) return notify('Selecciona un archivo de imagen.');
  await addGalleryPhoto(file, editingPhotoIndex);
  await recordGalleryLength();
  const left = galleryTrack.scrollLeft;
  renderGallery();
  galleryTrack.scrollLeft = left;
  notify('Fotografía añadida a tus recuerdos ♡');
  event.target.value = '';
});
$('#gallery-prev').addEventListener('click', () => galleryTrack.scrollBy({ left: -270, behavior: 'smooth' }));
$('#gallery-next').addEventListener('click', () => galleryTrack.scrollBy({ left: 270, behavior: 'smooth' }));
galleryTrack.addEventListener('scroll', updateGalleryDots, { passive: true });

// Sorpresa final: pregunta, primera foto y luego segunda foto a los 6 segundos.
const SURPRISE_MESSAGES = [
  'Así es como mi cámara te ve',
  'Así es como te miran mis ojos siempre'
];
let surpriseTimer;
let surprisePhotos = [null, null];
let surpriseStage = 0;
function renderSurprisePhoto(blob, index) {
  surprisePhotos[index] = resolveMediaSource(`surprise-${index + 1}`, blob);
  if ($('#surprise-reveal') && !$('#surprise-reveal').hidden && surpriseStage === index) applySurpriseStage(index);
}
function applySurpriseStage(index) {
  surpriseStage = index;
  const img = $('#surprise-image');
  const placeholder = $('#surprise-placeholder');
  const frame = $('#surprise-frame');
  frame.classList.remove('surprise-frame-switch');
  void frame.offsetWidth;
  frame.classList.add('surprise-frame-switch');
  const src = surprisePhotos[index];
  if (src) {
    img.hidden = false;
    img.src = src;
    placeholder.hidden = true;
  } else {
    img.hidden = true;
    img.removeAttribute('src');
    placeholder.hidden = false;
    placeholder.querySelector('strong').textContent = index === 0 ? 'Aquí irá la primera foto sorpresa' : 'Aquí irá la segunda foto sorpresa';
    placeholder.querySelector('span').textContent = index === 0 ? 'Sube la foto para “Así es como mi cámara te ve” ♡' : 'Sube la foto para “Así es como te miran mis ojos siempre” ♡';
  }
  $('#surprise-step').textContent = `${index + 1} de 2`;
  $('#surprise-message').textContent = SURPRISE_MESSAGES[index];
  $('#surprise-hint').textContent = index === 0
    ? 'En 6 segundos aparecerá la siguiente sorpresa ♡'
    : 'Y así es como te veo, siempre y para siempre ♡';
}
function startSurpriseSequence() {
  clearTimeout(surpriseTimer);
  $('#surprise-intro').hidden = true;
  $('#surprise-reveal').hidden = false;
  applySurpriseStage(0);
  surpriseTimer = setTimeout(() => applySurpriseStage(1), 6000);
}
$('#start-surprise').addEventListener('click', startSurpriseSequence);
$('#restart-surprise').addEventListener('click', startSurpriseSequence);
$('#surprise-input-1').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!isPhoto(file)) return notify('Selecciona un archivo de imagen.');
  renderSurprisePhoto(file, 0);
  await persistMedia('surprise-1', file);
  notify('Primera foto sorpresa guardada ♡');
  event.target.value = '';
});
$('#surprise-input-2').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!isPhoto(file)) return notify('Selecciona un archivo de imagen.');
  renderSurprisePhoto(file, 1);
  await persistMedia('surprise-2', file);
  notify('Segunda foto sorpresa guardada ♡');
  event.target.value = '';
});

// Carta desplegable al final de la página.
$('#open-letter').addEventListener('click', () => {
  $('#open-letter-sheet').hidden = false;
  $('.envelope-scene').classList.add('is-open');
  $('#open-letter').setAttribute('aria-expanded', 'true');
  $('#open-letter-sheet').scrollIntoView({ behavior: 'smooth', block: 'center' });
  $('#close-letter').focus({ preventScroll: true });
});
$('#close-letter').addEventListener('click', () => {
  $('#open-letter-sheet').hidden = true;
  $('.envelope-scene').classList.remove('is-open');
  $('#open-letter').setAttribute('aria-expanded', 'false');
  $('#open-letter').focus({ preventScroll: true });
});
$('#open-letter').setAttribute('aria-expanded', 'false');

// Animaciones de entrada al bajar; la barra superior sigue la sección.
function initScrollEffects() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  } else {
    document.documentElement.classList.add('js-ready');
    const appear = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    $$('.reveal').forEach(el => appear.observe(el));
  }
  const navLinks = $$('.nav-link');
  if ('IntersectionObserver' in window) {
    const activeSections = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-23% 0px -62% 0px', threshold: 0 });
    $$('main section[id]').forEach(section => activeSections.observe(section));
  }
  if (!reduced) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = Math.max(0, Math.min(window.scrollY, window.innerHeight));
        const lavender = $('.lavender-hero');
        if (lavender) lavender.style.translate = `0 ${Math.round(scrolled * .13)}px`;
        const polaroids = $('.side-polaroids');
        if (polaroids) polaroids.style.translate = `0 ${Math.round(scrolled * -.07)}px`;
        ticking = false;
      });
    }, { passive: true });
  }
}

async function restoreLocalFiles() {
  const hero = await getSaved('hero');
  if (hero?.blob) renderHeroPhoto(hero.blob);
  else renderHeroPhoto(DEFAULT_MEDIA.hero);

  const story = await getSaved('historia');
  if (story?.blob) renderStoryPhoto(story.blob);
  else renderStoryPhoto(DEFAULT_MEDIA.historia);

  await restorePlaylist();

  const meta = await getSaved('gallery-length');
  if (meta?.length) {
    gallery = Array(Math.min(MAX_GALLERY_SLOTS, Math.max(DEFAULT_GALLERY_SLOTS, meta.length))).fill(null);
    for (let i = 0; i < gallery.length; i++) {
      const saved = await getSaved(`gallery-${i}`);
      if (saved?.blob) gallery[i] = resolveMediaSource(`gallery-${i}`, saved.blob);
    }
  } else {
    gallery = DEFAULT_MEDIA.gallery.slice();
  }

  const surprise1 = await getSaved('surprise-1');
  if (surprise1?.blob) renderSurprisePhoto(surprise1.blob, 0);
  else renderSurprisePhoto(DEFAULT_MEDIA.surprise[0], 0);

  const surprise2 = await getSaved('surprise-2');
  if (surprise2?.blob) renderSurprisePhoto(surprise2.blob, 1);
  else renderSurprisePhoto(DEFAULT_MEDIA.surprise[1], 1);

  renderGallery();
}

renderGallery();
initScrollEffects();
restoreLocalFiles().catch(() => renderGallery());
window.addEventListener('pagehide', () => { for (const url of objectURLs.values()) URL.revokeObjectURL(url); });
