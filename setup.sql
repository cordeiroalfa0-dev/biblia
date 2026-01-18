
-- SCRIPT DE CONFIGURAÇÃO DEFINITIVO - ÁGAPE
-- Execute no SQL Editor do Supabase

-- 1. Hinos da Harpa Cristã
CREATE TABLE IF NOT EXISTS public.hymns (
    id bigint primary key generated always as identity,
    number int unique not null,
    title text not null,
    lyrics text not null,
    created_at timestamptz default now()
);

-- 2. Versículos Bíblicos
CREATE TABLE IF NOT EXISTS public.verses (
    id bigint primary key generated always as identity,
    book_name text not null,
    chapter int not null,
    verse int not null,
    text text not null,
    created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_verses_lookup ON public.verses(book_name, chapter);

-- 3. Imagens e Níveis do Quebra-Cabeça (100 Níveis)
CREATE TABLE IF NOT EXISTS public.mosaic_images (
    id bigint primary key generated always as identity,
    level int unique not null,
    theme text not null,
    image_data text not null,
    reference text, -- Ex: Gênesis 1:1
    description text, -- Descrição educativa do evento
    created_at timestamptz default now()
);

-- 4. Enigmas de Caça-Palavras
CREATE TABLE IF NOT EXISTS public.crossword_puzzles (
    id bigint primary key generated always as identity,
    level int unique not null,
    theme text not null,
    puzzle_data jsonb not null,
    created_at timestamptz default now()
);

-- Permissões
ALTER TABLE IF EXISTS public.hymns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mosaic_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crossword_puzzles DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.hymns TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.verses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mosaic_images TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.crossword_puzzles TO anon, authenticated, service_role;
