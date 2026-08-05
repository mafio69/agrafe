import React, { useState, useEffect } from 'react';
import { 
  googleDriveSignIn, 
  googleDriveSignOut, 
  initDriveAuth, 
  listDriveFiles, 
  uploadTextFileToDrive, 
  deleteDriveFile,
  readDriveFileContent,
  DriveFile 
} from '../lib/drive';
import { Case } from '../types';
import { User } from 'firebase/auth';
import { 
  HardDrive, 
  X, 
  UploadCloud, 
  Search, 
  Trash2, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  FolderDown,
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';

interface GoogleDriveModalProps {
  onClose: () => void;
  cases: Case[];
  onImportCaseFromFile?: (title: string, content: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  onClose,
  cases,
  onImportCaseFromFile
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  
  // Confirmation state for destructive operations
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (u, token) => {
        setUser(u);
        setDriveToken(token);
        loadFiles();
      },
      () => {
        setUser(null);
        setDriveToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const driveFiles = await listDriveFiles(searchQuery);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nie udało się pobrać listy plików z Dysk Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleDriveSignIn();
      if (result) {
        setUser(result.user);
        setDriveToken(result.accessToken);
        setSuccessMsg('Zalogowano pomyślnie do Google Drive!');
        loadFiles();
      }
    } catch (err: any) {
      setError(err.message || 'Błąd logowania do konta Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleDriveSignOut();
    setUser(null);
    setDriveToken(null);
    setFiles([]);
    setSuccessMsg('Wylogowano z Google Drive.');
  };

  const handleExportCase = async () => {
    if (!selectedCaseId) {
      setError('Wybierz sprawę do wyeksportowania.');
      return;
    }

    const c = cases.find(item => item.id === selectedCaseId);
    if (!c) return;

    setLoading(true);
    setError(null);
    try {
      const fileContent = `================================================
AGRAFKA - EKSPORT SPRAWY DO GOOGLE DRIVE
================================================
Numer sprawy: ${c.caseNumber}
Tytuł: ${c.title}
Kategoria: ${c.category}
Status: ${c.status}
Data utworzenia: ${new Date(c.createdAt).toLocaleString('pl-PL')}

PODSUMOWANIE (JĘZYK PROSTY):
${c.summary}

TREŚĆ NOTATNIKA / PISMA:
${c.notebook || 'Brak'}

CZYNNOŚCI I KROKI Wykonane (${c.timeline?.length || 0}):
${c.timeline?.map(t => `- [${new Date(t.date).toLocaleDateString('pl-PL')}] ${t.title}: ${t.description}`).join('\n') || 'Brak'}

================================================
Wygenerowano przez aplikację Agrafka 📎
================================================`;

      const fileName = `Agrafka_${c.caseNumber.replace(/\//g, '_')}_${c.title.substring(0, 20)}.txt`;
      const result = await uploadTextFileToDrive(fileName, fileContent, 'text/plain');

      setSuccessMsg(`Pomyślnie zapisano plik "${result.name}" w Google Drive! 📁`);
      loadFiles();
    } catch (err: any) {
      setError(err.message || 'Nie udało się zapisać pliku w Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async (file: DriveFile) => {
    setLoading(true);
    setError(null);
    try {
      const text = await readDriveFileContent(file.id);
      if (onImportCaseFromFile) {
        onImportCaseFromFile(file.name, text);
        setSuccessMsg(`Zaimportowano plik "${file.name}" jako nową sprawę! 📑`);
      }
    } catch (err: any) {
      setError(err.message || 'Nie udało się odczytać zawartości wybranego pliku z Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDriveFile(fileToDelete.id);
      setSuccessMsg(`Plik "${fileToDelete.name}" został trwale usunięty z Google Drive.`);
      setFileToDelete(null);
      loadFiles();
    } catch (err: any) {
      setError(err.message || 'Nie udało się usunąć pliku z Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl my-auto p-6 sm:p-8 space-y-6 shadow-xl text-stone-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                Google Drive 📁
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Zapisuj swoje pisma, analizy i zgłoszenia w chmurze Google Drive lub importuj zapisane pliki.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-center gap-2 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2 font-medium shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Section */}
        {!user || !driveToken ? (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-xs border border-stone-200">
              <HardDrive className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-stone-900">Połącz aplikację z Google Drive</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto font-medium">
                Uzyskaj bezpośredni dostęp do swoich dokumentów, eksportuj oficjalne potwierdzenia i trzymaj archiwa w chmurze Google.
              </p>
            </div>

            {/* Official Google Sign in button pattern */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex items-center gap-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-extrabold px-6 py-3 rounded-2xl text-sm shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Zaloguj się kontem Google</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 overflow-y-auto pr-1 flex-1">
            
            {/* User Account Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border border-stone-300" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-extrabold text-stone-900">{user.displayName || user.email}</p>
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Zalogowano do Google Drive
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadFiles}
                  className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Odśwież</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Wyloguj</span>
                </button>
              </div>
            </div>

            {/* Export Case Action Box */}
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-3">
              <h3 className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-amber-700" />
                Zapisz wybraną sprawę z Agrafki do Google Drive:
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none font-medium"
                >
                  <option value="">-- Wybierz sprawę do wyeksportowania --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>

                <button
                  onClick={handleExportCase}
                  disabled={loading || !selectedCaseId}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-5 py-2 rounded-xl text-xs shadow-xs transition disabled:opacity-50 whitespace-nowrap"
                >
                  Zapisz plik .txt
                </button>
              </div>
            </div>

            {/* Files List in Google Drive */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">
                  Twoje Ostatnie Pliki w Google Drive ({files.length}):
                </h3>
                
                {/* Search Bar */}
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Szukaj pliku w Drive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                    className="w-full bg-stone-100 border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              {files.length === 0 ? (
                <div className="border border-stone-200 rounded-2xl p-6 text-center text-xs text-stone-400">
                  {loading ? 'Ładowanie plików z Google Drive...' : 'Nie znaleziono żadnych plików w Google Drive.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files.map(f => (
                    <div key={f.id} className="bg-white border border-stone-200 hover:border-blue-400 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs transition">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-stone-900 truncate">{f.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            {f.createdTime ? new Date(f.createdTime).toLocaleDateString('pl-PL') : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onImportCaseFromFile && (
                          <button
                            onClick={() => handleImportFile(f)}
                            title="Zaimportuj jako sprawę w Agrafce"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <FolderDown className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Importuj</span>
                          </button>
                        )}

                        {f.webViewLink && (
                          <a
                            href={f.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold"
                            title="Otwórz w nowej karcie Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setFileToDelete(f)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs"
                          title="Usuń plik z Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Mandatory User Confirmation Modal for Destructive Delete */}
        {fileToDelete && (
          <div className="fixed inset-0 z-60 bg-stone-900/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-200">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="text-base font-extrabold text-stone-900">Potwierdź usunięcie pliku</h4>
              </div>

              <p className="text-xs text-stone-600 font-medium leading-relaxed">
                Czy na pewno chcesz usunąć plik <strong>"{fileToDelete.name}"</strong> z konta Google Drive? Operacja jest nieodwracalna.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-200"
                >
                  Anuluj
                </button>
                <button
                  onClick={confirmDeleteFile}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-extrabold rounded-xl hover:bg-rose-700 shadow-xs flex items-center gap-1.5"
                >
                  {isDeleting ? 'Usuwanie...' : 'Tak, usuń trwale'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-stone-100 flex justify-end shrink-0">
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
