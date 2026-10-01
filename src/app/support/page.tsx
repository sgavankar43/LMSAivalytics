'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { mockTickets } from '@/data/mockData';
import { SupportTicket } from '@/types';
import {
  Ticket,
  Plus,
  Search,
  Clock,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New ticket form state
  const [newSubject, setNewSubject] = useState('');
  const [newCourse, setNewCourse] = useState('Academic Information');
  const [newCategory, setNewCategory] = useState<'Academic' | 'Technical' | 'Evaluation' | 'General'>('Academic');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newDescription, setNewDescription] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDescription) return;

    const created: SupportTicket = {
      id: 'tkt_' + Date.now(),
      ticketId: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
      subject: newSubject,
      course: newCourse,
      category: newCategory,
      status: 'Open',
      priority: newPriority,
      createdAt: 'Just now',
      lastUpdated: 'Just now',
      repliesCount: 0,
      description: newDescription,
    };

    setTickets([created, ...tickets]);
    setShowNewModal(false);
    setNewSubject('');
    setNewDescription('');
  };

  const filteredTickets = tickets.filter((tkt) => {
    const matchesSearch =
      tkt.subject.toLowerCase().includes(search.toLowerCase()) ||
      tkt.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      tkt.course.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || tkt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
              Support & Help Desk
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Submit academic queries, resolve access permissions, or report technical lecture issues.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#3ECE92]" />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Status Filter Tabs & Search */}
        <div className="bg-white rounded-2xl p-4 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket ID or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8faf9] text-xs sm:text-sm text-gray-900 rounded-xl pl-9 pr-4 py-2 border border-gray-200/70 focus:outline-none focus:border-[#3ECE92]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-[#121614] text-white'
                    : 'bg-[#f4f6f5] text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#eaedf0]">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No tickets found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria or create a new ticket.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                      {ticket.ticketId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ticket.status === 'Open'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : ticket.status === 'In Progress'
                          ? 'bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {ticket.course} • {ticket.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900">
                    {ticket.subject}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-1">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0 self-end sm:self-center">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {ticket.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {ticket.repliesCount}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Create Ticket */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Submit Support Ticket</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of the issue"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                    <select
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                    >
                      <option>Academic Information</option>
                      <option>Business Research Method</option>
                      <option>Applied AI Systems</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Technical">Technical</option>
                      <option value="Evaluation">Evaluation</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide full details, timestamps, or reproduction steps..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#3ECE92] hover:bg-[#34be83] text-[#111614] font-semibold py-2.5 rounded-xl text-xs transition-all shadow-xs"
                  >
                    Submit Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Ticket Thread */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-0.5 rounded">
                    {selectedTicket.ticketId}
                  </span>
                  <span className="text-xs font-semibold text-[#059669] bg-[#e8f8f0] px-2 py-0.5 rounded-full">
                    {selectedTicket.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                  {selectedTicket.subject}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedTicket.course} • Filed on {selectedTicket.createdAt}
                </p>

                <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-700 leading-relaxed border border-gray-100">
                  {selectedTicket.description}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Faculty & Helpdesk Notes:</h4>
                  <div className="p-3 bg-[#e8f8f0]/50 rounded-xl text-xs text-gray-600 border border-[#d1f4e2]/60">
                    <p className="font-semibold text-[#059669]">Course Coordinator:</p>
                    <p className="mt-1">
                      Our system engineering team is verifying the quiz permissions. An update will be posted shortly.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 bg-[#121614] text-white rounded-xl text-xs font-semibold hover:bg-black"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
