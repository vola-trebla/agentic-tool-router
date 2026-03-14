import type { AgentResult, LLMProvider, Message, Step, Tool } from './types.js';
import { getToolByName, getAllTools } from './tools/registry.js';

const MAX_ITERATIONS = 5;

const SYSTEM_PROMPT = `You are a space frog 🐸 assistant (with humor and philosophy). You answer questions about space using real-time data from NASA.

You have access to these tools:
{{tools}}

Follow this loop:
1. Think about what data you need to answer the question
2. Call the appropriate tool using the tool calling mechanism
3. Observe the result
4. Repeat steps 1-3 if you need more data from other tools
5. When you have enough information, provide your final answer

STRICT RULES:
- ALWAYS use function calls to get data. NEVER write "I called X" or "I will call X" in text.
- Do NOT describe tool usage in text — just call the tool directly.
- If a question needs multiple tools, call them ONE BY ONE via function calls.
- When you have enough data, give a complete answer explaining data in human-friendly terms.
- Compare distances to the Moon (384,400 km), sizes to familiar objects (football fields, buses, buildings).
- Explain complex numbers with simple analogies so anyone can understand.
- If you don't have a tool for something, say so honestly and answer with what you have.`;

function buildSystemPrompt(tools: Tool[]): string {
  const toolList = tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');
  return SYSTEM_PROMPT.replace('{{tools}}', toolList);
}

export async function runAgent(question: string, provider: LLMProvider): Promise<AgentResult> {
  const tools = getAllTools();
  const steps: Step[] = [];
  const toolsUsed: string[] = [];

  const messages: Message[] = [
    { role: 'system', content: buildSystemPrompt(tools) },
    { role: 'user', content: question },
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await provider.chat(messages);

    if (response.toolCall) {
      const toolName = response.toolCall.name;

      steps.push({
        type: 'act',
        content: `Calling tool: ${toolName}`,
        toolName,
        timestamp: Date.now(),
      });

      const tool = getToolByName(toolName);

      if (!tool) {
        steps.push({
          type: 'observe',
          content: `Tool "${toolName}" not found`,
          timestamp: Date.now(),
        });
        messages.push({
          role: 'user',
          content: `Tool "${toolName}" not found. Use a different tool or answer with what you have.`,
        });
        continue;
      }

      const result = await tool.execute();

      if (!toolsUsed.includes(toolName)) {
        toolsUsed.push(toolName);
      }

      const observation = result.success ? JSON.stringify(result.data) : `Error: ${result.error}`;

      steps.push({
        type: 'observe',
        content: observation,
        timestamp: Date.now(),
      });

      messages.push({
        role: 'user',
        content: `[Tool result for ${toolName}]: ${observation}`,
      });

      continue;
    }

    if (response.text) {
      steps.push({
        type: 'final',
        content: response.text,
        timestamp: Date.now(),
      });

      return {
        answer: response.text,
        steps,
        toolsUsed,
      };
    }
  }

  const lastStep = steps.findLast((s) => s.type === 'final' || s.type === 'think');

  return {
    answer: lastStep?.content ?? 'I ran out of steps. Try a simpler question.',
    steps,
    toolsUsed,
  };
}
