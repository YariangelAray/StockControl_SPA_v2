export default async () => {
  // Referencia al elemento del título del header
  const header = document.querySelector('.header__title');  

  if (header) {
    // Si existe el header, cambia su contenido a '...'
    header.innerHTML = '...';
  } else {
    // Si no existe el header, cambia la clase del contenedor principal para mostrar la vista de error
    document.querySelector('#app-main').className = 'home home--error';
  }
};
