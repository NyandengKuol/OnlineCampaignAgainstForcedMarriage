import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPosts, getFaqs, getResources, getInquiries, savePostRecord, deletePostRecord, saveInquiry, addPostComment, updatePostComment, deletePostComment, togglePostLikeRecord, updateReportRecord, moderatePostRecord, moderateCommentRecord, reportPostRecord, reportCommentRecord } from '../utils/storage';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apiPosts, apiFaqs, apiResources] = await Promise.all([
        getPosts().catch(() => []),
        getFaqs().catch(() => []),
        getResources().catch(() => [])
      ]);
      setPosts(apiPosts);
      setFaqs(apiFaqs);
      setResources(apiResources);

      if (user) {
        const apiInquiries = await getInquiries().catch(() => []);
        setInquiries(apiInquiries.map((item) => {
          const resource = apiResources.find((entry) => entry.id === item.referralId || entry.title === item.referralId);
          return { ...item, referralId: resource?.id || '', referralName: resource?.title || item.referralName || item.referralId || '' };
        }));
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.error('Failed to load app data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addPost = async (data) => {
    try {
      const newPost = await savePostRecord(data);
      const normalized = {
        id: newPost._id,
        title: newPost.title,
        message: newPost.content,
        tags: newPost.tags,
        authorName: newPost.isAnonymous ? 'Anonymous' : newPost.author?.username || user?.name || 'Unknown',
        authorId: newPost.author?._id || user?.id,
        author: { name: newPost.isAnonymous ? 'Anonymous' : newPost.author?.username || user?.name || 'Unknown', handle: '' },
        adminAuthorName: newPost.author?.username || user?.name || 'Unknown',
        isAnonymous: Boolean(newPost.isAnonymous),
        likes: newPost.likes?.length || 0,
        isLiked: Boolean(newPost.isLiked),
        createdAt: newPost.createdAt,
        status: newPost.status || 'published',
        comments: (newPost.comments || []).map((comment) => ({
          id: comment._id,
          text: comment.text,
          authorName: comment.author?.username || 'Community member',
          authorId: comment.author?._id,
          author: { name: comment.author?.username || 'Community member' },
          createdAt: comment.createdAt,
          status: comment.status || 'pending'
        })),
        commentsCount: newPost.comments?.length || 0
      };
      setPosts((current) => [normalized, ...current]);
      return normalized;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deletePost = async (id) => {
    try {
      await deletePostRecord(id);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const submitInquiry = async (details) => {
    try {
      const saved = await saveInquiry(details);
      const normalized = {
        ...saved,
        id: saved._id,
        category: saved.type === 'question' ? 'Question' : saved.type === 'report_concern' ? 'Report a concern' : saved.type === 'other' ? 'Other help' : 'Request for support',
        question: saved.details,
        broadLocation: saved.location,
        safeToContact: saved.safeContact,
        parentReportId: saved.parentReport?._id || saved.parentReport || details.parentReportId || '',
        userId: user?.id
      };
      setInquiries((current) => [normalized, ...current]);
      return normalized;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Mocked for UI compatibility during migration
  const updatePost = async (id, data) => {
    if (!data.status) return;
    await moderatePostRecord(id, data.status);
    await loadData();
  };
  const moderateComment = async (id, status, action) => {
    await moderateCommentRecord(id, status, action);
    await loadData();
  };
  const reportPost = async (id, reason) => { await reportPostRecord(id, reason); await loadData(); };
  const reportComment = async (id, reason) => { await reportCommentRecord(id, reason); await loadData(); };
  const togglePostLike = async (id) => {
    const result = await togglePostLikeRecord(id);
    setPosts((current) => current.map((post) => post.id === id
      ? { ...post, likes: result.likes, isLiked: result.isLiked }
      : post));
    return result;
  };
  const addComment = async (postId, text) => {
    const updatedPost = await addPostComment(postId, text);
    setPosts((current) => current.map((post) => post.id === postId ? updatedPost : post));
    return updatedPost;
  };
  const editComment = async (commentId, text) => {
    const result = await updatePostComment(commentId, text);
    setPosts((current) => current.map((post) => post.id === result.postId
      ? { ...post, comments: post.comments.map((comment) => comment.id === result.comment.id ? { ...comment, ...result.comment } : comment) }
      : post));
    return result.comment;
  };
  const removeComment = async (commentId) => {
    const result = await deletePostComment(commentId);
    setPosts((current) => current.map((post) => post.id === result.postId
      ? { ...post, comments: post.comments.filter((comment) => comment.id !== result.commentId), commentsCount: Math.max(0, (post.commentsCount || post.comments.length) - 1) }
      : post));
    return result;
  };
  const submitQuestion = (question) => submitInquiry({ type: 'question', details: question });
  const updateInquiry = async (id, changes) => {
    const current = inquiries.find((item) => item.id === id);
    const referralId = changes.referralId ?? current?.referralId ?? '';
    const updated = await updateReportRecord(id, { status: changes.status, assignedResource: referralId, ...(changes.answer !== undefined ? { answer: changes.answer } : {}) });
    const resource = resources.find((entry) => entry.id === updated.assignedResource);
    setInquiries((items) => items.map((item) => item.id === id ? { ...item, ...updated, id: updated._id, referralId: updated.assignedResource || '', referralName: resource?.title || '' } : item));
    if (changes.answer !== undefined) await loadData();
    return updated;
  };
  const getPostsCb = useCallback(() => posts, [posts]);

  const value = useMemo(() => ({ 
    posts, faqs, inquiries, resources, isLoading,
    addPost, updatePost, moderateComment, reportPost, reportComment, deletePost, getPosts: getPostsCb, refreshData: loadData, togglePostLike, addComment, editComment, removeComment,
    submitQuestion, submitInquiry, updateInquiry 
  }), [posts, faqs, inquiries, resources, isLoading, getPostsCb, loadData]);
  
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
};
