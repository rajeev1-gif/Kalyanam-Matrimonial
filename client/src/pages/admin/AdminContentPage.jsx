import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { publicService } from '../../services/publicService';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';

export default function AdminContentPage() {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('stories'); // 'stories' or 'faqs'

  const [stories, setStories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Story Form
  const [storyForm, setStoryForm] = useState({
    groomName: '',
    brideName: '',
    weddingDate: '2025-01-01',
    story: '',
    couplePhoto: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
  });

  // New FAQ Form
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'General',
  });

  const loadContent = async () => {
    setLoading(true);
    try {
      const [storyRes, faqRes] = await Promise.all([
        publicService.getSuccessStories(),
        publicService.getFaqs(),
      ]);

      if (storyRes.success) setStories(storyRes.data || []);
      if (faqRes.success) setFaqs(faqRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createSuccessStory(storyForm);
      if (res.success) {
        showToast('Success story published!', 'success');
        setStoryForm({
          groomName: '',
          brideName: '',
          weddingDate: '2025-01-01',
          story: '',
          couplePhoto: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
          isFeatured: true,
        });
        loadContent();
      }
    } catch (err) {
      showToast(err.message || 'Error creating story', 'error');
    }
  };

  const handleDeleteStory = async (id) => {
    try {
      const res = await adminService.deleteSuccessStory(id);
      if (res.success) {
        showToast('Story removed', 'info');
        loadContent();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting story', 'error');
    }
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createFaq(faqForm);
      if (res.success) {
        showToast('FAQ added!', 'success');
        setFaqForm({ question: '', answer: '', category: 'General' });
        loadContent();
      }
    } catch (err) {
      showToast(err.message || 'Error adding FAQ', 'error');
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      const res = await adminService.deleteFaq(id);
      if (res.success) {
        showToast('FAQ removed', 'info');
        loadContent();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting FAQ', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Content & Knowledge Base Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish wedding stories, manage FAQs, and update homepage educational content
          </p>
        </div>

        <div className="flex bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'stories' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Success Stories ({stories.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'faqs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Manage FAQs ({faqs.length})
          </button>
        </div>
      </div>

      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* New Story Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-600" />
              Publish Wedding Story
            </h3>

            <form onSubmit={handleCreateStory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Couple Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram & Radhika Singhania"
                  value={storyForm.groomName}
                  onChange={(e) => setStoryForm({ ...storyForm, groomName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Wedding Date</label>
                <input
                  type="date"
                  required
                  value={storyForm.weddingDate}
                  onChange={(e) => setStoryForm({ ...storyForm, weddingDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Couple Photo URL</label>
                <input
                  type="url"
                  required
                  value={storyForm.couplePhoto}
                  onChange={(e) => setStoryForm({ ...storyForm, couplePhoto: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Story Narrative</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write the couple's matrimonial journey..."
                  value={storyForm.story}
                  onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
              >
                Publish Story
              </button>
            </form>
          </div>

          {/* Stories List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stories.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100 relative">
                    <img src={s.couplePhoto} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteStory(s.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-lg shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-serif font-bold text-sm text-slate-900">{s.groomName}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-3">{s.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* New FAQ Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-600" />
              Add New FAQ
            </h3>

            <form onSubmit={handleCreateFaq} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Verification, Privacy, Pricing"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does photo privacy work?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Answer</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detailed answer for members..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
              >
                Add FAQ
              </button>
            </form>
          </div>

          {/* FAQs List */}
          <div className="lg:col-span-2 space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                    {f.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-slate-900">{f.question}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(f.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

