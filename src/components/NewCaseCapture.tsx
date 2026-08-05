import React, { useState, useRef } from 'react';
import { Case, DeduplicationResult, CaseCategory, Priority } from '../types';
import { 
  Camera, 
  Mail, 
  FileText, 
  Upload, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Link as LinkIcon, 
  PlusCircle, 
  ArrowRight, 
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

interface NewCaseCaptureProps {
  existingCases: Case[];
  onCreateNewCase: (newCase: Partial<Case>) => void;
  onAppendToCase: (targetCaseId: string, timelineItem: any) => void;
  onCancel: () => void;
}

export const NewCaseCapture: React.FC<NewCaseCaptureProps> = ({
  existingCases,
  onCreateNewCase,
  onAppendToCase,
  onCancel
}) => {
  const [sourceType, setSourceType] = useState<'camera' | 'upload' | 'email' | 'note'>('camera');
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  
  // States during analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState<'input' | 'dedup' | 'finalize'>('input');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [dedupResult, setDedupResult] = useState<DeduplicationResult | null>(null);

  // Form fields for finalizing
  const [caseTitle, setCaseTitle] = useState('');
  const [category, setCategory] = useState<CaseCategory>('Urzędowa');
  const [priority, setPriority] = useState<Priority>('Średni');
  const [parties, setParties] = useState('');
  const [summary, setSummary] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera handling
  const startCamera = async () => {
    try {
      setIsCapturingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Kamera niedostępna:', err);
      alert('Nie można uzyskać dostępu do kamery. Możesz wgrać plik ze skanem lub wkleić treść e-maila.');
      setIsCapturingCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturingCamera(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process and analyze with Gemini (Agrafka)
  const processInput = async () => {
    setIsAnalyzing(true);
    try {
      // Step 1: Scan & Extract via /api/scan-document
      const scanRes = await fetch('/api/scan-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: capturedImage || undefined,
          textData: inputText || undefined
        })
      });

      const scanJson = await scanRes.json();
      if (!scanJson.success) throw new Error(scanJson.error || 'Błąd skanowania');

      const extracted = scanJson.data;
      setExtractedData(extracted);

      // Populate form defaults
      setCaseTitle(extracted.title || 'Dokument bez tytułu');
      setCategory(extracted.category || 'Urzędowa');
      setPriority(extracted.priority || 'Średni');
      setParties(Array.isArray(extracted.parties) ? extracted.parties.join(', ') : extracted.parties || '');
      setSummary(extracted.summary || '');

      // Step 2: Check deduplication via /api/check-deduplication
      const dedupRes = await fetch('/api/check-deduplication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDoc: extracted,
          existingCases
        })
      });

      const dedupJson = await dedupRes.json();
      if (dedupJson.success && dedupJson.data) {
        setDedupResult(dedupJson.data);
      }

      setStep('dedup');
    } catch (err: any) {
      console.error(err);
      alert('Nie udało się przetłumaczyć pisma: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute Append to Existing Case
  const handleExecuteAppend = () => {
    if (!dedupResult || !dedupResult.targetCaseId) return;

    const timelineItem = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString(),
      type: sourceType === 'camera' || sourceType === 'upload' ? 'scan' : 'email',
      title: extractedData?.title || caseTitle,
      description: extractedData?.summary || summary,
      author: sourceType === 'camera' ? 'Aparat' : 'E-mail',
      metadata: {
        ocrContent: extractedData?.ocrContent,
        referenceNumber: extractedData?.referenceNumber
      }
    };

    onAppendToCase(dedupResult.targetCaseId, timelineItem);
  };

  // Execute Create New Case
  const handleExecuteCreateNew = () => {
    const caseNumber = `SPR/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;

    const newCase: Partial<Case> = {
      caseNumber,
      title: caseTitle,
      category,
      priority,
      status: 'Nowa',
      summary,
      parties: parties.split(',').map(p => p.trim()).filter(Boolean),
      tags: [category, priority, 'Agrafka 📎'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      actionCount: 1,
      isArchived: false,
      isKnowledgeBase: false,
      notebook: `### 📎 Wyjaśnienie Agrafki:\n\n- **Podsumowanie**: ${summary}\n- **Strony**: ${parties}`,
      timeline: [
        {
          id: 'tl-' + Date.now(),
          date: new Date().toISOString(),
          type: sourceType === 'camera' || sourceType === 'upload' ? 'scan' : 'email',
          title: extractedData?.title || caseTitle,
          description: summary,
          author: 'Agrafka 📎'
        }
      ],
      linkedSource: {
        type: sourceType === 'email' ? 'email' : 'scan',
        originalContent: extractedData?.ocrContent || inputText
      }
    };

    onCreateNewCase(newCase);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md max-w-4xl mx-auto space-y-6 text-stone-900">
      
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              Przetłumacz Nowe Pismo z Agrafką 📎
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Zrób zdjęcie pisma z ZUS, wklej e-mail od hurtowni lub umowę. Przełożę to na prosty język!
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* STEP 1: Input selection */}
      {step === 'input' && (
        <div className="space-y-6">
          
          {/* Tabs for source */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => { setSourceType('camera'); setCapturedImage(null); }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition ${
                sourceType === 'camera'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-sm'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-medium'
              }`}
            >
              <Camera className="w-6 h-6 text-amber-600" />
              <span className="text-xs">📸 Aparat w telefonie</span>
            </button>

            <button
              onClick={() => { setSourceType('upload'); setCapturedImage(null); }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition ${
                sourceType === 'upload'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-sm'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-medium'
              }`}
            >
              <Upload className="w-6 h-6 text-emerald-600" />
              <span className="text-xs">📁 Wgraj plik / Zdjęcie</span>
            </button>

            <button
              onClick={() => { setSourceType('email'); setCapturedImage(null); stopCamera(); }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition ${
                sourceType === 'email'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-sm'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-medium'
              }`}
            >
              <Mail className="w-6 h-6 text-blue-600" />
              <span className="text-xs">✉️ Wklej e-mail</span>
            </button>

            <button
              onClick={() => { setSourceType('note'); setCapturedImage(null); stopCamera(); }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition ${
                sourceType === 'note'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-sm'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-medium'
              }`}
            >
              <FileText className="w-6 h-6 text-purple-600" />
              <span className="text-xs">📝 Notatka / Oferta</span>
            </button>
          </div>

          {/* Camera Capture Interface */}
          {sourceType === 'camera' && (
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center space-y-4">
              {!isCapturingCamera && !capturedImage && (
                <div className="py-6 space-y-3">
                  <Camera className="w-12 h-12 text-stone-400 mx-auto" />
                  <p className="text-sm font-semibold text-stone-700">Skieruj obiektyw aparatu na pismo z ZUS, wezwanie lub umowę</p>
                  <button
                    onClick={startCamera}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
                  >
                    Włącz aparat 📷
                  </button>
                </div>
              )}

              {isCapturingCamera && (
                <div className="space-y-3">
                  <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={takeSnapshot}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
                    >
                      Zrób zdjęcie pisma 📸
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-stone-200 text-stone-800 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-3">
                  <img src={capturedImage} alt="Skan" className="max-h-64 mx-auto rounded-2xl border border-stone-300 shadow" />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="text-xs text-amber-700 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Powtórz zdjęcie
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upload File Interface */}
          {sourceType === 'upload' && (
            <div className="bg-stone-50 p-8 rounded-2xl border-2 border-dashed border-stone-300 text-center space-y-4">
              <Upload className="w-10 h-10 text-amber-600 mx-auto" />
              <div>
                <p className="text-sm font-bold text-stone-800">Wybierz zdjęcie pisma z dysku lub telefonu</p>
                <p className="text-xs text-stone-500">Obsługiwane pliki: JPG, PNG, WEBP</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block mx-auto text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-600 cursor-pointer"
              />
              {capturedImage && (
                <div className="mt-4">
                  <img src={capturedImage} alt="Załadowano" className="max-h-48 mx-auto rounded-xl border border-stone-300 shadow" />
                </div>
              )}
            </div>
          )}

          {/* Email or Note Input */}
          {(sourceType === 'email' || sourceType === 'note') && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                {sourceType === 'email' ? 'Wklej całą wiadomość e-mail (np. od kontrahenta lub ZUS):' : 'Wpisz treść notatki lub ustalenia:'}
              </label>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  sourceType === 'email'
                    ? "Dzień dobry, przesyłam projekt umowy dostawy olejów dla Pana warsztatu..."
                    : "Pani Wanda dostała pismo ws. przeliczenia stażu..."
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-4 text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-500 hover:text-stone-800"
            >
              Anuluj
            </button>
            <button
              disabled={isAnalyzing || (!capturedImage && !inputText.trim())}
              onClick={processInput}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-sm transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agrafka czyta pismo i tłumaczy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tłumacz na prosty język 📎</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: Deduplication & Smart Link Matching Result */}
      {step === 'dedup' && dedupResult && (
        <div className="space-y-6">
          
          {/* Analysis Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Wyjaśnienie Agrafki 📎</span>
              <span className="text-xs text-stone-500 font-mono">Dopasowanie: {dedupResult.matchConfidence}%</span>
            </div>
            
            <h3 className="font-extrabold text-stone-900 text-base">{caseTitle}</h3>
            <p className="text-sm text-stone-800 leading-relaxed bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-sm font-medium">
              {summary}
            </p>
          </div>

          {/* DEDUPLICATION MATCH DISPLAY */}
          {dedupResult.matchType === 'exact_link' || dedupResult.matchType === 'possible_link' ? (
            <div className="bg-amber-100/80 border-2 border-amber-300 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500 text-stone-950 rounded-xl font-bold shrink-0">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-base">
                    Znaleźliśmy wcześniejszą sprawę na ten sam temat!
                  </h4>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    Agrafka sprawdziła bazę i wykryła, że to nowe pismo dopisuje się do sprawy: <strong className="text-stone-900 underline font-bold">{dedupResult.targetCaseTitle}</strong>.
                  </p>
                  <p className="text-xs text-stone-700 mt-2 bg-white/90 p-3 rounded-xl border border-amber-200">
                    💡 <em>"{dedupResult.reason}"</em>
                  </p>
                </div>
              </div>

              {/* Action Buttons for Match */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExecuteAppend}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold p-3 rounded-xl text-sm shadow-sm transition"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Dopisz pismo do tej samej sprawy</span>
                </button>

                <button
                  onClick={() => setStep('finalize')}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-bold p-3 rounded-xl text-sm border border-stone-300 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Załóż osobną nową sprawę</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">To całkowicie nowa sprawa!</h4>
                  <p className="text-xs text-emerald-800">Brak wcześniejszych podobnych pism. Zapisujemy w nowym folderze.</p>
                </div>
              </div>
              <button
                onClick={() => setStep('finalize')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm transition"
              >
                Przejdź do zapisania →
              </button>
            </div>
          )}

        </div>
      )}

      {/* STEP 3: Finalize New Case Form */}
      {step === 'finalize' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-2">
            Zapisz sprawę w bezpiecznej szufladzie
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-stone-700 font-bold">Tytuł sprawy / Pisma:</label>
              <input
                type="text"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-stone-700 font-bold">Kategoria:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CaseCategory)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="Urzędowa">Urzędowa (ZUS, Urzędy)</option>
                  <option value="Biznesowa / Współpraca">Biznesowa / E-mail</option>
                  <option value="Umowa">Umowa</option>
                  <option value="Podatki / Finanse">Podatki / Finanse</option>
                  <option value="Prawna">Prawna</option>
                  <option value="Inne">Inne</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-700 font-bold">Ważność:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="Pilny">Ważne</option>
                  <option value="Wysoki">Warto zerknąć</option>
                  <option value="Średni">Spokojnie</option>
                  <option value="Niski">Na wolną chwilę</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-stone-700 font-bold">Nadawca / Firma / Urząd:</label>
              <input
                type="text"
                value={parties}
                onChange={(e) => setParties(e.target.value)}
                placeholder="np. ZUS Poznań, Hurtownia Auto-Zapas"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-stone-700 font-bold">Wyjaśnienie Agrafki 📎 (po ludzku):</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={() => setStep('input')}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              ← Wróć do zdjęcia
            </button>
            <button
              onClick={handleExecuteCreateNew}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-sm transition"
            >
              Zapisz Sprawę 💾
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
