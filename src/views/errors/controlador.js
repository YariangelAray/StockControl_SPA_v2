export default async () => {
  const header = document.querySelector('.header__title');
  if (header) {
    header.innerHTML = '...';
  } else {
    document.querySelector('#app-main').className = 'home home--error';
  }
}