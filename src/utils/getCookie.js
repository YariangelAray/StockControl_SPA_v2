/**
 * Obtiene el valor de una cookie específica por su nombre
 * Retorna el valor parseado como JSON o el valor por defecto si no existe
 * 
 * @param {string} nombre - El nombre de la cookie a buscar
 * @param {*} defaultValue - Valor por defecto a retornar si la cookie no existe (default: null)
 * @returns {*} El valor de la cookie parseado como JSON, o el valor crudo si falla el parsing, o defaultValue si no existe
 */
export default (nombre, defaultValue = null) => {
  // Verifica si existen cookies en el documento
  if (!document.cookie) return defaultValue;

  // Divide todas las cookies por el separador '; '
  const cookies = document.cookie.split('; ');

  // Itera sobre cada cookie para encontrar la solicitada
  for (const cookie of cookies) {
    // Separa el nombre y valor de la cookie por '='
    const [key, value] = cookie.split('=');
    
    // Si encuentra la cookie solicitada
    if (key === nombre) {
      try {
        // Decodifica caracteres especiales y parsea como JSON
        return JSON.parse(decodeURIComponent(value));
      } catch (error) {
        // Si falla el parsing JSON, retorna el valor crudo decodificado
        console.warn(`Error parsing cookie ${nombre}:`, error);
        return decodeURIComponent(value);
      }
    }
  }

  // Retorna valor por defecto si la cookie no se encontró
  return defaultValue;
};