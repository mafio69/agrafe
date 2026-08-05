import React, { useState } from 'react';
import { Case, CaseStatus, Priority, CaseCategory } from '../types';
import { 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  Sparkles, 
  Filter,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
  Smile
} from 'lucide-react';

interface KanbanBoardProps {
  cases: Case[];
  onSelectCase: (caseItem: Case) => void;
  onUpdateStatus: (caseId: string, newStatus: CaseStatus) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const COLUMNS: { id: CaseStatus; title: string; subtitle: string; color: string; badgeBg: string }[] = [
  { id: 'Nowa', title: 'Niedawno wpłynęło', subtitle: 'Do przejrzenia', color: 'border-blue-400', badgeBg: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'W toku', title: 'W trakcie załatwiania', subtitle: 'Agrafka pomaga', color: 'border-amber-400', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'Oczekuje', title: 'Czeka na urząd / odpowiedź', subtitle: 'Wysłane', color: 'border-purple-400', badgeBg: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'Weryfikacja', title: 'Do sprawdzenia', subtitle: 'Ostatnie uwagi', color: 'border-indigo-400', badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'Zakończona', title: 'Załatwione i odłożone! 🎉', subtitle: 'Spokój ducha', color: 'border-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cases,
  onSelectCase,
  onUpdateStatus,
  searchQuery,
  setSearchQuery
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');
  const [selectedPriority, setSelectedPriority] = useState<string>('Wszystkie');

  // Filter cases
  const filteredCases = cases.filter(c => {
    if (c.isArchived || c.isKnowledgeBase) return false;
    
    if (selectedCategory !== 'Wszystkie' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'Wszystkie' && c.priority !== selectedPriority) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchNum = c.caseNumber.toLowerCase().includes(q);
      const matchSummary = c.summary.toLowerCase().includes(q);
      const matchParty = c.parties.some(p => p.toLowerCase().includes(q));
      const matchTag = c.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchNum || matchSummary || matchParty || matchTag;
    }

    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Pilny':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-600" /> Ważne</span>;
      case 'Wysoki':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-xs font-bold">Warto zerknąć</span>;
      case 'Średni':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold">Spokojnie</span>;
      case 'Niski':
        return <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-full text-xs font-medium">Na wolną chwilę</span>;
    }
  };

  const getCategoryBadge = (category: CaseCategory) => {
    return <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md border border-stone-200 font-semibold">{category}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Friendly Mascot Hero Card for User (Pani Wanda / Pan Marek Mechanik) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-orange-50/80 border border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Paperclip className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 flex items-center gap-2">
              Dzień dobry! Jestem Twoja Agrafka 📎
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-2xl leading-relaxed">
              Dostałeś e-mail od firmy albo pismo z ZUS i nie wiesz, o co chodzi? 
              Kliknij dowolną sprawę poniżej — przełożyłem wszystko z trudnego urzędowego na nasz prosty język!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-sm shrink-0">
          <Smile className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-bold text-stone-800">Wszystko pod kontrolą</span>
        </div>
      </div>

      {/* Controls / Filters Header */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider font-bold">
            <Filter className="w-4 h-4 text-amber-600" />
            Filtruj widok:
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-50 text-xs text-stone-800 font-semibold border border-stone-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="Wszystkie">Wszystkie rodzaje pism</option>
            <option value="Urzędowa">Urzędowa (ZUS, Urzędy)</option>
            <option value="Biznesowa / Współpraca">Biznesowa / E-maile</option>
            <option value="Umowa">Umowy</option>
            <option value="Podatki / Finanse">Podatki i US</option>
            <option value="Prawna">Prawna</option>
            <option value="Inne">Inne</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-stone-50 text-xs text-stone-800 font-semibold border border-stone-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="Wszystkie">Wszystkie priorytety</option>
            <option value="Pilny">Ważne</option>
            <option value="Wysoki">Warto zerknąć</option>
            <option value="Średni">Spokojnie</option>
            <option value="Niski">Na wolną chwilę</option>
          </select>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-4 text-xs text-stone-600 font-medium">
          <div>
            Aktywne pisma: <span className="font-bold text-stone-900">{filteredCases.length}</span>
          </div>
          <div className="h-4 w-px bg-stone-200" />
          <div className="flex items-center gap-1.5 text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Gotowe wyjaśnienia Agrafki 📎</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colCases = filteredCases.filter(c => c.status === col.id);

          return (
            <div key={col.id} className="bg-stone-100/70 rounded-2xl border border-stone-200 p-3 min-w-[280px] flex flex-col min-h-[500px]">
              
              {/* Column Title */}
              <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">{col.title}</h3>
                  <p className="text-[11px] text-stone-500">{col.subtitle}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${col.badgeBg}`}>
                  {colCases.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1">
                {colCases.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs p-4 text-center">
                    Brak pism w tej kolumnie
                  </div>
                ) : (
                  colCases.map(caseItem => {
                    const isStale = caseItem.actionCount === 0 || (Date.now() - new Date(caseItem.lastActivityAt).getTime()) > 14 * 24 * 3600 * 1000;

                    return (
                      <div
                        key={caseItem.id}
                        onClick={() => onSelectCase(caseItem)}
                        className="bg-white hover:bg-amber-50/40 border border-stone-200 hover:border-amber-400/80 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition group relative flex flex-col justify-between space-y-3"
                      >
                        <div>
                          {/* Case Number & Priority */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-mono font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                              {caseItem.caseNumber}
                            </span>
                            {getPriorityBadge(caseItem.priority)}
                          </div>

                          {/* Category */}
                          <div className="mb-2">
                            {getCategoryBadge(caseItem.category)}
                          </div>

                          {/* Title */}
                          <h4 className="font-bold text-stone-900 group-hover:text-amber-700 transition line-clamp-2 text-sm">
                            {caseItem.title}
                          </h4>

                          {/* Summary preview */}
                          <p className="text-xs text-stone-600 line-clamp-3 my-2 leading-relaxed bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                            <strong className="text-amber-900 font-semibold block mb-0.5">Wyjaśnienie Agrafki 📎:</strong>
                            {caseItem.summary}
                          </p>

                          {/* Parties */}
                          {caseItem.parties.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 mt-2">
                              <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                              <span className="truncate max-w-[200px] font-medium">{caseItem.parties.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Meta */}
                        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                          
                          {/* Actions counter & Stale Warning */}
                          <div className="flex items-center gap-1.5">
                            {isStale ? (
                              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                Do przejrzenia
                              </span>
                            ) : (
                              <span className="text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full font-semibold">
                                {caseItem.actionCount} wpisy
                              </span>
                            )}
                          </div>

                          {/* Time relative */}
                          <div className="flex items-center gap-1 text-stone-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(caseItem.lastActivityAt).toLocaleDateString('pl-PL', { month: 'numeric', day: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Quick Shift Status Controls */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                          <div className="text-[11px] text-stone-500 font-semibold">
                            Przesuń:
                          </div>
                          <div className="flex items-center gap-1">
                            {col.id !== 'Nowa' && (
                              <button
                                title="Wróć krok w tył"
                                onClick={() => {
                                  const idx = COLUMNS.findIndex(c => c.id === col.id);
                                  if (idx > 0) onUpdateStatus(caseItem.id, COLUMNS[idx - 1].id);
                                }}
                                className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {col.id !== 'Zakończona' && (
                              <button
                                title="Przesuń do przodu"
                                onClick={() => {
                                  const idx = COLUMNS.findIndex(c => c.id === col.id);
                                  if (idx < COLUMNS.length - 1) onUpdateStatus(caseItem.id, COLUMNS[idx + 1].id);
                                }}
                                className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-700 font-bold flex items-center gap-1 transition text-xs"
                              >
                                <span>Dalej</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
