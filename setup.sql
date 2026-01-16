
-- SCRIPT DE CONFIGURAÇÃO SUPABÍBLIA AI
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Tabela de Hinos da Harpa Cristã
CREATE TABLE IF NOT EXISTS public.hymns (
    id bigint primary key generated always as identity,
    number int unique not null,
    title text not null,
    lyrics text not null,
    created_at timestamptz default now()
);

-- 2. Tabela de Versículos (Cache da Bíblia)
CREATE TABLE IF NOT EXISTS public.verses (
    id bigint primary key generated always as identity,
    book_name text not null,
    chapter int not null,
    verse int not null,
    text text not null,
    created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_verses_lookup ON public.verses(book_name, chapter);

-- 3. Tabela de Controle de Capítulos Salvos
CREATE TABLE IF NOT EXISTS public.reading_progress (
    id bigint primary key generated always as identity,
    book_name text not null,
    chapter int not null,
    last_read timestamptz default now(),
    UNIQUE(book_name, chapter)
);

-- 4. Tabela de Histórico de Mensagens
CREATE TABLE IF NOT EXISTS public.messages (
    id bigint primary key generated always as identity,
    role text not null,
    content text not null,
    created_at timestamptz default now()
);

-- 5. Permissões de Acesso (Desabilita RLS para facilitar o uso do App)
ALTER TABLE IF EXISTS public.hymns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reading_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.hymns TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.verses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reading_progress TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role;
