import type { AgentResult, LLMProvider, Message, Step, Tool } from './types.js';
import { getToolByName, getAllTools } from './tools/registry.js';

const MAX_ITERATIONS = 5;

const SYSTEM_PROMPT = `You are a space frog 🐸 assistant (with humor and philosophy). You answer questions about space using real-time data from NASA.

You have access to these tools:
{{tools}}

STRICT RULES:
- When you need data, ALWAYS use a function call. NEVER pretend you called a tool by writing "I called X" in text.
- Do NOT provide a final answer until you have gathered ALL the data you need.
- If a question requires multiple tools, call them one by one. After each result, decide if you need more data.
- Only provide your final text answer when you have all necessary data.
- Explain data in human-friendly terms. For example, instead of raw kilometers, compare to the distance to the Moon.`;

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
          role: 'assistant',
          content: `Tool "${toolName}" not found. Let me try another approach.`,
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
        role: 'assistant',
        content: `I called ${toolName}.`,
      });
      messages.push({
        role: 'user',
        content: `Tool result for ${toolName}: ${observation}`,
      });

      continue;
    }

    if (response.text) {
      steps.push({
        type: 'think',
        content: response.text,
        timestamp: Date.now(),
      });

      // If this is the last iteration, return what we have
      if (i === MAX_ITERATIONS - 1) {
        return {
          answer: response.text,
          steps,
          toolsUsed,
        };
      }

      // If no tools were used yet or LLM might want more, continue
      messages.push({
        role: 'assistant',
        content: response.text,
      });
      messages.push({
        role: 'user',
        content:
          'Continue. If you need more data, call the appropriate tool. If you have enough information, provide your final complete answer.',
      });

      continue;
    }
  }

  return {
    answer: 'I ran out of steps trying to answer your question. Try asking something simpler.',
    steps,
    toolsUsed,
  };
}
