---

## 1. Cómo entendiste el problema

El problema principal no consiste únicamente en administrar clientes o almacenar pólizas. El verdadero problema consiste en ayudar al asesor de seguros a gestionar renovaciones de manera organizada para evitar perder oportunidades comerciales.

Actualmente el asesor utiliza Excel para administrar su cartera, lo que genera varios problemas operativos:

* Dificultad para identificar rápidamente qué clientes requieren atención
* Pérdida de contexto sobre conversaciones previas y ofertas realizadas
* Seguimiento manual de clientes y renovaciones
* Riesgo de perder clientes debido a vencimientos no gestionados oportunamente
* Falta de priorización sobre qué clientes requieren atención inmediata

Entiendo que la aplicación debe enfocarse principalmente en resolver problemas operativos del día a día del asesor, permitiéndole responder preguntas como:

* ¿Qué clientes debo gestionar hoy?
* ¿Cuáles pólizas están próximas a vencer?
* ¿Qué pólizas ya vencieron pero todavía pueden renovarse?
* ¿Qué ocurrió la última vez que hablé con este cliente?
* ¿Qué clientes tienen mayor riesgo de perderse?

También considero importante diferenciar dos conceptos distintos:

* Estado de la póliza (situación real del negocio)
* Estado de la gestión comercial (acciones realizadas por el asesor)

La prioridad del proyecto será construir una herramienta simple orientada a operación y seguimiento, priorizando reglas de negocio, facilidad de uso y velocidad de ejecución sobre funcionalidades adicionales.

---

## 2. Qué decidiste construir y qué dejaste fuera, con justificación

Dado el tiempo estimado de la prueba y el objetivo principal del problema, decidí priorizar funcionalidades orientadas a la operación diaria del asesor: identificar clientes que requieren atención, gestionar renovaciones, mantener contexto comercial y facilitar el seguimiento operativo.

El enfoque principal fue construir una herramienta simple que permita responder rápidamente preguntas como:

- ¿Qué clientes debo gestionar hoy?
- ¿Qué pólizas requieren atención inmediata?
- ¿Qué ocurrió la última vez que hablé con este cliente?
- ¿Qué oportunidades están próximas a perderse?

Para mantener el alcance enfocado en resolver el problema principal, decidí dejar fuera las siguientes funcionalidades:

| Funcionalidad                                                             | Justificación                                                                                                                                                                                       |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticación                                                             | El problema planteado está enfocado en la gestión operativa de una asesora individual. Incorporar autenticación agregaría complejidad sin aportar valor directo al objetivo principal de la prueba. |
| Edición o eliminación completa de clientes                                | El flujo principal está centrado en la gestión de pólizas y renovaciones, no en la administración completa de clientes.                                                                             |
| Creación completa de clientes y pólizas desde una interfaz administrativa | Para el alcance del MVP prioricé la gestión y seguimiento sobre la administración completa de información. Se utilizarán datos iniciales o formularios mínimos cuando sea necesario.                |
| Notificaciones push, emails automáticos o tareas programadas              | Requieren infraestructura adicional y procesamiento en segundo plano. Para el alcance del MVP decidí priorizar indicadores visuales, filtros y estados.                                             |
| Dashboard con gráficas o métricas avanzadas                               | Consideré más útil dedicar el tiempo a una pantalla principal enfocada en acciones operativas y priorización diaria.                                                                                |
| Paginación                                                                | Considerando el volumen descrito (~280 clientes activos), prioricé filtros, ordenamiento y visualización por prioridad antes que complejidad adicional.                                             |
| Soporte multiusuario o múltiples asesores                                 | El escenario presentado describe el flujo de trabajo de una única asesora, por lo que no fue considerado prioritario para esta versión.                                                             |
| Auditoría avanzada o trazabilidad completa                                | El historial de actividades asociado a las pólizas cubre el contexto operativo necesario sin agregar complejidad adicional.                                                                         |

### Funcionalidades priorizadas

En lugar de maximizar la cantidad de funcionalidades implementadas, decidí priorizar:

- Visualización rápida del trabajo pendiente
- Priorización de clientes según reglas de negocio
- Seguimiento comercial y contexto histórico
- Gestión de renovaciones y vencimientos
- Experiencia de uso simple y orientada a operación diaria
- Reglas de negocio sobre complejidad técnica

La prioridad general fue construir un MVP funcional enfocado en resolver el flujo operativo principal antes que maximizar cantidad de funcionalidades.

Durante el desarrollo prioricé mantener una estructura simple y explícita debido al alcance reducido de la prueba. Algunas decisiones técnicas privilegiaron facilidad de ejecución y rapidez de evaluación sobre incorporar capas adicionales de automatización, orquestación o complejidad arquitectónica que podrían ser apropiadas en proyectos de mayor escala.

---

## 3. Supuestos realizados

- Supuestos que tuviste que hacer (todo lo que no estaba claro en el enunciado)

Durante el análisis del problema encontré algunos puntos que no estaban completamente definidos en el enunciado, por lo que fue necesario asumir ciertas reglas para poder construir el MVP.

### Manejo de pólizas que superaron la ventana de renovación

El enunciado indica que una póliza puede renovarse dentro de los 30 días posteriores al vencimiento, pero no especifica cómo deben gestionarse las pólizas que superan esa ventana.

Para este MVP asumí que:

- Las pólizas vencidas hace más de 30 días dejan de considerarse oportunidades activas de renovación.
- Estas pólizas continúan existiendo en el sistema por motivos históricos y de seguimiento.
- Estas pólizas tendrán menor prioridad visual y podrán filtrarse para evitar saturar la pantalla principal.

---

### Estados de póliza

El enunciado no especifica cómo representar visual u operativamente el estado de las pólizas.

Para este MVP decidí separar el estado real de la póliza de las actividades realizadas sobre ella.

Los estados definidos para pólizas son:

- ACTIVE → póliza vigente sin requerir acción inmediata
- EXPIRING_SOON → póliza próxima a vencer
- EXPIRED_RENEWABLE → póliza vencida pero dentro de la ventana de renovación
- RENEWED → póliza renovada
- LOST → superó la ventana de renovación

Estos estados pueden calcularse dinámicamente utilizando fechas para reducir inconsistencias.

---

### Estados de gestión / actividades

El enunciado menciona que el asesor necesita saber si un cliente fue gestionado, pero no especifica cómo modelar el seguimiento comercial.

Para este MVP asumí que la gestión debe representarse mediante actividades independientes asociadas a cada póliza.

Los estados definidos para actividades son:

- PENDING → nunca gestionada
- ATTEMPTED → intento de contacto sin éxito
- CONTACTED → hubo contacto con el cliente
- WAITING_RESPONSE → esperando decisión del cliente
- COMPLETED → gestión finalizada

Esta separación permite diferenciar claramente entre la situación de la póliza y las acciones realizadas por el asesor.

---

## 4. Cómo va a funcionar el sistema en sus flujos principales

El sistema está diseñado alrededor del flujo operativo diario del asesor, priorizando rapidez de consulta, seguimiento y gestión de renovaciones.

La unidad principal de trabajo dentro del sistema será la póliza, ya que representa directamente las oportunidades que requieren atención.

### Flujo principal: visualizar trabajo pendiente

1. El asesor ingresa a la aplicación.
2. Se muestra una pantalla principal con una lista de pólizas.
3. Cada fila representa una póliza junto con información relevante del cliente.
4. La información se presenta ordenada utilizando estados, colores y fechas relevantes.
5. El asesor puede identificar rápidamente:

- pólizas próximas a vencer
- pólizas vencidas pero todavía renovables
- pólizas fuera de ventana de renovación
- pólizas pendientes de gestión
- pólizas críticas próximas a perder oportunidad comercial

---

### Flujo de seguimiento comercial

1. El asesor identifica una póliza que requiere gestión.
2. Visualiza rápidamente:

- información del cliente
- información de la póliza
- último estado de seguimiento
- historial de actividades registradas

3. El asesor registra una nueva actividad indicando:

- tipo de actividad
- observaciones o notas
- resultado de la gestión

Las actividades quedan asociadas a la póliza para mantener contexto histórico.

---

### Flujo de renovación

1. El asesor identifica una póliza renovable.
2. Actualiza la nueva fecha de vencimiento.
3. El sistema recalcula automáticamente el estado operativo de la póliza.
4. El historial de actividades permanece disponible para conservar trazabilidad comercial.

---

### Flujo de priorización

El sistema calcula automáticamente estados operativos utilizando fechas y reglas de negocio.

Las pólizas se priorizan visualmente mediante:

- colores
- estados calculados
- filtros
- ordenamiento

Esto permite que la pantalla principal funcione como una lista priorizada de trabajo diario en lugar de un repositorio estático de información.

## 6. Endpoints expuestos

La API fue diseñada priorizando simplicidad y enfocándose en el flujo operativo principal del asesor: visualizar trabajo pendiente, registrar seguimiento y gestionar renovaciones.

### Customers

### Obtener clientes

```http
GET /customers
```

Permite consultar clientes registrados.

---

### Obtener cliente específico

```http
GET /customers/:id
```

Retorna información detallada del cliente.

---

### Policies

### Obtener listado de pólizas

```http
GET /policies
```

Endpoint principal de consulta.

Permite utilizar filtros opcionales como:

- estado calculado
- estado de seguimiento
- próximas a vencer
- vencidas renovables
- pendientes de gestión

Ejemplos:

```http
GET /policies?policyStatus=EXPIRING_SOON

GET /policies?followUpStatus=PENDING

GET /policies?priority=CRITICAL
```

---

### Obtener detalle de póliza

```http
GET /policies/:id
```

Retorna información completa de la póliza junto con información relacionada.

---

### Actualizar seguimiento comercial

```http
PATCH /policies/:id/follow-up
```

Permite actualizar el estado comercial asociado a la póliza.

Ejemplo:

```json
{
  "followUpStatus": "WAITING_RESPONSE"
}
```

---

### Renovar póliza

```http
PATCH /policies/:id/renew
```

Actualiza la nueva fecha de vencimiento.

Ejemplo:

```json
{
  "expirationDate": "2027-06-01"
}
```

---

### Policy Activities

### Obtener historial de actividades

```http
GET /policies/:id/activities
```

Retorna actividades registradas sobre la póliza.

---

### Registrar nueva actividad

```http
POST /policies/:id/activities
```

Ejemplo:

```json
{
  "activityType": "CALL",
  "notes": "Cliente solicita cotización"
}
```

---

La API fue diseñada priorizando endpoints simples y orientados al flujo operativo principal en lugar de exponer operaciones CRUD completas sobre todas las entidades.

## 7. Trade-offs considerados

Durante el diseño del MVP fue necesario tomar decisiones para balancear simplicidad, tiempo disponible, facilidad de implementación y valor entregado al usuario final.

### Simplicidad vs Flexibilidad

Decidí priorizar un modelo simple y explícito sobre un modelo altamente configurable.

Esto implica:

**Ventaja**

- Menor complejidad
- Desarrollo más rápido
- Menor costo de mantenimiento inicial

**Costo**

- Menor flexibilidad para futuros escenarios complejos

---

### Estados calculados vs Estados persistidos

Decidí calcular dinámicamente el estado operativo de las pólizas utilizando fechas en lugar de almacenarlo directamente.

**Ventaja**

- Evita inconsistencias
- Reduce duplicación de datos
- Simplifica mantenimiento

**Costo**

- Incrementa ligeramente la lógica de consulta

---

### Pantalla única vs Navegación compleja

Decidí centralizar el flujo operativo en una única pantalla principal.

**Ventaja**

- Menos navegación
- Mayor rapidez operativa
- Menor complejidad de interfaz

**Costo**

- La pantalla principal asume más responsabilidades

---

### Historial de actividades separado vs Sobrescribir seguimiento

Decidí almacenar actividades independientes asociadas a cada póliza.

**Ventaja**

- Conserva contexto histórico
- Permite trazabilidad comercial
- Evita pérdida de información

**Costo**

- Mayor cantidad de registros y relaciones

---

### MVP funcional vs Cobertura completa

Decidí priorizar el flujo principal de negocio sobre funcionalidades adicionales.

**Ventaja**

- Mayor foco en resolver el problema principal
- Entrega funcional en menor tiempo

**Costo**

- Algunas funcionalidades quedan fuera de esta versión inicial

---

### Priorizar reglas de negocio vs Complejidad técnica

Decidí invertir más tiempo entendiendo reglas operativas y flujos comerciales antes que implementar infraestructura adicional o patrones más complejos.

**Ventaja**

- Mejor alineación con el problema real

**Costo**

- Algunas decisiones técnicas podrían refactorizarse en escenarios de mayor escala
