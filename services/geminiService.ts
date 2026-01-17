
import { GoogleGenAI, Type, Chat } from "@google/genai";

export function createBiblicalChat(): Chat {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Você é o assistente Ágape, especialista na Harpa Cristã e nas Escrituras Sagradas.`,
      temperature: 0.7,
    }
  });
}

/**
 * Gera uma imagem bíblica majestosa usando gemini-2.5-flash-image.
 */
export async function generateBiblicalImage(moment: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Prompt focado em arte clássica para evitar gatilhos de segurança
    const prompt = `A majestic, high-quality oil painting of the biblical scene: ${moment}. Renaissance style, dramatic divine lighting, cinematic masterpiece, 4k resolution, no text, no borders.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // imageConfig é necessário para o modelo flash-image
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("A IA bloqueou a imagem por motivos de segurança ou parâmetros inválidos.");
    }

    // Procura pela parte inlineData (imagem base64)
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("A resposta da IA não continha dados de imagem.");
  } catch (e: any) {
    console.error("Gemini API Error:", e);
    // Erro amigável para o log do usuário
    if (e.message?.includes('429')) throw new Error("Limite de velocidade atingido. Aguarde 60 segundos.");
    if (e.message?.includes('400')) throw new Error("Erro de parâmetro ou Segurança da IA.");
    throw new Error(e.message || "Erro na conexão com o Google Gemini");
  }
}

export async function generateCrossword(level: number, theme: string): Promise<any | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma palavra cruzada bíblica sobre "${theme}". Formato JSON estrito.`,
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
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return null;
  }
}
