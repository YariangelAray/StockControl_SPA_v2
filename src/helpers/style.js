/**
 * Controla el evento click en el documento para alternar la visibilidad de campos de contraseña.
 * 
 * Cuando se hace click en un ícono adyacente a un input con clase 'contrasena',
 * cambia el tipo del input entre 'password' y 'text' para mostrar u ocultar la contraseña,
 * y actualiza la clase del ícono para reflejar el estado.
 */
document.body.addEventListener('click', (e) => {
  // Verifica si el elemento clickeado es un ícono que sigue a un input con clases 'input contrasena'
  if (e.target.matches('.input.contrasena + .icon')) {
    const icono = e.target;
    // Obtiene el input anterior al ícono (el campo de contraseña)
    const input = icono.previousElementSibling;

    // Si no existe el input o no es un elemento INPUT, termina la función
    if (!input || input.tagName !== 'INPUT') return;

    // Alterna el tipo del input entre 'password' y 'text' para mostrar u ocultar la contraseña
    if (input.type === 'password') {
      input.type = 'text';
      // Cambia la clase del ícono para indicar que la contraseña está visible
      icono.classList.replace('ri-eye-line', 'ri-eye-close-line');
    } else {
      input.type = 'password';
      // Cambia la clase del ícono para indicar que la contraseña está oculta
      icono.classList.replace('ri-eye-close-line', 'ri-eye-line');
    }
  }
});
