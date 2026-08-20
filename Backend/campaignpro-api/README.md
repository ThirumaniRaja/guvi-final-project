# CampaignPro API

Production-ready, modular-layered REST API for **CampaignPro — Email Campaign Manager System**.

Built with Java 21, Spring Boot 3.4, Spring Security (JWT), Spring Data JPA / Hibernate,
PostgreSQL, Flyway, Spring Mail (SMTP, provider-swappable), MapStruct, Lombok, springdoc-openapi,
and tested with JUnit 5 / Mockito / Testcontainers.

## 1. Architecture

Layered, modular-by-feature package structure:

```
com.campaignpro
├── config          # Security, OpenAPI, JPA, Async configuration
├── security         # JWT filter/service, UserDetails, entry point
├── user             # Auth + profile: controller/service/repository/entity/dto/mapper
├── contact          # Contacts + contact groups
├── template         # Email templates + placeholder rendering
├── campaign         # Campaign lifecycle, recipients, delivery, scheduler
├── email            # EmailProvider abstraction (SMTP impl), dispatch, tracking injection
├── tracking          # Open/click tracking (public endpoints) + event storage
├── analytics        # Campaign & account-level analytics
├── admin            # Admin dashboard, user management
└── common           # Exceptions, ApiResponse/PageResponse, enums, audit, utils
```

Flow: `Controller → Service → Repository → PostgreSQL`. DTOs are used at the API boundary;
JPA entities are never returned directly from controllers.

### Email provider abstraction

`email.provider.EmailProvider` is the single interface business code depends on.
`SmtpEmailProvider` is the default implementation (Spring Mail / JavaMail).
`EmailProviderResolver` picks the active provider bean by name from `app.mail.provider`
(default `smtp`). To add AWS SES / SendGrid / Mailgun: implement `EmailProvider`,
annotate with `@Component("<name>EmailProvider")`, and set `app.mail.provider=<name>`.
No other code changes required.

### Tracking

`EmailTrackingInjector` signs an HMAC token per recipient and:
- appends a 1×1 pixel (`/api/v1/tracking/open/{token}.png`) for open tracking
- rewrites `<a href="...">` links to redirect through `/api/v1/tracking/click/{token}?u=...`

### Campaign delivery & scheduling

- `CampaignService` — CRUD + lifecycle (draft → scheduled/sending → sent/cancelled).
- `CampaignDeliveryService` — async per-recipient send (personalization + tracking + retry bookkeeping).
- `CampaignScheduler` — polls for due scheduled campaigns and retries failed recipients
  (guard with a distributed lock such as ShedLock in a multi-instance deployment).

## 2. Prerequisites

- Java 21 (project uses `--release 21`)
- Docker (for local Postgres/Mailhog, and for Testcontainers-based integration tests)
- No local Maven install required — the Maven Wrapper (`./mvnw`) is included

## 3. Configuration

All config lives in `src/main/resources/application.yml`, environment-driven via
`${VAR:default}` placeholders. Key variables:

| Variable | Purpose | Default |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection | local dev defaults |
| `MAIL_HOST`, `MAIL_PORT` | SMTP server | `localhost:1025` (Mailhog) |
| `JWT_SECRET` | HMAC signing secret (32+ bytes) | dev-only default — **change in prod** |
| `TRACKING_TOKEN_SECRET` | HMAC secret for tracking tokens | dev-only default — **change in prod** |
| `APP_MAIL_PROVIDER` (`app.mail.provider`) | Active email provider bean | `smtp` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin(s) | `http://localhost:3000` |

## 4. Run locally

```bash
# 1. Start Postgres + Mailhog (SMTP test server with web UI on :8025)
docker compose up -d postgres mailhog

# 2. Run the app (Flyway migrates the schema automatically on boot)
./mvnw spring-boot:run
```

App: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`
Health: `http://localhost:8080/actuator/health`

## 5. Run fully containerized

```bash
docker compose up --build
```

## 6. Tests

```bash
# Unit tests (Mockito) — no Docker required
./mvnw test -Dtest='!AuthFlowIntegrationTest'

# Full suite including Testcontainers-backed integration test (requires Docker)
./mvnw test
```

## 7. Build

```bash
./mvnw clean package
java -jar target/campaignpro-api-0.1.0.jar
```

## 8. Core API surface (v1)

| Area | Endpoints |
|---|---|
| Auth | `POST /api/v1/auth/{register,login,refresh,logout}` |
| Profile | `GET/PUT /api/v1/users/me`, `POST /api/v1/users/me/change-password` |
| Contacts | `POST/GET/PUT/DELETE /api/v1/contacts`, `/api/v1/contact-groups/**` |
| Templates | `POST/GET/PUT/DELETE /api/v1/templates`, `POST /api/v1/templates/{id}/preview` |
| Campaigns | `POST/GET/PUT /api/v1/campaigns`, `/{id}/schedule`, `/{id}/send-now`, `/{id}/cancel`, `/{id}/recipients` |
| Tracking (public) | `GET /api/v1/tracking/open/{token}.png`, `GET /api/v1/tracking/click/{token}` |
| Analytics | `GET /api/v1/analytics/overview`, `GET /api/v1/analytics/campaigns/{id}` |
| Admin (ROLE_ADMIN) | `GET /api/v1/admin/dashboard`, `/activity`, `/users`, `PATCH /users/{id}/status` |

All responses are wrapped in `ApiResponse<T>` (`success`, `errorCode`, `message`, `data`, `timestamp`).
Paged endpoints return `PageResponse<T>`.

## 9. Production hardening checklist

- [ ] Rotate `JWT_SECRET` / `TRACKING_TOKEN_SECRET` via a secrets manager
- [ ] Add a message queue (RabbitMQ/Kafka) in front of `CampaignDeliveryService` for true horizontal scale
- [ ] Add ShedLock (or DB advisory lock) around `CampaignScheduler` for multi-instance safety
- [ ] Add a real `EmailProvider` (SES/SendGrid) alongside SMTP for production sending
- [ ] Add rate limiting on `/auth/**` (Redis token bucket)
- [ ] Wire Micrometer → Prometheus/Grafana dashboards using the exposed `/actuator/metrics`

