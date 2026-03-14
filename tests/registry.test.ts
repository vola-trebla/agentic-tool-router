import { describe, it, expect } from 'vitest';
import { getAllTools, getToolByName } from '../src/tools/registry.js';

describe('Tool Registry', () => {
  it('returns all 4 tools', () => {
    const tools = getAllTools();
    expect(tools).toHaveLength(4);
  });

  it('each tool has name, description, and execute', () => {
    const tools = getAllTools();
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(typeof tool.execute).toBe('function');
    }
  });

  it('finds tool by name', () => {
    const tool = getToolByName('iss-position');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('iss-position');
  });

  it('returns undefined for unknown tool', () => {
    const tool = getToolByName('nonexistent-tool');
    expect(tool).toBeUndefined();
  });

  it('contains expected tool names', () => {
    const tools = getAllTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain('iss-position');
    expect(names).toContain('near-earth-asteroids');
    expect(names).toContain('astronomy-photo-of-the-day');
    expect(names).toContain('space-weather');
  });
});
