document.body.addEventListener('click', (e) => {
  if (e.target.matches('.input.contrasena + .icon')) {
    const icono = e.target;
    const input = icono.previousElementSibling;

    if (!input || input.tagName !== 'INPUT') return;

    if (input.type === 'password') {
      input.type = 'text';
      icono.classList.replace('ri-eye-line', 'ri-eye-close-line');
    } else {
      input.type = 'password';
      icono.classList.replace('ri-eye-close-line', 'ri-eye-line');
    }
  }
});
