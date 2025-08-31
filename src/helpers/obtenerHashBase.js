export default () => {
  const seg = location.hash.slice(2).split('/').filter(Boolean);

  // Si último segmento es tipo "id=1"
  if (seg.length > 1 && seg[seg.length - 1].includes('=')) {
    seg.pop(); // quitar id=1
    seg.pop(); // quitar "detalles"
  } else {
    seg.pop(); // quitar solo el modal (crear, editar, etc.)
  }

  return '#/' + seg.join('/');
};
