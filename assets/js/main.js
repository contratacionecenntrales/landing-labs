// Labs24k — validación del formulario de captura + envío a Formspree.
//
// CONFIGURA AQUÍ tu endpoint de Formspree (o el servicio que uses):
// 1. Crea un formulario en https://formspree.io
// 2. Sustituye 'YOUR_FORM_ID' por el ID que te den.
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById("lead-form");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const emailConfirmInput = document.getElementById("email-confirm");
  const submitBtn = document.getElementById("submit-btn");
  const statusEl = document.getElementById("form-status");

  const errors = {
    name: document.getElementById("error-name"),
    email: document.getElementById("error-email"),
    emailConfirm: document.getElementById("error-email-confirm"),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(input, errorEl, hasError) {
    input.classList.toggle("invalid", hasError);
    errorEl.classList.toggle("visible", hasError);
  }

  function validate() {
    let valid = true;

    const nameValid = nameInput.value.trim().length > 0;
    setFieldError(nameInput, errors.name, !nameValid);
    if (!nameValid) valid = false;

    const emailValid = emailPattern.test(emailInput.value.trim());
    setFieldError(emailInput, errors.email, !emailValid);
    if (!emailValid) valid = false;

    const emailsMatch = emailValid && emailInput.value.trim().toLowerCase() === emailConfirmInput.value.trim().toLowerCase();
    setFieldError(emailConfirmInput, errors.emailConfirm, !emailsMatch);
    if (!emailsMatch) valid = false;

    return valid;
  }

  function showStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.add("visible");
    statusEl.classList.toggle("error", isError);
  }

  [nameInput, emailInput, emailConfirmInput].forEach((input) => {
    input.addEventListener("blur", validate);
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) validate();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validate()) return;

    // Honeypot anti-spam: si un bot rellena este campo oculto, abortamos en silencio.
    if (form._gotcha.value) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "ENVIANDO...";

    if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) {
      // Endpoint no configurado todavía: seguimos al paso siguiente del embudo
      // para poder probar el diseño sin backend real.
      window.location.href = "gracias.html";
      return;
    }

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (response.ok) {
        window.location.href = "gracias.html";
      } else {
        throw new Error("Formspree respondió con error");
      }
    } catch (err) {
      showStatus("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.", true);
      submitBtn.disabled = false;
      submitBtn.textContent = "QUIERO LOS 7 KITS GRATIS";
    }
  });
});
