'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SupportTicket, TicketStatus, TicketCategory, TicketPriority, StudentFeedbackRating } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useSupportTickets } from '@/context/SupportTicketContext';
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
  Shield,
  ThumbsUp,
  ThumbsDown,
  User,
  Send,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Check,
} from 'lucide-react';

export default function SupportPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    tickets,
    myTickets,
    isLoading,
    openTicketsCount,
    underReviewCount,
    completedCount,
    myOpenTicketsCount,
    myUnderReviewCount,
    myCompletedCount,
    myTotalTicketsCount,
    createTicket,
    respondToTicket,
    submitStudentFeedback,
    refreshTickets,
  } = useSupportTickets();

  // Search & Filtering
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');

  // Modals & Selection
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Automatically open ticket modal when routed via search bar (?action=new)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new' || params.get('new') === 'true') {
        setShowNewModal(true);
      }
    }
  }, []);

  // New ticket form state
  const [newSubject, setNewSubject] = useState('');
  const [newCourse, setNewCourse] = useState('AI-Native Project Management');
  const [newCategory, setNewCategory] = useState<TicketCategory>('Academic');
  const [newPriority, setNewPriority] = useState<TicketPriority>('Medium');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Admin response form state
  const [adminStatusInput, setAdminStatusInput] = useState<TicketStatus>('Under Review');
  const [adminRemarksInput, setAdminRemarksInput] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Student feedback form state
  const [feedbackRatingInput, setFeedbackRatingInput] = useState<StudentFeedbackRating | null>(null);
  const [feedbackNoteInput, setFeedbackNoteInput] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Base tickets: Students strictly see ONLY their own tickets. Admins see all tickets across cohorts.
  const baseTickets = useMemo(() => {
    if (isAdmin) return tickets;
    return myTickets;
  }, [isAdmin, tickets, myTickets]);

  const displayTotal = isAdmin ? tickets.length : myTotalTicketsCount;
  const displayOpen = isAdmin ? openTicketsCount : myOpenTicketsCount;
  const displayUnderReview = isAdmin ? underReviewCount : myUnderReviewCount;
  const displayCompleted = isAdmin ? completedCount : myCompletedCount;

  // Find currently selected ticket from base tickets array
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return baseTickets.find((t) => t.id === selectedTicketId || t.ticketCode === selectedTicketId) || null;
  }, [baseTickets, selectedTicketId]);

  // When a ticket is opened, prefill response input fields
  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicketId(ticket.id);
    setAdminStatusInput(ticket.status === 'Open' ? 'Under Review' : ticket.status);
    setAdminRemarksInput(ticket.adminRemarks || '');
    setFeedbackRatingInput(ticket.studentFeedback || null);
    setFeedbackNoteInput(ticket.studentFeedbackNote || '');
  };

  // Student: Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    try {
      setIsSubmittingNew(true);
      const created = await createTicket({
        subject: newSubject.trim(),
        description: newDescription.trim(),
        course: newCourse,
        category: newCategory,
        priority: newPriority,
        studentName: user?.name || 'Alex Morgan',
        studentEmail: user?.email || 'alex.morgan@aivalytics.com',
      });

      setShowNewModal(false);
      setNewSubject('');
      setNewDescription('');
      showToast(`Support Ticket ${created.ticketCode || created.ticketId} created successfully!`);
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Admin: Respond to Ticket
  const handleAdminResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminRemarksInput.trim()) return;

    try {
      setIsSubmittingAdmin(true);
      await respondToTicket({
        ticketId: selectedTicket.id,
        status: adminStatusInput,
        remarks: adminRemarksInput.trim(),
        responderName: user?.name || 'Academic Support Faculty',
      });
      showToast(`Status updated to "${adminStatusInput}" and remarks sent to student!`);
    } catch (err) {
      console.error('Error responding to ticket:', err);
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Student: Submit Satisfaction Feedback
  const handleStudentFeedbackSubmit = async (rating: StudentFeedbackRating) => {
    if (!selectedTicket) return;

    try {
      setIsSubmittingFeedback(true);
      setFeedbackRatingInput(rating);
      await submitStudentFeedback({
        ticketId: selectedTicket.id,
        feedback: rating,
        feedbackNote: feedbackNoteInput.trim() || undefined,
      });
      showToast(`Feedback "${rating}" recorded. Thank you!`);
    } catch (err) {
      console.error('Error submitting satisfaction feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return baseTickets.filter((tkt) => {
      // Keyword search
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        tkt.subject.toLowerCase().includes(query) ||
        tkt.ticketId.toLowerCase().includes(query) ||
        (tkt.ticketCode && tkt.ticketCode.toLowerCase().includes(query)) ||
        tkt.course.toLowerCase().includes(query) ||
        (tkt.studentName && tkt.studentName.toLowerCase().includes(query)) ||
        tkt.description.toLowerCase().includes(query);

      // Status filter
      const matchesStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Completed'
          ? tkt.status === 'Completed' || tkt.status === 'Resolved'
          : statusFilter === 'Under Review'
          ? tkt.status === 'Under Review' || tkt.status === 'In Progress'
          : tkt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [baseTickets, search, statusFilter]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#121614] text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <div className="w-6 h-6 rounded-full bg-[#3ECE92]/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold ${
                  isAdmin
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]'
                }`}
              >
                {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Ticket className="w-3.5 h-3.5" />}
                {isAdmin ? 'Faculty & Admin Helpdesk Console' : 'Learner Support & Academic Helpdesk'}
              </span>
              <span className="text-xs text-gray-400 font-mono">• Realtime Synchronized</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
              {isAdmin ? 'Faculty Resolution Center' : 'Support & Help Desk'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
              {isAdmin
                ? 'Review learner queries, update investigation status, provide official faculty guidance, and track satisfaction ratings across cohorts.'
                : 'Submit academic queries, resolve access permissions, or report technical lecture issues. Faculty responses are tracked with full satisfaction reviews.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => refreshTickets()}
              title="Refresh tickets from database"
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#3ECE92]' : ''}`} />
            </button>

            <button
              id="create-new-ticket-btn"
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#3ECE92]" />
              <span>Create New Ticket</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#eaedf0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500">
                {isAdmin ? 'Total Tickets' : 'My Total Tickets'}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{displayTotal}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaedf0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-amber-700">
                {isAdmin ? 'Open Tickets' : 'My Open Tickets'}
              </p>
              <p className="text-xl font-bold text-amber-800 mt-0.5">{displayOpen}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaedf0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-blue-700">Under Review</p>
              <p className="text-xl font-bold text-blue-800 mt-0.5">{displayUnderReview}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaedf0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#059669]">
                {isAdmin ? 'Completed' : 'Resolved'}
              </p>
              <p className="text-xl font-bold text-[#059669] mt-0.5">{displayCompleted}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="ticket-search-input"
              placeholder={isAdmin ? "Search by ID, student, keyword, or course..." : "Search your tickets by ID, keyword, or course..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8faf9] text-xs sm:text-sm text-gray-900 rounded-xl pl-9 pr-4 py-2.5 border border-gray-200/70 focus:outline-none focus:border-[#3ECE92]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Open', 'Under Review', 'Completed', 'Rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-[#121614] text-white shadow-xs'
                    : 'bg-[#f4f6f5] text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Roster List */}
        <div className="space-y-3" id="tickets-list-container">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#eaedf0] shadow-xs">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-800">
                {baseTickets.length === 0 ? 'No tickets submitted yet' : 'No tickets found'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {baseTickets.length === 0
                  ? 'You have not submitted any support tickets. Click "Create New Ticket" to report an issue or ask a question.'
                  : 'No tickets match your filter criteria. Try clearing filters or submit a new query.'}
              </p>
              {baseTickets.length > 0 ? (
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('All');
                  }}
                  className="mt-4 text-xs font-semibold text-[#059669] hover:underline"
                >
                  Reset all filters
                </button>
              ) : (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#3ECE92]" />
                  <span>Create Your First Ticket</span>
                </button>
              )}
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isOpen = ticket.status === 'Open';
              const isUnderReview = ticket.status === 'Under Review' || ticket.status === 'In Progress';
              const isCompleted = ticket.status === 'Completed' || ticket.status === 'Resolved';
              const isRejected = ticket.status === 'Rejected';

              return (
                <div
                  key={ticket.id}
                  id={`ticket-card-${ticket.ticketCode || ticket.ticketId}`}
                  onClick={() => handleOpenTicket(ticket)}
                  className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    {/* Header line: Ticket Code, Status, Priority, Course */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
                        {ticket.ticketCode || ticket.ticketId}
                      </span>

                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isOpen
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isUnderReview
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isCompleted
                            ? 'bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ticket.status}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          ticket.priority === 'High'
                            ? 'bg-rose-50 text-rose-700'
                            : ticket.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ticket.priority} Priority
                      </span>

                      <span className="text-[11px] text-gray-400 font-medium">
                        {ticket.course} • {ticket.category}
                      </span>
                    </div>

                    {/* Subject & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#059669] transition-colors">
                        {ticket.subject}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Meta Indicators: Student, Faculty remarks, Student satisfaction */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <User className="w-3 h-3 text-gray-400" />
                        {ticket.studentName || 'Learner'}
                      </span>

                      {ticket.adminRemarks && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#059669] bg-[#e8f8f0] px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                          Faculty Responded
                        </span>
                      )}

                      {ticket.studentFeedback && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                            ticket.studentFeedback === 'Satisfied'
                              ? 'text-[#059669] bg-[#e8f8f0]'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                          }`}
                        >
                          {ticket.studentFeedback === 'Satisfied' ? (
                            <ThumbsUp className="w-3 h-3" />
                          ) : (
                            <ThumbsDown className="w-3 h-3" />
                          )}
                          Student: {ticket.studentFeedback}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0 self-end md:self-center">
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
              );
            })
          )}
        </div>

        {/* Modal: Create Ticket (Student or Faculty) */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]">
                    <Ticket className="w-4 h-4 text-[#059669]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Submit Support Ticket</h3>
                    <p className="text-xs text-gray-500">
                      Your query will be routed directly to the faculty desk with real-time tracking.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subject / Query Overview
                  </label>
                  <input
                    type="text"
                    required
                    id="new-ticket-subject-input"
                    placeholder="e.g. Permission error 403 when opening Module 2 graded quiz"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                    <select
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] bg-white"
                    >
                      <option>AI-Native Project Management</option>
                      <option>Module 1: AI Foundations</option>
                      <option>Module 2: AI Agents & Orchestration</option>
                      <option>Module 3: AI-Native Project Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] bg-white"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Technical">Technical</option>
                      <option value="Evaluation">Evaluation</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Detailed Description & Error Reproduction Steps
                  </label>
                  <textarea
                    required
                    id="new-ticket-description-input"
                    rows={4}
                    placeholder="Provide full details, error codes, browser information, or specific timestamp in lecture..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingNew}
                    id="submit-new-ticket-btn"
                    className="flex-1 bg-[#3ECE92] hover:bg-[#34be83] text-[#111614] font-semibold py-2.5 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingNew ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit Ticket to Faculty Desk</span>
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

        {/* Modal: Interactive Ticket Resolution & Feedback Console */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto space-y-6">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                    {selectedTicket.ticketCode || selectedTicket.ticketId}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      selectedTicket.status === 'Open'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : selectedTicket.status === 'Under Review' || selectedTicket.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : selectedTicket.status === 'Completed' || selectedTicket.status === 'Resolved'
                        ? 'bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {selectedTicket.category} • {selectedTicket.priority} Priority
                  </span>
                </div>

                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="text-gray-400 hover:text-gray-600 text-base font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* 1. Student Submission Audit Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
                      {(selectedTicket.studentName || 'Alex Morgan').charAt(0)}
                    </div>
                    <span>
                      {selectedTicket.studentName || 'Learner'} ({selectedTicket.studentEmail || selectedTicket.userId})
                    </span>
                  </div>
                  <span className="font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Filed {selectedTicket.createdAt}
                  </span>
                </div>

                <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#eaedf0] space-y-2">
                  <h4 className="text-sm font-bold text-gray-900">{selectedTicket.subject}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                  <p className="text-[11px] text-gray-400 pt-1 font-mono">
                    Course: {selectedTicket.course}
                  </p>
                </div>
              </div>

              {/* 2. Faculty & Admin Response Section */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#059669]" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Faculty Remarks & Investigation Audit
                    </h4>
                  </div>
                  {selectedTicket.adminRespondedAt && (
                    <span className="text-[11px] font-mono text-gray-400">
                      Updated {selectedTicket.adminRespondedAt}
                    </span>
                  )}
                </div>

                {/* If previously responded, display existing faculty remarks */}
                {selectedTicket.adminRemarks && (
                  <div className="p-4 bg-[#e8f8f0]/60 rounded-2xl border border-[#d1f4e2] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[#059669] font-semibold">
                      <span>{selectedTicket.adminRespondedBy || 'Academic Coordinator'}</span>
                      <span className="text-[10px] uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded border border-[#d1f4e2]">
                        {selectedTicket.status}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.adminRemarks}
                    </p>
                  </div>
                )}

                {/* If ADMIN: Show Interactive Action Console */}
                {isAdmin ? (
                  <form
                    onSubmit={handleAdminResponseSubmit}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800">
                        {selectedTicket.adminRemarks ? 'Update Faculty Remarks & Status' : 'Respond to this Ticket'}
                      </span>
                      <span className="text-[11px] text-gray-500">Logged in as Faculty</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Select Ticket Resolution Status:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Open', 'Under Review', 'Completed', 'Rejected'] as TicketStatus[]).map((status) => (
                          <button
                            type="button"
                            key={status}
                            onClick={() => setAdminStatusInput(status)}
                            className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                              adminStatusInput === status
                                ? status === 'Completed'
                                  ? 'bg-[#059669] text-white border-[#059669]'
                                  : status === 'Under Review'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : status === 'Rejected'
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Official Faculty Remarks:
                      </label>
                      <textarea
                        required
                        id="admin-remarks-textarea"
                        rows={3}
                        value={adminRemarksInput}
                        onChange={(e) => setAdminRemarksInput(e.target.value)}
                        placeholder="Detail the resolution steps taken, confirmation of database update, or reason for rejection..."
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3ECE92]"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingAdmin}
                        id="submit-admin-response-btn"
                        className="px-5 py-2.5 bg-[#121614] hover:bg-black text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingAdmin ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-[#3ECE92]" />
                        )}
                        <span>Save Remarks & Notify Student</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  !selectedTicket.adminRemarks && (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
                      <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      Awaiting response from faculty coordinator. You will be notified once reviewed.
                    </div>
                  )
                )}
              </div>

              {/* 3. Student Satisfaction Review Section */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Student Satisfaction Feedback
                    </h4>
                  </div>
                  {selectedTicket.studentFeedbackAt && (
                    <span className="text-[11px] font-mono text-gray-400">
                      Rated {selectedTicket.studentFeedbackAt}
                    </span>
                  )}
                </div>

                {/* Feedback Summary Card if provided */}
                {selectedTicket.studentFeedback ? (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                      selectedTicket.studentFeedback === 'Satisfied'
                        ? 'bg-[#e8f8f0] border-[#d1f4e2]'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5 text-gray-900">
                        {selectedTicket.studentFeedback === 'Satisfied' ? (
                          <ThumbsUp className="w-4 h-4 text-[#059669]" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 text-amber-700" />
                        )}
                        Student Response: {selectedTicket.studentFeedback}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {selectedTicket.studentName || 'Student'}
                      </span>
                    </div>

                    {selectedTicket.studentFeedbackNote && (
                      <p className="text-gray-700 leading-relaxed italic">
                        &quot;{selectedTicket.studentFeedbackNote}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  // Learner hasn't submitted feedback yet
                  !isAdmin ? (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Are you satisfied with the faculty response to this query?
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Confirming your satisfaction helps us ensure all issues are fully resolved.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          id="btn-mark-satisfied"
                          onClick={() => handleStudentFeedbackSubmit('Satisfied')}
                          disabled={isSubmittingFeedback}
                          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#3ECE92] hover:bg-[#34be83] text-[#111614] flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Satisfied (Issue Resolved)</span>
                        </button>

                        <button
                          type="button"
                          id="btn-mark-not-satisfied"
                          onClick={() => handleStudentFeedbackSubmit('Not Satisfied')}
                          disabled={isSubmittingFeedback}
                          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                          <ThumbsDown className="w-4 h-4 text-amber-600" />
                          <span>Not Satisfied (Needs More Help)</span>
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          id="student-feedback-note-input"
                          placeholder="Optional feedback comment or verification note..."
                          value={feedbackNoteInput}
                          onChange={(e) => setFeedbackNoteInput(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3ECE92]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center text-xs text-gray-400">
                      Student has not submitted satisfaction rating for this ticket yet.
                    </div>
                  )
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="px-5 py-2.5 bg-[#121614] text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
