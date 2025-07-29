const url = 'http://localhost:8080/StockControl_API/api/';

export const get = async (endpoint) => {
  
  const respuesta = await fetch(url + endpoint);
  const datos = await respuesta.json();  
  return datos;

}


export const post = async (endpoint, objeto) => {
  const respuesta = await fetch(url + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(objeto)
  });
  const datos = await respuesta.json();  
  return datos;
}

export const put = async (endpoint, objeto) => {
  const respuesta = await fetch(url + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(objeto)
  });
  const datos = await respuesta.json();
  return datos;
}

export const del = async (endpoint) => {
  const respuesta = await fetch(url + endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const datos = await respuesta.json();
  return datos;
}