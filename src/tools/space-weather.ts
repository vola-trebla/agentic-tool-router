import type { Tool, ToolResult } from '../types.js';
import { config } from '../config.js';

interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  classType: string;
  sourceLocation: string;
}

export const spaceWeatherTool: Tool = {
  name: 'space-weather',
  description: 'Get recent solar flares and space weather events from the past 7 days',

  async execute(): Promise<ToolResult> {
    try {
      const end = new Date().toISOString().split('T')[0]!;
      const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;

      const url = `${config.urls.spaceWeather}?startDate=${start}&endDate=${end}&api_key=${config.nasaApiKey}`;

      const response = await fetch(url);
      const data = (await response.json()) as SolarFlare[];

      const flares = data.map((f) => ({
        id: f.flrID,
        classType: f.classType,
        beginTime: f.beginTime,
        peakTime: f.peakTime,
        sourceLocation: f.sourceLocation,
      }));

      return {
        success: true,
        data: { count: flares.length, period: `${start} to ${end}`, flares },
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
