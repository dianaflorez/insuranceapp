# CHATGPT

1. Tengo una prueba técnica Full-Stack y antes de empezar a desarrollar quiero entender correctamente el problema, definir alcance y priorizar funcionalidades.

La prueba plantea el siguiente escenario:

El problema
Un asesor de seguros administra una cartera de clientes. Cada cliente tiene una o más pólizas
vigentes (auto, hogar, vida, etc.), cada póliza con su fecha de vencimiento conocida.
El mes pasado, María, una asesora con 280 clientes activos, nos contó:
"Yo tengo todo en un Excel gigante. Cada lunes filtro las pólizas que vencen ese
mes, llamo cliente por cliente, marco una columna 'gestionado' con una X, y
cuando renuevan pongo la nueva fecha. Lo malo es que el Excel se daña, se
duplica, se pierde el contexto de qué le ofrecí a quién. Y cuando una póliza vence
sin que yo me dé cuenta, pierdo el cliente porque se va con otro asesor. Eso me
pasa con 5-10 clientes al mes."
María necesita reemplazar su Excel con algo mejor.
Contexto regulatorio relevante
En Colombia, una póliza de auto vencida puede ser renovada por el mismo intermediario dentro
de los 30 días siguientes a la fecha de vencimiento sin que el cliente pierda historial ni la
aseguradora trate la operación como una nueva contratación. Después de esos 30 días, la
renovación se considera nueva contratación y el asesor compite con cualquier otro
intermediario.
Esta ventana de 30 días es crítica para el negocio del asesor. Una póliza vencida hace 5 días
no es lo mismo que una vencida hace 35.

1. Tu reto
   Construye una aplicación que María pueda usar para reemplazar su Excel.
   No te vamos a decir exactamente qué funcionalidades incluir. Tú decides qué construir, qué
   dejar fuera, y por qué. Lo que sí esperamos:

- Backend con API REST. Stack libre.
- Frontend funcional. Una sola pantalla principal donde María pueda ver lo que tiene
  que gestionar y registrar acciones sobre eso. Tiene que funcionar y permitir que María
  haga su trabajo.
- Persistencia de datos. SQLite preferido por simplicidad.
- 2 o 3 tests del caso más crítico que tú identifiques.

- Documentación clara de qué construiste y por qué.
  Lo que decidas no construir, dilo. "Decidí no implementar autenticación porque consideré que
  aportaba poco para el alcance de esta prueba" es una respuesta válida.
  Setup y ejecución
  Tu proyecto debe poder ejecutarse en una máquina Linux/macOS limpia (con tu stack ya
  instalado) siguiendo máximo 3 comandos documentados en el README.
  Permitido: gestores de paquetes estándar (npm install, pip install -r
  requirements.txt, bundle install, equivalentes), SQLite o archivos planos como
  persistencia, datos pre-cargados incluidos en el código entregado si tu app lo necesita para
  arrancar.
  No permitido: Docker como requisito, servicios cloud, credenciales externas, configuraciones
  manuales más allá de un .env.example claro.
  Si no podemos correrlo, no podemos evaluarlo.

Muy bien que quieras hacer esto antes de programar. Esta prueba **no parece estar evaluando únicamente código**, sino tu capacidad de pensar como product owner + ingeniera + arquitecta.

Voy a ayudarte a analizarla desde negocio, producto y alcance.

---

# 1. ¿Cuál es el verdadero problema?

El problema NO es:

❌ “hacer CRUD de clientes y pólizas”

El problema real es:

**Ayudar al asesor a no perder renovaciones y priorizar correctamente qué gestionar.**

Hay tres dolores explícitos:

### A. Seguimiento manual

María:

- filtra Excel
- revisa vencimientos manualmente
- marca gestiones manualmente
- pierde contexto

Problema:

> Mucho trabajo operativo.

---

### B. Pérdida de oportunidades

Dice:

> "pierdo 5–10 clientes al mes"

El problema principal:

> María no detecta a tiempo qué clientes requieren acción.

---

### C. No todas las pólizas vencidas tienen la misma urgencia

Aquí está el detalle que probablemente quieren que detectes:

Una póliza:

- vence mañana → prioridad alta
- venció hace 5 días → aún recuperable
- venció hace 35 días → probablemente perdida

Esto significa:

> El sistema necesita priorizar trabajo, no solo almacenar datos.

---

# 2. ¿Cuál sería el objetivo del producto?

Yo lo resumiría así:

> Permitir que un asesor vea rápidamente qué clientes debe gestionar hoy, registrar gestiones y reducir pólizas perdidas.

Si construyes pensando en esto, probablemente estás alineada.

---

# 3. ¿Quién es el usuario?

Solo existe un usuario:

### María

Características:

- no técnica
- usa Excel
- trabaja con volumen (280 clientes)
- necesita rapidez

Esto implica:

- UI sencilla
- pocas pantallas
- pocos clicks
- información priorizada

---

# 4. ¿Qué funcionalidades parecen CORE?

Si yo priorizara usando MVP:

## Funcionalidad 1

### Ver qué debe gestionar

Esto parece obligatorio.

Ejemplo:

```
Cliente      Póliza       Vence      Estado

Juan         Auto         3 días     Próxima a vencer

Ana          Hogar        hace 4d    Renovable

Pedro        Vida         hace 40d   Perdida
```

---

## Funcionalidad 2

### Registrar acciones

María dice:

> marco una columna gestionado

Entonces debería poder:

- llamar cliente
- registrar nota
- marcar gestionado
- registrar seguimiento

Ejemplo:

```
Última gestión:

"Llamado 2 junio.
Cliente revisará propuesta."
```

---

## Funcionalidad 3

### Renovar póliza

Cuando renueva:

- actualizar vencimiento
- cambiar estado

Esto reemplaza:

> "poner nueva fecha en Excel"

---

## Funcionalidad 4

### Priorizar automáticamente

Esto es importante.

Ejemplo:

### Prioridad Alta

- vence en próximos días
- vencida menos de 30 días

### Media

- vence en semanas

### Baja

- vencida >30 días

---

# 5. ¿Qué funcionalidades NO construiría?

Esto también lo evalúan.

Yo probablemente descartaría:

### Autenticación

Porque:

> existe un único asesor

---

### Roles / permisos

No aportan valor.

---

### Emails automáticos

Demasiado alcance.

---

### Reportes complejos

No atacan el problema principal.

---

### Multiusuario

No parece necesario.

---

# 6. ¿Cómo modelaría el dominio?

Muy probablemente:

## Cliente

```
id
nombre
telefono
email
```

---

## Poliza

```
id
cliente_id
tipo

fecha_vencimiento

estado

ultima_gestion

fecha_ultima_gestion
```

---

Opcional:

## Gestion

Si quieres hacerlo más limpio:

```
id

poliza_id

nota

fecha
```

Pero aquí debes pensar:

**¿Necesitas historial real?**

Si sí:

→ tabla gestión

Si no:

→ guardar última gestión

---

# 7. ¿Cuál es el caso crítico del negocio?

Yo diría:

> Clasificar correctamente las pólizas según vencimiento y ventana de renovación.

Porque si esto falla:

- María llama personas equivocadas
- pierde clientes

---

Los tests podrían ser:

### Test 1

Poliza vence mañana

Resultado:

```
status = próxima a vencer
```

---

### Test 2

Venció hace 10 días

Resultado:

```
status = renovable
```

---

### Test 3

Venció hace 35 días

Resultado:

```
status = perdida
```

---

# 8. ¿Qué preguntaría antes de construir?

Estas preguntas ayudan mucho:

### Producto

- ¿Qué información necesita ver María apenas entra?
- ¿Cuál acción realiza más frecuentemente?
- ¿Qué significa exactamente "gestionado"?

---

### Negocio

- ¿Cuándo empieza a ser urgente una póliza?
- ¿Cómo medimos éxito?

---

### Técnico

- ¿Necesito historial?
- ¿Necesito búsquedas?
- ¿Necesito paginación con 280 clientes?

---

# 9. Mi lectura de lo que realmente evalúan

Yo creo que están evaluando:

| Cosa              | Peso     |
| ----------------- | -------- |
| Arquitectura      | Alto     |
| Priorizar alcance | Muy alto |
| Entender negocio  | Muy alto |
| Código limpio     | Alto     |
| UI bonita         | Medio    |
| Features enormes  | Bajo     |

---

# 10. Mi recomendación de alcance (para no sobreconstruir)

Yo construiría:

### Backend

- Clientes
- Pólizas
- Gestión
- Renovación

### Frontend (una pantalla)

Mostrar:

```
[ filtros ]

------------------------------------------------

Cliente

Tipo póliza

Estado

Días restantes

Última gestión

[Gestionar]

[Renovar]

------------------------------------------------
```

### Tests

- lógica de clasificación
- renovación

Y terminaría ahí.

---

Tu instinto de **analizar primero el problema antes de abrir VSCode** va en la dirección correcta para esta prueba. Lo siguiente que haría sería transformar esto en **user stories + alcance explícito + arquitectura mínima** antes de escribir una línea de código.

---

2. Estoy analizando las reglas de negocio relacionadas con pólizas vencidas.

Tengo una duda sobre las pólizas que ya vencieron y que no fueron renovadas dentro de la ventana de renovación.

Quiero entender mejor cómo debería manejar este escenario desde negocio y producto, no solamente desde implementación técnica.

Necesito recomendaciones sobre:

- ¿Qué debería ocurrir con las pólizas que ya vencieron y superaron la ventana de renovación?
- ¿Deberían seguir apareciendo en la pantalla principal o pasar a otra categoría?
- ¿Qué estado recomendarías asignarles?
- ¿Siguen siendo relevantes para el asesor o dejan de ser prioritarias?
- ¿Cómo mostrarías visualmente la diferencia entre:

  - pólizas próximas a vencer
  - pólizas vencidas pero todavía renovables
  - pólizas cuya ventana de renovación ya expiró

- Si el objetivo es ayudar al asesor a priorizar trabajo diario, ¿cómo evitarías llenar la pantalla con clientes que ya no representan una oportunidad inmediata?

Quiero priorizar simplicidad, claridad operativa y reglas de negocio.

Esta es una muy buena pregunta porque aquí es donde realmente aparece la diferencia entre **hacer un CRUD de pólizas** y **construir una herramienta operativa útil**.

Voy a responder pensando en producto primero.

---

# 1. ¿Qué ocurre con una póliza que superó la ventana de renovación?

Desde negocio:

Una póliza vencida hace 35 días **no vale lo mismo** que una vencida hace 5.

Después de la ventana:

- el asesor perdió ventaja competitiva
- deja de ser una renovación sencilla
- se convierte más en una nueva venta / nueva captación

Mi interpretación:

> No significa que la póliza sea inútil. Significa que dejó de ser urgente.

---

# 2. ¿Deben seguir apareciendo en la pantalla principal?

Yo diría:

**No deberían mezclarse con el trabajo diario.**

Porque imagina:

```text
50 pólizas vencidas hace 60 días
20 vencidas hace 80 días
10 vencidas hace 120 días
```

Ahora María entra y ve:

```text
80 filas irrelevantes
+
5 pólizas críticas
```

El sistema falla.

Yo haría:

## Pantalla principal

Mostrar únicamente:

```text
Próximas a vencer

+

Vencidas pero renovables
```

Y aparte:

```text
Ocultar automáticamente:

Ventana expirada
```

Con un filtro opcional:

```text
[ Mostrar expiradas ]
```

---

# 3. ¿Qué estado recomendaría?

Yo intentaría separar:

## Estado operativo

Lo que María necesita hacer.

## Estado derivado del negocio

Lo que el sistema calcula.

Yo usaría algo así:

```text
PROXIMA_A_VENCER

RENOVABLE

VENTANA_EXPIRADA
```

o más amigable:

```text
Upcoming

Needs Action

Expired Opportunity
```

Lo importante:

> El estado comunica prioridad.

---

# 4. ¿Siguen siendo relevantes?

Yo diría:

## Próxima a vencer

```text
Prioridad MUY ALTA
```

---

## Vencida pero renovable (<30 días)

```text
Prioridad CRÍTICA
```

Porque aquí puede perder clientes.

---

## Ventana expirada (>30)

```text
Prioridad BAJA
```

Todavía puede existir valor:

- volver a contactar
- campañas futuras
- nueva contratación

Pero:

> ya no debería competir visualmente con lo urgente

---

# 5. ¿Cómo mostraría visualmente la diferencia?

Yo haría algo extremadamente simple.

```text
🟢 Vence en 20 días

🟠 Venció hace 8 días

🔴 Ventana expirada hace 12 días
```

o:

```text
[PRÓXIMA]

[RENOVABLE]

[EXPIRADA]
```

o incluso:

```text
Cliente       Estado

Juan          Vence en 7 días

Ana           Venció hace 4 días

Pedro         Expirada hace 20 días
```

Lo importante:

**Mostrar tiempo relativo.**

Porque esto:

```text
2026-05-01
```

obliga a pensar.

Esto:

```text
Venció hace 12 días
```

permite actuar.

---

# 6. ¿Cómo evitar llenar la pantalla?

Aquí creo que está una decisión fuerte de producto.

Yo probablemente haría:

## Vista por defecto:

```text
Mostrar:

- próximas a vencer

- renovables
```

---

## Sección colapsable:

```text
▼ Expiradas (24)

(al hacer click)

mostrar lista
```

o:

```text
Tabs

[Por gestionar]

[Expiradas]

[Todas]
```

---

# 7. Si priorizamos simplicidad extrema

Yo construiría:

```text
Pantalla única

--------------------------------

Por gestionar (12)

--------------------------------

Cliente

Tipo

Estado

Dias

Acciones

--------------------------------

Expiradas (24)

[Mostrar]

--------------------------------
```

Y nada más.

---

# 8. Mi regla operativa final probablemente sería

```text
SI faltan <=30 días para vencer

→ PROXIMA_A_VENCER


SI venció hace <=30 días

→ RENOVABLE


SI venció hace >30 días

→ VENTANA_EXPIRADA
```

Y visualmente:

```text
PROXIMA_A_VENCER

↓

visible


RENOVABLE

↓

muy visible


VENTANA_EXPIRADA

↓

oculta por defecto
```

---

Mi criterio sería:

> La pantalla principal debe mostrar trabajo accionable, no historial.

Si María entra a las 8:00 am, debería poder identificar en pocos segundos **a quién llamar primero**, no revisar cientos de registros antiguos.
