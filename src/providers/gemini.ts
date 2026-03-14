import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { config } from '../config.js';
import type { LLMProvider, LLMResponse, Message, Tool } from '../types.js';

export function createGeminiProvider(tools: Tool[]): LLMProvider {
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);

  const toolDeclarations = tools.map((t) => ({
    name: t.name.replaceAll('-', '_'),
    description: t.description,
    parameters: { type: SchemaType.OBJECT, properties: {} },
  }));

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    tools: [{ functionDeclarations: toolDeclarations }],
  });

  return {
    async chat(messages: Message[]): Promise<LLMResponse> {
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
          parts: [{ text: m.content }],
        }));

      const systemMessage = messages.find((m) => m.role === 'system');

      const result = await model.generateContent({
        contents,
        ...(systemMessage && {
          systemInstruction: { role: 'user' as const, parts: [{ text: systemMessage.content }] },
        }),
      });

      const response = result.response;
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];

      for (const part of parts) {
        if ('functionCall' in part && part.functionCall) {
          return {
            text: '',
            toolCall: {
              name: part.functionCall.name.replaceAll('_', '-'),
            },
          };
        }
      }

      const textPart = parts.find((p) => 'text' in p);
      const text = textPart && 'text' in textPart ? textPart.text : '';

      return { text: text ?? '' };
    },
  };
}
