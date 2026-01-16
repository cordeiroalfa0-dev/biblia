
// Mapeamento de nomes para IDs da Bolls Life API (Tradução ARA - Almeida Revista e Atualizada)
const BOOK_MAP: Record<string, number> = {
  'Gênesis': 1, 'Êxodo': 2, 'Levítico': 3, 'Números': 4, 'Deuteronômio': 5,
  'Josué': 6, 'Juízes': 7, 'Rute': 8, '1 Samuel': 9, '2 Samuel': 10,
  '1 Reis': 11, '2 Reis': 12, '1 Crônicas': 13, '2 Crônicas': 14, 'Esdras': 15,
  'Neemias': 16, 'Ester': 17, 'Jó': 18, 'Salmos': 19, 'Provérbios': 20,
  'Eclesiastes': 21, 'Cânticos': 22, 'Isaías': 23, 'Jeremias': 24, 'Lamentações': 25,
  'Ezequiel': 26, 'Daniel': 27, 'Oseias': 28, 'Joel': 29, 'Amós': 30,
  'Obadias': 31, 'Jonas': 32, 'Miqueias': 33, 'Naum': 34, 'Habacuque': 35,
  'Sofonias': 36, 'Ageu': 37, 'Zacarias': 38, 'Malaquias': 39,
  'Mateus': 40, 'Marcos': 41, 'Lucas': 42, 'João': 43, 'Atos': 44,
  'Romanos': 45, '1 Coríntios': 46, '2 Coríntios': 47, 'Gálatas': 48, 'Efésios': 49,
  'Filipenses': 50, 'Colossenses': 51, '1 Tessalonicenses': 52, '2 Tessalonicenses': 53,
  '1 Timóteo': 54, '2 Timóteo': 55, 'Tito': 56, 'Filemom': 57, 'Hebreus': 58,
  'Tiago': 59, '1 Pedro': 60, '2 Pedro': 61, '1 João': 62, '2 João': 63,
  '3 João': 64, 'Judas': 65, 'Apocalipse': 66
};

/**
 * Busca o capítulo completo de uma API real e gratuita (Bolls Life).
 * Versão: ARA (Almeida Revista e Atualizada)
 */
export async function fetchChapter(bookName: string, chapter: number): Promise<{verse: number, text: string}[]> {
  const bookId = BOOK_MAP[bookName];
  if (!bookId) {
    console.error(`Livro não encontrado no mapeamento: ${bookName}`);
    return [];
  }

  try {
    // Bolls Life API - Endpoint para capítulos completos
    // ARA é o código para Almeida Revista e Atualizada em Português
    const response = await fetch(`https://bolls.life/get-chapter/ARA/${bookId}/${chapter}/`);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    // A API Bolls retorna um array de objetos: [{ pk, translation, book, chapter, verse, text }]
    if (Array.isArray(data)) {
      return data.map((v: any) => ({
        verse: v.verse,
        text: v.text.replace(/<[^>]*>?/gm, '') // Limpa possíveis tags HTML do texto
      }));
    }

    return [];
  } catch (error) {
    console.error(`Falha ao buscar ${bookName} ${chapter} na API Bolls:`, error);
    return [];
  }
}
