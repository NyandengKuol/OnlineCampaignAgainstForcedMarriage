import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, BookOpen,
  Bell, CheckCircle2, ChevronDown, CircleHelp, FileText, Flag, Heart, Home, LogOut,
  Menu, MessageCircle, MessageSquare, Plus, Search, Send, Settings, ShieldAlert, ShieldCheck, Users, X,
  ChartNoAxesCombined, HandHeart, Megaphone, Sprout, UserRound, UserRoundCog
} from 'lucide-react';
import awarenessSpotlightImage from '../assets/awareness-spotlight.png';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/Layout/Navbar';
import { readSavedResourceIds } from '../utils/savedResources';
import { createFAQRecord, createResourceRecord, deleteFAQRecord, deleteResourceRecord } from '../utils/storage';
import './DashboardPage.css';

const userNav = [
  ['GENERAL', 'Dashboard', 'dashboard', Home],
  ['COMMUNITY', 'Community Campaign', 'community', MessageSquare], ['COMMUNITY', 'FAQs & Inquiries', 'faq', CircleHelp],
  ['MY SPACE', 'My Reports', 'my-reports', ShieldAlert], ['MY SPACE', 'My Posts', 'my-posts', FileText], ['MY SPACE', 'My Replies', 'my-replies', MessageCircle], ['MY SPACE', 'Saved Resources', 'saved-resources', Heart], ['MY SPACE', 'My Activity', 'activity', Activity],
  ['ACCOUNT', 'Profile', 'profile', UserRound]
];
const adminNav = [
  ['Dashboard', 'admin', Home], ['Campaign Content', 'content', Megaphone],
  ['Community Moderation', 'moderation', ShieldCheck], ['Posts & Comments', 'posts', MessageSquare],
  ['Resources', 'resources', BookOpen], ['FAQs & Inquiries', 'inquiries', CircleHelp], ['Reports', 'reports', Flag],
  ['Analytics', 'analytics', ChartNoAxesCombined], ['Settings', 'settings', Settings]
];
const categoryColors = ['rose', 'blue', 'teal', 'violet', 'pink', 'amber'];
const categoryNames = ['Awareness', 'Education', 'Rights & Law', 'Prevention', "Girls’ Empowerment", 'Community Stories'];

const dateLabel = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
};

function DashboardShell({ admin, children, page, navigate, logout, user, onSelectSection }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`campaign_notifications_read_${user?.id}`) || '[]'); } catch { return []; }
  });
  const { posts, inquiries, resources, faqs, refreshData } = useAppData();
  const setActiveTab = (tab) => navigate(({ home: '/', about: '/about', learn: '/learn', prevention: '/prevention', campaign: '/campaign', faq: '/faq', resources: '/resources', dashboard: '/dashboard', admin: '/admin' })[tab] || '/');
  const entries = admin ? adminNav : userNav;
  const notifications = admin
    ? inquiries.filter((item) => item.status === 'pending').map((item) => ({ id: `report:${item.id}`, title: 'New case report', detail: item.category || 'Support request', date: item.createdAt, target: 'inquiries' }))
    : [
      ...inquiries.filter((item) => item.type !== 'question').map((item) => ({ id: `report:${item.id}:${item.status}`, title: `Your report is ${item.status || 'pending'}`, detail: item.category || 'Support request', date: item.updatedAt || item.createdAt, target: 'my-reports-section' })),
      ...posts.filter((post) => post.authorId === user?.id).flatMap((post) => (post.comments || []).filter((comment) => comment.authorId !== user?.id).map((comment) => ({ id: `reply:${comment.id}`, title: `${comment.authorName || 'Someone'} replied to your post`, detail: post.title, date: comment.createdAt, postId: post.id })))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const unreadNotifications = notifications.filter((item) => !readNotifications.includes(item.id));
  const query = searchQuery.trim().toLocaleLowerCase();
  const searchResults = query ? [
    ...posts.filter((post) => `${post.title} ${post.message || post.content || ''} ${post.category || ''}`.toLocaleLowerCase().includes(query)).map((post) => ({ id: `post:${post.id}`, type: 'Community post', title: post.title, detail: post.category || 'Community', action: () => navigate(`/campaign/posts/${post.id}`, { state: { post } }) })),
    ...resources.filter((resource) => `${resource.title} ${resource.desc || resource.description || ''} ${resource.category || ''} ${resource.provider || ''}`.toLocaleLowerCase().includes(query)).map((resource) => ({ id: `resource:${resource.id}`, type: 'Resource', title: resource.title, detail: resource.category || 'Support', action: () => navigate(`/resources?search=${encodeURIComponent(resource.title)}`) })),
    ...faqs.filter((faq) => `${faq.question} ${faq.answer}`.toLocaleLowerCase().includes(query)).map((faq) => ({ id: `faq:${faq.id}`, type: 'FAQ', title: faq.question, detail: 'Frequently asked question', action: () => navigate(`/faq?search=${encodeURIComponent(faq.question)}`) }))
  ].slice(0, 7) : [];
  const openNotification = (item) => {
    setNotificationsOpen(false);
    if (item.postId) navigate(`/campaign/posts/${item.postId}`);
    else if (!admin && item.target === 'my-reports-section') onSelectSection?.('my-reports');
    else document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
  };
  const markNotificationsRead = () => {
    const ids = notifications.map((item) => item.id);
    setReadNotifications(ids);
    try { localStorage.setItem(`campaign_notifications_read_${user?.id}`, JSON.stringify(ids)); } catch { /* The menu still works if browser storage is unavailable. */ }
  };
  return <div className={`dash-shell ${admin ? 'admin-shell' : 'user-shell'}`}>
    <NavBar activeTab={admin ? 'admin' : 'dashboard'} setActiveTab={setActiveTab} dashboardLabel="Dashboard" />
    <div className="dashboard-toolbar">
      <button className="dash-mobile-menu" type="button" aria-label="Toggle dashboard sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>
      <div className="dashboard-search-wrap"><label className="dashboard-search"><Search size={17} /><input type="search" aria-label="Search posts, resources, and FAQs" placeholder="Search posts, resources, or FAQs..." value={searchQuery} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchQuery(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); if (event.key === 'Enter' && searchResults[0]) searchResults[0].action(); }} /></label>{searchOpen && query && <div className="dashboard-search-results" role="listbox">{searchResults.length ? searchResults.map((result) => <button type="button" role="option" key={result.id} onClick={() => { setSearchOpen(false); setSearchQuery(''); result.action(); }}><span>{result.type}</span><b>{result.title}</b><small>{result.detail}</small></button>) : <p>No matching posts, resources, or FAQs.</p>}</div>}</div>
      <div className="dashboard-header-context"><div className="dash-notification-wrap"><button type="button" className="dash-notification-button" aria-label={`Notifications${unreadNotifications.length ? `, ${unreadNotifications.length} unread` : ''}`} aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); if (!notificationsOpen) { markNotificationsRead(); refreshData(); } }}><Bell size={19} />{unreadNotifications.length > 0 && <span className="notification-count">{unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}</span>}</button>{notificationsOpen && <section className="notification-menu" aria-label="Notifications"><div className="notification-menu-heading"><b>Notifications</b><button type="button" onClick={() => { markNotificationsRead(); setNotificationsOpen(false); }}>Done</button></div>{notifications.length ? <div className="notification-list">{notifications.slice(0, 8).map((item) => <button type="button" className="notification-item" key={item.id} onClick={() => openNotification(item)}><b>{item.title}</b><span>{item.detail}</span><small>{dateLabel(item.date)}</small></button>)}</div> : <p className="notification-empty">You’re all caught up. New replies and report updates will appear here.</p>}</section>}</div>{admin ? <><span className="dash-user-avatar"><UserRoundCog size={17} /></span><span className="dashboard-header-user"><b>Admin</b><small>{user?.email || ''}</small></span></> : <button type="button" className="dashboard-account-control" onClick={() => onSelectSection?.('profile')} aria-label="Open profile settings"><span className="dash-user-avatar">{(user?.name || 'N').slice(0, 1).toUpperCase()}</span><span className="dashboard-header-user"><b>{user?.name || 'Member'}</b><small>{user?.email || ''}</small></span></button>}</div>
    </div>
    <div className="dash-workspace">
      <aside className={`dash-nav ${mobileOpen ? 'open' : ''}`}>
        <div className="dash-nav-list">{admin ? entries.map(([label, key, Icon], index) => <Fragment key={`${key}-${label}`}>{[1, 4, 6, 8].includes(index) && <div className="dash-nav-group-label">{index === 1 ? 'MANAGEMENT' : index === 4 ? 'CONTENT' : index === 6 ? 'REVIEW' : 'SYSTEM'}</div>}<button type="button" className={`dash-nav-item ${page === key ? 'selected' : ''}`} onClick={() => { setMobileOpen(false); if (key === 'admin') navigate('/admin'); else { const targets = { content: 'content', moderation: 'moderation', posts: 'content', resources: 'support-resources', inquiries: 'inquiries', reports: 'moderation', analytics: 'analytics', settings: 'settings' }; document.getElementById(targets[key])?.scrollIntoView({ behavior: 'smooth' }); } }}><Icon size={17} /><span>{label}</span>{['content', 'moderation', 'posts'].includes(key) && <ChevronDown size={13} className="nav-chevron" />}</button></Fragment>) : entries.map(([group, label, key, Icon], index) => <Fragment key={key}>{index === 0 || entries[index - 1][0] !== group ? <div className="dash-nav-group-label">{group}</div> : null}<button type="button" className={`dash-nav-item ${page === key ? 'selected' : ''}`} onClick={() => { setMobileOpen(false); onSelectSection?.(key); }}><Icon size={17} /><span>{label}</span>{key === 'my-reports' && <span className="nav-count">{inquiries.filter((item) => item.type !== 'question').length}</span>}</button></Fragment>)}</div>
        <div className="dash-nav-bottom"><div className="dash-nav-illustration"><HandHeart size={40} /><p>Educate<br />Support<br />Empower</p><small>Together against forced marriage</small></div><button type="button" className="dash-nav-item logout-link" onClick={logout}><LogOut size={17} /><span>Log out</span></button></div>
      </aside>
      <main className="dash-main">{children}<footer className="dash-footer" id={admin ? 'settings' : undefined}><ShieldCheck size={20} /><span><b>{admin ? 'Building a safer, more informed community.' : 'Your voice matters.'}</b><small>Together we can end forced marriage through awareness, support and action.</small></span><span className="footer-sprout">✳</span></footer></main>
    </div>
    {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} />}
  </div>;
}

function ProfileModal({ user, onClose, inline = false }) {
  const { updateName } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const canEditName = user?.authProvider !== 'google';
  const saveName = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateName(name.trim());
      setName(updated.name);
      setMessage('Your name was updated.');
    } catch (error) {
      setMessage(error.message || 'Could not update your name.');
    } finally {
      setSaving(false);
    }
  };
  return <div className={inline ? 'profile-inline' : 'profile-modal-backdrop'} onMouseDown={(event) => { if (!inline && event.target === event.currentTarget) onClose(); }}><section className="profile-modal" role={inline ? undefined : 'dialog'} aria-modal={inline ? undefined : 'true'} aria-labelledby="profile-modal-title"><header><div><span className="dash-eyebrow">ACCOUNT SETTINGS</span><h2 id="profile-modal-title">Your Profile</h2></div>{!inline && <button type="button" aria-label="Close profile" onClick={onClose}><X size={19} /></button>}</header><form onSubmit={saveName}><label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" value={user?.email || ''} readOnly aria-readonly="true" /><small className="profile-modal-help">Your email address is read-only.</small><label htmlFor="profile-name">Name</label><div className="profile-name-field"><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={50} required readOnly={!canEditName} /><button type="submit" disabled={!canEditName || saving || name.trim() === user?.name}>{saving ? 'Saving…' : 'Save'}</button></div>{canEditName ? <small className="profile-modal-help">You can change the name shown on your account.</small> : <small className="profile-modal-help">Your name is managed by Google for this account.</small>}{message && <p role="status">{message}</p>}</form></section></div>;
}

function RecordPanel({ title, empty, records, onOpen, reply = false }) {
  return <section className="dash-panel dashboard-record-list"><div className="panel-heading"><h2>{title}</h2></div>{records.length ? records.map((record) => {
    const post = reply ? record.post : record;
    const titleText = reply ? record.comment.text : post.title;
    const details = reply ? `Reply to: ${post.title} · ${dateLabel(record.comment.createdAt)}` : `${post.category || 'Community post'} · ${dateLabel(post.createdAt)}`;
    return <button type="button" className="dashboard-record-row" key={reply ? `${post.id}-${record.comment.id}` : post.id} onClick={() => onOpen(record)}><b>{titleText}</b><span>{details}</span></button>;
  }) : <p className="dashboard-record-empty">{empty}</p>}</section>;
}

function ReportRequestCard({ item, resources, followUps, submitInquiry }) {
  const [question, setQuestion] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const referral = resources.find((resource) => resource.id === item.referralId);
  const sendFollowUp = async (event) => {
    event.preventDefault();
    const details = question.trim();
    if (!details || saving) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await submitInquiry({ type: 'question', details, parentReportId: item.id });
      setQuestion('');
      setMessage('Your follow-up question was sent to the campaign team.');
    } catch (submitError) {
      setError(submitError.message || 'Could not send your follow-up. Please try again.');
    } finally { setSaving(false); }
  };

  return <article className="my-report-item" key={item.id}>
    <div><b>{item.category || (item.type === 'report_concern' ? 'Report a concern' : item.type === 'other' ? 'Other help' : 'Request for support')}</b><small>{dateLabel(item.createdAt)}</small></div>
    <span className={`status-pill ${item.status === 'pending' ? 'pending' : ''}`}>{item.status || 'pending'}</span>
    <p>{item.details || item.question}</p>
    {item.broadLocation && <small>Area: {item.broadLocation}</small>}
    {item.status === 'referred' && <div className="report-referral-details"><b>We referred you to:</b> <strong>{referral?.title || item.referralName || 'Referral organization details are unavailable'}</strong>
      {referral?.description && <p>{referral.description}</p>}
      {referral?.address && <small>Service area: {referral.address}</small>}
      {referral?.hours && <small>Availability: {referral.hours}</small>}
      {referral?.phone && <small>Phone: <a href={`tel:${referral.phone.replaceAll(' ', '')}`}>{referral.phone}</a></small>}
      {referral?.email && <small>Email: <a href={`mailto:${referral.email}`}>{referral.email}</a></small>}
      {referral?.url && <a className="report-referral-link" href={referral.url} target="_blank" rel="noreferrer">Visit {referral.title} website <ArrowRight size={14} /></a>}
    </div>}
    {item.status === 'referred' && <p className="report-followup-intro">If you have another question about this referral, ask us below. Your questions and our replies will appear here.</p>}
    {followUps.length > 0 && <div className="report-followups"><b>Your follow-up questions</b>{followUps.map((followUp) => <p key={followUp.id}><span>{followUp.details}</span><small>{dateLabel(followUp.createdAt)}</small>{followUp.answer && <span className="report-followup-answer"><b>Campaign team reply:</b> {followUp.answer}</span>}</p>)}</div>}
    <form className="report-followup-form" onSubmit={sendFollowUp}>
      <label htmlFor={`follow-up-${item.id}`}>{item.status === 'referred' ? 'Ask a question about your referral' : 'Have another question about this request?'}</label>
      <textarea id={`follow-up-${item.id}`} rows="2" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Write a follow-up question…" />
      <button type="submit" disabled={!question.trim() || saving}>{saving ? 'Sending…' : 'Send follow-up question'}</button>
      {message && <small role="status">{message}</small>}
      {error && <small role="alert">{error}</small>}
    </form>
  </article>;
}

function AwarenessSpotlight({ onExplore }) {
  return <section className="awareness-spotlight" aria-labelledby="awareness-spotlight-title">
    <div className="awareness-spotlight-copy">
      <span className="dashboard-section-eyebrow">AWARENESS SPOTLIGHT</span>
      <h2 id="awareness-spotlight-title">Every Girl Deserves the Opportunity to Choose Her Future.</h2>
      <p>Education, awareness and access to information can help create communities where every young person has the opportunity to make informed decisions about their future.</p>
      <button type="button" className="awareness-spotlight-button" onClick={onExplore}>Explore Campaigns <ArrowRight size={17} /></button>
    </div>
    <div className="awareness-spotlight-image-wrap"><img src={awarenessSpotlightImage} alt="A mother holding her young child outdoors" /></div>
  </section>;
}

function MessageToRemember() {
  return <section className="message-to-remember" aria-labelledby="message-to-remember-title">
    <div className="message-to-remember-mark" aria-hidden="true"><Sprout size={24} /></div>
    <div>
      <span className="dashboard-section-eyebrow">A MESSAGE TO REMEMBER</span>
      <h2 id="message-to-remember-title">“Change begins when we listen, learn and stand together.”</h2>
      <p>Every voice has the power to contribute to positive change. Together, we can promote awareness, encourage understanding and build supportive communities.</p>
    </div>
  </section>;
}

function UserDashboard({ onCreatePost, navigate }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { posts, faqs, inquiries, resources, submitQuestion, submitInquiry, togglePostLike } = useAppData();
  const [question, setQuestion] = useState('');
  const [notice, setNotice] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);
  const [reportError, setReportError] = useState('');
  const [caseType, setCaseType] = useState('support_request');
  const [caseDetails, setCaseDetails] = useState('');
  const [caseLocation, setCaseLocation] = useState('');
  const [safeContact, setSafeContact] = useState(false);
  const [contactValue, setContactValue] = useState('');
  const [savedResourceIds, setSavedResourceIds] = useState(() => readSavedResourceIds(user?.id));
  useEffect(() => {
    const syncSavedResources = (event) => {
      if (!event?.detail?.userId || event.detail.userId === user?.id) setSavedResourceIds(readSavedResourceIds(user?.id));
    };
    window.addEventListener('saved-resources-changed', syncSavedResources);
    window.addEventListener('storage', syncSavedResources);
    return () => { window.removeEventListener('saved-resources-changed', syncSavedResources); window.removeEventListener('storage', syncSavedResources); };
  }, [user?.id]);
  const userPosts = posts.filter((post) => post.authorId === user?.id);
  const userReplies = posts.flatMap((post) => (post.comments || []).filter((comment) => comment.authorId === user?.id || comment.author?.id === user?.id).map((comment) => ({ post, comment })));
  const myReplies = userReplies.length;
  const savedResources = savedResourceIds.length;
  const savedResourceRecords = resources.filter((resource) => savedResourceIds.includes(String(resource.id)));
  const myReports = inquiries.filter((item) => item.type !== 'question');
  const validSections = new Set(userNav.map(([, , key]) => key));
  const requestedSection = new URLSearchParams(location.search).get('section');
  const section = validSections.has(requestedSection) ? requestedSection : 'dashboard';
  const selectSection = (nextSection) => {
    const search = nextSection === 'dashboard' ? '' : `?section=${encodeURIComponent(nextSection)}`;
    navigate({ pathname: '/dashboard', search });
  };
  const statTargets = { 'My Posts': 'my-posts', 'My Reports': 'my-reports', 'My Replies': 'my-replies', 'Saved Resources': 'saved-resources' };
  const stats = [['My Posts', userPosts.length, 'posts created', FileText, 'blue'], ['My Reports', myReports.length, 'reports sent', ShieldAlert, 'amber'], ['My Replies', myReplies, 'replies made', MessageCircle, 'teal'], ['Saved Resources', savedResources, 'saved items', Heart, 'pink']];
  const activity = [
    ...userPosts.map((post) => ({ icon: FileText, title: 'You posted', detail: post.title, date: post.createdAt })),
    ...inquiries.filter((item) => item.type !== 'question').map((item) => ({ icon: ShieldAlert, title: 'You reported a case', detail: item.category || 'Support request', date: item.createdAt })),
    ...inquiries.filter((item) => item.type === 'question').map((item) => ({ icon: CircleHelp, title: item.parentReportId ? 'You asked a follow-up question' : 'You asked a question', detail: item.details || item.question, date: item.createdAt })),
    ...posts.flatMap((post) => (post.comments || []).flatMap((comment) => {
      const byMe = comment.authorId === user?.id || comment.author?.id === user?.id;
      if (byMe) return [{ icon: MessageCircle, title: 'You replied to a post', detail: post.title, date: comment.createdAt }];
      if (post.authorId === user?.id) return [{ icon: MessageCircle, title: `${comment.authorName || comment.author?.name || 'Someone'} replied to your post`, detail: post.title, date: comment.createdAt }];
      return [];
    }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8);
  const handleAskQuestion = async (event) => { event.preventDefault(); if (!question.trim()) return; try { await submitQuestion(question.trim()); setQuestion(''); setNotice('Your question was sent to the campaign team.'); } catch (error) { setNotice(error.message || 'Could not send your question. Please try again.'); } window.setTimeout(() => setNotice(''), 4000); };
  const submitCaseReport = async (event) => {
    event.preventDefault();
    setReportError('');
    if (!caseDetails.trim()) { setReportError('Please describe what kind of help you need.'); return; }
    setReportSaving(true);
    try {
      const saved = await submitInquiry({ type: caseType, category: caseType === 'report_concern' ? 'Report a concern' : caseType === 'other' ? 'Other help' : 'Request for support', question: caseDetails.trim(), details: caseDetails.trim(), broadLocation: caseLocation.trim(), safeToContact: safeContact, safeContact, contactMethod: safeContact ? 'Contact provided by user' : '', contactValue: safeContact ? contactValue.trim() : '', status: 'pending' });
      if (!saved) throw new Error('No record was saved.');
      setReportSent(true);
      setCaseDetails('');
      setCaseLocation('');
      setContactValue('');
      setSafeContact(false);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'We could not save this request. Please try again or contact a support organization directly.');
    } finally {
      setReportSaving(false);
    }
  };
  const sectionPanel = (key, content) => <section className={`user-section-panel ${section === key ? 'is-active' : ''}`} aria-hidden={section !== key}>{content}</section>;
  return <DashboardShell admin={false} page={section} onSelectSection={selectSection} navigate={navigate} logout={() => { logout(); navigate('/'); }} user={user}>
    {sectionPanel('dashboard', <><div className="user-welcome dash-hero"><div><span className="dash-eyebrow">YOUR DASHBOARD</span><h1>{user?.name ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Welcome back.'}</h1><p>Choose where you would like to contribute, find information, or manage your account.</p></div></div><div className="quick-actions"><button className="quick-action action-blue" onClick={onCreatePost}><Plus /><b>Create a Post</b><small>Share your thoughts or story</small></button><button className="quick-action action-report" onClick={() => { setReportOpen(true); setReportSent(false); }}><ShieldAlert /><b>Report a Case</b><small>Ask for help privately</small></button><button className="quick-action action-purple" onClick={() => navigate('/resources')}><BookOpen /><b>Browse Resources</b><small>Learn and get support</small></button><button className="quick-action action-coral" onClick={() => navigate('/resources')}><Users /><b>Find Support</b><small>Connect with organizations</small></button></div><div className="dash-stat-grid">{stats.map(([label, value, note, Icon, color]) => <button type="button" className="dash-stat" key={label} onClick={() => selectSection(statTargets[label])}><span className={`stat-icon ${color}`}><Icon size={18} /></span><span className="dash-stat-copy"><small>{label}</small><b>{value}</b><span>{note}</span></span></button>)}</div><AwarenessSpotlight onExplore={() => navigate('/campaign')} /><MessageToRemember /></>)}
    {sectionPanel('community', <section className="dash-panel community-panel"><div className="panel-heading"><div><h2>Community Campaign</h2><p>Stories, ideas, and support from the community</p></div><div className="panel-heading-actions"><button className="text-link" onClick={onCreatePost}>Create a post <ArrowRight size={14} /></button><button className="text-link" onClick={() => navigate('/campaign')}>Open Campaign Forum <ArrowRight size={14} /></button></div></div>{posts.length ? <div className="dashboard-post-list">{posts.map((post) => <article className="dashboard-post" key={post.id}><div className="post-author-line"><span className="small-avatar">{(post.authorName || post.author?.name || 'C').slice(0, 1)}</span><span><b>{post.authorName || post.author?.name || 'Community member'}</b><small>{dateLabel(post.createdAt || post.timestamp)} · {post.category}</small></span></div><button className="post-open" onClick={() => navigate(`/campaign/posts/${post.id}`, { state: { post } })}><b>{post.title}</b><span>{post.message || post.content}</span></button><div className="post-engagement"><button onClick={() => togglePostLike(post.id)}><Heart size={15} /> {post.likes || 0}</button><button onClick={() => navigate(`/campaign/posts/${post.id}`, { state: { post } })}><MessageSquare size={15} /> {post.commentsCount || post.comments?.length || 0} replies</button></div></article>)}</div> : <div className="dashboard-empty"><MessageCircle size={22} /><span>No community posts yet.</span></div>}</section>)}
    {sectionPanel('faq', <section className="dash-panel inquiry-panel"><div className="panel-heading"><div><h2>FAQs &amp; Inquiries</h2><p>Find answers or ask the campaign team a question.</p></div><button className="text-link" onClick={() => navigate('/faq')}>View all FAQs <ArrowRight size={14} /></button></div><div className="quick-faqs">{faqs.length ? faqs.map((faq) => <details key={faq.id || faq._id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>) : <p className="quick-faq-empty">Common answers will appear here soon.</p>}</div><form onSubmit={handleAskQuestion}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What would you like to know?" aria-label="Your question" rows="3" /><button type="submit" disabled={!question.trim()}>Send question <ArrowRight size={14} /></button>{notice && <small role="status">{notice}</small>}</form></section>)}
    {sectionPanel('my-reports', <section className="dash-panel my-reports-panel"><div className="panel-heading"><div><h2>My Reports &amp; Support Requests</h2><p>Private requests you have sent to the campaign team</p></div><button className="text-link" onClick={() => { setReportOpen(true); setReportSent(false); }}>Report a case <ArrowRight size={14} /></button></div>{myReports.length ? <div className="my-reports-list">{myReports.map((item) => <ReportRequestCard key={item.id} item={item} resources={resources} followUps={inquiries.filter((entry) => entry.parentReportId === item.id)} submitInquiry={submitInquiry} />)}</div> : <div className="table-empty">You have not sent any reports or support requests yet.</div>}</section>)}
    {sectionPanel('my-posts', <RecordPanel title="My Posts" empty="Your posts will appear here." records={userPosts} onOpen={(post) => navigate(`/campaign/posts/${post.id}`, { state: { post } })} />)}
    {sectionPanel('my-replies', <RecordPanel title="My Replies" empty="Your replies will appear here." records={userReplies} onOpen={({ post }) => navigate(`/campaign/posts/${post.id}`, { state: { post } })} reply />)}
    {sectionPanel('saved-resources', <section className="dash-panel dashboard-record-list"><div className="panel-heading"><h2>Saved Resources</h2><button type="button" className="text-link" onClick={() => navigate('/resources')}>Browse resources <ArrowRight size={14} /></button></div>{savedResourceRecords.length ? savedResourceRecords.map((resource) => <article className="dashboard-record-row saved-resource-row" key={resource.id}><b>{resource.title}</b><span>{resource.category || 'Resource'}</span><a href={resource.url} target="_blank" rel="noreferrer">Open resource <ArrowRight size={13} /></a></article>) : <p className="dashboard-record-empty">Save resources from the Resources page to find them here.</p>}</section>)}
    {sectionPanel('activity', <section className="dash-panel activity-panel"><div className="panel-heading"><h2>My Activity</h2></div>{activity.length ? <div className="activity-list">{activity.map((item, index) => <div className="activity-row" key={`${item.title}-${item.date}-${index}`}><span><item.icon size={15} /></span><div><b>{item.title}</b><small>{item.detail}</small><small>{dateLabel(item.date)}</small></div></div>)}</div> : <div className="activity-empty">Your posts, replies, and case reports will appear here.</div>}</section>)}
    {sectionPanel('profile', <ProfileModal user={user} inline />)}
    {reportOpen && <div className="case-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportOpen(false); }}><section className="case-modal" role="dialog" aria-modal="true" aria-labelledby="case-modal-title"><div className="case-modal-heading"><span className="case-modal-icon"><ShieldAlert size={20} /></span><div><h2 id="case-modal-title">Report a case or ask for help</h2><p>Share only what you feel safe sharing.</p></div><button aria-label="Close form" onClick={() => setReportOpen(false)}><X size={19} /></button></div>{reportSent ? <div className="case-success"><CheckCircle2 size={30} /><h3>Your request was sent</h3><p>Your request was saved for the campaign admin. This form does not provide emergency response.</p><button onClick={() => setReportOpen(false)}>Done</button></div> : <form className="case-form" noValidate onSubmit={submitCaseReport}><label>What do you need?<select value={caseType} onChange={(event) => setCaseType(event.target.value)}><option value="support_request">I need support for myself</option><option value="report_concern">I want to report a concern</option><option value="other">Another kind of help</option></select></label><label>What would you like the admin to know?<textarea rows="5" value={caseDetails} onChange={(event) => { setCaseDetails(event.target.value); setReportError(''); }} placeholder="Describe the kind of help you are looking for. You can leave out names and details that could identify someone." /></label>{reportError && <p className="case-error" role="alert">{reportError}</p>}<label>General area (optional)<input value={caseLocation} onChange={(event) => setCaseLocation(event.target.value)} placeholder="For example, county or nearest town" /></label><label className="safe-contact-option"><input type="checkbox" checked={safeContact} onChange={(event) => setSafeContact(event.target.checked)} /><span>It is safe for the admin to contact me about this request.</span></label>{safeContact && <label>Safe contact detail (optional)<input value={contactValue} onChange={(event) => setContactValue(event.target.value)} placeholder="A phone number or email you can safely access" /></label>}<p className="case-privacy-note"><ShieldCheck size={15} /> Your request is sent to the campaign server for admin review. Do not include another person’s name, exact address, or identifying details. For immediate danger, contact a trusted person or local emergency service directly.</p><div className="case-form-actions"><button type="button" className="case-cancel" onClick={() => setReportOpen(false)}>Cancel</button><button type="submit" className="case-submit" disabled={reportSaving}>{reportSaving ? 'Saving…' : <><Send size={15} /> Send to admin</>}</button></div></form>}</section></div>}
  </DashboardShell>;
}

function MiniLineChart({ posts, comments }) {
  const chartNow = new Date();
  const inLastMonth = (date) => date instanceof Date && !Number.isNaN(date.getTime()) && chartNow - date <= 30 * 86400000 && date <= chartNow;
  const bucket = (records) => Array.from({ length: 5 }, (_, index) => records.filter((record) => {
    const date = new Date(record.createdAt || record.timestamp);
    return inLastMonth(date) && Math.min(4, Math.floor((chartNow - date) / (6 * 86400000))) === index;
  }).length).reverse();
  const lines = [
    { label: 'Posts', values: bucket(posts), color: '#0878de' },
    { label: 'Comments', values: bucket(comments), color: '#13b8a6' },
  ];
  const peak = Math.max(0, ...lines.flatMap((line) => line.values));
  const scale = peak || 1;
  const coords = (values) => values.map((value, index) => `${42 + index * 80},${140 - (value / scale) * 108}`).join(' ');
  const axisValue = (fraction) => peak ? Math.ceil(peak * fraction) : 0;
  return <div className="chart-wrap"><div className="chart-y-labels"><span>{peak}</span><span>{axisValue(.75)}</span><span>{axisValue(.5)}</span><span>{axisValue(.25)}</span><span>0</span></div><svg viewBox="0 0 390 155" role="img" aria-label={`Community engagement in the last 30 days. ${posts.length} posts, ${comments.length} comments`}><g className="chart-grid-lines">{[26, 55, 84, 113, 142].map((y) => <line key={y} x1="28" x2="380" y1={y} y2={y} />)}</g>{lines.map((line) => <polyline key={line.label} points={coords(line.values)} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />)}{lines[0].values.map((value, index) => <circle key={index} cx={42 + index * 80} cy={140 - (value / scale) * 108} r="2.4" fill="#0878de" />)}</svg><div className="chart-x-labels"><span>30 days ago</span><span>21 days</span><span>14 days</span><span>7 days</span><span>Today</span></div><div className="chart-legend">{lines.map((line) => <span key={line.label}><i style={{ background: line.color }} />{line.label}</span>)}</div></div>;
}

function AdminQuestionAnswer({ item, updateInquiry }) {
  const [answer, setAnswer] = useState(item.answer || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const saveAnswer = async (event) => {
    event.preventDefault();
    if (!answer.trim() || saving) return;
    setSaving(true);
    setMessage('');
    try {
      await updateInquiry(item.id, { answer: answer.trim(), status: 'resolved' });
      setMessage('Answer saved and published in FAQs.');
    } catch (error) {
      setMessage(error.message || 'Could not save the answer.');
    } finally { setSaving(false); }
  };
  return <form className="admin-answer-form" onSubmit={saveAnswer}><textarea aria-label={`Answer to ${item.details || 'question'}`} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write an answer; it will be published in FAQs" rows="2" required /><button type="submit" disabled={!answer.trim() || saving}>{saving ? 'Saving…' : item.answer ? 'Update answer' : 'Answer & publish FAQ'}</button>{message && <small role="status">{message}</small>}</form>;
}

function AdminContentForm({ type, onSaved }) {
  const isFaq = type === 'faq';
  const initialValues = isFaq
    ? { question: '', answer: '', category: 'Rights' }
    : { title: '', category: 'Health & Protection', description: '', url: '', phone: '', email: '', address: '', hours: '', linkLabel: '', provider: '', award: '', eligibility: '', studyLevel: '', deadline: '' };
  const [values, setValues] = useState(initialValues);
  const [resourceType, setResourceType] = useState('support');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const setField = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (isFaq) await createFAQRecord(values);
      else await createResourceRecord({ ...values, type: resourceType, category: resourceType === 'scholarship' ? 'Scholarships' : values.category });
      setValues(initialValues);
      setResourceType('support');
      setMessage(isFaq ? 'FAQ published for users.' : 'Resource added and published for users.');
      await onSaved();
    } catch (error) { setMessage(error.message || 'Could not save this content.'); }
    finally { setSaving(false); }
  };
  return <form className="admin-content-form" onSubmit={submit}>
    <h3>{isFaq ? 'Add a frequently asked question' : 'Add a support organization or resource'}</h3>
    {isFaq ? <>
      <label>Question<input name="question" value={values.question} onChange={setField} required maxLength={240} /></label>
      <label>Answer<textarea name="answer" value={values.answer} onChange={setField} required rows="3" /></label>
      <label>Category<select name="category" value={values.category} onChange={setField}>{['Rights', 'Support', 'Prevention', 'Submitted'].map((item) => <option key={item}>{item}</option>)}</select></label>
    </> : <>
      <label>What are you adding?<select value={resourceType} onChange={(event) => { const type = event.target.value; setResourceType(type); setValues((current) => ({ ...current, category: type === 'scholarship' ? 'Scholarships' : 'Health & Protection' })); }}><option value="support">Support organization or resource</option><option value="scholarship">Scholarship</option></select></label>
      <label>{resourceType === 'scholarship' ? 'Scholarship name' : 'Organization / resource name'}<input name="title" value={values.title} onChange={setField} required maxLength={120} /></label>
      {resourceType === 'support' ? <label>Support category<select name="category" value={values.category} onChange={setField} required>{['Child Protection', 'Health & Protection', 'Legal Aid'].map((item) => <option key={item}>{item}</option>)}</select></label> : <>
        <label>Scholarship provider<input name="provider" value={values.provider} onChange={setField} placeholder="Organization or institution offering it" /></label>
        <div className="admin-form-fields"><label>Award / funding amount<input name="award" value={values.award} onChange={setField} placeholder="For example, tuition and living costs" /></label><label>Study level<input name="studyLevel" value={values.studyLevel} onChange={setField} placeholder="Undergraduate, postgraduate…" /></label></div>
        <div className="admin-form-fields"><label>Eligibility requirements<textarea name="eligibility" value={values.eligibility} onChange={setField} rows="2" /></label><label>Application deadline<input name="deadline" value={values.deadline} onChange={setField} placeholder="Date or rolling applications" /></label></div>
      </>}
      <label>Description<textarea name="description" value={values.description} onChange={setField} required rows="3" /></label>
      <label>{resourceType === 'scholarship' ? 'Application / scholarship information link' : 'Website or information link'}<input name="url" type="url" value={values.url} onChange={setField} required placeholder="https://example.org" /></label>
      {resourceType === 'support' && <>
        <div className="admin-form-fields"><label>Phone (optional)<input name="phone" type="tel" value={values.phone} onChange={setField} /></label><label>Email (optional)<input name="email" type="email" value={values.email} onChange={setField} /></label></div>
        <div className="admin-form-fields"><label>Area / service location (optional)<input name="address" value={values.address} onChange={setField} /></label><label>Hours / availability (optional)<input name="hours" value={values.hours} onChange={setField} /></label></div>
      </>}
      <label>Website button text (optional)<input name="linkLabel" value={values.linkLabel} onChange={setField} placeholder={resourceType === 'scholarship' ? 'View scholarship / apply' : 'Visit website'} /></label>
    </>}
    <div className="admin-form-actions"><button type="submit" disabled={saving}>{saving ? 'Saving…' : isFaq ? 'Publish FAQ' : 'Add resource'}</button>{message && <span role="status">{message}</span>}</div>
  </form>;
}

function AdminDashboard({ navigate }) {
  const { user, logout } = useAuth();
  const { posts, resources, faqs, inquiries, updateInquiry, updatePost, moderateComment, deletePost, refreshData } = useAppData();
  const [contentTab, setContentTab] = useState('Campaign Posts');
  const comments = posts.flatMap((post) => post.comments || []);
  const metrics = [['Total Posts', posts.length, 'in community feed', FileText, 'violet', 'content'], ['Total Comments', comments.length, 'across all posts', MessageCircle, 'teal', 'moderation'], ['Pending Reports', inquiries.filter((item) => item.type === 'report_concern' && item.status === 'pending').length, 'Needs review', AlertTriangle, 'red', 'inquiries'], ['Pending Inquiries', inquiries.filter((item) => item.status === 'pending').length, 'Awaiting response', CircleHelp, 'blue', 'inquiries'], ['Active Resources', resources.filter((resource) => resource.status !== 'archived').length, 'Published', BookOpen, 'teal', 'support-resources']];
  const categories = useMemo(() => categoryNames.map((name, index) => ({ name, color: categoryColors[index], count: posts.filter((post) => post.category === name).length })), [posts]);
  const topicTotal = Math.max(posts.length, 1);
  const topicGradient = categories.reduce((state, category, index) => {
    const share = (category.count || (posts.length ? 0 : index === 0 ? 1 : 0)) / topicTotal * 100;
    const next = `${state.gradient}${state.position}% ${state.position + share}%, `;
    return { gradient: next, position: state.position + share };
  }, { gradient: '', position: 0 });
  const contentRows = contentTab === 'Campaign Posts'
    ? posts.map((post) => ({ id: post.id, authorId: post.authorId, title: post.title, author: post.adminAuthorName || post.authorName || post.author?.name || 'Community member', status: post.status || 'Published', reportCount: post.reports?.length || 0, reportReasons: (post.reports || []).map((report) => report.reason).filter(Boolean), type: 'Campaign post' }))
    : contentTab === 'Educational Articles'
      ? resources.map((resource) => ({ id: resource.id, title: resource.title, author: 'Campaign team', status: resource.status || 'Published', type: 'Resource' }))
      : faqs.map((faq) => ({ id: faq.id, title: faq.question, author: faq.userId ? 'Community member' : 'Campaign team', status: faq.isSubmitted ? 'Pending' : 'Published', type: faq.isSubmitted ? 'Inquiry' : 'FAQ' }));
  const topicColors = { rose: '#ff6b7b', blue: '#2785dc', teal: '#11b8a8', violet: '#8658d7', pink: '#d94ead', amber: '#f4a945' };
  return <DashboardShell admin page="admin" navigate={navigate} logout={() => { logout(); navigate('/'); }} user={user}>
    <div className="admin-heading"><div><span className="dash-eyebrow">OVERVIEW</span><h1>Admin Dashboard</h1><p>Manage the campaign, monitor activity and keep the community safe.</p></div><button className="date-range"><Activity size={15} /> Sep 1, 2026 – Sep 30, 2026 <ChevronDown size={14} /></button></div>
    <div className="admin-metric-grid">{metrics.map(([label, value, caption, Icon, color, target]) => <button type="button" className="admin-metric" key={label} onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })}><span className={`metric-icon ${color}`}><Icon size={17} /></span><small>{label}</small><b>{value}</b><span className="metric-caption">{caption}</span></button>)}</div>
    <div className="admin-charts" id="analytics"><section className="dash-panel engagement-panel"><div className="panel-heading"><div><h2>Community Engagement</h2><p>Activity overview for the past month</p></div><button className="chart-filter">Last 30 days <ChevronDown size={13} /></button></div><MiniLineChart posts={posts} comments={comments} /></section><section className="dash-panel topics-panel"><div className="panel-heading"><div><h2>Most Discussed Topics</h2><p>Community post categories</p></div></div><div className="topics-chart-row"><div className="donut-chart" style={{ background: `conic-gradient(${topicGradient.gradient}#e9eef4 ${topicGradient.position}% 100%)` }}><span>Topics<small>{posts.length}</small></span></div><ul>{categories.map((item) => <li key={item.name}><i style={{ background: topicColors[item.color] }} />{item.name}<b>{posts.length ? Math.round(item.count / posts.length * 100) : 0}%</b></li>)}</ul></div></section></div>
    <div className="admin-lower-grid"><section className="dash-panel content-management" id="content"><div className="panel-heading"><div><h2>Content Management</h2><p>Review and manage campaign content</p></div><button className="text-link" onClick={() => navigate('/campaign')}>View all <ArrowRight size={14} /></button></div><div className="management-tabs" role="tablist" aria-label="Content type">{['Campaign Posts', 'Educational Articles', 'FAQs'].map((tab) => <button role="tab" aria-selected={contentTab === tab} className={contentTab === tab ? 'active' : ''} key={tab} onClick={() => setContentTab(tab)}>{tab}</button>)}</div>{contentTab === 'FAQs' && <AdminContentForm type="faq" onSaved={refreshData} />}<div className="table-scroll"><table><thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead><tbody>{contentRows.map((row) => <tr key={`${row.type}-${row.id}`}><td><span className="table-title">{row.title}</span><small>{row.type}{row.reportCount > 0 ? ` · ${row.reportCount} report(s): ${row.reportReasons.join('; ')}` : ''}</small></td><td>{row.author}</td><td><span className={`status-pill ${row.status === 'Draft' || row.status === 'Pending' ? 'draft' : ''}`}>{row.status}</span></td><td>{row.type === 'FAQ' ? <button className="table-action" aria-label={`Delete ${row.title}`} onClick={async () => { if (window.confirm('Delete this FAQ?')) { await deleteFAQRecord(row.id); refreshData(); } }}>Delete</button> : row.type === 'Campaign post' ? <div className="admin-row-actions"><button className="table-action" onClick={() => updatePost(row.id, { status: ['blocked', 'flagged'].includes(posts.find((post) => post.id === row.id)?.status) ? 'published' : 'blocked' })}>{['blocked', 'flagged'].includes(posts.find((post) => post.id === row.id)?.status) ? 'Keep post' : 'Block post'}</button><button className="table-action" onClick={() => { if (window.confirm('Delete this post?')) deletePost(row.id); }}>Delete post</button></div> : <button className="table-action" aria-label={`Open ${row.title}`} onClick={() => navigate('/resources')}>Open</button>}</td></tr>)}</tbody></table>{contentRows.length === 0 && <div className="table-empty">Nothing to display in this tab yet.</div>}</div></section>
      <section className="dash-panel moderation-panel" id="moderation"><div className="panel-heading"><h2>Community Moderation</h2><button className="text-link" onClick={() => document.getElementById('moderation-comments')?.scrollIntoView({ behavior: 'smooth' })}>Review comments <ArrowRight size={14} /></button></div><div className="moderation-grid">{[['Pending Comments', comments.filter((comment) => comment.status === 'pending').length, MessageSquare, 'blue', 'moderation-comments'], ['Reported Posts', posts.reduce((sum, post) => sum + (post.reports?.length || 0), 0), AlertTriangle, 'red', 'content'], ['Reported Comments', comments.reduce((sum, comment) => sum + (comment.reports?.length || 0), 0), Flag, 'amber', 'moderation-comments'], ['Flagged Content', posts.filter((post) => post.status === 'flagged').length, ShieldCheck, 'violet', 'content']].map(([label, value, Icon, color, target]) => <button type="button" className="moderation-card" key={label} onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })}><span className={color}><Icon size={16} /></span><small>{label}</small><b>{value}</b></button>)}</div></section>
      <section className="dash-panel moderation-comments-panel" id="moderation-comments"><div className="panel-heading"><div><h2>Comment Review</h2><p>Approve, decline, or delete replies</p></div></div><div className="table-scroll"><table><thead><tr><th>Comment</th><th>Post</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead><tbody>{comments.map((comment) => { const post = posts.find((entry) => (entry.comments || []).some((item) => item.id === comment.id)); return <tr key={comment.id}><td>{comment.text}{comment.reports?.length > 0 && <small className="reported-reasons">{comment.reports.length} report(s): {comment.reports.map((report) => report.reason).filter(Boolean).join('; ')}</small>}</td><td>{post?.title || 'Community post'}</td><td>{comment.authorName || 'Member'}</td><td>{comment.status || 'approved'}</td><td><div className="admin-row-actions"><button className="table-action" disabled={comment.status === 'approved'} onClick={() => moderateComment(comment.id, 'approved')}>Approve</button><button className="table-action" disabled={comment.status === 'blocked'} onClick={() => moderateComment(comment.id, 'blocked')}>Decline</button><button className="table-action" onClick={() => { if (window.confirm('Delete this comment?')) moderateComment(comment.id, undefined, 'delete'); }}>Delete</button></div></td></tr>; })}</tbody></table>{comments.length === 0 && <div className="table-empty">No comments need review.</div>}</div></section>
      <section className="dash-panel support-orgs" id="support-resources"><div className="panel-heading"><div><h2>Support Organizations &amp; Resources</h2><p>Verified support resources</p></div><button className="text-link" onClick={() => navigate('/resources')}>View all <ArrowRight size={14} /></button></div><AdminContentForm type="resource" records={resources} onSaved={refreshData} /><div className="table-scroll"><table><thead><tr><th>Organization / Resource</th><th>Category</th><th>Location</th><th>Status</th><th></th></tr></thead><tbody>{resources.slice(0, 8).map((resource) => <tr key={resource.id}><td>{resource.title}</td><td>{resource.category}</td><td>{resource.address || 'Online'}</td><td><span className="status-pill">{resource.status || 'Active'}</span></td><td><button className="table-action" onClick={async () => { if (window.confirm(`Delete ${resource.title}?`)) { await deleteResourceRecord(resource.id); refreshData(); } }}>Delete</button></td></tr>)}</tbody></table>{resources.length === 0 && <div className="table-empty">No support organizations or resources have been added yet.</div>}</div></section>
      <section className="dash-panel inquiry-management" id="inquiries"><div className="panel-heading"><div><h2>Inquiries / Case Reports</h2><p>Answer questions to publish them as FAQs, or refer support requests</p></div><button className="text-link" onClick={() => navigate('/faq')}>FAQs <ArrowRight size={14} /></button></div><div className="table-scroll"><table><thead><tr><th>Request</th><th>Details &amp; Contact</th><th>Answer / Referral</th><th>Status</th><th>Action</th></tr></thead><tbody>{inquiries.map((item) => <tr key={item.id}><td><span className="table-title">{item.category}</span><small>{dateLabel(item.createdAt)}</small></td><td><span className="case-admin-details">{item.details || item.question}</span><small>{item.safeToContact && item.contactValue ? `Safe contact: ${item.contactValue}` : 'No safe contact provided'}{item.broadLocation ? ` · ${item.broadLocation}` : ''}</small></td><td>{item.type === 'question' ? <AdminQuestionAnswer item={item} updateInquiry={updateInquiry} /> : <select aria-label={`Refer ${item.category} to a resource`} value={item.referralId || ''} onChange={(event) => { const resource = resources.find((entry) => entry.id === event.target.value); updateInquiry(item.id, { referralId: event.target.value, referralName: resource?.title || '' }); }}><option value="">Choose resource</option>{resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.title}</option>)}</select>}</td><td><span className={`status-pill ${item.status === 'pending' ? 'pending' : ''}`}>{item.status || 'pending'}</span></td><td>{item.type === 'question' ? '—' : <button className="table-action refer-action" disabled={!item.referralId || item.status === 'referred'} onClick={() => updateInquiry(item.id, { status: 'referred' })}>{item.status === 'referred' ? 'Referred' : 'Mark referred'}</button>}</td></tr>)}</tbody></table>{inquiries.length === 0 && <div className="table-empty">No help requests or case reports have been submitted from this browser.</div>}</div></section></div>
  </DashboardShell>;
}

export default function DashboardPage({ admin = false, onCreatePost }) {
  const navigate = useNavigate();
  return admin ? <AdminDashboard navigate={navigate} /> : <UserDashboard navigate={navigate} onCreatePost={onCreatePost} />;
}
