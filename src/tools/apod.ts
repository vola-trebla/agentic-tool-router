import type { Tool, ToolResult } from '../types.js';
import { config } from '../config.js';

interface APODResponse {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export const apodTool: Tool = {
  name: 'astronomy-photo-of-the-day',
  description: "Get NASA's Astronomy Picture of the Day with title, explanation, and image URL",

  async execute(): Promise<ToolResult> {
    try {
      const url = `${config.urls.apod}?api_key=${config.nasaApiKey}`;

      const response = await fetch(url);
      const data = (await response.json()) as APODResponse;

      return {
        success: true,
        data: {
          title: data.title,
          explanation: data.explanation,
          imageUrl: data.hdurl ?? data.url,
          mediaType: data.media_type,
          date: data.date,
          copyright: data.copyright ?? null,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
