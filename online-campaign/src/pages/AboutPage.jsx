import { BookOpen, GraduationCap, HeartHandshake, Megaphone, Scale, ShieldCheck, Target, Users, Eye, Heart, ArrowRight, UserRoundCheck, CheckCircle2, Lightbulb, Compass } from 'lucide-react';
import './AboutPage.css';

const programs = [
  { icon: BookOpen, title: 'Education & awareness', text: 'Share clear information about consent, girls’ rights, child marriage, and the value of education through facts and community dialogue.' },
  { icon: UserRoundCheck, title: 'Girl empowerment', text: 'Help girls understand their rights, build confidence to express their wishes, and see pathways to continue learning.' },
  { icon: Users, title: 'Community engagement', text: 'Encourage respectful conversations with families, community leaders, and faith communities so girls are heard and supported.' },
  { icon: HeartHandshake, title: 'Support & referral', text: 'Help girls facing pressure find safe, trusted adults and verified local support. We will share only contacts that have been checked.' }
];

const awarenessPoints = [
  { icon: CheckCircle2, title: 'Know her rights', text: 'Every girl deserves to understand consent and have a say in decisions about her future.' },
  { icon: BookOpen, title: 'Keep learning', text: 'Education builds knowledge, confidence, and new possibilities.' },
  { icon: Compass, title: 'Make informed choices', text: 'When girls have information and support, they can better shape their own paths.' },
  { icon: Lightbulb, title: 'Strengthen communities', text: 'Families and communities can help girls thrive by listening, encouraging education, and respecting their choices.' }
];

const AboutPage = ({ setActiveTab }) => {
  return (
    <div className="about-page">
      <div className="page-header text-center">
        <div className="container">
          <span className="badge badge-primary mb-2">About Us</span>
          <h1>About the Campaign</h1>
          <p className="page-subtitle">Her Future, Her Choice — helping girls understand consent, value education, and make informed choices about their futures.</p>
        </div>
      </div>

      <section className="about-who section-padding container">
        <div className="about-who-copy">
          <span className="about-eyebrow">WHO WE ARE</span>
          <h2>Every girl deserves to understand her choices</h2>
          <p>The Online Campaign Against Forced Marriage helps girls understand that they have the right to give or withhold consent and to make informed choices about their future. We share information about why consent matters, how education can expand girls’ choices, and how families and communities can support girls to learn and thrive.</p>
          <p>We believe respectful conversations and reliable information can help communities protect girls’ dignity, safety, and opportunity.</p>
        </div>
        <div className="about-image-card">
          <img
            src="https://www.unicef.org/southsudan/sites/unicef.org.southsudan/files/styles/media_large_image/public/6S3A2404.JPG.webp?itok=tYJ5D7Qu"
            alt="A South Sudanese student writes on a classroom blackboard."
            className="about-feature-img"
            loading="lazy"
          />
          <p>Photo: UNICEF South Sudan / Nathanaelle Ngabe Nguegan · <a href="https://www.unicef.org/southsudan/stories/desire-enjoys-her-new-school" target="_blank" rel="noreferrer">View photo source</a></p>
        </div>
      </section>

      <section className="about-context">
        <div className="container context-inner">
          <div>
            <span className="about-eyebrow">THE SOUTH SUDAN CONTEXT</span>
            <h2>Why this campaign centers on girls in South Sudan</h2>
            <p>Poverty and financial pressure can make marriage seem like a way to support a household, while bride price and dowry expectations may put additional pressure on girls and families. Girls can also face barriers to continuing their education, including early marriage, pregnancy, school costs, and limited access to schools.</p>
            <p>These challenges are shaped by many circumstances and affect communities differently. The campaign promotes respectful dialogue while affirming that every girl’s consent, safety, education, and dignity matter.</p>
            <a className="about-source-link" href="https://www.unicef.org/southsudan/stories/what-affecting-girl-child-south-sudan" target="_blank" rel="noreferrer">Read UNICEF South Sudan on challenges facing girls <ArrowRight size={15} /></a>
          </div>
          <div className="context-callout">
            <Scale size={30} aria-hidden="true" />
            <h3>Consent matters</h3>
            <p>Marriage should be a free and informed choice. Pressure, fear, poverty, bride price, or expectations should not silence a girl’s wishes.</p>
          </div>
        </div>
      </section>

      <section className="about-programs section-padding container">
        <div className="about-section-heading">
          <span className="about-eyebrow">WHAT WE DO</span>
          <h2>Information, confidence, and community support</h2>
          <p>Our campaign focuses on practical ways to help girls understand their rights and help communities support their futures.</p>
        </div>
        <div className="about-program-grid">
          {programs.map(({ icon: Icon, title, text }) => (
            <article className="about-program" key={title}>
              <span className="about-program-icon"><Icon size={25} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-pillars">
        <div className="container">
          <div className="about-section-heading">
            <span className="about-eyebrow">OUR COMMITMENT</span>
            <h2>What guides this campaign</h2>
          </div>
          <div className="pillars-grid">
            <article className="pillar-card">
              <div className="pillar-icon"><Target size={28} aria-hidden="true" /></div>
              <h3>Our Mission</h3>
              <p>Increase awareness about forced marriage, provide reliable information, and encourage action for a future where girls can make informed choices.</p>
            </article>
            <article className="pillar-card">
              <div className="pillar-icon"><Eye size={28} aria-hidden="true" /></div>
              <h3>Our Vision</h3>
              <p>A future where every girl can learn, live safely, and make her own decisions about marriage and her life.</p>
            </article>
            <article className="pillar-card">
              <div className="pillar-icon"><Heart size={28} aria-hidden="true" /></div>
              <h3>Our Values</h3>
              <ul className="values-list">
                <li><ShieldCheck size={16} /> Respect for girls’ dignity and rights</li>
                <li><ShieldCheck size={16} /> Consent and informed choice</li>
                <li><ShieldCheck size={16} /> Accurate, respectful information</li>
                <li><ShieldCheck size={16} /> Education and community support</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="about-facts section-padding">
        <div className="container">
          <div className="about-section-heading">
            <span className="about-eyebrow">AWARENESS & EDUCATION</span>
            <h2>Why awareness and education matter</h2>
          </div>
          <ul className="awareness-list">
            {awarenessPoints.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="awareness-icon"><Icon size={22} aria-hidden="true" /></span>
                <span><strong>{title}</strong><span>{text}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-join">
        <div className="container about-join-inner">
          <div>
            <span className="about-eyebrow">TAKE PART</span>
            <h2>Help girls learn, be heard, and choose their futures</h2>
            <p>Start by learning about consent and girls’ rights, join a respectful community conversation, or explore the support information available on this site.</p>
          </div>
          <div className="about-join-actions">
            <button className="btn btn-primary" onClick={() => setActiveTab('campaign')}><Megaphone size={17} /> Join the Campaign</button>
            <button className="btn btn-light" onClick={() => setActiveTab('learn')}><GraduationCap size={17} /> Learn and Share</button>
            <button className="about-text-action" onClick={() => setActiveTab('resources')}>Explore Support Resources <ArrowRight size={15} /></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
