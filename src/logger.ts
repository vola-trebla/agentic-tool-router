import type { AgentResult } from './types.js';

const ICONS: Record<string, string> = {
  think: '🧠',
  act: '🔧',
  observe: '👁️',
};

export function logAgentResult(result: AgentResult): void {
  console.log('\n=== Agent Reasoning Trace ===\n');

  for (const step of result.steps) {
    const icon = ICONS[step.type] ?? '•';
    const label = step.type.toUpperCase().padEnd(7);
    const tool = step.toolName ? ` [${step.toolName}]` : '';

    console.log(`${icon} ${label}${tool}`);
    console.log(`  ${step.content.slice(0, 200)}`);
    console.log();
  }

  console.log('=== Final Answer ===\n');
  console.log(result.answer);
  console.log(`\nTools used: ${result.toolsUsed.join(', ') || 'none'}`);
}
