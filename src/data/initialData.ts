import { Case, KnowledgeArticle, KeepNote, CalendarEvent, TaskItem } from '../types';

export const INITIAL_CASES: Case[] = [
  {
    id: 'case-101',
    caseNumber: 'ZUS/2026/08/104',
    title: 'Pismo z ZUS - Waloryzacja i wyliczenie stażu pracy (Pani Wanda)',
    category: 'Urzędowa',
    status: 'W toku',
    priority: 'Średni',
    summary: 'Oficjalna decyzja Zakładu Ubezpieczeń Społecznych ws. ponownego przeliczenia emerytury po przedstawieniu zaświadczeń o latach pracy.',
    parties: ['Zakład Ubezpieczeń Społecznych (ZUS)', 'Wanda Kowalska'],
    tags: ['ZUS', 'Emerytura', 'Waloryzacja', 'Brak dopłat'],
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    actionCount: 2,
    isArchived: false,
    isKnowledgeBase: false,
    notebook: `### 📎 Wyjaśnienie Agrafki dla Pani Wandy:\n\n- **Czy trzeba się bać?**: Absolutnie nie! To nie jest wezwanie do zapłaty ani żaden dług.\n- **Co wynika z pisma?**: ZUS pozytywnie uwzględnił dodatkowe lata pracy z lat 1985-1990.\n- **Efekt**: Twoje świadczenie wzrośnie o ok. **125 PLN netto miesięcznie** od pierwszego dnia przyszłego miesiąca.\n- **Co trzeba zrobić?**: Nic! Pieniądze same wpłyną na konto. Pismo wsuwamy do folderu ZUS.`,
    timeline: [
      {
        id: 'tl-101-1',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        type: 'scan',
        title: 'Skan pisma z ZUS (Decyzja waloryzacyjna)',
        description: 'ZUS przesłał 3-stronicowe pismo naszpikowane paragrafami. Agrafka przeanalizowała pismo i potwierdza brak powódu do niepokoju.',
        author: 'Skaner Aparatu'
      },
      {
        id: 'tl-101-2',
        date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        type: 'note',
        title: 'Podsumowanie Agrafki w notatniku',
        description: 'Potwierdzono podwyżkę emerytury. Zaplanowano przypomnienie na 15. dzień miesiąca na sprawdzenie przelewu bankowego.',
        author: 'Agrafka 📎'
      }
    ]
  },
  {
    id: 'case-102',
    caseNumber: 'EML/2026/08/042',
    title: 'E-mail od Hurtowni Części Auto-Zapas z propozycją umowy (Pan Marek Mechanik)',
    category: 'Biznesowa / Współpraca',
    status: 'Nowa',
    priority: 'Wysoki',
    summary: 'Oferta współpracy dla warsztatu samochodowego Pan Marka z rabatem 15% na oleje i filtry oraz projektem umowy dostawy.',
    parties: ['Hurtownia Auto-Zapas Sp. z o.o.', 'Marek Nowak - Warsztat Samochodowy'],
    tags: ['Warsztat', 'Dostawy', 'Rabat 15%', 'Płatność 7 dni'],
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    actionCount: 1,
    isArchived: false,
    isKnowledgeBase: false,
    notebook: `### 📎 Wyjaśnienie Agrafki dla Pana Marka:\n\n- **O co chodzi?**: Hurtownia proponuje stały rabat 15% na części zamienne pod warunkiem zamawiania min. za 2000 zł miesięcznie.\n- **Na co uważać?**: Punkt 6 umowy wymaga płatności w 7 dni od faktury. Jeśli spóźnisz się z przelewem, rabat odpada.\n- **Co robimy?**: Agrafka ułożyła krótką odpowiedź e-mail z prośbą o wydłużenie terminu płatności do 14 dni.`,
    timeline: [
      {
        id: 'tl-102-1',
        date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        type: 'email',
        title: 'Otrzymany e-mail z ofertą Hurtowni',
        description: 'Wiadomość z załączoną propozycją rabatową dla warsztatu.',
        author: 'kontakt@auto-zapas.pl'
      }
    ]
  },
  {
    id: 'case-103',
    caseNumber: 'US/2026/07/089',
    title: 'Wezwanie z Urzędu Skarbowego ws. ulgi na internet',
    category: 'Podatki / Finanse',
    status: 'Oczekuje',
    priority: 'Pilny',
    summary: 'Pismo z Urzędu Skarbowego proszące o przesłanie faktur i potwierdzenia zapłaty za internet za rok 2025.',
    parties: ['Urząd Skarbowy Poznań-Jeżyce', 'Pan Marek / Pani Wanda'],
    tags: ['Urząd Skarbowy', 'Ulga Internet', 'Termin 14 dni'],
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    actionCount: 3,
    isArchived: false,
    isKnowledgeBase: false,
    notebook: `### 📎 Wyjaśnienie Agrafki:\n- Urząd po prostu chce kserokopię lub wydruk potwierdzenia przelewu za bankowość elektroniczną.\n- Nie ma żadnej kary ani mandatu. Dołączamy 2 potwierdzenia przelewów z banku i wysyłamy listem poleconym lub przez ePUAP.`,
    timeline: [
      {
        id: 'tl-103-1',
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        type: 'scan',
        title: 'Skan wezwania z US',
        description: 'Wezwanie do złożenia wyciągu bankowego.',
        author: 'Skaner Aparatu'
      },
      {
        id: 'tl-103-2',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        type: 'gemini_research',
        title: 'Pismo przewodnie przygotowane przez Agrafkę',
        description: 'Gotowy wzór pisma z załącznikami do Urzędu Skarbowego.',
        author: 'Agrafka 📎'
      }
    ]
  },
  {
    id: 'case-104',
    caseNumber: 'SPAM/2026/05/012',
    title: 'Stary biuletyn promocyjny hurtowni narzędzi (Do wyrzucenia)',
    category: 'Inne',
    status: 'Nowa',
    priority: 'Niski',
    summary: 'Niezamówiona reklama z maja z gazetką sprzętową. Brak wartości użytkowej.',
    parties: ['Hurtownia ToolsMax'],
    tags: ['Promocja', 'Reklama', 'Zaległość'],
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    actionCount: 0,
    isArchived: false,
    isKnowledgeBase: false,
    notebook: '',
    timeline: [
      {
        id: 'tl-104-1',
        date: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
        type: 'email',
        title: 'Reklama handlowa',
        description: 'Brak reacji ze strony użytkownika.',
        author: 'newsletter@toolsmax.pl'
      }
    ]
  }
];

export const INITIAL_KNOWLEDGE: KnowledgeArticle[] = [
  {
    id: 'know-1',
    title: 'Wzór wniosku o przywrócenie terminu KPA (art. 58 § 1 KPA)',
    category: 'Procedury Urzędowe',
    content: 'W razie uchybienia terminu należy złożyć wniosek w ciągu 7 dni od dnia ustania przyczyny uchybienia terminu, uprawdopodobniając brak swojej winy i jednocześnie dopełniając czynności, dla której określony był termin.',
    tags: ['KPA', 'Przywrócenie terminu', 'Wzór pisma', 'Procedura'],
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'know-2',
    title: 'Klauzula poufności NDA - standard spółki',
    category: 'Biznes i Umowy',
    content: 'Standardowe zapisy dotyczące ochrony tajemnicy przedsiębiorstwa, kary umownej za ujawnienie informacji poufnych (50 000 PLN) oraz czasu trwania obowiązku poufności (3 lata od rozwiązania umowy).',
    tags: ['NDA', 'Poufność', 'Umowy', 'Wzór'],
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_KEEP_NOTES: KeepNote[] = [
  {
    id: 'keep-1',
    caseId: 'case-101',
    title: 'Sprawdzić opłatę skarbową za pełnomocnictwo',
    content: 'Kwota 17 PLN wniesiona na konto Urzędu Miasta. Dołączyć potwierdzenie przelewu do akt sprawy.',
    color: '#fef3c7', // yellow
    pinned: true,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'keep-2',
    caseId: 'case-102',
    title: 'Pytania do rozmowy z Nexus Soft',
    content: '1. Czy cena obejmuje migrację starych baz SQL?\n2. Jaki jest czas reakcji SLA w przypadku awarii krytycznej?',
    color: '#dbeafe', // blue
    pinned: false,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    caseId: 'case-101',
    title: 'Uzupełnić mapę zasadniczą do wniosku o pozwolenie',
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    completed: false,
    priority: 'Pilny'
  },
  {
    id: 'task-2',
    caseId: 'case-103',
    title: 'Przesłać pliki JPK_V7M do weryfikacji przez księgowość',
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    completed: true,
    priority: 'Wysoki'
  }
];
