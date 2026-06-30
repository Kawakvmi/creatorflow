export type ContentType = "video" | "presentation" | "game" | "layout" | "site" | "identity";

export const contentTypeLabels: Record<ContentType, string> = {
  video: "Vídeo",
  presentation: "Apresentação",
  game: "Game",
  layout: "Layout",
  site: "Site",
  identity: "Identidade Visual",
};

export type Stage = "script" | "narration" | "art" | "editing" | "review" | "published";

export const stageLabels: Record<Stage, string> = {
  script: "Roteiro",
  narration: "Narração",
  art: "Arte",
  editing: "Edição",
  review: "Revisão",
  published: "Publicado",
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Reprovado",
};

export interface Campaign {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  dueDate?: string;
  archived: boolean;
  clientId?: string | null;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface GuidebookBlock {
  id: string;
  type: "text" | "image";
  content: string;
  order: number;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  notes: string;
  email?: string;
  whatsapp?: string;
  driveLink?: string;
  createdAt: string;
}

export interface Card {
  id: string;
  campaignId: string | null;
  clientId?: string | null;
  title: string;
  description: string;
  contentType: ContentType;
  stage: Stage;
  priority: "low" | "medium" | "high";
  approvalStatus: ApprovalStatus;
  dueDate: string;
  actualDeliveryDate?: string | null;
  coverImageId?: string;
  checklist: ChecklistItem[];
  guidebook: GuidebookBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  name: string;
  email: string;
  avatarSeed: string;
}
