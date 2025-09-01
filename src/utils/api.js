/**
 * Cliente HTTP para la API de StockControl
 * Maneja peticiones GET, POST, PUT, PATCH y DELETE
 */

// URL base de la API
const url = 'http://localhost:3000/stockcontrol_api/';

/**
 * Estructura de respuesta por defecto para errores
 * Se retorna cuando hay errores de conexión o problemas técnicos
 */
const defaultErrorResponse = {
  success: false,
  message: 'Error de conexión con el servidor',
  data: null,
  errors: {},
  authError: null
};

/**
 * Maneja errores de red y respuestas HTTP
 * @param {Response} response - Objeto Response de fetch
 * @param {Error} networkError - Error de red si existe
 * @returns {Object} Respuesta formateada según la estructura de la API
 */
const handleError = async (response = null, networkError = null) => {
  // Si hay un error de red
  if (networkError) {
    console.warn('❌ Error de red:', networkError.message);
    return {
      ...defaultErrorResponse,
      message: `Error de conexión: ${networkError.message}`
    };
  }

  // Si hay respuesta pero el status no es exitoso (400, 500, etc.)
  if (response && !response.ok) {    
    try {
      // Intenta parsear la respuesta como JSON por si contiene información del error
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || `Error del servidor: ${response.status}`,
        data: null,
        errors: errorData.errors || {},
        authError: errorData.authError || null
      };
    } catch (parseError) {
      // Si no se puede parsear como JSON, retorna error genérico
      return {
        ...defaultErrorResponse,
        message: `Error del servidor: ${response.status} - ${response.statusText}`
      };
    }
  }

  // Error desconocido
  return defaultErrorResponse;
};

/**
 * Realiza peticiones GET al servidor
 * @param {string} endpoint - Endpoint de la API (sin la URL base)
 * @returns {Promise<Object>} Respuesta de la API con estructura estándar
 */
export const get = async (endpoint) => {
  try {
    // Realiza la petición GET con credenciales incluidas
    const respuesta = await fetch(url + endpoint, {
      method: 'GET',
      credentials: 'include', // Incluye cookies de sesión/autenticación
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Verifica si la respuesta HTTP es exitosa (status 200-299)
    if (!respuesta.ok) {
      return await handleError(respuesta);
    }

    // Parsea y retorna la respuesta JSON
    const data = await respuesta.json();    
    return data;

  } catch (error) {
    // Captura errores de red, parsing JSON, etc.
    return await handleError(null, error);
  }
};

/**
 * Realiza peticiones POST al servidor
 * @param {string} endpoint - Endpoint de la API
 * @param {Object|FormData} body - Datos a enviar (objeto JSON o FormData para archivos)
 * @returns {Promise<Object>} Respuesta de la API con estructura estándar
 */
export const post = async (endpoint, body) => {
  try {
    // Detecta si el body es FormData (para envío de archivos)
    const isFormData = body instanceof FormData;
    
    // Configura headers apropiados según el tipo de contenido
    const headers = isFormData  ? {} // FormData establece automáticamente el Content-Type con boundary
      : { 'Content-Type': 'application/json' };

    // Realiza la petición POST
    const respuesta = await fetch(url + endpoint, {
      method: 'POST',
      credentials: 'include', // Incluye cookies de sesión/autenticación
      headers: headers,
      body: isFormData ? body : JSON.stringify(body) // Serializa solo si no es FormData
    });

    // Verifica si la respuesta HTTP es exitosa
    if (!respuesta.ok) {
      return await handleError(respuesta);
    }

    // Parsea y retorna la respuesta JSON
    const data = await respuesta.json();    
    return data;

  } catch (error) {
    // Captura errores de red, parsing JSON, etc.
    return await handleError(null, error);
  }
};

/**
 * Realiza peticiones PUT al servidor (actualización completa)
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} objeto - Datos completos del objeto a actualizar
 * @returns {Promise<Object>} Respuesta de la API con estructura estándar
 */
export const put = async (endpoint, objeto) => {
  try {
    // Realiza la petición PUT
    const respuesta = await fetch(url + endpoint, {
      method: 'PUT',
      credentials: 'include', // Incluye cookies de sesión/autenticación
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objeto) // Serializa el objeto a JSON
    });

    // Verifica si la respuesta HTTP es exitosa
    if (!respuesta.ok) {
      return await handleError(respuesta);
    }

    // Parsea y retorna la respuesta JSON
    const data = await respuesta.json();    
    return data;

  } catch (error) {
    // Captura errores de red, parsing JSON, etc.
    return await handleError(null, error);
  }
};

/**
 * Realiza peticiones PATCH al servidor (actualización parcial)
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} objeto - Datos parciales a actualizar
 * @returns {Promise<Object>} Respuesta de la API con estructura estándar
 */
export const patch = async (endpoint, objeto) => {
  try {
    // Realiza la petición PATCH
    const respuesta = await fetch(url + endpoint, {
      method: 'PATCH',
      credentials: 'include', // Incluye cookies de sesión/autenticación
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objeto) // Serializa el objeto a JSON
    });

    // Verifica si la respuesta HTTP es exitosa
    if (!respuesta.ok) {
      return await handleError(respuesta);
    }

    // Parsea y retorna la respuesta JSON
    const data = await respuesta.json();
    console.log(`✅ PATCH ${endpoint} exitoso`);
    return data;

  } catch (error) {
    // Captura errores de red, parsing JSON, etc.
    return await handleError(null, error);
  }
};

/**
 * Realiza peticiones DELETE al servidor
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<Object>} Respuesta de la API con estructura estándar
 */
export const del = async (endpoint) => {
  try {
    // Realiza la petición DELETE
    const respuesta = await fetch(url + endpoint, {
      method: 'DELETE',
      credentials: 'include', // Incluye cookies de sesión/autenticación
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Verifica si la respuesta HTTP es exitosa
    if (!respuesta.ok) {
      return await handleError(respuesta);
    }

    // Parsea y retorna la respuesta JSON
    const data = await respuesta.json();    
    return data;

  } catch (error) {
    // Captura errores de red, parsing JSON, etc.
    return await handleError(null, error);
  }
};