import type { Tool, ToolResult } from '../types.js';
import { config } from '../config.js';

interface ISSPosition {
  latitude: string;
  longitude: string;
}

interface ISSResponse {
  iss_position: ISSPosition;
  timestamp: number;
  message: string;
}

export const issTool: Tool = {
  name: 'iss-position',
  description: 'Get the current position of the International Space Station',

  async execute(): Promise<ToolResult> {
    try {
      const response = await fetch(config.urls.iss);
      const data = (await response.json()) as ISSResponse;

      return {
        success: true,
        data: {
          latitude: data.iss_position.latitude,
          longitude: data.iss_position.longitude,
          timestamp: data.timestamp,
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
