/**
 * Obtiene el hash base de la URL eliminando segmentos de modal o parámetros
 * Útil para navegar de vuelta al listado principal desde modales o vistas detalle
 * 
 * @returns {string} Hash base sin modal ni parámetros (ej: '#/inventarios/elementos')
 */
export default () => {
  // Obtiene segmentos de la URL actual eliminando '#/' inicial y segmentos vacíos
  const seg = location.hash.slice(2).split('/').filter(Boolean);

  // Caso 1: Si último segmento contiene parámetros tipo "id=1"
  if (seg.length > 1 && seg[seg.length - 1].includes('=')) {
    seg.pop(); // Quita el segmento con parámetros (ej: "id=1&nombre=Ambiente")
    seg.pop(); // Quita el segmento de acción (ej: "detalles")
  } else {
    // Caso 2: Solo hay un modal sin parámetros
    seg.pop(); // Quita únicamente el modal (crear, editar, etc.)
  }

  // Reconstruye el hash base con los segmentos restantes
  return '#/' + seg.join('/');
};