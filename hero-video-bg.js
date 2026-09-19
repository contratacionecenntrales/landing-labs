// Añade un vídeo de fondo animado a la sección hero de la home, para hacerla
// más impactante visualmente.
//
// Igual que private-access-nav.js, se inyecta en tiempo de ejecución
// (después de que React hidrate la página) en lugar de editar el HTML
// exportado directamente: este sitio es un export estático de Next.js y el
// vídeo no forma parte del árbol que React espera renderizar, así que
// añadirlo a mano en el HTML fuente sería descartado por React al hidratar
// (mismatch de hidratación). Insertarlo por JS después de la carga evita
// ese problema.
//
// Respeta prefers-reduced-motion y conexiones con ahorro de datos: en esos
// casos se usa la imagen de póster como fondo estático en vez del vídeo.
(function () {
  var VIDEO_SRC = '/videos/hero-bg.mp4';
  var POSTER_SRC = '/videos/hero-bg-poster.jpg';

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function isSaveData() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    if (c.saveData) return true;
    return /^(slow-2g|2g)$/.test(c.effectiveType || '');
  }

  function ensureStyles() {
    if (document.getElementById('hero-video-bg-styles')) return;
    var style = document.createElement('style');
    style.id = 'hero-video-bg-styles';
    style.textContent =
      '.hero__video-bg,.hero__video-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}' +
      '.hero__video-bg{opacity:0;transition:opacity .8s ease}' +
      '.hero__video-bg--ready{opacity:1}' +
      '.hero__video-overlay{position:absolute;inset:0;z-index:0;pointer-events:none;' +
      'background:linear-gradient(180deg,rgba(6,16,24,.68) 0%,rgba(6,16,24,.58) 40%,rgba(6,16,24,.85) 100%)}';
    document.head.appendChild(style);
  }

  function inject() {
    var hero = document.getElementById('top');
    if (!hero || !hero.classList.contains('hero') || document.getElementById('heroVideoBg') || document.getElementById('heroVideoPoster')) return;

    ensureStyles();

    var overlay = document.createElement('div');
    overlay.className = 'hero__video-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    if (prefersReducedMotion() || isSaveData()) {
      var img = document.createElement('img');
      img.id = 'heroVideoPoster';
      img.className = 'hero__video-poster';
      img.src = POSTER_SRC;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      hero.insertBefore(overlay, hero.firstChild);
      hero.insertBefore(img, hero.firstChild);
      return;
    }

    var video = document.createElement('video');
    video.id = 'heroVideoBg';
    video.className = 'hero__video-bg';
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    video.poster = POSTER_SRC;
    video.setAttribute('aria-hidden', 'true');

    var source = document.createElement('source');
    source.src = VIDEO_SRC;
    source.type = 'video/mp4';
    video.appendChild(source);

    hero.insertBefore(overlay, hero.firstChild);
    hero.insertBefore(video, hero.firstChild);

    // Fade-in disparado por la inserción (no por 'canplay'): el póster ya
    // es el primer fotograma del vídeo, así que el corte poster->vídeo es
    // imperceptible, y no depende del tiempo de buffering en redes lentas.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        video.classList.add('hero__video-bg--ready');
      });
    });

    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(inject, 50);
  } else {
    window.addEventListener('load', function () {
      setTimeout(inject, 50);
    });
  }
})();
