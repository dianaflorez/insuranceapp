# Cartera — Gestión de Pólizas de Seguros

Aplicación para que María reemplace su Excel. Una sola pantalla donde puede ver su cartera completa, filtrar por urgencia, registrar gestiones y renovar pólizas.

---

## Node superior 22

## Setup (3 comandos)

```bash
# 1. Instalar dependencias de backend y frontend, y cargar datos iniciales
cd backend && npm install && npm run seed && cd ../frontend && npm install

# 2. Iniciar el backend (terminal 1)
cd backend && npm start

# 3. Iniciar el frontend (terminal 2)
cd frontend && npm run dev
```

Abrir: **http://localhost:5173**

> El backend corre en `http://localhost:3001`. El frontend hace proxy automático via Vite.

## Tests

```bash
cd backend && npm test
```

14 tests sobre `calculatePolicyStatus` — la función más crítica del sistema.

---

## Stack

| Capa       | Tecnología                                     |
| ---------- | ---------------------------------------------- |
| Backend    | Node.js + Express                              |
| Base datos | SQLite via `sql.js` (pure JS, sin compilación) |
| Frontend   | React + Vite                                   |
| Estilos    | CSS-in-JS inline (sin dependencias extra)      |

---

## Qué construí y por qué

### La pantalla única

Una tabla de pólizas ordenada por urgencia + un drawer lateral de detalle. Desde esa pantalla María puede:

- Ver todas sus pólizas ordenadas por urgencia (por vencer → renovables → vigentes → perdidas)
- Filtrar por estado con un click
- Buscar por nombre de cliente o número de póliza
- Abrir el drawer de cualquier póliza y registrar una actividad (llamada, WhatsApp, email, nota, reunión)
- Actualizar el estado de gestión (`PENDING → ATTEMPTED → CONTACTED → WAITING_RESPONSE → COMPLETED`)
- Registrar una renovación con nueva fecha de vencimiento
- Ver el historial completo de actividades

### El modelo de datos

```
customer  1:N  policy  1:N  policy_activity
```

**`policy_status` es CALCULADO, nunca guardado.**

```
expiration_date + today → ACTIVE / EXPIRING_SOON / EXPIRED_RENEWABLE / LOST
```

Guardar el status sería duplicar información y crear inconsistencias el día que los timestamps no coincidan.

### La ventana de 30 días es el corazón del negocio

```
EXPIRING_SOON     = vence en 0–30 días   → prioridad alta, actuar antes del vencimiento
EXPIRED_RENEWABLE = venció hace 1–30 días → VENTANA CRÍTICA, renovación sin competencia
LOST              = venció hace > 30 días → María ya compite con cualquier intermediario
```

Las pólizas se ordenan exactamente en ese orden de urgencia.

### `follow_up_status` sí se persiste

El estado de gestión refleja el trabajo de María, no el tiempo. No se puede calcular:

```
PENDING → ATTEMPTED → CONTACTED → WAITING_RESPONSE → COMPLETED
```

---

## API Endpoints

```
GET    /api/policies                    Lista ordenada por urgencia (filtros: status, follow_up_status, search)
GET    /api/policies/:id                Detalle con historial de actividades
POST   /api/policies                    Crear póliza (puede crear cliente nuevo en el mismo request)
PATCH  /api/policies/:id/follow-up      Actualizar estado de gestión
PATCH  /api/policies/:id/renew          Registrar renovación (nueva fecha + marca COMPLETED)

GET    /api/policies/:id/activities     Historial de actividades de una póliza
POST   /api/policies/:id/activities     Registrar nueva actividad

GET    /api/customers                   Lista de clientes con conteo de pólizas
POST   /api/customers                   Crear cliente
PUT    /api/customers/:id               Actualizar cliente

GET    /api/health                      Health check
```

---

## Datos pre-cargados

El seed crea 8 clientes y 12 pólizas con fechas relativas a hoy, para que siempre haya pólizas en todos los estados:

| Estado            | Ejemplo                                  |
| ----------------- | ---------------------------------------- |
| EXPIRING_SOON     | Póliza que vence mañana (Mariana Torres) |
| EXPIRING_SOON     | Póliza que vence en 4 días (Juan Pérez)  |
| EXPIRED_RENEWABLE | Venció hace 5 días (Mariana Torres Auto) |
| EXPIRED_RENEWABLE | Venció hace 12 días (Ana Rodríguez)      |
| EXPIRED_RENEWABLE | Venció hace 25 días (Valentina Castro)   |
| ACTIVE            | Vence en 45, 60, 90 y 180 días           |
| LOST              | Venció hace 50 días (Carlos López)       |

---
