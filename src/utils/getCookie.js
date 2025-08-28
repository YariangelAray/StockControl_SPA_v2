export default (nombre, defaultValue = null) => {
  // Si no hay cookies
  if (!document.cookie) return defaultValue;

  const cookies = document.cookie.split('; ');

  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === nombre) {
      return JSON.parse(decodeURIComponent(value));
    }
  }

  // Si no se encontró la cookie
  return defaultValue;
};
