import React, { useState, useEffect } from 'react';
import { 
  Case, 
  CaseStatus, 
  KnowledgeArticle, 
  KeepNote, 
  CalendarEvent, 
  TaskItem,
  TimelineItem,
  AppTab 
} from './types';
import { 
  INITIAL_CASES, 
  INITIAL_KNOWLEDGE, 
  INITIAL_KEEP_NOTES, 
  INITIAL_TASKS 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { NewCaseCapture } from './components/NewCaseCapture';
import { CaseDetailModal } from './components/CaseDetailModal';
import { CollectorGuardView } from './components/CollectorGuardView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { CalendarTasksView } from './components/CalendarTasksView';
import { CreditsModal } from './components/CreditsModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  // Google Drive Modal State
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Agrafki AI Balance & Wallet Modal State
  const [agrafkiBalance, setAgrafkiBalance] = useState<number>(() => {
    const saved = localStorage.getItem('agrafki_balance');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);

  // Main State
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('kancelaria_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [knowledge, setKnowledge] = useState<KnowledgeArticle[]>(() => {
    const saved = localStorage.getItem('kancelaria_knowledge');
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE;
  });

  const [keepNotes, setKeepNotes] = useState<KeepNote[]>(() => {
    const saved = localStorage.getItem('kancelaria_keep');
    return saved ? JSON.parse(saved) : INITIAL_KEEP_NOTES;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('kancelaria_events');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cal-1',
        caseId: 'case-1',
        title: 'Przelew składki ZUS / Odpowiedź',
        start: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        end: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        description: 'Pismo z ZUS - wyjaśnienie składki wypadkowej'
      }
    ];
  });
  
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('kancelaria_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('agrafki_balance', agrafkiBalance.toString());
  }, [agrafkiBalance]);

  useEffect(() => {
    localStorage.setItem('kancelaria_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('kancelaria_knowledge', JSON.stringify(knowledge));
  }, [knowledge]);

  useEffect(() => {
    localStorage.setItem('kancelaria_keep', JSON.stringify(keepNotes));
  }, [keepNotes]);

  useEffect(() => {
    localStorage.setItem('kancelaria_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('kancelaria_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleDeductAgrafki = (amount: number = 1) => {
    setAgrafkiBalance(prev => Math.max(0, prev - amount));
  };

  const handleTopUpFreeAgrafki = (amount: number) => {
    setAgrafkiBalance(prev => prev + amount);
  };

  // Case Handlers
  const handleCreateNewCase = (newCaseData: Partial<Case>) => {
    handleDeductAgrafki(2); // Deduct 2 Agrafki for new document scanning/translation
    const fullCase: Case = {
      id: 'case-' + Date.now(),
      caseNumber: newCaseData.caseNumber || `SPR/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      title: newCaseData.title || 'Nowa sprawa',
      category: newCaseData.category || 'Urzędowa',
      status: 'Nowa',
      priority: newCaseData.priority || 'Średni',
      summary: newCaseData.summary || '',
      parties: newCaseData.parties || [],
      tags: newCaseData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      actionCount: 1,
      isArchived: false,
      isKnowledgeBase: false,
      notebook: newCaseData.notebook || '',
      timeline: newCaseData.timeline || [],
      linkedSource: newCaseData.linkedSource
    };

    setCases(prev => [fullCase, ...prev]);
    setActiveTab('kanban');
    setSelectedCase(fullCase);
  };

  const handleAppendToCase = (targetCaseId: string, timelineItem: TimelineItem) => {
    setCases(prev => prev.map(c => {
      if (c.id === targetCaseId) {
        return {
          ...c,
          lastActivityAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          actionCount: c.actionCount + 1,
          timeline: [...c.timeline, timelineItem]
        };
      }
      return c;
    }));

    const updatedTarget = cases.find(c => c.id === targetCaseId);
    if (updatedTarget) {
      setSelectedCase({
        ...updatedTarget,
        lastActivityAt: new Date().toISOString(),
        actionCount: updatedTarget.actionCount + 1,
        timeline: [...updatedTarget.timeline, timelineItem]
      });
    }

    setActiveTab('kanban');
  };

  const handleUpdateStatus = (caseId: string, newStatus: CaseStatus) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  const handleUpdateCase = (updated: Case) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCase(updated);
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę sprawę z bazy?')) {
      setCases(prev => prev.filter(c => c.id !== caseId));
      if (selectedCase?.id === caseId) setSelectedCase(null);
    }
  };

  const handleArchiveCase = (caseId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, isArchived: true, status: 'Zarchiwizowana' } : c));
  };

  const handleMoveToKnowledge = (caseItem: Case, articleTitle: string, category: string) => {
    const newArt: KnowledgeArticle = {
      id: 'know-' + Date.now(),
      caseId: caseItem.id,
      title: articleTitle || caseItem.title,
      category: category || caseItem.category,
      content: `${caseItem.summary}\n\nPodsumowanie Osi Czasu:\n` + caseItem.timeline.map(t => `- ${t.title}: ${t.description}`).join('\n'),
      tags: caseItem.tags,
      createdAt: new Date().toISOString()
    };

    setKnowledge(prev => [newArt, ...prev]);
    // Mark case as knowledge base item
    setCases(prev => prev.map(c => c.id === caseItem.id ? { ...c, isKnowledgeBase: true, status: 'BazaWiedzy' } : c));
    alert('Pomyślnie zamieniono sprawę na materiał referencyjny w Bazie Wiedzy! 📚');
  };

  // Keep Notes handlers
  const handleAddKeepNote = (note: Partial<KeepNote>) => {
    const fullNote: KeepNote = {
      id: 'keep-' + Date.now(),
      caseId: note.caseId || '',
      title: note.title || 'Notatka',
      content: note.content || '',
      color: note.color || '#fef3c7',
      pinned: false,
      createdAt: new Date().toISOString()
    };
    setKeepNotes(prev => [fullNote, ...prev]);
  };

  const handleDeleteKeepNote = (noteId: string) => {
    setKeepNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Calendar Event handlers
  const handleAddCalendarEvent = (event: Partial<CalendarEvent>) => {
    const fullEvt: CalendarEvent = {
      id: 'cal-' + Date.now(),
      caseId: event.caseId || '',
      title: event.title || 'Sprawa',
      start: event.start || new Date().toISOString(),
      end: event.end || new Date().toISOString(),
      description: event.description
    };
    setCalendarEvents(prev => [fullEvt, ...prev]);
  };

  // Task handlers
  const handleAddTask = (task: Partial<TaskItem>) => {
    const fullTask: TaskItem = {
      id: 'task-' + Date.now(),
      caseId: task.caseId || '',
      title: task.title || 'Zadanie',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      priority: task.priority || 'Średni'
    };
    setTasks(prev => [fullTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleAddKnowledgeArticle = (article: Partial<KnowledgeArticle>) => {
    const fullArt: KnowledgeArticle = {
      id: 'know-' + Date.now(),
      title: article.title || 'Tytuł',
      category: article.category || 'Ogólna',
      content: article.content || '',
      tags: article.tags || [],
      createdAt: new Date().toISOString()
    };
    setKnowledge(prev => [fullArt, ...prev]);
  };

  const staleCount = cases.filter(c => !c.isArchived && !c.isKnowledgeBase && (
    c.actionCount === 0 || 
    (Date.now() - new Date(c.lastActivityAt).getTime()) > 14 * 24 * 3600 * 1000
  )).length;

  const totalActiveCases = cases.filter(c => !c.isArchived && !c.isKnowledgeBase).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickScan={() => setActiveTab('new_case')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        staleCount={staleCount}
        totalActiveCases={totalActiveCases}
        agrafkiBalance={agrafkiBalance}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Tab 1: Kanban Board */}
        {activeTab === 'kanban' && (
          <KanbanBoard
            cases={cases}
            onSelectCase={(c) => setSelectedCase(c)}
            onUpdateStatus={handleUpdateStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* Tab 2: Capture / New Case Modal View */}
        {activeTab === 'new_case' && (
          <NewCaseCapture
            existingCases={cases.filter(c => !c.isArchived)}
            onCreateNewCase={handleCreateNewCase}
            onAppendToCase={handleAppendToCase}
            onCancel={() => setActiveTab('kanban')}
          />
        )}

        {/* Tab 3: Calendar & Tasks Direct View */}
        {activeTab === 'calendar_tasks' && (
          <CalendarTasksView
            events={calendarEvents}
            tasks={tasks}
            cases={cases.filter(c => !c.isArchived)}
            onAddEvent={handleAddCalendarEvent}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onSelectCase={(c) => setSelectedCase(c)}
          />
        )}

        {/* Tab 4: Anti-Spam & Collector Guard */}
        {activeTab === 'collector' && (
          <CollectorGuardView
            cases={cases}
            onDeleteCase={handleDeleteCase}
            onArchiveCase={handleArchiveCase}
            onMoveToKnowledge={handleMoveToKnowledge}
          />
        )}

        {/* Tab 5: Knowledge Base */}
        {activeTab === 'knowledge' && (
          <KnowledgeBaseView
            articles={knowledge}
            onAddArticle={handleAddKnowledgeArticle}
          />
        )}

      </main>

      {/* Credits / Business Model Modal */}
      {isCreditsModalOpen && (
        <CreditsModal
          balance={agrafkiBalance}
          onClose={() => setIsCreditsModalOpen(false)}
          onTopUpFree={handleTopUpFreeAgrafki}
        />
      )}

      {/* Google Drive Workspace Modal */}
      {isDriveModalOpen && (
        <GoogleDriveModal
          onClose={() => setIsDriveModalOpen(false)}
          cases={cases.filter(c => !c.isArchived)}
          onImportCaseFromFile={(title, content) => {
            handleCreateNewCase({
              title: `[Z Dysku] ${title}`,
              summary: content.slice(0, 200) + '...',
              notebook: content,
              category: 'Urzędowa'
            });
            setIsDriveModalOpen(false);
            setActiveTab('kanban');
          }}
        />
      )}

      {/* Case Detail Modal View */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdateCase={handleUpdateCase}
          keepNotes={keepNotes}
          onAddKeepNote={handleAddKeepNote}
          onDeleteKeepNote={handleDeleteKeepNote}
          calendarEvents={calendarEvents}
          onAddCalendarEvent={handleAddCalendarEvent}
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onOpenDriveModal={() => setIsDriveModalOpen(true)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 text-xs py-4 px-6 text-center">
        <span>Kancelaria i Sprawy &copy; 2026. Zbudowano w Google AI Studio z napędem Gemini 2.5 i Google Workspace.</span>
      </footer>

    </div>
  );
}
