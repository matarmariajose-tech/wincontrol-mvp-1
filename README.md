# Winallcontrol

Plataforma de gestión comercial para inmobiliarias. Centraliza el ciclo completo de un lead — desde la captación hasta la venta — automatizando agendamiento, encuestas de satisfacción y métricas por comercial y producto.

**Lead → Agendamiento → Visita → Encuesta → Oferta → Venta**

🔗 **Producción:** [winallcontrol.com](https://www.winallcontrol.com)

## Estado del proyecto

**Fase actual:** Fase 2 — CRM inmobiliario completo, desplegado en producción.

Implementado:
- Autenticación con jerarquía de roles: WAC Admin → Admin Empresa/Cliente → Comercial
- Gestión de leads con máquina de estados (Lead Nuevo → Visita Agendada → ... → Vendido) e historial de cambios
- Agendamiento público sin login, con integración a Google Calendar y cálculo de buffers por categoría de inmueble
- Gestión de comerciales y de productos (inmuebles)
- Envío de emails automatizados (Resend)
- Documentación de API con Swagger

En curso / próximos pasos:
- Integración de WhatsApp Business API (pendiente aprobación de Meta)
- Encuestas de satisfacción post-visita (email + WhatsApp)
- Dashboards de métricas por comercial y por producto, con exportación CSV/XLSX
- Conexión con portales inmobiliarios (Idealista, Fotocasa, Habitaclia) — pendiente de acuerdos comerciales

## Arquitectura

```
wincontrol-mvp/
│
├── backend/                 # API (TypeScript, Express, TypeORM)
│   ├── src/
│   │   ├── auth/             # Autenticación JWT y control de roles
│   │   ├── leads/             # Gestión de leads y máquina de estados
│   │   ├── visits/            # Agendamiento y ciclo de visitas
│   │   ├── comerciales/       # Gestión de comerciales
│   │   ├── properties/        # Gestión de inmuebles
│   │   ├── calendar/          # Integración con Google Calendar
│   │   ├── mail/              # Envío de emails transaccionales
│   │   └── app.ts
│   ├── .env                  # Variables de entorno (no versionado)
│   └── package.json
│
├── frontend/
│   └── prototype/
│       ├── admin/             # Panel de administración
│       ├── comercial/         # Panel del comercial
│       ├── login/             # Autenticación
│       ├── schedule/          # Agendamiento público (sin login)
│       ├── survey/            # Encuesta de satisfacción
│       └── valoracion/        # Valoración del comercial
│
├── docker-compose.yml        # PostgreSQL local para desarrollo
└── README.md
```

El backend sigue una arquitectura modular por dominio: cada módulo agrupa su entidad, DTOs, repositorio, servicio, controlador y rutas.

## Stack técnico

**Backend:** Node.js · TypeScript · Express · TypeORM · JWT · Helmet · Swagger
**Base de datos:** PostgreSQL (Neon en producción, Docker en local)
**Frontend:** HTML / CSS / JavaScript vanilla, Fetch API
**Infraestructura:** Render (backend) · Vercel (frontend) · Google Calendar API · Resend (email)

## Seguridad

- Autenticación basada en JWT, con rutas públicas explícitamente separadas de las protegidas
- Cabeceras HTTP de seguridad (Content-Security-Policy, HSTS, X-Frame-Options, etc.) vía Helmet en el backend y configuración equivalente en Vercel para el frontend
- Variables de entorno y credenciales nunca versionadas — ver `.env.example` para las variables requeridas
- Dependencias auditadas regularmente (`npm audit`)

## Cómo levantarlo en local

**1. Clonar el repositorio**
```bash
git clone https://github.com/matarmariajose-tech/wincontrol-mvp-1.git
cd wincontrol-mvp-1
```

**2. Levantar la base de datos**
```bash
docker compose up -d
```

**3. Configurar el backend**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Salida esperada:
```
DB connected
Server running on port 3000
```

- Health check: `http://localhost:3000/health`
- Documentación de API: `http://localhost:3000/api-docs`

**4. Configurar el frontend**
```bash
cd frontend
npm install
```
Servir los archivos estáticos de `prototype/` con cualquier servidor local, apuntando `config.js` a tu backend local.

## API — endpoints principales

| Recurso | Endpoints |
|---|---|
| Auth | `POST /api/auth/login` · `POST /api/auth/register` |
| Leads | `GET/POST/PUT/DELETE /api/leads` · `PATCH /api/leads/:id/state` |
| Visits | `GET/POST/PUT/DELETE /api/visits` · `PATCH /api/visits/:id/cancel` · `PATCH /api/visits/:id/complete` |
| Comerciales | `GET/POST/PUT/DELETE /api/comerciales` |
| Properties | `GET /api/properties` · `PATCH /api/properties/:id/comercial` |
| Calendar | `GET /api/calendar/slots/:comercialId/:date` · `GET /api/calendar/auth/:comercialId` |

Documentación completa e interactiva disponible en `/api-docs` (Swagger).

---

Desarrollado como plataforma de gestión comercial inmobiliaria para Winallcontrol.
