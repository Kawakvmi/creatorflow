import { Campaign, Card, MockUser, ChecklistItem } from "../types";
import { addDays, subDays } from "date-fns";

const today = new Date();

export const seedMockUser: MockUser = {
  name: "Dereck",
  email: "dereck@creatorflow.com",
  avatarSeed: "Dereck",
};

export const seedCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Relançamento do Canal no YouTube",
    description: "Série de vídeos focados no novo formato de vlogs e tutoriais avançados.",
    color: "#8b5cf6",
    icon: "youtube",
    createdAt: subDays(today, 10).toISOString(),
    archived: false,
  },
  {
    id: "camp-2",
    name: "Série de Pitch Decks para Clientes",
    description: "Propostas comerciais e apresentações para o Q3.",
    color: "#0ea5e9",
    icon: "presentation",
    createdAt: subDays(today, 5).toISOString(),
    archived: false,
  },
  {
    id: "camp-3",
    name: "Devlog do Jogo Indie",
    description: "Acompanhamento do desenvolvimento do novo jogo em Unity.",
    color: "#10b981",
    icon: "gamepad-2",
    createdAt: subDays(today, 2).toISOString(),
    archived: false,
  },
];

const videoChecklist: ChecklistItem[] = [
  { id: "chk-v-1", label: "Roteiro escrito",     done: true  },
  { id: "chk-v-2", label: "Narração gravada",    done: true  },
  { id: "chk-v-3", label: "Trilha sonora",       done: false },
  { id: "chk-v-4", label: "Thumbnail/arte",      done: false },
  { id: "chk-v-5", label: "Edição finalizada",   done: false },
  { id: "chk-v-6", label: "Revisão de qualidade",done: false },
];

const presentationChecklist: ChecklistItem[] = [
  { id: "chk-p-1", label: "Estrutura definida",  done: true  },
  { id: "chk-p-2", label: "Conteúdo escrito",    done: true  },
  { id: "chk-p-3", label: "Design dos slides",   done: true  },
  { id: "chk-p-4", label: "Dados revisados",     done: false },
  { id: "chk-p-5", label: "Exportação final",    done: false },
];

const gameChecklist: ChecklistItem[] = [
  { id: "chk-g-1", label: "Conceito/GDD",              done: true  },
  { id: "chk-g-2", label: "Assets visuais",            done: false },
  { id: "chk-g-3", label: "Protótipo/programação",     done: false },
  { id: "chk-g-4", label: "Testes",                    done: false },
];

export const seedCards: Card[] = [
  {
    id: "card-1",
    campaignId: "camp-1",
    title: "Episódio 1: Revelando meu fluxo de edição",
    description: "Um mergulho nas ferramentas que utilizo diariamente.",
    contentType: "video",
    stage: "editing",
    priority: "high",
    approvalStatus: "pending",
    dueDate: addDays(today, 2).toISOString(),
    checklist: videoChecklist,
    guidebook: [],
    createdAt: subDays(today, 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "card-2",
    campaignId: "camp-1",
    title: "Episódio 2: Como crescer em 2026",
    description: "Dicas de engajamento e retenção.",
    contentType: "video",
    stage: "script",
    priority: "medium",
    approvalStatus: "pending",
    dueDate: addDays(today, 7).toISOString(),
    checklist: videoChecklist.map(c => ({ ...c, done: false })),
    guidebook: [],
    createdAt: subDays(today, 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "card-3",
    campaignId: "camp-2",
    title: "Proposta Comercial — Cliente A",
    description: "Apresentação personalizada para o novo projeto.",
    contentType: "presentation",
    stage: "review",
    priority: "high",
    approvalStatus: "pending",
    dueDate: addDays(today, 3).toISOString(),
    checklist: presentationChecklist,
    guidebook: [],
    createdAt: subDays(today, 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "card-4",
    campaignId: "camp-3",
    title: "Devlog #1: Movimentação Básica",
    description: "Primeiro update de progresso do jogo.",
    contentType: "game",
    stage: "art",
    priority: "medium",
    approvalStatus: "pending",
    dueDate: addDays(today, 5).toISOString(),
    checklist: gameChecklist,
    guidebook: [],
    createdAt: subDays(today, 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
