import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini API
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function getGenAIClient() {
  if (!ai) {
    throw new Error('Brak klucza GEMINI_API_KEY. Skonfiguruj klucz w panelu Secrets.');
  }
  return ai;
}

// 1. Scan document / OCR / Multimodal API
app.post('/api/scan-document', async (req, res) => {
  try {
    const { imageData, textData, mimeType = 'image/jpeg' } = req.body;
    
    if (!imageData && !textData) {
      return res.status(400).json({ error: 'Należy przesłać plik graficzny (imageData) lub tekst (textData).' });
    }

    const client = getGenAIClient();
    
    let prompt = `Jesteś wyjątkowo pomocnym, ciepłym i wyrozumiałym asystentem "Agrafką" 📎.
Twoim zadaniem jest zdjęcie wszelkiego stresu z użytkownika (np. Pani Wandy, która boi się skomplikowanego pisma z ZUS, czy Pana Marka mechanika, który dostał długi e-mail z umową).
Tłumaczysz zwięźle, prosto i z klasą z polskiego języka urzędowo-prawniczego na prosty język polski ("z polskiego na nasze").

Zanalizuj poniższy skan pisma urzędowego, e-maila lub notatki.
Wyciągnij kluczowe informacje i zwróć wyłącznie obiekt JSON w formacie:
{
  "title": "Krótki, przyjazny i zrozumiały tytuł sprawy (np. ZUS: Decyzja o podwyżce emerytury - bez obaw!)",
  "category": "Jedna z wartości: Urzędowa | Biznesowa / Współpraca | Umowa | Podatki / Finanse | Prawna | Inne",
  "priority": "Jedna z wartości: Pilny | Wysoki | Średni | Niski",
  "parties": ["Strona / Nadawca / Urząd", "Adresat / Inwestor"],
  "referenceNumber": "Znak sprawy lub numer pisma (jeśli istnieje, inaczej null)",
  "ocrContent": "Pełny odczytany tekst z pisma lub notatki",
  "summary": "Wyjaśnienie Agrafki 📎 prosto z mostu: O co chodzi, czy trzeba się bać/płacić, oraz co robimy krok po kroku w zwykłym języku",
  "deadlines": ["Wykryte terminy, np. 14 dni od doręczenia"],
  "suggestedActions": ["Krok 1", "Krok 2"]
}`;

    let responseText = '';

    if (imageData) {
      // Clean base64 if prefixed
      const base64Clean = imageData.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');
      
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: base64Clean,
              mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });
      responseText = response.text || '';
    } else {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: `${prompt}\n\nTekst do analizy:\n${textData}` }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });
      responseText = response.text || '';
    }

    const result = JSON.parse(responseText);
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Błąd w /api/scan-document:', err);
    res.status(500).json({ error: err.message || 'Błąd podczas analizy dokumentu przez Gemini.' });
  }
});

// 2. Check Deduplication & Link Matching API
app.post('/api/check-deduplication', async (req, res) => {
  try {
    const { newDoc, existingCases = [] } = req.body;
    
    if (!newDoc) {
      return res.status(400).json({ error: 'Brak danych nowego dokumentu (newDoc).' });
    }

    const client = getGenAIClient();

    const prompt = `Jesteś ekspertem ds. deduplikacji i rejestracji kancelaryjnej w systemie spraw.
Twój cel: Przeanalizuj nowy wpłynięty dokument/notatkę/e-mail i porównaj go z listą istniejących aktywnych spraw w bazie.
Zdecyduj, czy ten dokument jest kolejnym zdarzeniem (pismem, notatką, odpowiedzią) w istniejącej sprawie, czy też stanowi CAŁKIEM NOWĄ sprawę.

Nowy dokument:
- Tytuł/Przedmiot: ${newDoc.title}
- Strony/Nadawca: ${Array.isArray(newDoc.parties) ? newDoc.parties.join(', ') : newDoc.sender || 'Nieznany'}
- Znak/Numer pisma: ${newDoc.referenceNumber || 'Brak'}
- Podsumowanie: ${newDoc.summary}
- Treść: ${newDoc.text || newDoc.ocrContent || ''}

Istniejące sprawy w bazie (${existingCases.length} sztuk):
${JSON.stringify(existingCases.map((c: any) => ({
  id: c.id,
  caseNumber: c.caseNumber,
  title: c.title,
  category: c.category,
  parties: c.parties,
  summary: c.summary,
  status: c.status
})), null, 2)}

Zwróć odpowiedź w ścisłym formacie JSON:
{
  "matchType": "exact_link" | "possible_link" | "new_case",
  "matchConfidence": liczba od 0 do 100 (pewność powiązania),
  "targetCaseId": "id sprawy z bazy jeśli powiązane, inaczej null",
  "targetCaseTitle": "tytuł sprawy z bazy jeśli powiązane, inaczej null",
  "reason": "Szczegółowe uzasadnienie decyzji po polsku (np. Pismo odnosi się do tego samego znaku sprawy UM/2026/08 lub tych samych stron i nieruchomości)",
  "suggestedTitle": "Proponowany tytuł dla sprawy / wydarzenia",
  "suggestedCategory": "Urzędowa | Biznesowa / Współpraca | Umowa | Podatki / Finanse | Prawna | Inne",
  "suggestedPriority": "Pilny | Wysoki | Średni | Niski",
  "suggestedParties": ["Strona 1", "Strona 2"],
  "summary": "Zwięzły opis wpisu"
}

Zasady:
- "exact_link": pewność >= 80% (ten sam numer sprawy, jednoznaczne nawiązanie do poprzedniego pisma).
- "possible_link": pewność 40-79% (te same strony, podobny przedmiot, ale niepewne czy nowa kwestia).
- "new_case": pewność < 40% (zupełnie nowy temat, inny urządnadzór, brak powiązań).`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Błąd w /api/check-deduplication:', err);
    res.status(500).json({ error: err.message || 'Błąd analizy deduplikacji.' });
  }
});

// 3. Deep Research with Google Search Grounding API
app.post('/api/deep-research', async (req, res) => {
  try {
    const { caseTitle, query, caseContext } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Wymagane zapytanie (query).' });
    }

    const client = getGenAIClient();

    const systemPrompt = `Jesteś asystentem analityczno-prawnym i biznesowym. Przeprowadź przeszukiwanie sieci w celu znalezienia dokładnych, aktualnych informacji (np. polskie orzecznictwo, przepisy KPA/KC/KSH, dane z CEIDG/KRS, wzory pism urzędowych, aktualne rozporządzenia).
Kontekst sprawy: ${caseTitle || ''} - ${caseContext || ''}
Zapytanie użytkownika: ${query}

Podaj wyczerpującą, profesjonalną odpowiedź po polsku z jasnymi wnioskami, cytatami i odnośnikami do źródeł z wyszukiwarki Google. Zwróć strukturę w przejrzystym formacie Markdown z nagłówkami.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: systemPrompt }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || chunk.web?.uri || 'Źródło internetowe',
      url: chunk.web?.uri || ''
    })).filter((s: any) => s.url) || [];

    res.json({
      success: true,
      text: response.text || 'Brak wyników.',
      sources: sources
    });
  } catch (err: any) {
    console.error('Błąd w /api/deep-research:', err);
    res.status(500).json({ error: err.message || 'Błąd podczas wykonywania wyszukiwania Deep Research.' });
  }
});

// 4. Gemini Notebook Actions API
app.post('/api/notebook-action', async (req, res) => {
  try {
    const { actionType, currentNotebook, caseDetails, userPrompt } = req.body;
    
    const client = getGenAIClient();

    let promptText = '';
    if (actionType === 'synthesize') {
      promptText = `Przeanalizuj poniższe szczegóły sprawy jako serdeczny asystent Agrafka 📎.
Napisz wyrozumiałe, super proste wyjaśnienie dla zwykłego człowieka (np. Pani Wandy lub Pana Marka mechanika):
- **O co chodzi?** (w 2 prostych zdaniach)
- **Czy trzeba się bać / płacić?**
- **Co musimy zrobić w 3 prostych krokach?**

Sprawa: ${caseDetails?.title}
Kategoria: ${caseDetails?.category}
Strony: ${caseDetails?.parties?.join(', ')}
Dotychczasowy opis: ${caseDetails?.summary}
Notebook:
${currentNotebook || 'Brak'}`;
    } else if (actionType === 'draft_reply') {
      promptText = `Jako Agrafka 📎 przygotuj przejrzysty, zrównoważony i uprzejmy projekt odpowiedzi / pisma bez trudnych prawniczych skomplikowań, gotowy do wysłania lub zaniesienia do urzędu.
Sprawa: ${caseDetails?.title}
Strony: ${caseDetails?.parties?.join(', ')}
Wskazówki użytkownika: ${userPrompt || 'Standardowa uprzejma odpowiedź'}`;
    } else if (actionType === 'extract_deadlines') {
      promptText = `Jako Agrafka 📎 wyciągnij wszystkie terminy, opłaty oraz dokumenty do dostarczenia i przedstaw je w formie przyjaznej listy krok po kroku.
Kontekst: ${JSON.stringify(caseDetails)}`;
    } else {
      promptText = `Jako serdeczny asystent Agrafka 📎 wykonaj następujące polecenie dla użytkownika dotyczące sprawy "${caseDetails?.title}":
${userPrompt}

Dotychczasowa treść notebooka:
${currentNotebook || 'Brak'}`;
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: promptText }]
    });

    res.json({ success: true, text: response.text || '' });
  } catch (err: any) {
    console.error('Błąd w /api/notebook-action:', err);
    res.status(500).json({ error: err.message || 'Błąd generatora Gemini Notebook.' });
  }
});

// 5. Detect Stale Cases / Anti-Spam / Collector Guard API
app.post('/api/detect-stale-cases', async (req, res) => {
  try {
    const { cases = [] } = req.body;

    const client = getGenAIClient();

    const prompt = `Jesteś inteligentnym doradcą ds. higieny pracy i odgracania bazy spraw (Anti-Spam & Collector Guard).
Użytkownik ma skłonność do gromadzenia dokumentów ("zbieracz"), ciężko mu coś odrzucić lub usunąć.
Przeanalizuj listę poniższych spraw i wytypuj te, które nie wygenerowały żadnych czynności, są przedawnionym spamem, gazetkami promocyjnymi lub nieaktywnymi od dawna projektami.

Lista spraw:
${JSON.stringify(cases.map((c: any) => ({
  id: c.id,
  title: c.title,
  category: c.category,
  status: c.status,
  actionCount: c.actionCount || 0,
  createdAt: c.createdAt,
  lastActivityAt: c.lastActivityAt,
  summary: c.summary
})), null, 2)}

Wygeneruj dla KAŻDEJ nieaktywnej lub bezczynnej sprawy rekomendację w formacie JSON:
{
  "staleCases": [
    {
      "caseId": "id sprawy",
      "title": "tytuł sprawy",
      "inactiveDays": szacowana liczba dni bezczynności,
      "isSpamOrCollector": true/false (czy wygląda na zbędny balast/spam/unsolicited proposal),
      "recommendation": "delete" | "knowledge_base" | "archive" | "keep_active",
      "explanation": "Przekonujące, uprzejme uzasadnienie dla zbieracza (np. Oferta handlowa z maja nie ma wartości wykonawczej - warto ją usunąć lub przenieść kluczowy wzór do Bazy Wiedzy)"
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{ "staleCases": [] }');
    res.json({ success: true, data: result.staleCases || [] });
  } catch (err: any) {
    console.error('Błąd w /api/detect-stale-cases:', err);
    res.status(500).json({ error: err.message || 'Błąd analizy nieaktywnych spraw.' });
  }
});

// Vite Middleware & Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', geminiEnabled: !!process.env.GEMINI_API_KEY });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer Kancelaria i Sprawy uruchomiony na portzie ${PORT}`);
  });
}

startServer();
