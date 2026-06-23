"use client";

import { useEffect } from "react";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import * as db from "@/lib/supabase/db";

export function useSupabaseData() {
  const setCampaigns = useCreatorStore((s) => s.setCampaigns);
  const setCards     = useCreatorStore((s) => s.setCards);
  const setLoading   = useCreatorStore((s) => s.setLoading);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [campaigns, cards] = await Promise.all([
          db.getCampaigns(),
          db.getCards(),
        ]);
        setCampaigns(campaigns);
        setCards(cards);
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setCampaigns, setCards, setLoading]);
}
