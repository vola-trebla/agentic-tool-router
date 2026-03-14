export type StepType = 'think' | 'act' | 'observe' | 'final';

export interface Step {
  type: StepType;
  content: string;
  toolName?: string;
  timestamp: number;
}

export interface AgentResult {
  answer: string;
  steps: Step[];
  toolsUsed: string[];
}

export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  execute: () => Promise<ToolResult>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  text: string;
  toolCall?: {
    name: string;
  };
}

export interface LLMProvider {
  chat: (messages: Message[]) => Promise<LLMResponse>;
}
