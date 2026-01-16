
import { GoogleGenAI, Modality, Type, Chat, GenerateContentResponse } from "@google/genai";

export interface GeminiResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

export function createBiblicalChat(): Chat {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Você é o assistente Ágape, especialista na Harpa Cristã e nas Escrituras Sagradas. 
      Responda sempre com autoridade e reverência em Português.`,
      temperature: 0.7,
    }
  });
}

/**
 * Gera uma imagem bíblica cinematográfica baseada em um momento/nível
 */
export async function generateBiblicalImage(moment: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `PINTURA SACRA ULTRA COLORIDA E VIBRANTE. Estilo vitral moderno misturado com realismo épico. O momento bíblico é: ${moment}. Use uma paleta de cores explosiva: azuis elétricos, dourado radiante, vermelhos intensos e roxos reais. A iluminação deve parecer emanar de dentro da imagem, como luz divina passando através de vidro colorido. Detalhes majestosos, alta definição, sagrado e inspirador.` }
        ]
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Erro ao gerar imagem:", e);
    return null;
  }
}

/**
 * Gera um tabuleiro de palavras cruzadas bíblicas para um nível específico
 */
export async function generateCrossword(level: number): Promise<any | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma palavra cruzada bíblica de Nível ${level}. 
      A dificuldade deve aumentar conforme o nível.
      Retorne um JSON com:
      - theme: Título do nível (ex: "Os Patriarcas", "Milagres de Cristo")
      - words: Lista de objetos {word, clue, direction (across|down), row (0-11), col (0-11)}.
      Tente cruzar as palavras entre si no grid 12x12.
      As palavras devem ser em português e sem acentos no campo "word".`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  clue: { type: Type.STRING },
                  direction: { type: Type.STRING },
                  row: { type: Type.INTEGER },
                  col: { type: Type.INTEGER }
                },
                required: ["word", "clue", "direction", "row", "col"]
              }
            }
          },
          required: ["theme", "words"]
        },
        temperature: 0.2
      }
    });
    
    return JSON.parse(response.text);
  } catch (e) {
    console.error(`Erro ao gerar cruzadinha:`, e);
    return null;
  }
}

export async function fetchHymnViaAI(number: number): Promise<{title: string, lyrics: string} | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `REQUISIÇÃO: Extraia o registro do Hino ${number} da Harpa Cristã. 
      Retorne obrigatoriamente um JSON com "title" e "lyrics" (letra completa).`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING }
          },
          required: ["title", "lyrics"]
        },
        temperature: 0.1
      }
    });
    
    const data = JSON.parse(response.text);
    if (!data.title || data.lyrics.length < 15) return null;
    
    return data;
  } catch (e) {
    return null;
  }
}

export async function explainHymn(number: number, title: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Análise do hino ${number} - ${title} da Harpa Cristã.`,
  });
  return response.text || "";
}

export async function semanticSearch(query: string): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Busca bíblica: "${query}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            book: { type: Type.STRING },
            chapter: { type: Type.INTEGER },
            verse: { type: Type.INTEGER },
            text: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["book", "chapter", "verse", "text", "explanation"]
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function explainVerseDetail(book: string, chapter: number, verse: number, text: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Comente: ${book} ${chapter}:${verse} - "${text}".`,
  });
  return response.text || "";
}
