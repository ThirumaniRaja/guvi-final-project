-- Users
create table app_users (
    id              bigserial primary key,
    email           varchar(255) not null unique,
    password_hash   varchar(255) not null,
    full_name       varchar(255) not null,
    organization    varchar(255),
    timezone        varchar(64) default 'UTC',
    role            varchar(20) not null default 'USER',
    status          varchar(20) not null default 'ACTIVE',
    created_at      timestamp not null default now(),
    updated_at      timestamp not null default now()
);

create table refresh_tokens (
    id              bigserial primary key,
    user_id         bigint not null references app_users(id) on delete cascade,
    token_hash      varchar(255) not null unique,
    expires_at      timestamp not null,
    revoked         boolean not null default false,
    created_at      timestamp not null default now()
);

-- Contacts
create table contact_groups (
    id              bigserial primary key,
    owner_id        bigint not null references app_users(id) on delete cascade,
    name            varchar(150) not null,
    description     varchar(500),
    created_at      timestamp not null default now(),
    unique(owner_id, name)
);

create table contacts (
    id              bigserial primary key,
    owner_id        bigint not null references app_users(id) on delete cascade,
    email           varchar(255) not null,
    first_name      varchar(100),
    last_name       varchar(100),
    company         varchar(150),
    phone           varchar(30),
    status          varchar(20) not null default 'ACTIVE',
    metadata        jsonb,
    created_at      timestamp not null default now(),
    updated_at      timestamp not null default now(),
    unique(owner_id, email)
);

create table contact_group_members (
    group_id        bigint not null references contact_groups(id) on delete cascade,
    contact_id      bigint not null references contacts(id) on delete cascade,
    primary key (group_id, contact_id)
);

-- Templates
create table email_templates (
    id              bigserial primary key,
    owner_id        bigint not null references app_users(id) on delete cascade,
    name            varchar(150) not null,
    subject         varchar(255) not null,
    html_body       text not null,
    text_body       text,
    version         int not null default 1,
    active          boolean not null default true,
    created_at      timestamp not null default now(),
    updated_at      timestamp not null default now()
);

-- Campaigns
create table campaigns (
    id              bigserial primary key,
    owner_id        bigint not null references app_users(id) on delete cascade,
    template_id     bigint not null references email_templates(id),
    name            varchar(150) not null,
    status          varchar(20) not null default 'DRAFT',
    scheduled_at    timestamp,
    sent_at         timestamp,
    created_at      timestamp not null default now(),
    updated_at      timestamp not null default now()
);

create table campaign_recipients (
    id                      bigserial primary key,
    campaign_id             bigint not null references campaigns(id) on delete cascade,
    contact_id              bigint not null references contacts(id),
    status                  varchar(20) not null default 'PENDING',
    retries                 int not null default 0,
    provider_message_id     varchar(255),
    last_error              varchar(1000),
    created_at              timestamp not null default now(),
    updated_at              timestamp not null default now(),
    unique(campaign_id, contact_id)
);

-- Tracking / events
create table email_events (
    id              bigserial primary key,
    campaign_id     bigint not null references campaigns(id) on delete cascade,
    recipient_id    bigint references campaign_recipients(id) on delete set null,
    type            varchar(20) not null,
    metadata        varchar(2000),
    created_at      timestamp not null default now()
);

-- Idempotency
create table idempotency_keys (
    id              bigserial primary key,
    key             varchar(150) not null unique,
    scope           varchar(100) not null,
    request_hash    varchar(255),
    created_at      timestamp not null default now(),
    expires_at      timestamp not null
);

-- Audit logs
create table audit_logs (
    id              bigserial primary key,
    actor_user_id   bigint references app_users(id),
    action          varchar(150) not null,
    entity_type     varchar(100),
    entity_id       varchar(100),
    details         varchar(2000),
    created_at      timestamp not null default now()
);

-- Indexes
create index idx_contacts_owner on contacts(owner_id);
create index idx_contact_groups_owner on contact_groups(owner_id);
create index idx_templates_owner on email_templates(owner_id);
create index idx_campaigns_owner_status on campaigns(owner_id, status);
create index idx_campaigns_status_scheduled on campaigns(status, scheduled_at);
create index idx_recipients_campaign_status on campaign_recipients(campaign_id, status);
create index idx_events_campaign_type on email_events(campaign_id, type);
create index idx_audit_actor on audit_logs(actor_user_id);

