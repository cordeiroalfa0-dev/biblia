
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://myoitcrjrkqtyyzxljxb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15b2l0Y3JqcmtxdHl5enhsanhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTY0MDgsImV4cCI6MjA4NDA5MjQwOH0.yNWXkVGBC-tvoR-ivRk2C75AoxHk1gZPZq9dlaDuwDU';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BIBLE_BOOKS_MASTER = [
  { name: 'Gênesis', chapters: 50, testament: 'Velho' }, { name: 'Êxodo', chapters: 40, testament: 'Velho' },
  { name: 'Levítico', chapters: 27, testament: 'Velho' }, { name: 'Números', chapters: 36, testament: 'Velho' },
  { name: 'Deuteronômio', chapters: 34, testament: 'Velho' }, { name: 'Josué', chapters: 24, testament: 'Velho' },
  { name: 'Juízes', chapters: 21, testament: 'Velho' }, { name: 'Rute', chapters: 4, testament: 'Velho' },
  { name: '1 Samuel', chapters: 31, testament: 'Velho' }, { name: '2 Samuel', chapters: 24, testament: 'Velho' },
  { name: '1 Reis', chapters: 22, testament: 'Velho' }, { name: '2 Reis', chapters: 25, testament: 'Velho' },
  { name: '1 Crônicas', chapters: 29, testament: 'Velho' }, { name: '2 Crônicas', chapters: 36, testament: 'Velho' },
  { name: 'Esdras', chapters: 10, testament: 'Velho' }, { name: 'Neemias', chapters: 13, testament: 'Velho' },
  { name: 'Ester', chapters: 10, testament: 'Velho' }, { name: 'Jó', chapters: 42, testament: 'Velho' },
  { name: 'Salmos', chapters: 150, testament: 'Velho' }, { name: 'Provérbios', chapters: 31, testament: 'Velho' },
  { name: 'Eclesiastes', chapters: 12, testament: 'Velho' }, { name: 'Cânticos', chapters: 8, testament: 'Velho' },
  { name: 'Isaías', chapters: 66, testament: 'Velho' }, { name: 'Jeremias', chapters: 52, testament: 'Velho' },
  { name: 'Lamentações', chapters: 5, testament: 'Velho' }, { name: 'Ezequiel', chapters: 48, testament: 'Velho' },
  { name: 'Daniel', chapters: 12, testament: 'Velho' }, { name: 'Oseias', chapters: 14, testament: 'Velho' },
  { name: 'Joel', chapters: 3, testament: 'Velho' }, { name: 'Amós', chapters: 9, testament: 'Velho' },
  { name: 'Obadias', chapters: 1, testament: 'Velho' }, { name: 'Jonas', chapters: 4, testament: 'Velho' },
  { name: 'Miqueias', chapters: 7, testament: 'Velho' }, { name: 'Naum', chapters: 3, testament: 'Velho' },
  { name: 'Habacuque', chapters: 3, testament: 'Velho' }, { name: 'Sofonias', chapters: 3, testament: 'Velho' },
  { name: 'Ageu', chapters: 2, testament: 'Velho' }, { name: 'Zacarias', chapters: 14, testament: 'Velho' },
  { name: 'Malaquias', chapters: 4, testament: 'Velho' },
  { name: 'Mateus', chapters: 28, testament: 'Novo' }, { name: 'Marcos', chapters: 16, testament: 'Novo' },
  { name: 'Lucas', chapters: 24, testament: 'Novo' }, { name: 'João', chapters: 21, testament: 'Novo' },
  { name: 'Atos', chapters: 28, testament: 'Novo' }, { name: 'Romanos', chapters: 16, testament: 'Novo' },
  { name: '1 Coríntios', chapters: 16, testament: 'Novo' }, { name: '2 Coríntios', chapters: 13, testament: 'Novo' },
  { name: 'Gálatas', chapters: 6, testament: 'Novo' }, { name: 'Efésios', chapters: 6, testament: 'Novo' },
  { name: 'Filipenses', chapters: 4, testament: 'Novo' }, { name: 'Colossenses', chapters: 4, testament: 'Novo' },
  { name: '1 Tessalonicenses', chapters: 5, testament: 'Novo' }, { name: '2 Tessalonicenses', chapters: 3, testament: 'Novo' },
  { name: '1 Timóteo', chapters: 6, testament: 'Novo' }, { name: '2 Timóteo', chapters: 4, testament: 'Novo' },
  { name: 'Tito', chapters: 3, testament: 'Novo' }, { name: 'Filemom', chapters: 1, testament: 'Novo' },
  { name: 'Hebreus', chapters: 13, testament: 'Novo' }, { name: 'Tiago', chapters: 5, testament: 'Novo' },
  { name: '1 Pedro', chapters: 5, testament: 'Novo' }, { name: '2 Pedro', chapters: 3, testament: 'Novo' },
  { name: '1 João', chapters: 5, testament: 'Novo' }, { name: '2 João', chapters: 1, testament: 'Novo' },
  { name: '3 João', chapters: 1, testament: 'Novo' }, { name: 'Judas', chapters: 1, testament: 'Novo' },
  { name: 'Apocalipse', chapters: 22, testament: 'Novo' }
];

export async function fetchBooks() {
  try {
    const { data, error } = await supabase.from('books').select('*').order('id');
    if (error) throw error;
    return data && data.length > 0 ? data : BIBLE_BOOKS_MASTER;
  } catch (e) {
    return BIBLE_BOOKS_MASTER;
  }
}

export async function testDatabaseConnection(): Promise<{success: boolean, message: string}> {
  try {
    const { error } = await supabase.from('verses').select('id').limit(1);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Conectado!" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function fetchVerses(bookName: string, chapter: number) {
  try {
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .eq('book_name', bookName)
      .eq('chapter', chapter)
      .order('verse', { ascending: true });
    return data || [];
  } catch (e) {
    return [];
  }
}

export async function saveVerses(verses: { book_name: string, chapter: number, verse: number, text: string }[]) {
  if (verses.length === 0) return;
  const { book_name, chapter } = verses[0];
  await supabase.from('verses').delete().eq('book_name', book_name).eq('chapter', chapter);
  const { error } = await supabase.from('verses').insert(verses);
  if (error) throw error;
  await updateReadingProgress(book_name, chapter);
}

export async function fetchHymns(search?: string) {
  let query = supabase.from('hymns').select('*').order('number', { ascending: true });
  if (search) {
    if (!isNaN(Number(search))) {
      query = query.eq('number', Number(search));
    } else {
      query = query.ilike('title', `%${search}%`);
    }
  }
  const { data } = await query;
  return data || [];
}

export async function updateReadingProgress(book_name: string, chapter: number) {
  await supabase.from('reading_progress').upsert({ book_name, chapter }, { onConflict: 'book_name,chapter' });
}

// Funções para Gerenciamento de Imagens do Mosaico
export async function getStoredMosaicImage(level: number) {
  const { data, error } = await supabase
    .from('mosaic_images')
    .select('image_data, theme')
    .eq('level', level)
    .single();
  
  if (error) return null;
  return data;
}

export async function saveMosaicImage(level: number, theme: string, imageData: string) {
  const { error } = await supabase
    .from('mosaic_images')
    .upsert({ level, theme, image_data: imageData }, { onConflict: 'level' });
  
  if (error) console.error("Erro ao salvar imagem no banco:", error);
}

export async function fetchAllMosaicImages() {
  const { data, error } = await supabase
    .from('mosaic_images')
    .select('*')
    .order('level', { ascending: true });
  
  if (error) {
    console.error("Erro ao buscar galeria:", error);
    return [];
  }
  return data || [];
}

// Funções para Gerenciamento de Palavras Cruzadas
export async function getStoredCrossword(level: number) {
  const { data, error } = await supabase
    .from('crossword_puzzles')
    .select('puzzle_data, theme')
    .eq('level', level)
    .single();
  
  if (error) return null;
  return data;
}

export async function saveCrossword(level: number, theme: string, puzzleData: any) {
  const { error } = await supabase
    .from('crossword_puzzles')
    .upsert({ level, theme, puzzle_data: puzzleData }, { onConflict: 'level' });
  
  if (error) console.error("Erro ao salvar cruzadinha no banco:", error);
}

export async function fetchAllCrosswords() {
  const { data, error } = await supabase
    .from('crossword_puzzles')
    .select('level, theme')
    .order('level', { ascending: true });
  
  if (error) return [];
  return data || [];
}
