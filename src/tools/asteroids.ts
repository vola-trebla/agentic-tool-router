import type { Tool, ToolResult } from '../types.js';
import { config } from '../config.js';

interface Asteroid {
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    miss_distance: {
      kilometers: string;
    };
    relative_velocity: {
      kilometers_per_second: string;
    };
  }>;
}

interface NeoFeed {
  near_earth_objects: Record<string, Asteroid[]>;
}

export const asteroidsTool: Tool = {
  name: 'near-earth-asteroids',
  description:
    'Get asteroids passing close to Earth today, including size, distance, speed, and whether they are potentially hazardous',

  async execute(): Promise<ToolResult> {
    try {
      const today = new Date().toISOString().split('T')[0]!;
      const url = `${config.urls.asteroids}?start_date=${today}&end_date=${today}&api_key=${config.nasaApiKey}`;

      const response = await fetch(url);
      const data = (await response.json()) as NeoFeed;
      const raw = data.near_earth_objects[today] ?? [];

      const asteroids = raw.map((a) => ({
        name: a.name,
        diameterMin: a.estimated_diameter.meters.estimated_diameter_min,
        diameterMax: a.estimated_diameter.meters.estimated_diameter_max,
        hazardous: a.is_potentially_hazardous_asteroid,
        missDistanceKm: a.close_approach_data[0]?.miss_distance.kilometers,
        velocityKmPerSec: a.close_approach_data[0]?.relative_velocity.kilometers_per_second,
      }));

      return {
        success: true,
        data: { date: today, count: asteroids.length, asteroids },
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
