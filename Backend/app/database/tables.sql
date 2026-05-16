-- =========================
-- USERS & AUTH
-- =========================

create table users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    password_hash text not null,
    status text default 'active',
    created_at timestamp default now()
);

create table roles (
    id uuid primary key default gen_random_uuid(),
    name text unique not null
);

create table user_roles (
    user_id uuid references users(id) on delete cascade,
    role_id uuid references roles(id) on delete cascade,
    primary key (user_id, role_id)
);

-- =========================
-- API KEYS (DEVELOPER PLATFORM)
-- =========================

create table api_keys (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    key_hash text not null,
    name text,
    status text default 'active',
    last_used_at timestamp,
    created_at timestamp default now()
);

-- =========================
-- SUBSCRIPTIONS
-- =========================

create table plans (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    price numeric default 0,
    limits jsonb not null
);

create table subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    plan_id uuid references plans(id),
    status text default 'active',
    start_date timestamp default now(),
    end_date timestamp
);


-- =========================
-- INFERENCE LOGS (CORE AI USAGE)
-- =========================

create table inference_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    input_payload jsonb not null,
    created_at timestamp default now()
);

create table inference_responses (
    id uuid primary key default gen_random_uuid(),
    request_id uuid references inference_requests(id) on delete cascade,
    output jsonb not null,
    tokens_used int,
    latency_ms int,
    created_at timestamp default now()
);

-- =========================
-- USAGE TRACKING (BILLING CORE)
-- =========================

create table usage_logs (
    id uuid primary key default gen_random_uuid(),

    api_key_id uuid references api_keys(id) on delete cascade,

    endpoint text,

    tokens_used int default 0,

    status_code int,

    created_at timestamp default now()
);

-- =========================
-- IMAGE / ML JOB PIPELINE
-- =========================

create table image_jobs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    image_url text,
    status text default 'queued',
    result jsonb,
    created_at timestamp default now()
);

-- =========================
-- CHATBOT / ASSISTANT
-- =========================


CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,

    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),

    content TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);