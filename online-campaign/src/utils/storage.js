// API Client for the MongoDB backend
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('campaign_token') || sessionStorage.getItem('campaign_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const requestAdmin = async (path, method, body) => {
  const res = await fetch(`${API_URL}${path}`, { method, headers: getAuthHeaders(), ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'The admin action could not be completed');
  return data;
};

const getStoredUserId = () => {
  try { return JSON.parse(localStorage.getItem('campaign_user') || sessionStorage.getItem('campaign_user') || 'null')?.id || null; }
  catch { return null; }
};

export const getPosts = async () => {
  const res = await fetch(`${API_URL}/posts`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch posts');
  const data = await res.json();
  // Map backend format to frontend format for minimal component changes
  return data.map(post => ({
    id: post._id,
    title: post.title,
    message: post.content,
    tags: post.tags,
    authorName: post.isAnonymous ? 'Anonymous' : post.author?.username || 'Unknown',
    authorId: post.isMine ? getStoredUserId() : typeof post.author === 'string' ? post.author : post.author?._id,
    adminAuthorName: post.author?.username || 'Unknown',
    isAnonymous: Boolean(post.isAnonymous),
    author: { name: post.isAnonymous ? 'Anonymous' : post.author?.username || 'Unknown', handle: '' },
    likes: post.likesCount ?? post.likes?.length ?? 0,
    isLiked: Boolean(post.isLiked),
    createdAt: post.createdAt,
    status: post.status || 'published',
    reports: post.reports || [],
    comments: (post.comments || []).map((comment) => ({
      id: comment._id,
      text: comment.text,
      authorName: comment.author?.username || 'Community member',
      authorId: comment.author?._id,
      author: { name: comment.author?.username || 'Community member' },
      createdAt: comment.createdAt,
      status: comment.status || 'approved',
      reports: comment.reports || []
    })),
    commentsCount: post.comments?.length || 0
  }));
};

export const togglePostLikeRecord = async (postId) => {
  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Could not update this like');
  return data;
};

export const addPostComment = async (postId, text) => {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Could not post your reply');
  }
  const post = await res.json();
  return {
    id: post._id,
    title: post.title,
    message: post.content,
    tags: post.tags,
    authorName: post.isAnonymous ? 'Anonymous' : post.author?.username || 'Unknown',
    authorId: post.isMine ? getStoredUserId() : typeof post.author === 'string' ? post.author : post.author?._id,
    isAnonymous: Boolean(post.isAnonymous),
    author: { name: post.isAnonymous ? 'Anonymous' : post.author?.username || 'Unknown', handle: '' },
    likes: post.likesCount ?? post.likes?.length ?? 0,
    isLiked: Boolean(post.isLiked),
    createdAt: post.createdAt,
    status: post.status || 'published',
    reports: post.reports || [],
    comments: (post.comments || []).map((comment) => ({
      id: comment._id,
      text: comment.text,
      authorName: comment.author?.username || 'Community member',
      authorId: comment.author?._id,
      author: { name: comment.author?.username || 'Community member' },
      createdAt: comment.createdAt,
      status: comment.status || 'approved',
      reports: comment.reports || []
    })),
    commentsCount: post.comments?.length || 0
  };
};

export const updatePostComment = (commentId, text) => requestAdmin(`/posts/comments/${commentId}`, 'PATCH', { text });
export const deletePostComment = (commentId) => requestAdmin(`/posts/comments/${commentId}`, 'DELETE');

export const updateAccountProfile = async (username) => {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Could not update your profile');
  return data;
};

export const savePostRecord = async (postData) => {
  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: postData.title,
      content: postData.message || postData.content,
      tags: postData.tags || [],
      isAnonymous: Boolean(postData.isAnonymous)
    })
  });
  if (!res.ok) throw new Error('Failed to save post');
  return res.json();
};

export const deletePostRecord = async (id) => {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete post');
  return true;
};

export const getFaqs = async () => {
  const res = await fetch(`${API_URL}/content/faqs`);
  if (!res.ok) throw new Error('Failed to fetch faqs');
  return (await res.json()).map((faq) => ({ ...faq, id: faq._id, category: faq.category || 'General' }));
};

export const getResources = async () => {
  const res = await fetch(`${API_URL}/content/resources`);
  if (!res.ok) throw new Error('Failed to fetch resources');
  return (await res.json()).map((resource) => ({ ...resource, id: resource._id, desc: resource.description || '', hours: resource.hours || '', linkLabel: resource.linkLabel || 'Visit website', status: resource.status || 'active' }));
};

export const createFAQRecord = (data) => requestAdmin('/content/faqs', 'POST', data);
export const deleteFAQRecord = (id) => requestAdmin(`/content/faqs/${id}`, 'DELETE');
export const createResourceRecord = (data) => requestAdmin('/content/resources', 'POST', data);
export const deleteResourceRecord = (id) => requestAdmin(`/content/resources/${id}`, 'DELETE');
export const moderatePostRecord = (id, status) => requestAdmin(`/posts/${id}/moderation`, 'PATCH', { status });
export const moderateCommentRecord = (id, status, action) => requestAdmin(`/posts/comments/${id}/moderation`, 'PATCH', { status, action });
export const reportPostRecord = (id, reason) => requestAdmin(`/posts/${id}/report`, 'POST', { reason });
export const reportCommentRecord = (id, reason) => requestAdmin(`/posts/comments/${id}/report`, 'POST', { reason });
export const updateReportRecord = async (id, changes) => {
  const res = await fetch(`${API_URL}/reports/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(changes) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Could not update this request');
  return data;
};

export const getInquiries = async () => {
  const res = await fetch(`${API_URL}/reports`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  const reports = await res.json();
  return reports.map((report) => ({
    ...report,
    id: report._id,
    referralId: report.assignedResource || '',
    parentReportId: report.parentReport?._id || report.parentReport || '',
    category: report.type === 'question' ? (report.parentReport ? 'Follow-up question' : 'Question') : report.type === 'report_concern' ? 'Report a concern' : report.type === 'other' ? 'Other help' : 'Request for support',
    question: report.details,
    broadLocation: report.location,
    safeToContact: report.safeContact
  }));
};

export const saveInquiry = async (inquiryData) => {
  const res = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      type: inquiryData.type || 'support_request',
      details: inquiryData.details || inquiryData.question || 'Request for help',
      location: inquiryData.broadLocation || inquiryData.location || '',
      safeContact: inquiryData.safeToContact ?? inquiryData.safeContact ?? false,
      contactValue: inquiryData.contactValue,
      parentReportId: inquiryData.parentReportId
    })
  });
  if (!res.ok) {
    let message = 'Could not save your request. Please try again.';
    try {
      const error = await res.json();
      if (error.message) message = error.message;
    } catch {
      // Keep the friendly fallback when the server does not return JSON.
    }
    throw new Error(message);
  }
  return res.json();
};

export const registerUser = async (userData) => {
  return authRequest('/register', {
    username: userData.username || userData.name,
    email: userData.email,
    password: userData.password
  }, 'Account creation failed');
};

export const loginUser = async (credentials) => {
  return authRequest('/login', {
    username: credentials.identifier || credentials.email || credentials.name,
    password: credentials.password
  }, 'Login failed');
};

export const loginWithGoogle = async (credential) => {
  return authRequest('/google', { credential }, 'Google sign-in failed');
};

const authRequest = async (path, payload, fallbackMessage) => {
  let res;
  try {
    res = await fetch(`${API_URL}/auth${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error(`Could not reach the sign-in server at ${API_URL}. Start the backend and try again.`);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(fallbackMessage);
  }
  if (!res.ok) throw new Error(data.message || fallbackMessage);
  return data;
};
