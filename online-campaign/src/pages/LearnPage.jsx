import { useState } from 'react';
import { learnTopics } from '../data/LearnTopics';
import { BookOpen, Clock, ChevronRight, Quote } from 'lucide-react';
import './LearnPage.css';

const LearnPage = () => {
  const [activeTopicId, setActiveTopicId] = useState(learnTopics[0].id);

  const activeTopic = learnTopics.find((t) => t.id === activeTopicId) || learnTopics[0];

  return (
    <div className="learn-page">
      {/* Header Banner */}
      <div className="page-header text-center">
        <div className="container">
          <span className="badge badge-primary mb-2">Education Center</span>
          <h1>Learn</h1>
          <p className="page-subtitle">Understand. Be informed. Make a difference.</p>
        </div>
      </div>

      {/* Split-View Section (Frame 3) */}
      <div className="container section-padding">
        <div className="split-view-layout">
          {/* Left Drawer / Navigation Sidebar */}
          <aside className="topics-sidebar">
            <h3 className="sidebar-title">
              <BookOpen size={18} /> Topics
            </h3>
            <div className="topics-nav">
              {learnTopics.map((topic) => (
                <button
                  key={topic.id}
                  className={`topic-nav-btn ${activeTopicId === topic.id ? 'active' : ''}`}
                  onClick={() => setActiveTopicId(topic.id)}
                >
                  <span>{topic.title}</span>
                  <ChevronRight size={16} className="nav-arrow" />
                </button>
              ))}
            </div>
          </aside>

          {/* Right Reading Content Viewport */}
          <main className="content-viewport">
            <div className="viewport-header">
              <h2>{activeTopic.title}</h2>
              <span className="read-time-tag">
                <Clock size={14} /> {activeTopic.readTime}
              </span>
            </div>

            <div className="viewport-body">
              {activeTopic.content.map((block, index) => {
                if (block.type === 'paragraph') {
                  return <p key={index} className="content-p">{block.text}</p>;
                }
                if (block.type === 'subheading') {
                  return <h3 key={index} className="content-h3">{block.text}</h3>;
                }
                if (block.type === 'quote') {
                  return (
                    <div key={index} className="quote-banner">
                      <Quote size={28} className="quote-icon" />
                      <p className="quote-text">{block.text}</p>
                    </div>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <ul key={index} className="content-list">
                      {block.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return null;
              })}

              <div className="content-hero-img-card">
                <img
                  src="/forced-marriage-bride.png"
                  alt="A bride standing beside an older man at a wedding ceremony."
                  className="viewport-img"
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
