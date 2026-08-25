import { useMemo, useState } from 'react';
import type { AIChatMessage, AIProvider } from '../types';

export function useChat(provider: AIProvider, model: string) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canChat = useMemo(() => model.trim().length > 0, [model]);
  async function send(content: string): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed || isThinking || !canChat) return;
    const userMessage: AIChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages); setError(null); setIsThinking(true);
    try { const response = await provider.chat({ model, messages: nextMessages }); setMessages((current) => [...current, response.message]); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not connect to Ollama.'); }
    finally { setIsThinking(false); }
  }
  return { messages, isThinking, error, canChat, send, clearError: () => setError(null), clearChat: () => { setMessages([]); setError(null); } };
}
