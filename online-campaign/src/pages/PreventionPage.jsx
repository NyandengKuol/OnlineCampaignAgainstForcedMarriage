import { MessageCircle, Eye, Scale, Share2, ShieldCheck, HeartHandshake } from 'lucide-react';
import preventionSupportImage from '../assets/prevention-support.png';
import './PreventionPage.css';

const PreventionPage = ({ setActiveTab }) => {
  const preventionSteps = [
    {
      id: 1,
      icon: <MessageCircle size={28} />,
      title: 'Talk About It',
      description: 'Have open and honest conversations with family, friends, and trusted adults about consent and individual rights.'
    },
    {
      id: 2,
      icon: <Eye size={28} />,
      title: 'Know the Signs',
      description: 'Learn to recognize early warning signs and stay vigilant when family expectations feel coercive or restrictive.'
    },
    {
      id: 3,
      icon: <Scale size={28} />,
      title: 'Support Equality',
      description: 'Promote human rights, equal opportunities, and independent decision-making for young people.'
    },
    {
      id: 4,
      icon: <Share2 size={28} />,
      title: 'Be Aware',
      description: 'Stay informed and share reliable information with your community to prevent forced marriage.'
    },
    {
      id: 5,
      icon: <ShieldCheck size={28} />,
      title: 'Use Trusted Resources',
      description: 'Access verified support services, legal aid organizations, and emergency hotlines whenever needed.'
    }
  ];

  return (
    <div className="prevention-page">
      {/* Header */}
      <div className="page-header text-center">
        <div className="container">
          <span className="badge badge-primary mb-2">Prevention & Safety</span>
          <h1>Prevention</h1>
          <p className="page-subtitle">Awareness today. Safer tomorrows.</p>
        </div>
      </div>

      {/* Main Content Grid (Frame 4) */}
      <section className="section-padding container">
        <div className="section-intro text-center mb-4">
          <h2>How to Help Prevent Forced Marriage</h2>
          <p>Forced marriage thrives on silence. Here are key ways to help yourself and support others.</p>
        </div>

        <div className="prevention-grid">
          {preventionSteps.map((step) => (
            <div key={step.id} className="prevention-card">
              <div className="prevention-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>

        <section className="prevention-story">
          <img src={preventionSupportImage} alt="A young woman holding a baby while seated indoors" />
          <div>
            <span className="eyebrow">SUPPORT MAKES A DIFFERENCE</span>
            <h2>You do not have to face concerns alone.</h2>
            <p>Listening, believing someone, and helping them find trusted support can be a powerful first step.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('resources')}>Find support</button>
          </div>
        </section>

        {/* Impact Quote Card */}
        <div className="prevention-banner mt-4">
          <HeartHandshake size={32} className="banner-icon" />
          <p className="banner-text">
            "Awareness, education, and support can help prevent forced marriage and protect individuals."
          </p>
        </div>
      </section>
    </div>
  );
};

export default PreventionPage;
