# Cartera — Gestión de Pólizas de Seguros

Aplicación diseñada para reemplazar la gestión manual en Excel mediante una única pantalla donde el asesor puede visualizar su cartera, priorizar renovaciones, registrar seguimientos y mantener contexto comercial.

---

# 1. Cómo correrlo

## Requisitos

- Node.js instalado (Superior 22)
- npm instalado

## Setup (3 comandos)

```bash
# 1. Instalar dependencias y cargar datos iniciales
cd backend && npm install && npm run seed && cd ../frontend && npm install

# 2. Iniciar backend
cd backend && npm start

# 3. Iniciar frontend
cd frontend && npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3001
```

---

## Tests

```bash
cd backend && npm test
```

Se implementaron 14 tests sobre `calculatePolicyStatus`, considerada la lógica de negocio más crítica del sistema.

---

# 2. Decisiones de diseño y por qué

## Pantalla única orientada a operación

Se priorizó una única pantalla principal para minimizar navegación y facilitar el flujo diario del asesor.

Desde esta pantalla María puede:

- visualizar pólizas ordenadas por urgencia
- filtrar información rápidamente
- registrar actividades
- actualizar seguimiento
- renovar pólizas
- consultar historial

---

## Modelo de datos simple

```text
customer

1:N

policy

1:N

policy_activity
```

La póliza se definió como la unidad principal de trabajo.

---

## `policy_status` calculado dinámicamente

No se almacena.

Se calcula:

```text
expiration_date + today

↓

ACTIVE
EXPIRING_SOON
EXPIRED_RENEWABLE
LOST
```

Esto evita inconsistencias y duplicación de información.

---

## Separación entre negocio y seguimiento

El estado operativo y el estado comercial representan conceptos distintos.

Estado operativo:

```text
ACTIVE

EXPIRING_SOON

EXPIRED_RENEWABLE

LOST
```

Estado seguimiento:

```text
PENDING

ATTEMPTED

CONTACTED

WAITING_RESPONSE

COMPLETED
```

---

# 3. Qué dejé fuera y por qué

Se priorizó resolver el flujo principal antes que maximizar funcionalidades.

No se implementó:

- autenticación
- notificaciones automáticas
- dashboard con gráficas
- soporte multiusuario
- paginación
- scheduler/background jobs (tareas automáticas programadas)
- administración completa de clientes

La prioridad fue construir un MVP operativo y funcional.

---

# 4. Si esto fuera a producción mañana, qué le falta

Las siguientes mejoras serían prioritarias:

- autenticación y autorización
- auditoría y trazabilidad
- Base de datos
- validaciones más robustas
- Variables de entorno
- manejo centralizado de errores
- paginación
- Rate limiting y CORS restrictivo. Actualmente CORS acepta cualquier origen.
- observabilidad y logs
- jobs programados para recordatorios
- soporte multiusuario
- despliegue automatizado y CI/CD
- optimización adicional de consultas

# 5. Tiempo aproximado invertido

Tiempo aproximado:

```text
≈ 3-4 horas
```

Distribución aproximada:

- análisis y spec
- modelado
- implementación backend
- implementación frontend
- testing
- documentación
- code review

---

# 6. Qué mejoraría de esta prueba técnica

Una mejora que realizaría sería permitir aclarar explícitamente algunos supuestos de negocio.

Ejemplo:

- comportamiento esperado para pólizas fuera de ventana
- alcance esperado de gestión comercial
- restricciones esperadas para la UI principal

Esto reduciría ambigüedad inicial y permitiría enfocar más tiempo en implementación y menos en interpretación.

---

# API Endpoints

**Customers**

```
GET    /api/customers          Lista de clientes
POST   /api/customers          Crear cliente
PUT    /api/customers/:id       Actualizar cliente
```

**Policies**

```
GET    /api/policies            Lista ordenada por urgencia
                                Filtros: ?status= ?follow_up_status= ?search= ?customer_id=
GET    /api/policies/:id        Detalle con historial de actividades
POST   /api/policies            Crear póliza
PATCH  /api/policies/:id/follow-up   Actualizar estado de gestión
PATCH  /api/policies/:id/renew       Registrar renovación
```

**Activities**

```
GET    /api/policies/:id/activities  Historial de actividades
POST   /api/policies/:id/activities  Registrar nueva actividad
```

**Misc**

```
GET    /api/health              Health check
GET    /favicon.ico             204 No Content (suprime error CSP)
```

---

## Video Explicando la Prueba Técnica

Video explicando decisiones técnicas y arquitectura:

https://youtu.be/dWwC99uAKxM
