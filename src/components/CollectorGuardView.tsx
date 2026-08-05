import React, { useState, useEffect } from 'react';
import { Case, StaleCaseAnalysis, KnowledgeArticle } from '../types';
import { 
  ShieldCheck, 
  Trash2, 
  BookOpen, 
  Archive, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

interface CollectorGuardViewProps {
  cases: Case[];
  onDeleteCase: (caseId: string) => void;
  onArchiveCase: (caseId: string) => void;
  onMoveToKnowledge: (caseItem: Case, articleTitle: string, category: string) => void;
}

export const CollectorGuardView: React.FC<CollectorGuardViewProps> = ({
  cases,
  onDeleteCase,
  onArchiveCase,
  onMoveToKnowledge
}) => {
  const [analyses, setAnalyses] = useState<StaleCaseAnalysis[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Filter inactive/low action cases
  const inactiveCases = cases.filter(c => !c.isArchived && !c.isKnowledgeBase && (
    c.actionCount === 0 || 
    (Date.now() - new Date(c.lastActivityAt).getTime()) > 14 * 24 * 3600 * 1000
  ));

  const runAnalysis = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/detect-stale-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cases: inactiveCases })
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAnalyses(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (inactiveCases.length > 0) {
      runAnalysis();
    }
  }, [cases.length]);

  return (
    <div className="space-y-6 text-stone-900">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 border border-amber-300 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm text-stone-950">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/90 text-amber-900 rounded-2xl shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-stone-950">
              Porządki i Ochrona Przed Niepotrzebnymi Papierami 📎
            </h2>
            <p className="text-xs text-stone-900 mt-1 max-w-2xl leading-relaxed font-medium">
              Zamiast trzymać w nieskończoność stary reklamy lub e-maile, z których nic nie wynika — Agrafka podpowie Ci, co warto bezpiecznie wyrzucić albo schować do <strong>Szafy na Przyszłość (Bazy Wiedzy)</strong>.
            </p>
          </div>
        </div>

        <button
          disabled={isScanning || inactiveCases.length === 0}
          onClick={runAnalysis}
          className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-50 whitespace-nowrap"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
          <span>Sprawdź bezczynne sprawy ({inactiveCases.length})</span>
        </button>
      </div>

      {/* List of Inactive & Stale Cases */}
      {inactiveCases.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-extrabold text-stone-900">Wszystkie dokumenty są na swoim miejscu!</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto font-medium">
            Żadna sprawa nie leży bezużytecznie. Agrafka nie znalazła żadnego zbędnego spamu w Twojej szafce.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-stone-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Dokumenty i sprawy leżące bez ruchu — decyzja dla Pana / Pani:
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {inactiveCases.map(caseItem => {
              const analysis = analyses.find(a => a.caseId === caseItem.id);

              return (
                <div
                  key={caseItem.id}
                  className="bg-white border border-stone-200 hover:border-amber-400 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded border border-stone-200">
                        {caseItem.caseNumber}
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                        {caseItem.actionCount} czynności
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        Ostatnio zerkano: {new Date(caseItem.lastActivityAt).toLocaleDateString('pl-PL')}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-stone-900 text-base">{caseItem.title}</h4>
                    <p className="text-xs text-stone-700 line-clamp-2 font-medium">{caseItem.summary}</p>

                    {/* Agrafka Recommendation */}
                    {analysis && (
                      <div className="mt-2 text-xs bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-stone-800 flex items-start gap-2 font-medium">
                        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span><strong>Rekomendacja Agrafki 📎:</strong> {analysis.explanation}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Collector */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 w-full md:w-auto">
                    
                    <button
                      onClick={() => onMoveToKnowledge(caseItem, caseItem.title, caseItem.category)}
                      className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-stone-300 shadow-xs transition"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Szafa na Przyszłość 📚</span>
                    </button>

                    <button
                      onClick={() => onArchiveCase(caseItem.id)}
                      className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-stone-300 shadow-xs transition"
                    >
                      <Archive className="w-3.5 h-3.5 text-stone-600" />
                      <span>Odłóż do Archiwum 📁</span>
                    </button>

                    <button
                      onClick={() => onDeleteCase(caseItem.id)}
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-200 shadow-xs transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Wyrzuć do kosza 🗑️</span>
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
