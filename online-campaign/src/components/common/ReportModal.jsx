import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, onSubmitReport, post }) => {
  const [reason, setReason] = useState('Inappropriate Content');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmitReport?.(post.id, `${reason}${details.trim() ? `: ${details.trim()}` : ''}`);
      setSubmitted(true);
      setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
      }, 1400);
    } catch (submitError) { setError(submitError.message || 'Could not submit your report.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div className="report-modal-title">
            <AlertTriangle size={20} className="report-icon" />
            <h3>Report Post</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body text-center py-4">
            <p className="success-msg">Thank you. The report has been flagged for moderation review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <p className="report-intro">
              Flagging post by <strong>{post?.author?.name || 'User'}</strong>: "{post?.title}"
            </p>

            <div className="form-group">
              <label className="form-label">Reason for reporting</label>
              <select
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Harassment or Bullying">Harassment or Bullying</option>
                <option value="Spam or Misinformation">Spam or Misinformation</option>
                <option value="Safety Violation">Safety Violation</option>
              </select>
            </div>
            {error && <p role="alert" className="field-error">{error}</p>}

            <div className="form-group">
              <label className="form-label">Additional Details (optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Provide further context..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={saving}>
                {saving ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
