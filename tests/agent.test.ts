import { describe, it, expect, vi } from 'vitest';
import { runAgent } from '../src/agent.js';
import type { LLMProvider, LLMResponse } from '../src/types.js';

function createMockProvider(responses: LLMResponse[]): LLMProvider {
  let callIndex = 0;
  return {
    chat: vi.fn(async () => {
      const response = responses[callIndex] ?? { text: 'Fallback answer' };
      callIndex++;
      return response;
    }),
  };
}

describe('Agent', () => {
  it('returns text answer when LLM responds with text', async () => {
    const provider = createMockProvider([{ text: 'The ISS is above the Pacific Ocean.' }]);

    const result = await runAgent('Where is the ISS?', provider);

    expect(result.answer).toBe('The ISS is above the Pacific Ocean.');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]?.type).toBe('final');
    expect(result.toolsUsed).toHaveLength(0);
  });

  it('handles unknown tool gracefully', async () => {
    const provider = createMockProvider([
      { text: '', toolCall: { name: 'unknown-tool' } },
      { text: 'I could not find that tool.' },
    ]);

    const result = await runAgent('Do something', provider);

    expect(result.answer).toBe('I could not find that tool.');
    expect(result.steps.some((s) => s.content.includes('not found'))).toBe(true);
    expect(result.toolsUsed).toHaveLength(0);
  });

  it('stops after MAX_ITERATIONS with only unknown tools', async () => {
    const provider = createMockProvider([
      { text: '', toolCall: { name: 'fake-tool' } },
      { text: '', toolCall: { name: 'fake-tool' } },
      { text: '', toolCall: { name: 'fake-tool' } },
      { text: '', toolCall: { name: 'fake-tool' } },
      { text: '', toolCall: { name: 'fake-tool' } },
    ]);

    const result = await runAgent('Loop forever', provider);

    expect(result.steps.length).toBeGreaterThan(0);
    expect(provider.chat).toHaveBeenCalledTimes(5);
  });
});
