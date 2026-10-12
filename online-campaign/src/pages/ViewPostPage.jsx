import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Heart, MessageSquare, Share2, Flag, Send, Image as ImageIcon, Pencil, Trash2, Check, X } from 'lucide-react';
import './ViewPostPage.css';

const ViewPostPage = ({ post, onBack, onOpenReportModal }) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const { posts, togglePostLike, addComment, editComment, removeComment, reportComment } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentPost = posts.find((item) => item.id === post?.id) || post;

  if (!currentPost) {
    return (
      <div className="container section-padding text-center">
        <p>No post selected.</p>
        <button className="btn btn-primary mt-3" onClick={onBack}>
          Back to Feed
        </button>
      </div>
    );
  }

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await togglePostLike(currentPost.id);
    } catch (error) {
      setCommentError(error.message || 'Could not update the like. Please try again.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      setCommentError('Write a comment before posting.');
      return;
    }
    try {
      await addComment(currentPost.id, newCommentText.trim());
      setNewCommentText('');
      setCommentError('');
    } catch (error) {
      setCommentError(error.message || 'Could not post your reply. Please try again.');
    }
  };

  const handleSaveComment = async (event) => {
    event.preventDefault();
    if (!editingCommentText.trim()) { setCommentError('Comment cannot be empty.'); return; }
    try {
      await editComment(editingCommentId, editingCommentText.trim());
      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentError('');
      setReportMessage('Comment updated.');
    } catch (error) {
      setCommentError(error.message || 'Could not edit this comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    try {
      await removeComment(commentId);
      setReportMessage('Comment deleted.');
      setCommentError('');
    } catch (error) {
      setCommentError(error.message || 'Could not delete this comment.');
    }
  };

  return (
    <div className="view-post-page">
      <div className="container section-padding">
        {/* Back Navigation Bar */}
        <button className="back-link-btn mb-3" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Community Feed
        </button>

        <div className="view-post-layout">
          {/* Main Article Container (Frame 6) */}
          <article className="expanded-post-card">
            <div className="post-header">
              {currentPost.author.avatar ? <img src={currentPost.author.avatar} alt={currentPost.author.name} className="author-avatar-lg" /> : <span className="author-avatar-lg author-avatar-placeholder" aria-hidden="true">C</span>}
              <div className="author-meta">
                <div className="author-name-row">
                  <span className="author-name-lg">{currentPost.author.name}</span>
                  <span className="author-handle">{currentPost.author.handle}</span>
                </div>
                <span className="post-time">{currentPost.createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(currentPost.createdAt)) : currentPost.timestamp}{currentPost.updatedAt && <span className="edited-label"> · Edited</span>}</span>
              </div>
              <span className="post-category-tag">{currentPost.category}</span>
            </div>

            <h1 className="expanded-post-title">{currentPost.title}</h1>
            <div className="expanded-post-content">
              <p>{currentPost.message ?? currentPost.content}</p>
              {(currentPost.image ?? currentPost.imageUrl) && <img className="expanded-post-image" src={currentPost.image ?? currentPost.imageUrl} alt="Post attachment" />}
            </div>

            <div className="post-action-bar">
              <div className="left-actions">
                <button
                  type="button"
                  aria-pressed={Boolean(currentPost.isLiked)}
                  aria-label={user ? (currentPost.isLiked ? 'Unlike post' : 'Like post') : 'Log in to like post'}
                  className={`action-btn ${currentPost.isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  <Heart size={18} className={currentPost.isLiked ? 'fill-current' : ''} />
                  <span>{currentPost.likes} Likes</span>
                </button>

                <div className="action-stat">
                  <MessageSquare size={18} />
                  <span>{(currentPost.comments || []).length} Comments</span>
                </div>

                <button className="action-btn">
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>

              <button className="report-btn" onClick={() => onOpenReportModal(currentPost)}>
                <Flag size={16} /> Report
              </button>
            </div>

            {/* Comments Thread */}
            <section className="comments-section">
              <h3 className="comments-title">Comments ({(currentPost.comments || []).length})</h3>

              <div className="comments-feed">
                {(currentPost.comments || []).length === 0 ? (
                  <p className="no-comments-msg">No comments yet. Be the first to join the conversation!</p>
                ) : (
                  currentPost.comments.map((c) => (
                    <div key={c.id} className="comment-card">
                      {c.author.avatar ? <img src={c.author.avatar} alt={c.author.name} className="comment-avatar" /> : <span className="comment-avatar author-avatar-placeholder" aria-hidden="true">C</span>}
                      <div className="comment-body">
                        <div className="comment-meta">
                          <span className="comment-author">{c.author.name}</span>
                          <span className="comment-time">{c.timestamp}</span>
                        </div>
                        {editingCommentId === c.id ? <form className="comment-edit-form" onSubmit={handleSaveComment}>
                          <textarea aria-label="Edit comment" rows="3" maxLength={2000} value={editingCommentText} onChange={(event) => setEditingCommentText(event.target.value)} />
                          <div className="comment-manage-actions"><button type="submit" className="comment-manage-button"><Check size={14} /> Save</button><button type="button" className="comment-manage-button" onClick={() => { setEditingCommentId(null); setEditingCommentText(''); setCommentError(''); }}><X size={14} /> Cancel</button></div>
                        </form> : <p className="comment-text">{c.text}</p>}
                        <div className="comment-manage-actions">
                          {user && String(c.authorId) === String(user.id) && editingCommentId !== c.id && <button type="button" className="comment-manage-button" onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.text); setCommentError(''); }}><Pencil size={13} /> Edit</button>}
                          {user && (String(c.authorId) === String(user.id) || user.isAdmin) && <button type="button" className="comment-manage-button comment-delete-button" onClick={() => handleDeleteComment(c.id)}><Trash2 size={13} /> Delete</button>}
                          {user && String(c.authorId) !== String(user.id) && <button type="button" className="report-comment-button" onClick={async () => { try { await reportComment(c.id, 'Reported by a community member'); setReportMessage('Comment sent to the moderation team.'); } catch (error) { setReportMessage(error.message || 'Could not report this comment.'); } }}><Flag size={13} /> Report comment</button>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {reportMessage && <p role="status" className="comment-report-message">{reportMessage}</p>}

              {/* Reply Input Form */}
              <form className="comment-form" onSubmit={handleAddComment}>
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="Write a reply or comment..."
                    value={newCommentText}
                    onChange={(e) => { setNewCommentText(e.target.value); if (commentError) setCommentError(''); }}
                  />
                  <button type="button" className="icon-input-btn" title="Attach Image">
                    <ImageIcon size={18} />
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={16} /> Post
                  </button>
                </div>
              </form>
              {commentError && <p className="field-error" role="alert">{commentError}</p>}
            </section>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ViewPostPage;
