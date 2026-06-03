# CLAUDE

Estoy realizando una prueba tecnica FullStack; la prueba plantea el siguiente escenario:

<problema>
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
</problema>

Ya realize un analisis y definí que deseo hacer lo siguiente:

1. Backend: Node, Front: React, vite, SQLite
2. Esto es lo que defini: ...En esta parte puse: 03_definicion.md

Comparto el link de la conversacion con el resultado
https://claude.ai/share/fcb47b38-a5d3-4702-8d36-e626fff8b446
