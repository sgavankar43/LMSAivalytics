'use client';

import React, { useState } from 'react';
import { AdminTask } from '@/types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  X,
  ListTodo,
} from 'lucide-react';

interface AdminTaskCardProps {
  tasks: AdminTask[];
  onAddTask: (task: Omit<AdminTask, 'id' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const AdminTaskCard: React.FC<AdminTaskCardProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');
  const [showAddForm, setShowAddForm] = useState(false);

  // New task form fields
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newCategory, setNewCategory] = useState<'Grading' | 'Curriculum' | 'Support' | 'Faculty'>('Curriculum');
  const [newDueDate, setNewDueDate] = useState('Tomorrow, 05:00 PM');

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'Pending') return !t.completed;
    if (filter === 'Completed') return t.completed;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate,
      completed: false,
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const getPriorityBadge = (priority: AdminTask['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-600 border border-red-200/80';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border border-amber-200/80';
      case 'Low':
        return 'bg-blue-50 text-blue-700 border border-blue-200/80';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 card-hover flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60">
              <ListTodo className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Task Management</h3>
              <p className="text-xs text-gray-400">Faculty workflow & administrative duties</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f8f0] text-[#059669]">
              {pendingCount} Pending
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-colors"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-[#3ECE92]" />}
              <span>{showAddForm ? 'Cancel' : 'New Task'}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-gray-100 text-xs">
          {(['Pending', 'All', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filter === tab
                  ? 'bg-[#121614] text-white font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Add Task Form Collapsible */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="my-3 p-4 bg-[#f8faf9] rounded-xl border border-gray-200/80 space-y-3 animate-in fade-in duration-150"
          >
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Task Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Audit grading criteria for Session 2..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as AdminTask['priority'])}
                  className="w-full text-xs p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AdminTask['category'])}
                  className="w-full text-xs p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                >
                  <option value="Grading">Grading</option>
                  <option value="Curriculum">Curriculum</option>
                  <option value="Support">Support</option>
                  <option value="Faculty">Faculty</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Due Deadline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, 05:00 PM"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#3ECE92] text-[#111614] hover:bg-[#34be83] transition-colors"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* Task Items List */}
        <div className="mt-3 divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-gray-500">No {filter.toLowerCase()} tasks found</p>
              <p className="text-[11px] text-gray-400">All administrative items are clear</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 px-1 flex items-start justify-between gap-3 group hover:bg-gray-50/70 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Toggle Checkmark button */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 shrink-0 text-gray-400 hover:text-[#3ECE92] transition-colors"
                    title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#3ECE92] fill-[#e8f8f0]" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium leading-snug transition-all ${
                        task.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-900 font-semibold'
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {task.category}
                      </span>

                      <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all shrink-0"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
