/**
 * Verifica si un permiso requerido está presente en la lista de permisos del usuario
 * Soporta permisos específicos y permisos de grupo con wildcard (.*)
 * 
 * @param {string} requerido - El permiso que se requiere verificar
 * @param {string[]} permisos - Array de permisos asignados al usuario
 * @returns {boolean} true si el permiso está presente, false en caso contrario
 */
export default (requerido, permisos) => {
    // Verifica cada permiso asignado al usuario
    return permisos.some(asignado => {
        // Coincidencia exacta del permiso
        if (asignado === requerido) return true;
        
        // Verifica permisos de grupo con wildcard (.*)
        if (asignado.endsWith(".*")) {
            // Extrae la base del permiso removiendo el wildcard
            const base = asignado.replace(".*", "");
            
            // Verifica si el permiso requerido pertenece al grupo
            // Ejemplo: "usuario.*" permite "usuario.create", "usuario.update", etc.
            return requerido.startsWith(base + ".");
        }
        
        // No hay coincidencia
        return false;
    });
};