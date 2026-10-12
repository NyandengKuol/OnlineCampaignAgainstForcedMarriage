import { useState } from 'react';
import { X, Upload, CheckSquare, Square } from 'lucide-react';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onSubmitPost }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Awareness');
  const [message, setMessage] = useState('');
  const [agreeGuidelines, setAgreeGuidelines] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please fill in both the title and message fields.');
      return;
    }

    if (!agreeGuidelines) {
      setErrorMsg('You must agree to the community guidelines before posting.');
      return;
    }

    const newPostData = {
      title: title.trim(),
      category,
      content: message.trim()
    };

    onSubmitPost(newPostData);

    // Reset and close
    setTitle('');
    setMessage('');
    setAgreeGuidelines(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Create a New Post</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {errorMsg && <div className="modal-error">{errorMsg}</div>}

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Awareness">Awareness</option>
              <option value="Education">Education</option>
              <option value="Support">Support</option>
              <option value="Prevention">Prevention</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Share your thoughts, story, or message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose Image (optional)</label>
            <div className="upload-box">
              <Upload size={22} className="upload-icon" />
              <span>PNG, JPG (Max 5MB)</span>
            </div>
          </div>

          <div className="checkbox-row" onClick={() => setAgreeGuidelines(!agreeGuidelines)}>
            {agreeGuidelines ? (
              <CheckSquare size={18} className="checkbox-active" />
            ) : (
              <Square size={18} className="checkbox-inactive" />
            )}
            <span>I agree to the community guidelines</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
