import React from 'react';
import { 
  Paperclip, 
  FolderKanban, 
  PlusCircle, 
  BookOpen, 
  Camera, 
  ShieldCheck, 
  Search,
  Sparkles,
  Calendar,
  Zap,
  HardDrive
} from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onQuickScan: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  staleCount: number;
  totalActiveCases: number;
  agrafkiBalance: number;
  onOpenCreditsModal: () => void;
  onOpenDriveModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onQuickScan,
  searchQuery,
  setSearchQuery,
  staleCount,
  totalActiveCases,
  agrafkiBalance,
  onOpenCreditsModal,
  onOpenDriveModal
}) => {
  return (
    <header className="bg-white text-stone-900 border-b border-amber-200/70 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Name: Agrafka 📎 */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('kanban')}>
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 transform hover:scale-105 transition">
              <Paperclip className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">Agrafka 📎</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Pomocnik
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Tłumaczymy pisma i ZUS z urzędowego na nasze</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Szukaj po tytule, piśmie z ZUS, nadawcy lub słowach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-100/80 text-sm text-stone-800 placeholder-stone-400 pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right Action Bar: Credits Counter, Google Drive & Scan Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Google Drive Button */}
            <button
              onClick={onOpenDriveModal}
              title="Otwórz Dysk Google 📁"
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-extrabold text-blue-900 transition shadow-xs"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Google Drive</span>
            </button>

            {/* Agrafki AI Balance Badge */}
            <button
              onClick={onOpenCreditsModal}
              title="Zobacz stan Agrafek AI i pakiet"
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-extrabold text-amber-950 transition shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{agrafkiBalance} Agrafek</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onQuickScan}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2 rounded-xl text-sm shadow-sm transition active:scale-95 shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">📸 Zrób zdjęcie / Wklej e-mail</span>
              <span className="sm:hidden">Dodaj</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-stone-100 pt-1.5 pb-2 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'kanban'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-amber-600" />
            <span>📋 Moje Sprawy & Pisma</span>
            <span className="ml-1 bg-white text-stone-700 font-bold px-2 py-0.5 rounded-full text-xs border border-stone-200">
              {totalActiveCases}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new_case')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'new_case'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>➕ Przetłumacz nowe pismo</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar_tasks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'calendar_tasks'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>📅 Kalendarz & Zadania</span>
          </button>

          <button
            onClick={() => setActiveTab('collector')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'collector'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>🧹 Porządki w Szufladzie</span>
            {staleCount > 0 && (
              <span className="bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 rounded-full text-xs font-bold">
                {staleCount} do wyrzucenia
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'knowledge'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-600" />
            <span>📚 Przydatne Ściągi</span>
          </button>
        </div>
      </div>
    </header>
  );
};

