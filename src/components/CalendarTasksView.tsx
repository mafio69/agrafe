import React, { useState } from 'react';
import { CalendarEvent, TaskItem, Case } from '../types';
import { Calendar as CalendarIcon, CheckSquare, Plus, CheckCircle2, Clock, FolderKanban, Tag } from 'lucide-react';

interface CalendarTasksViewProps {
  events: CalendarEvent[];
  tasks: TaskItem[];
  cases: Case[];
  onAddEvent: (event: Partial<CalendarEvent>) => void;
  onAddTask: (task: Partial<TaskItem>) => void;
  onToggleTask: (taskId: string) => void;
  onSelectCase: (caseItem: Case) => void;
}

export const CalendarTasksView: React.FC<CalendarTasksViewProps> = ({
  events,
  tasks,
  cases,
  onAddEvent,
  onAddTask,
  onToggleTask,
  onSelectCase
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'tasks'>('calendar');

  // Form states
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventCaseId, setEventCaseId] = useState('');

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskCaseId, setTaskCaseId] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    onAddEvent({
      title: eventTitle,
      start: eventDate,
      end: eventDate,
      caseId: eventCaseId
    });

    setEventTitle('');
    setShowAddEvent(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      title: taskTitle,
      dueDate: taskDueDate,
      caseId: taskCaseId,
      priority: 'Średni'
    });

    setTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="space-y-6 text-stone-900">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">
              Kalendarz i Listy Zadań 📅
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Wszystkie Twoje terminy urzędowe, daty przesyłek ZUS i ważne zadania w jednym czytelnym miejscu.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'calendar'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Kalendarz ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'tasks'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Lista Zadań ({tasks.filter(t => !t.completed).length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CALENDAR EVENTS */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Nadchodzące terminy i przypomnienia:
            </h3>
            <button
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj nowe wydarzenie</span>
            </button>
          </div>

          {/* Add Event Form */}
          {showAddEvent && (
            <form onSubmit={handleCreateEvent} className="bg-amber-50/80 p-5 rounded-3xl border border-amber-200 space-y-4 shadow-xs">
              <h4 className="text-xs font-extrabold text-amber-950">Zaplanuj nowe przypomnienie w kalendarzu:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Co trzeba zrealizować (np. przelew ZUS, odpowiedź)..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="sm:col-span-2 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none font-medium"
                />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <select
                  value={eventCaseId}
                  onChange={(e) => setEventCaseId(e.target.value)}
                  className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none font-medium"
                >
                  <option value="">-- Powiąż ze sprawą (Opcjonalnie) --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddEvent(false)} className="px-3 py-1.5 text-xs font-bold text-stone-500">
                    Anuluj
                  </button>
                  <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-4 py-1.5 rounded-xl text-xs shadow-xs">
                    Zapisz
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Events List */}
          {events.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center space-y-2">
              <CalendarIcon className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700">Brak zaplanowanych wydarzeń w kalendarzu</p>
              <p className="text-xs text-stone-400">Kliknij przycisk powyżej, aby dodać pierwsze przypomnienie.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map(evt => {
                const linkedCase = cases.find(c => c.id === evt.caseId);
                return (
                  <div key={evt.id} className="bg-white border border-stone-200 hover:border-amber-400 rounded-2xl p-4 space-y-2 shadow-xs transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                        <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                          📅 {evt.start}
                        </span>
                        {linkedCase && (
                          <span className="font-mono text-[11px] text-stone-400">
                            {linkedCase.caseNumber}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-stone-900 text-sm">{evt.title}</h4>
                      {evt.description && <p className="text-xs text-stone-600 mt-1 font-medium">{evt.description}</p>}
                    </div>

                    {linkedCase && (
                      <div className="pt-2 border-t border-stone-100 flex justify-end">
                        <button
                          onClick={() => onSelectCase(linkedCase)}
                          className="text-xs text-amber-700 hover:underline font-bold flex items-center gap-1"
                        >
                          <FolderKanban className="w-3.5 h-3.5" />
                          <span>Otwórz powiązaną sprawę →</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TASKS LIST */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> Twoja lista zadań i kroków do zrobienia:
            </h3>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj nowe zadanie</span>
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTask && (
            <form onSubmit={handleCreateTask} className="bg-amber-50/80 p-5 rounded-3xl border border-amber-200 space-y-4 shadow-xs">
              <h4 className="text-xs font-extrabold text-amber-950">Dodaj zadanie do wykonania:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Co trzeba wysłać / sprawdzić..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="sm:col-span-2 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none font-medium"
                />
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <select
                  value={taskCaseId}
                  onChange={(e) => setTaskCaseId(e.target.value)}
                  className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none font-medium"
                >
                  <option value="">-- Powiąż ze sprawą (Opcjonalnie) --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddTask(false)} className="px-3 py-1.5 text-xs font-bold text-stone-500">
                    Anuluj
                  </button>
                  <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-4 py-1.5 rounded-xl text-xs shadow-xs">
                    Zapisz Zadanie
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-stone-700">Wszystkie zadania zrealizowane!</p>
              <p className="text-xs text-stone-400">Możesz dodać nowe zadanie przyciskiem powyżej.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => {
                const linkedCase = cases.find(c => c.id === task.caseId);
                return (
                  <div
                    key={task.id}
                    className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition shadow-xs ${
                      task.completed ? 'border-stone-200 opacity-60' : 'border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleTask(task.id)}
                        className="rounded text-amber-600 focus:ring-0 w-5 h-5 cursor-pointer shrink-0"
                      />
                      <div>
                        <p className={`text-sm font-extrabold ${task.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                          {task.title}
                        </p>
                        {linkedCase && (
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                            <Tag className="w-3 h-3 text-amber-600" />
                            <span>{linkedCase.title}</span>
                          </div>
                        )}
                      </div>
                    </label>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-stone-500 font-medium">
                        Termin: {task.dueDate}
                      </span>
                      {linkedCase && (
                        <button
                          onClick={() => onSelectCase(linkedCase)}
                          className="text-xs text-amber-700 hover:underline font-bold hidden sm:inline"
                        >
                          Zobacz sprawę
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
