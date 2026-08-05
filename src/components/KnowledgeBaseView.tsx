import React, { useState } from 'react';
import { KnowledgeArticle } from '../types';
import { BookOpen, Search, Plus, Tag, Calendar, FileText, X } from 'lucide-react';

interface KnowledgeBaseViewProps {
  articles: KnowledgeArticle[];
  onAddArticle: (article: Partial<KnowledgeArticle>) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  articles,
  onAddArticle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Procedury Urzędowe');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const filteredArticles = articles.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddArticle({
      title,
      category,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    });

    setTitle('');
    setContent('');
    setTags('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Baza Wiedzy & Wzory Pism</h2>
            <p className="text-xs text-slate-400">Przechowuj bezcenne procedury, orzecznictwo i klauzule do ponownego wykorzystania.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj Wpis / Procedurę</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj w Bazie Wiedzy po tytule, kategoria, klauzulach..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map(art => (
          <div key={art.id} className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 space-y-3 shadow-sm transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                {art.category}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3 h-3" />
                {new Date(art.createdAt).toLocaleDateString('pl-PL')}
              </span>
            </div>

            <h3 className="font-bold text-slate-100 text-base">{art.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{art.content}</p>

            {art.tags && art.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                {art.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Nowy Wpis do Bazy Wiedzy</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Tytuł wpisu / procedury:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="np. Wzór wniosku o przywrócenie terminu..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Kategoria:</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Treść / Wzór / Klauzule:</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Tagi (po przecinku):</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="KPA, Wzór, Urząd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-xs text-slate-400">
                  Anuluj
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs">
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
