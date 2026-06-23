import { create } from "zustand";
import { Campaign, Card, MockUser, Stage } from "../types";

interface CreatorState {
  campaigns:    Campaign[];
  cards:        Card[];
  user:         MockUser | null;
  isLoading:    boolean;

  // Hydration (called after Supabase fetch)
  setCampaigns: (campaigns: Campaign[]) => void;
  setCards:     (cards: Card[]) => void;
  setLoading:   (v: boolean) => void;

  // Local mutations (optimistic update — Supabase write happens in the caller)
  addCampaign:    (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  removeCampaign: (id: string) => void;

  addCard:         (card: Card) => void;
  updateCard:      (id: string, updates: Partial<Card>) => void;
  updateCardStage: (id: string, stage: Stage) => void;
  removeCard:      (id: string) => void;

  // Auth
  setUser: (user: MockUser | null) => void;

  // Legacy (used by Settings reset)
  resetDemoData: () => void;
  initIfNeeded:  () => void;
}

export const useCreatorStore = create<CreatorState>()((set, get) => ({
  campaigns: [],
  cards:     [],
  user:      null,
  isLoading: true,

  setCampaigns: (campaigns) => set({ campaigns }),
  setCards:     (cards)     => set({ cards }),
  setLoading:   (v)         => set({ isLoading: v }),

  addCampaign: (campaign) =>
    set((s) => ({ campaigns: [campaign, ...s.campaigns] })),

  updateCampaign: (id, updates) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) => c.id === id ? { ...c, ...updates } : c),
    })),

  removeCampaign: (id) =>
    set((s) => ({
      campaigns: s.campaigns.filter((c) => c.id !== id),
      cards:     s.cards.filter((c) => c.campaignId !== id),
    })),

  addCard: (card) =>
    set((s) => ({ cards: [card, ...s.cards] })),

  updateCard: (id, updates) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    })),

  updateCardStage: (id, stage) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, stage, updatedAt: new Date().toISOString() } : c
      ),
    })),

  removeCard: (id) =>
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

  setUser: (user) => set({ user }),

  resetDemoData: () => {
    // No-op after migration — data lives in Supabase
    set({ campaigns: [], cards: [] });
  },

  initIfNeeded: () => {
    // No-op after migration — data is loaded via useSupabaseData hook
    const { isLoading } = get();
    if (isLoading) return;
  },
}));
