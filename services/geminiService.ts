
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gera uma imagem bíblica artística seguindo as Regras Master (Sacerdotais).
 */
export async function generateBiblicalImage(moment: string, reference?: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Ilustração digital semi-realista de um evento bíblico:
${moment}.

Regras obrigatórias:
- Pintura digital respeitosa
- Atmosfera solene e inspiradora
- Iluminação suave e equilibrada
- Trajes bíblicos históricos
- Sem texto na imagem
- Sem elementos modernos
- Composição central equilibrada
- Proporção 1:1
- Alta qualidade

Contexto bíblico:
Evento: ${moment}
Referência: ${reference || "Escrituras Sagradas"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1"
        } 
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    console.error("Erro na geração de imagem Master:", e);
    return null;
  }
}

/**
 * Gera metadados bíblicos para um nível (referência e descrição).
 */
export async function generateLevelMetadata(theme: string): Promise<{ reference: string, description: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Para o evento bíblico "${theme}", forneça a referência bíblica principal (Livro Capítulo:Versículo) e uma descrição educativa curta e didática (máximo 200 caracteres) em Português (Brasil).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reference: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["reference", "description"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch {
    return { reference: "Bíblia Sagrada", description: "Um momento marcante e sagrado da história bíblica para estudo e reflexão." };
  }
}

/**
 * Gera um caça-palavras bíblico temático.
 */
export async function generateWordSearch(theme: string): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um caça-palavras bíblico baseado no tema "${theme}". Retorne uma lista de 8 a 10 palavras bíblicas relacionadas e o tema. Palavras devem ser em Português.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["theme", "words"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch {
    return { theme: "Fé Cristã", words: ["JESUS", "GRACA", "ORACAO", "BIBLIA", "IGREJA", "AMOR", "PAZ"] };
  }
}
