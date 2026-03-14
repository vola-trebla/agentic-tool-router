import type { Tool } from '../types.js';
import { issTool } from './iss.js';
import { asteroidsTool } from './asteroids.js';
import { apodTool } from './apod.js';
import { spaceWeatherTool } from './space-weather.js';

const tools: Tool[] = [issTool, asteroidsTool, apodTool, spaceWeatherTool];

export function getAllTools(): Tool[] {
  return tools;
}

export function getToolByName(name: string): Tool | undefined {
  return tools.find((t) => t.name === name);
}
