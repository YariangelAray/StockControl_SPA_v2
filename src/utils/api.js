const url = 'http://localhost:3000/stockcontrol_api/';

export const get = async (endpoint) => {
  try {
    const respuesta = await fetch(url + endpoint,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );   
    return await respuesta.json();
  } catch (error) {
    console.warn(error);
  }
}

export const post = async (endpoint, objeto) => {
  try {
    const respuesta = await fetch(url + endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objeto)
    });
    return await respuesta.json();  
  } catch (error) {
    console.warn(error);
  }
}

export const put = async (endpoint, objeto) => {
  try {
    const respuesta = await fetch(url + endpoint, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objeto)
    });
    return await respuesta.json();
  } catch (error) {
    console.warn(error);
  }
}

export const del = async (endpoint) => {
  try {
    const respuesta = await fetch(url + endpoint, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await respuesta.json();
  } catch (error) {
    console.warn(error);
  }
}