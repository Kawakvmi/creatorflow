import { createClient } from "./client";
import { Campaign, Card, Client, Stage } from "../types";

// ─── Mappers (snake_case DB → camelCase TS) ──────────────────────────────────

function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id:          row.id          as string,
    name:        row.name        as string,
    description: (row.description as string) || "",
    color:       row.color       as string,
    icon:        row.icon        as string,
    archived:    row.archived    as boolean,
    createdAt:   row.created_at  as string,
  };
}

function mapClient(row: Record<string, unknown>): Client {
  return {
    id:        row.id         as string,
    name:      row.name       as string,
    notes:     (row.notes     as string) || "",
    createdAt: row.created_at as string,
  };
}

function mapCard(row: Record<string, unknown>): Card {
  return {
    id:                  row.id                   as string,
    campaignId:          (row.campaign_id         as string) ?? null,
    clientId:            (row.client_id           as string) ?? null,
    title:               row.title                as string,
    description:         (row.description         as string) || "",
    contentType:         row.content_type         as Card["contentType"],
    stage:               row.stage                as Stage,
    priority:            row.priority             as Card["priority"],
    approvalStatus:      row.approval_status      as Card["approvalStatus"],
    dueDate:             row.due_date             as string,
    actualDeliveryDate:  (row.actual_delivery_date as string) ?? null,
    checklist:           (row.checklist           as Card["checklist"]) || [],
    guidebook:           (row.guidebook           as Card["guidebook"]) || [],
    createdAt:           row.created_at           as string,
    updatedAt:           row.updated_at           as string,
  };
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCampaign);
}

export async function createCampaign(
  campaign: Omit<Campaign, "id" | "createdAt">
): Promise<Campaign> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id:     user.id,
      name:        campaign.name,
      description: campaign.description,
      color:       campaign.color,
      icon:        campaign.icon,
      archived:    campaign.archived ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCampaign(data);
}

export async function updateCampaign(
  id: string,
  updates: Partial<Campaign>
): Promise<void> {
  const supabase = createClient();
  const db: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name        !== undefined) db.name        = updates.name;
  if (updates.description !== undefined) db.description = updates.description;
  if (updates.color       !== undefined) db.color       = updates.color;
  if (updates.icon        !== undefined) db.icon        = updates.icon;
  if (updates.archived    !== undefined) db.archived    = updates.archived;
  const { error } = await supabase.from("campaigns").update(db).eq("id", id);
  if (error) throw error;
}

export async function deleteCampaign(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function getCards(): Promise<Card[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCard);
}

export async function createCard(
  card: Omit<Card, "id" | "createdAt" | "updatedAt">
): Promise<Card> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id:              user.id,
      campaign_id:          card.campaignId || null,
      client_id:            card.clientId || null,
      title:                card.title,
      description:          card.description,
      content_type:         card.contentType,
      stage:                card.stage,
      priority:             card.priority,
      approval_status:      card.approvalStatus,
      due_date:             card.dueDate,
      actual_delivery_date: card.actualDeliveryDate || null,
      checklist:            card.checklist,
      guidebook:            card.guidebook,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCard(data);
}

export async function updateCard(
  id: string,
  updates: Partial<Card>
): Promise<void> {
  const supabase = createClient();
  const db: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title               !== undefined) db.title                = updates.title;
  if (updates.description         !== undefined) db.description          = updates.description;
  if (updates.contentType         !== undefined) db.content_type         = updates.contentType;
  if (updates.stage               !== undefined) db.stage                = updates.stage;
  if (updates.priority            !== undefined) db.priority             = updates.priority;
  if (updates.approvalStatus      !== undefined) db.approval_status      = updates.approvalStatus;
  if (updates.dueDate             !== undefined) db.due_date             = updates.dueDate;
  if (updates.actualDeliveryDate  !== undefined) db.actual_delivery_date = updates.actualDeliveryDate;
  if (updates.checklist           !== undefined) db.checklist            = updates.checklist;
  if (updates.guidebook           !== undefined) db.guidebook            = updates.guidebook;
  if (updates.clientId            !== undefined) db.client_id            = updates.clientId ?? null;
  const { error } = await supabase.from("cards").update(db).eq("id", id);
  if (error) throw error;
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw error;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapClient);
}

export async function createClient(client: Omit<Client, "id" | "createdAt">): Promise<Client> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("clients")
    .insert({ user_id: user.id, name: client.name, notes: client.notes || "" })
    .select()
    .single();
  if (error) throw error;
  return mapClient(data);
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  const supabase = createClient();
  const db: Record<string, unknown> = {};
  if (updates.name  !== undefined) db.name  = updates.name;
  if (updates.notes !== undefined) db.notes = updates.notes;
  const { error } = await supabase.from("clients").update(db).eq("id", id);
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}
