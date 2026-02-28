import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation } from './types';
import seedConversations from '../public/data/conversations.json';

interface ConversationStore {
  conversations: Conversation[];
  addConversation: (conv: Conversation) => void;
  updateSpeakerName: (convId: string, speaker: 'A' | 'B', name: string) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      conversations: seedConversations as Conversation[],
      addConversation: (conv) =>
        set((state) => ({ conversations: [...state.conversations, conv] })),
      updateSpeakerName: (convId, speaker, name) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? { ...c, [speaker === 'A' ? 'speakerAName' : 'speakerBName']: name }
              : c
          ),
        })),
    }),
    { name: 'conversations-storage' }
  )
);
