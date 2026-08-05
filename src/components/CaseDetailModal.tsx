import React, { useState } from 'react';
import { 
  Case, 
  CaseStatus, 
  TimelineItem, 
  KeepNote, 
  CalendarEvent, 
  TaskItem 
} from '../types';
import { 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  FileText, 
  Mail, 
  CheckSquare, 
  Sparkles, 
  Search, 
  Send, 
  Plus, 
  ExternalLink, 
  Pin, 
  Trash2, 
  BookOpen, 
  Loader2, 
  Check, 
  AlertTriangle,
  FileCode,
  Tag,
  Users
} from 'lucide-react';

interface CaseDetailModalProps {
  caseItem: Case;
  onClose: () => void;
  onUpdateCase: (updatedCase: Case) => void;
  keepNotes: KeepNote[];
  onAddKeepNote: (note: Partial<KeepNote>) => void;
  onDeleteKeepNote: (noteId: string) => void;
  calendarEvents: CalendarEvent[];
  onAddCalendarEvent: (event: Partial<CalendarEvent>) => void;
  tasks: TaskItem[];
  onAddTask: (task: Partial<TaskItem>) => void;
  onToggleTask: (taskId: string) => void;
  onOpenDriveModal?: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  onUpdateCase,
  keepNotes,
  onAddKeepNote,
  onDeleteKeepNote,
  calendarEvents,
  onAddCalendarEvent,
  tasks,
  onAddTask,
  onToggleTask,
  onOpenDriveModal
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'notebook' | 'research' | 'workspace'>('timeline');

  // Timeline new item state
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Gemini Notebook state
  const [notebookContent, setNotebookContent] = useState(caseItem.notebook || '');
  const [isGeneratingNotebook, setIsGeneratingNotebook] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Deep Research state
  const [researchQuery, setResearchQuery] = useState('');
  const [isSearchingResearch, setIsSearchingResearch] = useState(false);
  const [researchResult, setResearchResult] = useState<{ text: string; sources: Array<{ title: string; url: string }> } | null>(null);

  // Keep Notes form state
  const [newKeepTitle, setNewKeepTitle] = useState('');
  const [newKeepContent, setNewKeepContent] = useState('');
  const [newKeepColor, setNewKeepColor] = useState('#fef3c7');

  // Calendar Event form state
  const [calTitle, setCalTitle] = useState('');
  const [calDate, setCalDate] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Update Status
  const handleStatusChange = (newStatus: CaseStatus) => {
    const updated = {
      ...caseItem,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      actionCount: caseItem.actionCount + 1,
      timeline: [
        ...caseItem.timeline,
        {
          id: 'tl-' + Date.now(),
          date: new Date().toISOString(),
          type: 'decision' as const,
          title: `Zmiana statusu sprawy na: ${newStatus}`,
          description: `Zaktualizowano status z ${caseItem.status} na ${newStatus}`,
          author: 'Agrafka 📎'
        }
      ]
    };
    onUpdateCase(updated);
  };

  // Add Manual Note to Timeline
  const handleAddTimelineNote = () => {
    if (!newNoteText.trim()) return;

    const newItem: TimelineItem = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString(),
      type: 'note',
      title: 'Notatka własna',
      description: newNoteText,
      author: 'Użytkownik'
    };

    const updated = {
      ...caseItem,
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      actionCount: caseItem.actionCount + 1,
      timeline: [...caseItem.timeline, newItem]
    };

    onUpdateCase(updated);
    setNewNoteText('');
    setShowAddNote(false);
  };

  // Trigger Gemini Notebook Action (Agrafka)
  const handleNotebookAction = async (actionType: 'synthesize' | 'draft_reply' | 'extract_deadlines' | 'custom') => {
    setIsGeneratingNotebook(true);
    try {
      const res = await fetch('/api/notebook-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          currentNotebook: notebookContent,
          caseDetails: caseItem,
          userPrompt: customPrompt
        })
      });

      const json = await res.json();
      if (json.success && json.text) {
        const appendText = `\n\n---\n### 📎 Odpowiedź Agrafki (${new Date().toLocaleTimeString('pl-PL')})\n${json.text}`;
        const newNotebook = notebookContent + appendText;
        setNotebookContent(newNotebook);
        
        // Save to case
        onUpdateCase({
          ...caseItem,
          notebook: newNotebook,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
      alert('Nie udało się wygenerować odpowiedzi od Agrafki.');
    } finally {
      setIsGeneratingNotebook(false);
      setCustomPrompt('');
    }
  };

  // Import Notebook Content to Case Timeline
  const handleImportNotebookToTimeline = () => {
    if (!notebookContent.trim()) return;

    const newItem: TimelineItem = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString(),
      type: 'gemini_research',
      title: 'Podsumowanie Agrafki 📎',
      description: notebookContent.slice(0, 300) + '...',
      author: 'Agrafka 📎',
      metadata: { fullContent: notebookContent }
    };

    onUpdateCase({
      ...caseItem,
      lastActivityAt: new Date().toISOString(),
      actionCount: caseItem.actionCount + 1,
      timeline: [...caseItem.timeline, newItem]
    });

    alert('Zapisano podsumowanie Agrafki w osi czasu sprawy! 📎');
  };

  // Execute Deep Research Search Grounding
  const handleExecuteResearch = async () => {
    if (!researchQuery.trim()) return;
    setIsSearchingResearch(true);
    try {
      const res = await fetch('/api/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: caseItem.title,
          caseContext: caseItem.summary,
          query: researchQuery
        })
      });

      const json = await res.json();
      if (json.success) {
        setResearchResult({
          text: json.text,
          sources: json.sources || []
        });
      }
    } catch (err) {
      console.error(err);
      alert('Wystąpił problem z przeszukiwaniem informacji.');
    } finally {
      setIsSearchingResearch(false);
    }
  };

  // Attach Deep Research result to Notebook or Timeline
  const handleAttachResearchToCase = (destination: 'notebook' | 'timeline') => {
    if (!researchResult) return;

    if (destination === 'notebook') {
      const added = `\n\n### 📎 Wynik sprawdzania: ${researchQuery}\n${researchResult.text}\n\n**Źródła**:\n${researchResult.sources.map(s => `- [${s.title}](${s.url})`).join('\n')}`;
      const updatedNb = notebookContent + added;
      setNotebookContent(updatedNb);
      onUpdateCase({ ...caseItem, notebook: updatedNb });
      alert('Dodano wyjaśnienie do notatek sprawy!');
    } else {
      const newItem: TimelineItem = {
        id: 'tl-' + Date.now(),
        date: new Date().toISOString(),
        type: 'gemini_research',
        title: `Sprawdzono: ${researchQuery}`,
        description: researchResult.text.slice(0, 350) + '...',
        author: 'Google Wyszukiwarka'
      };
      onUpdateCase({
        ...caseItem,
        lastActivityAt: new Date().toISOString(),
        actionCount: caseItem.actionCount + 1,
        timeline: [...caseItem.timeline, newItem]
      });
      alert('Wpisano w historię sprawy!');
    }
  };

  // Create Keep Note
  const handleCreateKeep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeepTitle.trim()) return;
    onAddKeepNote({
      caseId: caseItem.id,
      title: newKeepTitle,
      content: newKeepContent,
      color: newKeepColor,
      pinned: false,
      createdAt: new Date().toISOString()
    });
    setNewKeepTitle('');
    setNewKeepContent('');
  };

  // Create Calendar Event
  const handleCreateCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle.trim() || !calDate) return;
    onAddCalendarEvent({
      caseId: caseItem.id,
      title: calTitle,
      start: calDate,
      end: calDate,
      description: `Sprawa: ${caseItem.caseNumber} - ${caseItem.title}`
    });
    // Also log to timeline
    const newItem: TimelineItem = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString(),
      type: 'calendar',
      title: `Termin: ${calTitle}`,
      description: `Przypomnienie w Kalendarzu na dzień ${calDate}`,
      author: 'Google Calendar'
    };
    onUpdateCase({
      ...caseItem,
      lastActivityAt: new Date().toISOString(),
      actionCount: caseItem.actionCount + 1,
      timeline: [...caseItem.timeline, newItem]
    });
    setCalTitle('');
    setCalDate('');
  };

  // Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      caseId: caseItem.id,
      title: taskTitle,
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      completed: false,
      priority: caseItem.priority
    });
    setTaskTitle('');
    setTaskDueDate('');
  };

  const caseKeepNotes = keepNotes.filter(n => n.caseId === caseItem.id);
  const caseCalendarEvents = calendarEvents.filter(e => e.caseId === caseItem.id);
  const caseTasks = tasks.filter(t => t.caseId === caseItem.id);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col shadow-xl overflow-hidden text-stone-900">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs bg-white text-stone-700 font-bold px-2 py-0.5 rounded-md border border-stone-200 shadow-xs">
                {caseItem.caseNumber}
              </span>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                {caseItem.category}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {caseItem.actionCount} czynności
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">{caseItem.title}</h2>
            
            {/* Agrafka Plain Polish Box */}
            <div className="mt-2 text-xs bg-amber-50 p-3 rounded-2xl border border-amber-200/80 text-stone-800 leading-relaxed font-medium">
              <strong className="text-amber-900 block font-bold mb-0.5">Wyjaśnienie Agrafki 📎 (z polskiego na nasze):</strong>
              {caseItem.summary}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
            {/* Google Drive Export/Sync Button */}
            {onOpenDriveModal && (
              <button
                onClick={onOpenDriveModal}
                title="Zapisz sprawę w Google Drive"
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow-xs"
              >
                <span>Google Drive 📁</span>
              </button>
            )}

            {/* Status Change Selector */}
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-semibold pl-2">Status:</span>
              <select
                value={caseItem.status}
                onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                className="bg-stone-50 text-xs text-amber-900 font-bold px-2.5 py-1 rounded-lg border border-stone-300 focus:outline-none"
              >
                <option value="Nowa">Niedawno wpłynęło</option>
                <option value="W toku">W trakcie załatwiania</option>
                <option value="Oczekuje">Czeka na odpowiedź</option>
                <option value="Weryfikacja">Do sprawdzenia</option>
                <option value="Zakończona">Załatwione i odłożone 🎉</option>
              </select>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-xl text-stone-400 hover:text-stone-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs Header */}
        <div className="flex items-center gap-2 px-6 border-b border-stone-200 bg-stone-50/50 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-amber-500 text-amber-900 bg-amber-100/60'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>📜 Historia & Linia Czasu</span>
            <span className="bg-white text-stone-700 px-2 py-0.5 rounded-full text-xs font-bold border border-stone-200">
              {caseItem.timeline?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'notebook'
                ? 'border-amber-500 text-amber-900 bg-amber-100/60'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>📎 Notes Agrafki (Tłumacz & Pisma)</span>
          </button>

          <button
            onClick={() => setActiveTab('research')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'research'
                ? 'border-amber-500 text-amber-900 bg-amber-100/60'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-600" />
            <span>🔍 Sprawdź w Google</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'workspace'
                ? 'border-amber-500 text-amber-900 bg-amber-100/60'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>📅 Kalendarz & Przypomnienia</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              
              {/* Timeline Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-700">Co wydarzyło się nowego?</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddNote(!showAddNote)}
                    className="flex items-center gap-1.5 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-stone-300 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dopisz notatkę</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('workspace')}
                    className="flex items-center gap-1.5 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-stone-300 shadow-xs transition"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Wydarzenie</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('workspace')}
                    className="flex items-center gap-1.5 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-stone-300 shadow-xs transition"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Zadanie</span>
                  </button>
                </div>
              </div>

              {/* Add Note Collapsible Form */}
              {showAddNote && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900">Dopisz notatkę do historii sprawy:</h4>
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Wpisz treść rozmowy, to co ustalono przez telefon lub przemyślenia..."
                    className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddNote(false)} className="px-3 py-1.5 text-xs text-stone-500 font-semibold">
                      Anuluj
                    </button>
                    <button
                      onClick={handleAddTimelineNote}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs"
                    >
                      Zapisz w historii 💾
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Visual Timeline List */}
              <div className="relative border-l-2 border-stone-200 ml-4 space-y-6 pt-2">
                {caseItem.timeline.map((item, idx) => (
                  <div key={item.id || idx} className="relative pl-6 group">
                    
                    {/* Node Dot */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    </div>

                    <div className="bg-white border border-stone-200 group-hover:border-amber-400 p-4 rounded-2xl space-y-2 shadow-xs transition">
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          {item.type === 'scan' && <FileText className="w-3.5 h-3.5 text-amber-600" />}
                          {item.type === 'email' && <Mail className="w-3.5 h-3.5 text-blue-600" />}
                          {item.type === 'gemini_research' && <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                          {item.type === 'calendar' && <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />}
                          {item.title}
                        </span>
                        <span className="text-stone-400 font-mono">
                          {new Date(item.date).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {item.description}
                      </p>

                      {item.author && (
                        <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                          <span>Źródło: <strong>{item.author}</strong></span>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: GEMINI NOTEBOOK */}
          {activeTab === 'notebook' && (
            <div className="space-y-6">
              
              {/* Notebook Header & AI Actions */}
              <div className="bg-amber-50/70 p-4.5 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Notes Agrafki 📎 dla tej Sprawy
                  </h3>
                  <button
                    onClick={handleImportNotebookToTimeline}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-xs"
                  >
                    <span>Dodaj efekty do Historii 📥</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    disabled={isGeneratingNotebook}
                    onClick={() => handleNotebookAction('synthesize')}
                    className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-300 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Napisz wyrozumiałe wyjaśnienie</span>
                  </button>

                  <button
                    disabled={isGeneratingNotebook}
                    onClick={() => handleNotebookAction('draft_reply')}
                    className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-300 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ułóż odpowiedź / e-mail</span>
                  </button>

                  <button
                    disabled={isGeneratingNotebook}
                    onClick={() => handleNotebookAction('extract_deadlines')}
                    className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-300 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Wypisz terminy i krok po kroku</span>
                  </button>
                </div>

                {/* Custom prompt input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Zapytaj Agrafkę o cokolwiek dot. tej sprawy..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <button
                    disabled={isGeneratingNotebook || !customPrompt.trim()}
                    onClick={() => handleNotebookAction('custom')}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 shadow-xs"
                  >
                    {isGeneratingNotebook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Zapytaj</span>
                  </button>
                </div>
              </div>

              {/* Notebook Content Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700">Notatki & Wyjaśnienia Agrafki:</label>
                <textarea
                  rows={14}
                  value={notebookContent}
                  onChange={(e) => setNotebookContent(e.target.value)}
                  placeholder="Notatki Agrafki pojawią się w tym miejscu..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-4 text-xs font-mono text-stone-900 leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

            </div>
          )}

          {/* TAB 3: DEEP RESEARCH & SEARCH GROUNDING */}
          {activeTab === 'research' && (
            <div className="space-y-6">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <h3 className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-600" /> Sprawdź w Google Wyszukiwarce
                </h3>
                <p className="text-xs text-stone-600">
                  Chcesz sprawdzić adres urzędu, przepisy ZUS, godziny otwarcia lub dane kontrahenta z KRS?
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    placeholder="np. ZUS Poznań kontakt godziny urzędowania..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                  <button
                    disabled={isSearchingResearch || !researchQuery.trim()}
                    onClick={handleExecuteResearch}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 transition shadow-xs"
                  >
                    {isSearchingResearch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Szukaj</span>
                  </button>
                </div>
              </div>

              {/* Research Output Display */}
              {researchResult && (
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <span className="text-xs font-bold text-stone-900">Wyniki wyszukiwania w internecie</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAttachResearchToCase('notebook')}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs px-3 py-1 rounded-lg border border-stone-300"
                      >
                        Wklej do Notesu 📝
                      </button>
                      <button
                        onClick={() => handleAttachResearchToCase('timeline')}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs px-3 py-1 rounded-lg shadow-xs"
                      >
                        Wpisz w Historię 📥
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                    {researchResult.text}
                  </p>

                  {/* Sources List */}
                  {researchResult.sources.length > 0 && (
                    <div className="pt-3 border-t border-stone-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-500">Zweryfikowane Źródła:</span>
                      <ul className="space-y-1">
                        {researchResult.sources.map((src, i) => (
                          <li key={i}>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-cyan-700 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{src.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 4: GOOGLE WORKSPACE & KEEP INTEGRATION */}
          {activeTab === 'workspace' && (
            <div className="space-y-8">
              
              {/* GOOGLE KEEP NOTES */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <Pin className="w-4 h-4 text-amber-600" /> Szybkie Notatki (Google Keep)
                </h3>

                <form onSubmit={handleCreateKeep} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newKeepTitle}
                    onChange={(e) => setNewKeepTitle(e.target.value)}
                    placeholder="Tytuł notatki..."
                    className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none font-medium"
                  />
                  <input
                    type="text"
                    value={newKeepContent}
                    onChange={(e) => setNewKeepContent(e.target.value)}
                    placeholder="Krótka treść..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none font-medium"
                  />
                  <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs">
                    Zapisz Notatkę
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {caseKeepNotes.length === 0 ? (
                    <div className="text-xs text-stone-400 py-2">Brak przypiętych notatek dla tej sprawy.</div>
                  ) : (
                    caseKeepNotes.map(note => (
                      <div key={note.id} className="p-3.5 rounded-2xl border border-amber-300 text-stone-900 relative shadow-xs bg-amber-100/70">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-bold text-xs">{note.title}</h5>
                          <button onClick={() => onDeleteKeepNote(note.id)} className="text-stone-500 hover:text-rose-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* GOOGLE CALENDAR */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600" /> Kalendarz Google (Przypomnienia)
                </h3>

                <form onSubmit={handleCreateCalendar} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    placeholder="Co zaplanować (np. przelew z ZUS, wizyta)..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none font-medium"
                  />
                  <input
                    type="date"
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none font-medium"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs">
                    Dodaj do Kalendarza
                  </button>
                </form>

                <div className="space-y-2">
                  {caseCalendarEvents.map(evt => (
                    <div key={evt.id} className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs shadow-xs">
                      <span className="font-bold text-stone-900">{evt.title}</span>
                      <span className="text-blue-700 font-bold font-mono">{evt.start}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GOOGLE TASKS */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" /> Lista Zadań (Google Tasks)
                </h3>

                <form onSubmit={handleCreateTask} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Nowe zadanie..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none font-medium"
                  />
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none font-medium"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs">
                    Utwórz Zadanie
                  </button>
                </form>

                <div className="space-y-2">
                  {caseTasks.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs shadow-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleTask(task.id)}
                          className="rounded text-emerald-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className={task.completed ? 'line-through text-stone-400 font-medium' : 'text-stone-900 font-bold'}>
                          {task.title}
                        </span>
                      </label>
                      <span className="text-stone-500 font-mono font-medium">{task.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
