
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://myoitcrjrkqtyyzxljxb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15b2l0Y3JqcmtxdHl5enhsanhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTY0MDgsImV4cCI6MjA4NDA5MjQwOH0.yNWXkVGBC-tvoR-ivRk2C75AoxHk1gZPZq9dlaDuwDU';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BIBLE_BOOKS_MASTER = [
  { name: 'Gênesis', chapters: 50 }, { name: 'Êxodo', chapters: 40 }, { name: 'Levítico', chapters: 27 },
  { name: 'Números', chapters: 36 }, { name: 'Deuteronômio', chapters: 34 }, { name: 'Josué', chapters: 24 },
  { name: 'Juízes', chapters: 21 }, { name: 'Rute', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 }, { name: '1 Reis', chapters: 22 }, { name: '2 Reis', chapters: 25 },
  { name: '1 Crônicas', chapters: 29 }, { name: '2 Crônicas', chapters: 36 }, { name: 'Esdras', chapters: 10 },
  { name: 'Neemias', chapters: 13 }, { name: 'Ester', chapters: 10 }, { name: 'Jó', chapters: 42 },
  { name: 'Salmos', chapters: 150 }, { name: 'Provérbios', chapters: 31 }, { name: 'Eclesiastes', chapters: 12 },
  { name: 'Cânticos', chapters: 8 }, { name: 'Isaías', chapters: 66 }, { name: 'Jeremias', chapters: 52 },
  { name: 'Lamentações', chapters: 5 }, { name: 'Ezequiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
  { name: 'Oseias', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amós', chapters: 9 },
  { name: 'Obadias', chapters: 1 }, { name: 'Jonas', chapters: 4 }, { name: 'Miqueias', chapters: 7 },
  { name: 'Naum', chapters: 3 }, { name: 'Habacuque', chapters: 3 }, { name: 'Sofonias', chapters: 3 },
  { name: 'Ageu', chapters: 2 }, { name: 'Zacarias', chapters: 14 }, { name: 'Malaquias', chapters: 4 },
  { name: 'Mateus', chapters: 28 }, { name: 'Marcos', chapters: 16 }, { name: 'Lucas', chapters: 24 },
  { name: 'João', chapters: 21 }, { name: 'Atos', chapters: 28 }, { name: 'Romanos', chapters: 16 },
  { name: '1 Coríntios', chapters: 16 }, { name: '2 Coríntios', chapters: 13 }, { name: 'Gálatas', chapters: 6 },
  { name: 'Efésios', chapters: 6 }, { name: 'Filipenses', chapters: 4 }, { name: 'Colossenses', chapters: 4 },
  { name: '1 Tessalonicenses', chapters: 5 }, { name: '2 Tessalonicenses', chapters: 3 }, { name: '1 Timóteo', chapters: 6 },
  { name: '2 Timóteo', chapters: 4 }, { name: 'Tito', chapters: 3 }, { name: 'Filemom', chapters: 1 },
  { name: 'Hebreus', chapters: 13 }, { name: 'Tiago', chapters: 5 }, { name: '1 Pedro', chapters: 5 },
  { name: '2 Pedro', chapters: 3 }, { name: '1 João', chapters: 5 }, { name: '2 João', chapters: 1 },
  { name: '3 João', chapters: 1 }, { name: 'Judas', chapters: 1 }, { name: 'Apocalipse', chapters: 22 }
];

export async function fetchVerses(bookName: string, chapter: number) {
  const { data } = await supabase.from('verses').select('*').eq('book_name', bookName).eq('chapter', chapter).order('verse', { ascending: true });
  return data || [];
}

export async function saveVerses(verses: any[]) {
  if (!verses.length) return;
  await supabase.from('verses').delete().eq('book_name', verses[0].book_name).eq('chapter', verses[0].chapter);
  await supabase.from('verses').insert(verses);
}

export async function fetchHymns(search?: string) {
  let query = supabase.from('hymns').select('*').order('number', { ascending: true });
  if (search) {
    if (!isNaN(Number(search))) query = query.eq('number', Number(search));
    else query = query.ilike('title', `%${search}%`);
  }
  const { data } = await query;
  return data || [];
}

export async function saveHymns(hymns: any[]) {
  await supabase.from('hymns').upsert(hymns, { onConflict: 'number' });
}

export async function saveMosaicImage(level: number, theme: string, imageData: string, reference?: string, description?: string) {
  await supabase.from('mosaic_images').upsert({ level, theme, image_data: imageData, reference, description }, { onConflict: 'level' });
}

export async function fetchAllMosaicImages() {
  const { data } = await supabase.from('mosaic_images').select('*').order('level', { ascending: true });
  return data || [];
}

export async function saveCrossword(level: number, theme: string, puzzleData: any) {
  await supabase.from('crossword_puzzles').upsert({ level, theme, puzzle_data: puzzleData }, { onConflict: 'level' });
}

export async function fetchAllCrosswords() {
  const { data } = await supabase.from('crossword_puzzles').select('*').order('level', { ascending: true });
  return data || [];
}
