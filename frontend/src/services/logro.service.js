import api from './api'

export const logroService = {
  // Obtener todos los logros del usuario
  getAll: () => api.get('/finanzas/logros'),

  // Obtener resumen de gamificación (puntos, nivel, progreso)
  getResumen: () => api.get('/finanzas/logros/resumen'),

  // Obtener historial de puntos
  getHistorialPuntos: () => api.get('/finanzas/logros/historial')
}
