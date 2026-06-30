"use client";

import { useEffect } from "react";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import * as db from "@/lib/supabase/db";

export function useSupabaseData() {
  const setCampaigns = useCreatorStore((s) => s.setCampaigns);
  const setCards     = useCreatorStore((s) => s.setCards);
  const setClients   = useCreatorStore((s) => s.setClients);
  const setLoading   = useCreatorStore((s) => s.setLoading);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [campaigns, cards, clients] = await Promise.all([
          db.getCampaigns(),
          db.getCards(),
          db.getClients(),
        ]);
        setCampaigns(campaigns);
        setCards(cards);
        setClients(clients);
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setCampaigns, setCards, setClients, setLoading]);
}
