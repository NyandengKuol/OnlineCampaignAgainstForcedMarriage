import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import PreventionPage from './pages/PreventionPage';
import CampaignPage from './pages/CampaignPage';
import ViewPostPage from './pages/ViewPostPage';
import FAQPage from './pages/FAQPage';
import ResourcesPage from './pages/ResourcesPage';
import AboutPage from './pages/AboutPage';
import LearnPage from './pages/LearnPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAppData } from './context/AppDataContext';
import { useAuth } from './context/AuthContext';

import CreatePostModal from './components/modals/CreatePostModal';
import ReportModal from './components/common/ReportModal';
import DashboardPage from './pages/DashboardPage';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [toast, setToast] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingPost, setReportingPost] = useState(null);
  const { addPost, updatePost, deletePost, reportPost, posts } = useAppData();
  const { user, isLoading } = useAuth();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/admin';

  useEffect(() => { if (!deletingPost) return undefined; const onKeyDown = (event) => { if (event.key === 'Escape') setDeletingPost(null); if (event.key === 'Tab') { const controls = [...document.querySelectorAll('.delete-dialog button')]; if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); } else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); } } }; document.addEventListener('keydown', onKeyDown); window.setTimeout(() => document.querySelector('.delete-dialog button')?.focus(), 0); return () => document.removeEventListener('keydown', onKeyDown); }, [deletingPost]);
  const announce = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3500); };

  const tabPaths = { home: '/', prevention: '/prevention', campaign: '/campaign', about: '/about', learn: '/learn', faq: '/faq', resources: '/resources', login: '/login', signup: '/signup', dashboard: '/dashboard', admin: '/admin', 'view-post': '/campaign' };
  const currentTab = Object.entries(tabPaths).find(([, path]) => path === location.pathname)?.[0] || (location.pathname.startsWith('/campaign/posts/') ? 'view-post' : 'home');
  const changeTab = (tab) => navigate(tabPaths[tab] || '/');

  const handleSelectPost = (post) => {
    navigate(`/campaign/posts/${post.id}`, { state: { post } });
  };

  const handleOpenReportModal = (post) => {
    setReportingPost(post);
    setIsReportModalOpen(true);
  };

  const handleCreatePostSubmit = (newPostData) => {
    if (editingPost) { updatePost(editingPost.id, newPostData); setEditingPost(null); announce('Post updated successfully.'); }
    else { addPost(newPostData, user); announce('Post published successfully.'); }
    setIsCreateModalOpen(false);
  };

  return (
    <div className="app-shell">
      {!isDashboard && <Navbar activeTab={currentTab} setActiveTab={changeTab} />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage setActiveTab={changeTab} />} />
          <Route path="/prevention" element={<PreventionPage setActiveTab={changeTab} />} />
          <Route path="/campaign" element={<CampaignPage onSelectPost={handleSelectPost} onOpenCreateModal={() => { if (user) setIsCreateModalOpen(true); else changeTab('login'); }} onEditPost={(post) => { setEditingPost(post); setIsCreateModalOpen(true); }} onDeletePost={setDeletingPost} setActiveTab={changeTab} />} />
          <Route path="/campaign/posts/:postId" element={<ViewPostPage post={location.state?.post || posts.find((post) => post.id === location.pathname.split('/').at(-1))} onBack={() => changeTab('campaign')} onOpenReportModal={handleOpenReportModal} />} />
          <Route path="/about" element={<AboutPage setActiveTab={changeTab} />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/login" element={<LoginPage setActiveTab={changeTab} />} />
          <Route path="/signup" element={<SignupPage setActiveTab={changeTab} />} />
          <Route path="/dashboard" element={isLoading ? <div className="auth-session-check" role="status">Checking your session…</div> : user?.isAdmin ? <Navigate to="/admin" replace /> : user ? <DashboardPage onCreatePost={() => setIsCreateModalOpen(true)} /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={isLoading ? <div className="auth-session-check" role="status">Checking your session…</div> : user?.isAdmin ? <DashboardPage admin /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDashboard && <Footer setActiveTab={changeTab} />}

      {/* Global Modals */}
      {isCreateModalOpen && <CreatePostModal
        key={editingPost?.id || 'new-post'}
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditingPost(null); }}
        onSubmitPost={handleCreatePostSubmit}
        post={editingPost}
      />}

      {deletingPost && <div className="modal-backdrop delete-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeletingPost(null); }}><section className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><div className="delete-dialog-icon"><Trash2 size={22} /></div><h2 id="delete-title">Delete this post?</h2><p id="delete-description">This action cannot be undone.</p><div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setDeletingPost(null)}>Cancel</button><button type="button" className="btn btn-danger" onClick={() => { deletePost(deletingPost.id); setDeletingPost(null); announce('Post deleted.'); }}>{'Delete'}</button></div></section></div>}
      {toast && <div className="app-toast" role="status" aria-live="polite">{toast}</div>}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={reportPost}
        post={reportingPost}
      />
    </div>
  );
};

export default App;
