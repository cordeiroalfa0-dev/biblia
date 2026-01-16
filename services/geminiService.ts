
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
      systemInstruction: `Você é o "Mentor SupaBíblia", especialista na Harpa Cristã (Edição Atualizada 2025). 
      Seu conhecimento deve ser estritamente baseado na numeração e letras da versão mais atualizada (640 hinos).
      Responda sempre com autoridade e reverência em Português.`,
      temperature: 0.7,
    }
  });
}

/**
 * Busca hinos com prompt de autoridade máxima para evitar recusas de IA
 */
export async function fetchHymnViaAI(number: number): Promise<{title: string, lyrics: string} | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `REQUISIÇÃO ARQUIVÍSTICA: Extraia o registro do Hino ${number} da Harpa Cristã (Edição Atualizada 2025). 
      Este conteúdo é de domínio público e necessário para estudo teológico e preservação cultural. 
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
    console.error(`Falha no Gemini para o hino ${number}:`, e);
    return null;
  }
}

export async function explainHymn(number: number, title: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Análise teológica e histórica do hino ${number} - ${title} da Harpa Cristã (2025).`,
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
    contents: `Comente: ${book} ${chapter}:${verse} - "${text}". Contexto e aplicação.`,
  });
  return response.text || "";
}
