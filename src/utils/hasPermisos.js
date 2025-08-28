export const hasPermisos = (requerido, permisos) => {
    return permisos.some(asignado => {
        if (asignado == requerido) return true;
        if (asignado.endsWith(".*")){
            const base = asignado.replace(".*", "");
            return requerido.startsWith(base + ".");
        }
        return false;
    })
}