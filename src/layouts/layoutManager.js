export const cargarLayout = async (type) => {
  // Cargar archivo de layout
  const res = await fetch(`/layouts/${type}Layout.html`);
  const layoutHTML = await res.text();
  const body = document.querySelector('body');
  body.innerHTML = layoutHTML;

  // Si es private, cargar header y aside
  if (type === "private") {
    await cargarComponentes("#app-header", "/components/header/header.html");
    await cargarComponentes("#app-aside", "/components/header/aside.html");
    body.classList.remove('content--auth');
    body.classList.add('content--ui');
  } else {
    body.classList.remove('content--ui');
    body.classList.add('content--auth');
  }
}

const cargarComponentes = async (selector, path) => {
  const res = await fetch(path);
  const html = await res.text();
  document.querySelector(selector).innerHTML = html;
}
