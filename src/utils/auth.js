import { get } from "./api";

/**
 * Verifica si el usuario está autenticado correctamente
 * Maneja automáticamente la renovación de tokens expirados
 * 
 * @returns {Promise<boolean>} true si está autenticado, false en caso contrario
 */
export const isAuth = async () => {
  try {
    // Realiza petición al endpoint protegido para verificar autenticación
    let response = await get("auth/protected");

    // Verifica si fue exitoso
    if (response.success) return true;

    // Maneja caso de token expirado
    if (response.authError === "TOKEN_EXPIRED") {
      
      // Intenta renovar el token automáticamente
      const refresh = await refreshToken();
      if (!refresh) return false;
      
      // Reintenta la verificación con el nuevo token
      response = await get("auth/protected");
      return response.success;
    }

    // Maneja caso de token inválido
    if (response.authError === "TOKEN_INVALID") {
      console.warn("Token inválido.");
      return false;
    }

    // Maneja caso de token faltante
    if (response.authError === "TOKEN_MISSING") {
      console.warn("Token no proporcionado.");
      return false;
    }

    // Maneja errores de autenticación no contemplados
    console.warn("Error de autenticación no manejado:", response);
    return false;
  } catch (error) {
    // Captura y registra errores de red o del sistema
    console.error("Error al verificar autenticación:", error);
    return false;
  }
};

/**
 * Intenta renovar el token de autenticación usando el refresh token
 * 
 * @returns {Promise<boolean>} true si la renovación fue exitosa, false en caso contrario
 */
const refreshToken = async () => {
  // Realiza petición para renovar el token
  const response = await get("auth/refresh");
  
  // Registra error si la renovación falla
  if (!response.success) console.error("Error al renovar token:", error);
  
  // Retorna el resultado de la operación
  return response.success;
};