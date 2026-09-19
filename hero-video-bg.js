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
(function () {
  var VIDEO_SRC = '/videos/hero-bg.mp4';
  var POSTER_SRC = '/videos/hero-bg-poster.jpg';

  function inject() {
    var hero = document.getElementById('top');
    if (!hero || !hero.classList.contains('hero') || document.getElementById('heroVideoBg')) return;

    if (!document.getElementById('hero-video-bg-styles')) {
      var style = document.createElement('style');
      style.id = 'hero-video-bg-styles';
      style.textContent =
        '.hero__video-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}' +
        '.hero__video-overlay{position:absolute;inset:0;z-index:0;pointer-events:none;' +
        'background:linear-gradient(180deg,rgba(6,16,24,.68) 0%,rgba(6,16,24,.58) 40%,rgba(6,16,24,.85) 100%)}';
      document.head.appendChild(style);
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

    var overlay = document.createElement('div');
    overlay.className = 'hero__video-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    hero.insertBefore(overlay, hero.firstChild);
    hero.insertBefore(video, hero.firstChild);

    video.play().catch(function () {});
  }

  if (document.readyState === 'complete') {
    setTimeout(inject, 50);
  } else {
    window.addEventListener('load', function () {
      setTimeout(inject, 50);
    });
  }
})();
