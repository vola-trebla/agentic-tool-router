import { describe, it, expect, vi } from 'vitest';
import { logAgentResult } from '../src/logger.js';
import type { AgentResult } from '../src/types.js';

describe('Logger', () => {
  it('logs all steps and final answer', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result: AgentResult = {
      answer: 'Test answer',
      steps: [
        {
          type: 'act',
          content: 'Calling tool: iss-position',
          toolName: 'iss-position',
          timestamp: 1,
        },
        { type: 'observe', content: '{"lat": 45}', timestamp: 2 },
        { type: 'final', content: 'Test answer', timestamp: 3 },
      ],
      toolsUsed: ['iss-position'],
    };

    logAgentResult(result);

    const output = consoleSpy.mock.calls.map((c) => c.join(' ')).join('\n');

    expect(output).toContain('Agent Reasoning Trace');
    expect(output).toContain('ACT');
    expect(output).toContain('iss-position');
    expect(output).toContain('OBSERVE');
    expect(output).toContain('Final Answer');
    expect(output).toContain('Test answer');

    consoleSpy.mockRestore();
  });

  it('shows "none" when no tools used', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result: AgentResult = {
      answer: 'No tools needed',
      steps: [{ type: 'final', content: 'No tools needed', timestamp: 1 }],
      toolsUsed: [],
    };

    logAgentResult(result);

    const output = consoleSpy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('none');

    consoleSpy.mockRestore();
  });
});
