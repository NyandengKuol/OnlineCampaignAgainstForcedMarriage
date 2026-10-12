import { useEffect, useRef, useState } from 'react';
import { X, Upload, CheckSquare, Square, Trash2 } from 'lucide-react';
import { POST_CATEGORIES, validatePost } from '../../utils/validators';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onSubmitPost, post }) => {
  const dialogRef = useRef(null); const titleRef = useRef(null); const categoryRef = useRef(null); const messageRef = useRef(null); const imageInputRef = useRef(null);
  const [title, setTitle] = useState(() => post?.title || ''); const [category, setCategory] = useState(() => post?.category || 'Awareness'); const [message, setMessage] = useState(() => post?.message ?? post?.content ?? ''); const [image, setImage] = useState(() => post?.image ?? post?.imageUrl ?? null); const [imageName, setImageName] = useState(''); const [imageError, setImageError] = useState(''); const [agreeGuidelines, setAgreeGuidelines] = useState(false); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(() => Boolean(post?.isAnonymous));
  const editing = Boolean(post);
  useEffect(() => {
    if (!isOpen) return;
    window.setTimeout(() => dialogRef.current?.querySelector('input, select, textarea, button')?.focus(), 0);
    const keyHandler = (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')].filter((item) => item.offsetParent !== null);
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, post?.id]);
  const refs = { title: titleRef, category: categoryRef, message: messageRef };
  const validate = () => { const next = validatePost({ title, category, message, agreeGuidelines, imageError }); setErrors(next); const first = Object.keys(next).find((key) => refs[key]); if (first) refs[first].current?.focus(); return Object.keys(next).length === 0; };
  const validateField = (name) => { const next = validatePost({ title, category, message, agreeGuidelines, imageError }); setErrors((current) => ({ ...current, [name]: next[name] })); };
  const updateField = (name, value) => { const values = { title, category, message, agreeGuidelines, imageError, [name]: value }; setErrors((current) => ({ ...current, [name]: validatePost(values)[name] })); };
  const handleImage = (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    const allowedName = /\.(png|jpe?g|webp)$/i.test(file.name); const allowedType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
    let error = !allowedName || !allowedType ? 'Choose a PNG, JPG, JPEG, or WEBP image.' : file.size > 5 * 1024 * 1024 ? 'Image must be 5 MB or smaller.' : '';
    if (error) { setImageError(error); setErrors((current) => ({ ...current, image: error })); event.target.value = ''; return; }
    setImageError(''); setErrors((current) => ({ ...current, image: undefined })); setImageName(file.name);
    const reader = new FileReader(); reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : null); reader.readAsDataURL(file);
  };
  const handleSubmit = async (event) => { event.preventDefault(); if (busy || !validate()) return; setBusy(true); try { await onSubmitPost({ title: title.trim(), category, message: message.trim(), image, isAnonymous }); } finally { setBusy(false); } };
  const props = (name) => ({ 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `${name}-error` : undefined });
  if (!isOpen) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div ref={dialogRef} className="modal-container" role="dialog" aria-modal="true" aria-labelledby="create-post-title" tabIndex={-1}>
      <div className="modal-header"><h3 id="create-post-title">{editing ? 'Edit your post' : 'Share your voice'}</h3><button type="button" className="close-btn" onClick={onClose} aria-label="Close post form"><X size={20} /></button></div>
      <form onSubmit={handleSubmit} className="modal-body" noValidate>
        <p className="post-session-notice">Choose whether your name appears alongside this community post.</p>
        <div className="form-group"><label className="form-label" htmlFor="post-title">Title *</label><input ref={titleRef} id="post-title" type="text" maxLength={100} className="form-input" placeholder="Enter post title..." value={title} onBlur={() => validateField('title')} onChange={(event) => { setTitle(event.target.value); updateField('title', event.target.value); }} {...props('title')} /><span className="character-count">{title.length} / 100</span>{errors.title && <p id="title-error" className="field-error" role="alert">{errors.title}</p>}</div>
        <div className="form-group"><label className="form-label" htmlFor="post-category">Category *</label><select ref={categoryRef} id="post-category" className="form-select" value={category} onBlur={() => validateField('category')} onChange={(event) => { setCategory(event.target.value); updateField('category', event.target.value); }} {...props('category')}><option value="">Select a category</option>{POST_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select>{errors.category && <p id="category-error" className="field-error" role="alert">{errors.category}</p>}</div>
        <div className="form-group"><label className="form-label" htmlFor="post-message">Message *</label><textarea ref={messageRef} id="post-message" className="form-textarea" rows={4} maxLength={2000} placeholder="Share your thoughts, story, or message..." value={message} onBlur={() => validateField('message')} onChange={(event) => { setMessage(event.target.value); updateField('message', event.target.value); }} {...props('message')} /><span className="character-count">{message.length} / 2000</span>{errors.message && <p id="message-error" className="field-error" role="alert">{errors.message}</p>}</div>
        <div className="form-group anonymous-post-choice"><label><input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} /><span>Post anonymously</span></label><small>{isAnonymous ? 'Other community members will see “Anonymous” instead of your name.' : 'Your account name will appear with the post.'}</small></div>
        <div className="form-group"><label className="form-label" htmlFor="post-image">Choose Image (optional)</label><input ref={imageInputRef} id="post-image" className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImage} aria-invalid={Boolean(errors.image)} aria-describedby={errors.image ? 'image-error' : undefined} /><label htmlFor="post-image" className="upload-box"><Upload size={22} className="upload-icon" /><span>{imageName || 'PNG, JPG, or WEBP (Max 5 MB)'}</span></label>{image && <div className="image-preview-wrap"><img className="post-image-preview" src={image} alt="Selected post preview" /><button type="button" className="btn btn-outline btn-sm" onClick={() => { setImage(null); setImageName(''); setImageError(''); if (imageInputRef.current) imageInputRef.current.value = ''; }}><Trash2 size={15} /> Remove image</button></div>}{errors.image && <p id="image-error" className="field-error" role="alert">{errors.image}</p>}</div>
        <div><label className="checkbox-row"><input type="checkbox" checked={agreeGuidelines} onBlur={() => validateField('guidelines')} onChange={(event) => { setAgreeGuidelines(event.target.checked); updateField('agreeGuidelines', event.target.checked); }} aria-invalid={Boolean(errors.guidelines)} aria-describedby={errors.guidelines ? 'guidelines-error' : undefined} />{agreeGuidelines ? <CheckSquare size={18} className="checkbox-active" /> : <Square size={18} className="checkbox-inactive" />}<span>I agree to the community guidelines</span></label>{errors.guidelines && <p id="guidelines-error" className="field-error" role="alert">{errors.guidelines}</p>}</div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>Cancel</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Post'}</button></div>
      </form>
    </div>
  </div>;
};

export default CreatePostModal;
