# CHATGPT

Me gustan estas entidades:

- customer
- policy
- policy_activity

Ahora quiero concretar lo que hemos definido y quiero las entidades con sus atributos, tipos de datos sugeridos y relaciones.

También quiero que me muestres ejemplos en formato tabla para entender mejor cómo se comportaría el sistema con distintos escenarios y estados.

Me interesa especialmente visualizar:

- cómo se relacionan customers con múltiples policies
- cómo funcionan los estados de póliza
- cómo funcionan los estados de gestión/seguimiento
- cómo se verían varios registros reales con fechas distintas, estados distintos y actividades registradas

Perfecto. Ya tienes suficientemente claro el problema como para aterrizar un modelo concreto. Voy a proponerte algo que prioriza:

- simplicidad
- reglas de negocio
- facilidad para consultas
- facilidad para construir la UI de una sola pantalla
- evitar duplicidad de datos

---

# 1. Relaciones generales

```text
Customer

1 -------- N

Policy

1 -------- N

PolicyActivity
```

Visualmente:

```text
Customer Juan

   |

   |---- Policy Auto

   |         |

   |         |---- Activity

   |         |---- Activity

   |

   |---- Policy Home

             |

             |---- Activity
```

---

# 2. Entidad Customer

Tabla:

```text
customer
```

| Field      | Type         | Nullable | Description   |
| ---------- | ------------ | -------- | ------------- |
| id         | INTEGER PK   | No       | identifier    |
| first_name | VARCHAR(100) | No       | first name    |
| last_name  | VARCHAR(100) | No       | last name     |
| phone      | VARCHAR(30)  | Yes      | phone         |
| email      | VARCHAR(150) | Yes      | email         |
| created_at | DATETIME     | No       | creation date |
| updated_at | DATETIME     | No       | update date   |

Ejemplo:

| id  | first_name | last_name | phone     |
| --- | ---------- | --------- | --------- |
| 1   | Juan       | Perez     | 300111111 |
| 2   | Ana        | Rodriguez | 300222222 |
| 3   | Carlos     | Lopez     | 300333333 |

---

# 3. Entidad Policy

Tabla:

```text
policy
```

| Field            | Type        | Nullable | Description       |
| ---------------- | ----------- | -------- | ----------------- |
| id               | INTEGER PK  | No       | identifier        |
| customer_id      | INTEGER FK  | No       | customer owner    |
| policy_number    | VARCHAR(50) | No       | policy number     |
| policy_type      | VARCHAR(50) | No       | auto/home/life    |
| expiration_date  | DATE        | No       | expiration        |
| follow_up_status | ENUM/TEXT   | No       | management status |
| renewed_at       | DATETIME    | Yes      | renewal date      |
| created_at       | DATETIME    | No       | creation          |
| updated_at       | DATETIME    | No       | update            |

---

## Follow Up Status (persistido)

| Enum             | Usuario             |
| ---------------- | ------------------- |
| PENDING          | Pendiente           |
| ATTEMPTED        | Intento de contacto |
| CONTACTED        | Contactado          |
| WAITING_RESPONSE | Esperando respuesta |
| COMPLETED        | Completado          |

---

## Policy Status (calculado)

No se guarda.

Se calcula.

| Status            | Regla                         |
| ----------------- | ----------------------------- |
| ACTIVE            | vence >30 días                |
| EXPIRING_SOON     | vence dentro próximos 30 días |
| EXPIRED_RENEWABLE | venció hace <=30 días         |
| LOST              | venció hace >30 días          |

---

# 4. Entidad Policy Activity

Tabla:

```text
policy_activity
```

| Field         | Type       |
| ------------- | ---------- |
| id            | INTEGER PK |
| policy_id     | INTEGER FK |
| activity_type | VARCHAR    |
| notes         | TEXT       |
| created_at    | DATETIME   |

---

## Activity Types

| Enum     | Usuario  |
| -------- | -------- |
| CALL     | Llamada  |
| WHATSAPP | WhatsApp |
| EMAIL    | Email    |
| NOTE     | Nota     |
| MEETING  | Reunión  |

---

# 5. Ejemplo real completo

Supongamos:

**Hoy = 1 Junio**

---

## Customer Table

| id  | first_name | last_name |
| --- | ---------- | --------- |
| 1   | Juan       | Perez     |
| 2   | Ana        | Rodriguez |
| 3   | Carlos     | Lopez     |

---

## Policy Table

| id  | customer_id | type | expiration_date | Follow Up        | Policy Status (calculated) |
| --- | ----------- | ---- | --------------- | ---------------- | -------------------------- |
| 101 | 1           | Auto | 2026-06-05      | WAITING_RESPONSE | EXPIRING_SOON              |
| 102 | 1           | Home | 2026-10-20      | PENDING          | ACTIVE                     |
| 103 | 2           | Life | 2026-05-20      | CONTACTED        | EXPIRED_RENEWABLE          |
| 104 | 3           | Auto | 2026-04-10      | ATTEMPTED        | LOST                       |

---

Interpretación:

### Policy 101

```text
vence en 4 días

↓

urgente

↓

ya hubo contacto

↓

esperando respuesta
```

---

### Policy 103

```text
venció hace 12 días

↓

todavía renovable

↓

ya contactaron cliente
```

---

### Policy 104

```text
venció hace 50 días

↓

ventana perdida

↓

ya intentaron contactar
```

---

# 6. Policy Activity Table

| id  | policy_id | type     | note                        | created_at |
| --- | --------- | -------- | --------------------------- | ---------- |
| 1   | 101       | CALL     | Cliente solicita cotización | 2026-05-29 |
| 2   | 101       | WHATSAPP | Cotización enviada          | 2026-05-31 |
| 3   | 103       | CALL     | Cliente revisando opciones  | 2026-05-25 |
| 4   | 104       | CALL     | No respondió                | 2026-04-15 |

---

# 7. Cómo se vería la pantalla principal

Probablemente una fila = una póliza.

| Customer      | Policy | Expires  | Policy Status       | Follow Up              | Last Activity     |
| ------------- | ------ | -------- | ------------------- | ---------------------- | ----------------- |
| Juan Perez    | Auto   | 4 days   | 🟠 Próxima a vencer | 🟠 Esperando respuesta | Whatsapp enviado  |
| Ana Rodriguez | Life   | -12 days | 🔴 Renovable        | 🔵 Contactado          | Cliente revisando |
| Carlos Lopez  | Auto   | -50 days | ⚫ Expirada         | 🟡 Intentado           | No respondió      |

---

# 8. Lo que yo NO guardaría

No guardaría:

```text
policy_status

priority

expired_days

days_remaining

renewable_window
```

Porque:

```text
expiration_date

+

today

↓

everything calculable
```

---

# 9. Modelo final resumido

```text
customer

1:N

policy

1:N

policy_activity
```

```text
customer
    id
    first_name
    last_name
    phone
    email


policy
    id
    customer_id
    policy_number
    policy_type
    expiration_date
    follow_up_status
    renewed_at


policy_activity
    id
    policy_id
    activity_type
    notes
    created_at
```

Con este modelo ya puedes construir API REST, tests, filtros, dashboard y pantalla principal sin sobrecomplicar la prueba.
