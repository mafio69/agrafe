import React from 'react';
import { Sparkles, X, Check, ShieldCheck, Zap, RefreshCw, Heart } from 'lucide-react';

interface CreditsModalProps {
  balance: number;
  onClose: () => void;
  onTopUpFree: (amount: number) => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  balance,
  onClose,
  onTopUpFree
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl my-auto p-6 sm:p-8 space-y-6 shadow-xl text-stone-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Pula Agrafek AI 📎
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">
                Przejrzyste i darmowe korzystanie bez obaw o wysokie opłaty.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-2xl p-5 text-stone-950 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Twój Aktualny Stan:</span>
            <div className="text-3xl font-extrabold flex items-center gap-2 mt-1">
              <span>{balance} Agrafek</span>
              <span className="text-xs font-bold bg-white/90 text-stone-900 px-2.5 py-0.5 rounded-full shadow-xs">
                {balance > 20 ? 'Zapasy bezpieczne 👍' : 'Mało Agrafek ⚠️'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              onTopUpFree(50);
              alert('Dodano +50 Agrafek do Twojego konta! 🎉');
            }}
            className="bg-stone-950 hover:bg-stone-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Doładuj darmowo (+50)</span>
          </button>
        </div>

        {/* Transparent Pricing Rules */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" /> Jak działa nasza przeliczeniowa pula Agrafek?
          </h3>
          
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs text-stone-700 leading-relaxed font-medium">
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pakiet na start:</strong> Każdy użytkownik dostaje <strong>100 darmowych Agrafek AI</strong> bez podawania karty kredytowej.</span>
            </p>
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Nie znika jak śnieg w piekarniku!</strong> Twoja pula nie wygasa na koniec miesiąca. Używasz tylko wtedy, gdy faktycznie przetłumaczysz pismo lub wygenerujesz pismo do ZUS.</span>
            </p>
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Standardowe koszty:</strong> 📸 Zdjęcie + OCR pisma (2 Agrafki), 📄 Tłumaczenie z polskiego na nasze (1 Agrafka), 🔍 Sprawdzenie w Google (2 Agrafki).</span>
            </p>
          </div>
        </div>

        {/* Top-up Subscription Plans preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="border border-stone-200 rounded-2xl p-4 bg-white space-y-2">
            <span className="text-xs font-bold text-stone-500 uppercase">Pakiet Okazjonalny</span>
            <div className="text-lg font-extrabold text-stone-900">500 Agrafek</div>
            <p className="text-xs text-stone-500">Wystarcza na przetłumaczenie ponad 250 pism i odpowiedź.</p>
            <div className="pt-2 flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-sm">9 PLN / jednorazowo</span>
              <button
                onClick={() => {
                  onTopUpFree(500);
                  alert('Testowo aktywowano pakiet 500 Agrafek! 🎉');
                }}
                className="bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold px-3 py-1.5 rounded-xl text-xs transition"
              >
                Wybierz
              </button>
            </div>
          </div>

          <div className="border border-amber-300 rounded-2xl p-4 bg-amber-50/60 space-y-2">
            <span className="text-xs font-bold text-amber-900 uppercase">Pakiet Nielimitowany</span>
            <div className="text-lg font-extrabold text-stone-900">Stała Opieka 📎</div>
            <p className="text-xs text-stone-600">Nielimitowane tłumaczenie dokumentów, wklejanie e-maili i asystent.</p>
            <div className="pt-2 flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-sm">19 PLN / miesiąc</span>
              <button
                onClick={() => {
                  onTopUpFree(1000);
                  alert('Testowo aktywowano nielimitowaną opiekę Agrafki! 🎉');
                }}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs"
              >
                Aktywuj
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold px-6 py-2 rounded-xl text-xs shadow-xs"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
