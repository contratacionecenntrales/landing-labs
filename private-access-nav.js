// Añade el enlace "Acceso privado" al menú principal en todas las páginas.
//
// Se inyecta en tiempo de ejecución (después de que React hidrate el header)
// en lugar de editar el HTML exportado directamente: este sitio es un
// export estático de Next.js y el header se hidrata con React — un enlace
// añadido a mano en el HTML fuente es descartado por React al hidratar
// (mismatch de hidratación). Añadirlo por JS después de la carga evita
// ese problema y el enlace se integra con el mismo estilo que el resto
// del menú, tanto en escritorio como en el menú móvil.
(function () {
  function inject() {
    var nav = document.getElementById('nav');
    if (!nav || document.getElementById('login-nav-link')) return;
    var link = document.createElement('a');
    link.id = 'login-nav-link';
    link.href = '/acceso/';
    link.textContent = 'Acceso privado';
    nav.appendChild(link);
  }

  if (document.readyState === 'complete') {
    setTimeout(inject, 50);
  } else {
    window.addEventListener('load', function () {
      setTimeout(inject, 50);
    });
  }
})();
