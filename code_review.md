## Metodología de revisión

La revisión fue realizada manualmente y apoyada por discusiones técnicas adicionales para análisis y validación.

Estos 3 problemas son bloqueantes para producción: dos de ellos representan vulnerabilidades de seguridad explotables hoy, y el primero destruye la escalabilidad desde el primer día de uso real.

- La ausencia de autenticación/autorización no es un olvido menor: es una vulnerabilidad IDOR que expone datos personales de todos los clientes de la empresa a cualquier asesor o atacante externo.
- debug=True en producción equivale a dejar una consola root abierta al público.
- El patrón N+1 hace que el endpoint se vuelva inutilizable con carteras reales sin ningún cambio en el código del cliente.

Los tres siguientes son importantes pero no bloquean un MVP inicial con volumen bajo.

- Conexión a BD sin cerrar y sin pooling IMPORTANTE Calidad / Dominio
- Sin paginación IMPORTANTE Calidad / Dominio
- recommended_action hardcodeado IMPORTANTE Calidad / Dominio

Conversación de apoyo utilizada:

https://claude.ai/share/e889f0d0-6601-4886-9714-0a46dc961543

# Code Review — expired_policies.py

## Resumen Ejecutivo

Los tres problemas más críticos encontrados bloquean el paso a producción porque afectan **seguridad, escalabilidad y estabilidad**.

---

## 1. N+1 Queries (CRÍTICO)

### Problema

El endpoint ejecuta queries adicionales dentro de un bucle.  
Si existen muchas pólizas vencidas, el número de consultas crece linealmente.

```python
for policy in policies:
    cursor.execute(...)
    cursor.execute(...)
```

### Impacto

- Alta latencia
- Mala escalabilidad
- Bloqueos y timeouts con múltiples usuarios

### Solución

- Reemplazar queries repetidas por `JOIN`
- Agregar índices adecuados
- Reducir consultas a una sola operación SQL

---

## 2. Sin autenticación ni autorización (CRÍTICO)

### Problema

El `advisor_id` llega desde la URL sin validar identidad ni permisos.

```python
@app.route('/advisors/<advisor_id>/expired-policies')
def list_expired_policies(advisor_id):
```

### Impacto

- Cualquier usuario podría consultar datos de otros asesores
- Exposición de datos sensibles
- Vulnerabilidad tipo IDOR (OWASP)

### Solución

- Agregar autenticación (JWT / sesiones)
- Validar permisos antes de retornar información
- Limitar acceso únicamente a recursos propios

---

## 3. debug=True en producción (CRÍTICO)

### Problema

La aplicación corre con:

```python
app.run(debug=True)
```

### Impacto

- Exposición de consola interactiva
- Posible ejecución remota de código
- Riesgo de compromiso total del servidor

### Solución

- Eliminar `debug=True` en producción
- Ejecutar usando un servidor WSGI (ej. Gunicorn)
- Activar debug únicamente en desarrollo

---

# Conclusión

El endpoint funciona funcionalmente, pero estos tres problemas impiden un despliegue seguro:

1. Falta de autenticación → expone datos sensibles
2. `debug=True` → riesgo de ejecución remota
3. N+1 Queries → mala escalabilidad

Corregir estos puntos debería ser prioritario antes de producción.
