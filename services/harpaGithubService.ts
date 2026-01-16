
export interface HymnSource {
  number: number;
  title: string;
  lyrics: string;
}

// URL do JSON que corresponde EXATAMENTE ao formato que você enviou
const PRIMARY_SOURCE = 'https://raw.githubusercontent.com/DanielLiberato/harpa-crista-json/main/harpa-crista.json';

export async function fetchAllHymnsFromGitHub(): Promise<HymnSource[]> {
  try {
    console.log(`Buscando Harpa Cristã: ${PRIMARY_SOURCE}`);
    const response = await fetch(PRIMARY_SOURCE, { cache: 'no-cache' });
    
    if (!response.ok) throw new Error('Não foi possível acessar a fonte primária.');
    
    const data = await response.json();
    const hymns: HymnSource[] = [];

    // O formato do seu JSON é um objeto onde as chaves são os números dos hinos
    for (const key in data) {
      if (key === "-1") continue; // Pula o cabeçalho de autor

      const item = data[key];
      const number = parseInt(key);
      
      // Extrai o título (Removendo o número do início se existir, ex: "1 - Chuvas de Graça")
      let title = item.hino || "";
      if (title.includes(' - ')) {
        title = title.split(' - ')[1];
      }

      // Constrói a letra formatada a partir do Coro e Versos
      let fullLyrics = "";
      
      if (item.verses) {
        const verseKeys = Object.keys(item.verses).sort((a, b) => parseInt(a) - parseInt(b));
        
        verseKeys.forEach((vKey, index) => {
          const verseText = item.verses[vKey].replace(/<br>/g, '\n').trim();
          fullLyrics += `${vKey}. ${verseText}\n\n`;
          
          // Adiciona o coro após o primeiro verso, que é o padrão da Harpa
          if (index === 0 && item.coro) {
            const coroText = item.coro.replace(/<br>/g, '\n').trim();
            fullLyrics += `CORO:\n${coroText}\n\n`;
          }
        });
      }

      if (number && title && fullLyrics) {
        hymns.push({
          number,
          title: title.trim(),
          lyrics: fullLyrics.trim()
        });
      }
    }

    console.log(`Total de hinos processados: ${hymns.length}`);
    return hymns;
  } catch (error) {
    console.error(`Erro ao processar JSON da Harpa:`, error);
    return [];
  }
}
