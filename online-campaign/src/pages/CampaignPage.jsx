import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, Heart, MessageSquare, Share2, Tag, ArrowRight, ShieldCheck, MessageCircleHeart, Pencil, Trash2 } from 'lucide-react';
import './CampaignPage.css';

const CampaignPage = ({ onSelectPost, onOpenCreateModal, onEditPost, onDeletePost, setActiveTab }) => {
  const { posts, togglePostLike } = useAppData(); const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(''); const [selectedCategory, setSelectedCategory] = useState('All'); const [likeError, setLikeError] = useState('');
  const categories = ['All', 'Awareness', 'Education', 'Support', 'Prevention'];
  const filteredPosts = posts.filter((post) => {
    const categoryMatches = selectedCategory === 'All' || post.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    return categoryMatches && (post.title.toLowerCase().includes(query) || (post.message ?? post.content ?? '').toLowerCase().includes(query));
  });
  const share = () => user ? onOpenCreateModal() : setActiveTab('login');
  const handleLike = async (postId) => {
    setLikeError('');
    if (!user) { setActiveTab('login'); return; }
    try { await togglePostLike(postId); }
    catch (error) { setLikeError(error.message || 'Could not update the like. Please try again.'); }
  };
  const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? value || 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date); };
  return <div className="campaign-page">
    <div className="page-header text-center"><div className="container"><span className="badge badge-primary mb-2">Public Forum</span><h1>Community Campaign</h1><p className="page-subtitle">Share. Learn. Speak. Support.</p></div></div>
    <div className="container section-padding">
      <div className="feed-controls-bar"><div className="search-box"><Search size={18} className="search-icon" /><input type="search" aria-label="Search campaign posts" placeholder="Search campaign posts..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
        <div className="category-pills" aria-label="Filter posts by category">{categories.map((category) => <button type="button" key={category} aria-pressed={selectedCategory === category} className={`pill-btn ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
        <button type="button" className="btn btn-primary" onClick={share}><PlusCircle size={18} /> Share your voice</button>
      </div>
      <div className="campaign-grid"><main className="posts-feed" aria-live="polite">
        {likeError && <p className="auth-notice" role="alert">{likeError}</p>}
        {filteredPosts.length === 0 ? posts.length > 0 ? <div className="empty-feed-card"><p>No posts match your search or selected topic.</p></div> : <div className="empty-feed-card voice-invitation"><div className="voice-icon"><MessageCircleHeart size={28} /></div><span className="voice-eyebrow">A space for real voices</span><h2>Share your voice</h2><p className="voice-lead">This community feed is waiting for real contributions from people who care about girls’ rights and education in South Sudan.</p><button type="button" className="btn btn-primary" onClick={share}><PlusCircle size={18} /> Write a post</button><div className="voice-guidance"><ShieldCheck size={19} /><p><strong>Share with care.</strong> Only post your own words or information you have permission to share. Protect girls’ privacy: leave out names, locations, photos, or details that could identify someone without their informed consent.</p></div><p className="demo-note">Posts are saved in this browser and are not shared with other users.</p></div> : filteredPosts.map((post) => {
          const owned = Boolean(user && (post.authorId === user.id || user.isAdmin)); const content = post.message ?? post.content ?? ''; const image = post.image ?? post.imageUrl;
          return <article key={post.id} className="post-card" onClick={() => onSelectPost(post)}>
            <div className="post-header">{post.author?.avatar ? <img src={post.author.avatar} alt="" className="author-avatar" /> : <span className="author-avatar author-avatar-placeholder" aria-hidden="true">{(post.authorName || post.author?.name || 'C').slice(0, 1).toUpperCase()}</span>}<div className="author-meta"><div className="author-name-row"><span className="author-name">{post.authorName || post.author?.name || 'Community member'}</span></div><span className="post-time">{formatDate(post.createdAt || post.timestamp)}{post.updatedAt && <span className="edited-label"> · Edited</span>}</span></div><span className="post-category-tag">{post.category}</span></div>
            <h3 className="post-title">{post.title}</h3><p className="post-body">{content}</p>{image && <img className="post-image" src={image} alt="Post attachment" />}
            <div className="post-actions" onClick={(event) => event.stopPropagation()}><button type="button" aria-pressed={Boolean(post.isLiked)} aria-label={user ? (post.isLiked ? 'Unlike post' : 'Like post') : 'Log in to like post'} className={`action-btn ${post.isLiked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}><Heart size={18} className={post.isLiked ? 'fill-current' : ''} /><span>{post.likes || 0}</span></button><button type="button" className="action-btn" onClick={() => onSelectPost(post)}><MessageSquare size={18} /><span>{post.commentsCount || 0} Comments</span></button><button type="button" className="action-btn" onClick={() => { if (navigator.share) navigator.share({ title: post.title, text: content }).catch(() => {}); else navigator.clipboard?.writeText(`${post.title}\n${content}`); }}><Share2 size={18} /><span>Share</span></button>{owned && <><button type="button" className="action-btn post-manage-btn" onClick={() => onEditPost(post)} aria-label={`Edit ${post.title}`}><Pencil size={16} /><span>Edit</span></button><button type="button" className="action-btn post-manage-btn delete-action" onClick={() => onDeletePost(post)} aria-label={`Delete ${post.title}`}><Trash2 size={16} /><span>Delete</span></button></>}</div>
          </article>;
        })}
      </main><aside className="campaign-sidebar"><div className="sidebar-photo-card"><img src="/campaign-community.png" alt="Community members hold signs calling for an end to child and forced marriage." /><div><span>SHARE • LEARN • SUPPORT</span><strong>Your voice can make a difference.</strong></div></div><div className="sidebar-widget callout-widget"><h3>Join the Conversation</h3><p>Be part of a community that supports, informs, and empowers.</p><button className="btn btn-primary btn-sm w-100 mt-2" onClick={() => setActiveTab(user ? 'campaign' : 'login')}>{user ? 'You are signed in' : 'Sign Up / Log In'}</button></div><div className="sidebar-widget"><h4 className="widget-title"><Tag size={16} /> Campaign Topics</h4><ul className="topic-list">{categories.filter((category) => category !== 'All').map((category) => <li key={category}><button type="button" onClick={() => setSelectedCategory(category)}><span>{category}</span><ArrowRight size={14} /></button></li>)}</ul></div></aside></div>
    </div>
  </div>;
};
export default CampaignPage;
