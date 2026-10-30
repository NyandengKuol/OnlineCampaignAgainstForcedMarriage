import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, HelpCircle, Send } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import './FAQPage.css';

const FAQPage = () => {
  const { faqs, submitQuestion } = useAppData();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  useEffect(() => setSearchQuery(searchParams.get('search') || ''), [searchParams]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const categories = ['All', 'Rights', 'Support', 'Prevention', 'Submitted'];

  const filteredFaqs = faqs.filter((faq) => {
    const categoryMatches = selectedCategory === 'All' || faq.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    return categoryMatches && (faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query));
  });

  const handleAskSubmit = (event) => {
    event.preventDefault();
    if (!questionText.trim()) {
      setQuestionError('Please enter a question before submitting.');
      return;
    }
    submitQuestion(questionText.trim());
    setQuestionText('');
    setQuestionError('');
    setSubmitted(true);
  };

  return <div className="faq-page">
    <div className="page-header text-center"><div className="container"><span className="badge badge-primary mb-2">Help Center</span><h1>Frequently Asked Questions</h1><p className="page-subtitle">Find answers or ask us directly.</p></div></div>
    <div className="container section-padding">
      <div className="faq-controls-bar">
        <div className="search-box"><Search size={18} className="search-icon" /><input type="search" placeholder="Search questions..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
        <div className="category-pills">{categories.map((category) => <button key={category} className={`pill-btn ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
      </div>
      <div className="faq-accordion-list">
        {filteredFaqs.length === 0 ? <p className="no-faqs">No matching questions found.</p> : filteredFaqs.map((faq) => <button key={faq.id} className={`faq-item ${openId === faq.id ? 'open' : ''}`} onClick={() => setOpenId(openId === faq.id ? null : faq.id)}>
          <span className="faq-question"><span>{faq.question}</span>{openId === faq.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
          {openId === faq.id && <span className="faq-answer">{faq.answer}</span>}
        </button>)}
      </div>
      <section className="ask-question-card mt-5">
        <div className="ask-header"><HelpCircle size={24} className="ask-icon" /><div><h3>Have a Question?</h3><p>If you cannot find your answer above, submit your question here confidentially.</p></div></div>
        {submitted ? <div className="ask-success">Thank you. Your question has been added to this session as awaiting a response.</div> : <form onSubmit={handleAskSubmit} className="ask-form">
          <textarea rows={3} placeholder="Type your question here..." value={questionText} onChange={(event) => { setQuestionText(event.target.value); setQuestionError(''); }} aria-invalid={Boolean(questionError)} />
          {questionError && <p className="field-error" role="alert">{questionError}</p>}
          <button type="submit" className="btn btn-primary btn-sm"><Send size={16} /> Submit Question</button>
        </form>}
      </section>
    </div>
  </div>;
};

export default FAQPage;
