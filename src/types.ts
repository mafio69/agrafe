export type CaseStatus = 
  | 'Nowa' 
  | 'W toku' 
  | 'Oczekuje' 
  | 'Weryfikacja' 
  | 'Zakończona' 
  | 'BazaWiedzy' 
  | 'Zarchiwizowana';

export type Priority = 'Pilny' | 'Wysoki' | 'Średni' | 'Niski';

export type CaseCategory = 
  | 'Urzędowa' 
  | 'Biznesowa / Współpraca' 
  | 'Umowa' 
  | 'Podatki / Finanse' 
  | 'Prawna' 
  | 'Inne';

export type TimelineItemType = 
  | 'email' 
  | 'scan' 
  | 'note' 
  | 'calendar' 
  | 'task' 
  | 'gemini_research' 
  | 'decision' 
  | 'system'
  | 'keep';

export interface TimelineItem {
  id: string;
  date: string;
  type: TimelineItemType;
  title: string;
  description: string;
  author?: string;
  metadata?: Record<string, any>;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  category: CaseCategory;
  status: CaseStatus;
  priority: Priority;
  summary: string;
  parties: string[];
  tags: string[];
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  actionCount: number;
  isArchived: boolean;
  isKnowledgeBase: boolean;
  notebook: string;
  timeline: TimelineItem[];
  linkedSource?: {
    type: 'email' | 'scan' | 'note' | 'proposal';
    sourceId?: string;
    sender?: string;
    originalContent?: string;
    fileUrl?: string;
  };
}

export interface DocumentItem {
  id: string;
  caseId: string;
  title: string;
  fileType: string;
  ocrContent: string;
  summary: string;
  dataUrl?: string;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  caseId?: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface KeepNote {
  id: string;
  caseId: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  caseId: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  googleCalendarEventId?: string;
}

export interface TaskItem {
  id: string;
  caseId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: Priority;
  googleTaskId?: string;
}

export interface DeduplicationResult {
  matchType: 'exact_link' | 'possible_link' | 'new_case';
  matchConfidence: number; // 0 to 100
  targetCaseId?: string;
  targetCaseTitle?: string;
  reason: string;
  suggestedTitle: string;
  suggestedCategory: CaseCategory;
  suggestedPriority: Priority;
  suggestedParties: string[];
  summary: string;
}

export interface StaleCaseAnalysis {
  caseId: string;
  title: string;
  inactiveDays: number;
  actionCount: number;
  isSpamOrCollector: boolean;
  recommendation: 'delete' | 'knowledge_base' | 'archive' | 'keep_active';
  explanation: string;
}

export type AppTab = 'kanban' | 'new_case' | 'knowledge' | 'collector' | 'calendar_tasks';

