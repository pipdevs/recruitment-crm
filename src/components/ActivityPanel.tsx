import { useState, useEffect } from 'react';
import { Trash2, Plus, CheckSquare, StickyNote, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ActivityFeed } from './ActivityFeed';
import { tasksService } from '../services/tasks';
import type { Database } from '../lib/database.types';

type EntityType = 'candidate' | 'company' | 'job';
type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

interface ActivityPanelProps {
  entityType: EntityType;
  entityId: string;
  addNote: (content: string, userId: string) => Promise<void>;
  getNotes: (entityId: string) => Promise<any[]>;
  deleteNote: (noteId: string) => Promise<void>;
}

export function ActivityPanel({
  entityType,
  entityId,
  addNote,
  getNotes,
  deleteNote,
}: ActivityPanelProps) {
  const { user, organisation } = useAuth();
  const [tab, setTab] = useState<'notes' | 'tasks' | 'activity'>('notes');
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => { loadNotes(); }, [entityId]);
  useEffect(() => { loadTasks(); }, [entityId]);

  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const data = await getNotes(entityId);
      setNotes(data || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('related_entity_id', entityId)
        .eq('related_entity_type', entityType)
        .order('due_date', { ascending: true, nullsFirst: false });
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    setAddingNote(true);
    try {
      await addNote(newNote, user.id);
      setNewNote('');
      await loadNotes();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !user) return;
    setAddingTask(true);
    try {
      const created = await tasksService.create({
        title: newTask,
        due_date: newTaskDue || null,
        status: 'Pending',
        related_entity_type: entityType,
        related_entity_id: entityId,
        created_by: user.id,
        assigned_to: user.id,
      });
      setTasks([...tasks, created]);
      setNewTask('');
      setNewTaskDue('');
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await tasksService.update(taskId, { status });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksService.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const TABS = [
    { id: 'notes', label: 'Notes', icon: StickyNote, count: notes.length },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.filter(t => t.status !== 'Completed').length },
    { id: 'activity', label: 'Activity', icon: Clock, count: null },
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-100">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                tab === t.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* NOTES TAB */}
        {tab === 'notes' && (
          <div>
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote();
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">⌘↵ to save</span>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>

            {loadingNotes ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No notes yet</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-xs font-medium text-gray-600">
                        {note.creator?.full_name || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div>
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Task title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.trim() || addingTask}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addingTask ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>

            {loadingTasks ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No tasks yet</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {tasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed';
                  return (
                    <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                      task.status === 'Completed' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={task.status === 'Completed'}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.checked ? 'Completed' : 'Pending')}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {isOverdue ? '⚠ Overdue · ' : 'Due · '}
                            {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === 'activity' && (
          <ActivityFeed entityType={entityType} entityId={entityId} />
        )}
      </div>
    </div>
  );
}