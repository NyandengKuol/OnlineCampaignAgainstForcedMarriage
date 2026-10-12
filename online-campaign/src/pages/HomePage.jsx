import { ArrowRight, BookOpen, HeartHandshake, MapPin, Users, GraduationCap, HeartPulse, Shield, HandHeart, Megaphone, School, BriefcaseBusiness, Heart, Sparkles } from 'lucide-react';
import './HomePage.css';

const photos = [
  {
    src: '/home-gallery-image.png',
    alt: 'A young girl in a green shirt sits outdoors holding an infant.'
  }
];

const HomePage = ({ setActiveTab }) => {
  const actions = [
    { icon: BookOpen, title: 'Learn', text: 'Understand the facts and your rights.', page: 'learn' },
    { icon: HeartHandshake, title: 'Prevent', text: 'Recognize the signs and take action.', page: 'prevention' },
    { icon: MapPin, title: 'Get Support', text: 'Find help and relevant resources.', page: 'resources' },
    { icon: Users, title: 'Join the Campaign', text: 'Share, raise awareness, and take action.', page: 'campaign' }
  ];
  const harms = [
    { icon: GraduationCap, text: 'It can force girls to leave school.' },
    { icon: HeartPulse, text: 'Early pregnancy can endanger their health.' },
    { icon: Shield, text: 'It can increase the risk of violence and isolation.' },
    { icon: BriefcaseBusiness, text: 'It can limit independence and employment opportunities.' },
    { icon: Sparkles, text: 'It takes away childhood and future choices.' }
  ];
  const rights = [
    'Continue her education', 'Live free from violence', 'Be heard and respected',
    'Choose whether and when to marry', 'Pursue the future she wants'
  ];
  const helps = [
    'Learn and share accurate information', 'Encourage families to keep girls in school',
    'Speak against forced and child marriage', 'Support girls facing pressure or danger',
    'Join community campaigns and discussions'
  ];

  return <div className="home-page">
    <section className="home-hero"><div className="container home-hero-content"><div><h1>Your Future.<br />Your Choice.<br />Your Consent.</h1><p>Learn, understand and share awareness about forced marriage and the importance of free and informed consent.</p><div className="hero-actions"><button className="btn btn-primary" onClick={() => setActiveTab('learn')}>Learn More <ArrowRight size={16} /></button><button className="btn btn-light" onClick={() => setActiveTab('resources')}>Explore Resources</button></div></div></div></section>
    <section className="container home-actions">{actions.map(({ icon: Icon, title, text, page }) => <button key={title} className="home-action-card" onClick={() => setActiveTab(page)}><span><Icon size={24} /></span><strong>{title}</strong><small>{text}</small></button>)}</section>

    <section className="container home-info"><div><span className="eyebrow">KNOW YOUR RIGHTS</span><h2>What is Forced Marriage?</h2><p>Forced marriage happens when one or both people do not freely and fully consent to the marriage. It can happen at any age and affects people of all backgrounds.</p><button className="text-link" onClick={() => setActiveTab('learn')}>Learn More <ArrowRight size={15} /></button></div><img src="/home-photo-1.png" alt="A young woman in a green shirt sits outdoors holding an infant." /></section>

    <section className="home-opening"><div className="container opening-copy"><span className="eyebrow">HER FUTURE, HER CHOICE</span><h2>Her Future Is Hers to Choose</h2><p>Every girl deserves time to learn, grow, and decide her own future. She should never be forced into marriage, exchanged for dowry, or treated as a solution to poverty.</p></div></section>

    <section className="home-section"><div className="container two-column"><div><span className="eyebrow">FREE AND FULL CONSENT</span><h2>Why Forced Marriage Is Unfair</h2><p>Forced marriage takes away a girl’s freedom to make decisions about her life. Marriage must be based on the full and free consent of both people—not pressure, fear, poverty, dowry, or family expectations.</p><button className="text-link" onClick={() => setActiveTab('learn')}>Learn about consent <ArrowRight size={15} /></button></div><div className="consent-note"><img src="/home-photo-2.png" alt="A young mother sits with an infant on a bed." /><div><Heart size={28} aria-hidden="true" /><p>Her voice matters. A choice made freely is part of a safe and dignified future.</p></div></div></div></section>

    <section className="home-harms"><div className="container harm-layout"><div><span className="eyebrow">CHILDHOOD SHOULD HAVE ROOM TO GROW</span><h2>Why Child Marriage Is Harmful</h2><ul className="harm-list">{harms.map(({ icon: Icon, text }) => <li key={text}><span><Icon size={22} aria-hidden="true" /></span>{text}</li>)}</ul></div><img className="harm-photo" src="/home-photo-3.png" alt="A young woman in a white dress holds a newborn wrapped in a blanket." /></div></section>

    <section className="home-gallery"><div className="container"><div className="gallery-heading"><div><span className="eyebrow">LEARNING, LEADING, IMAGINING</span><h2>Every Girl Deserves the Chance to Grow</h2></div><p>Hopeful scenes of girls learning and building their futures in South Sudan.</p></div><div className="girl-gallery">{photos.map((photo) => <figure key={photo.src}><img src={photo.src} alt={photo.alt} loading="lazy" /></figure>)}</div></div></section>

    <section className="home-future"><div className="container future-inner"><div><span className="eyebrow">HOPE FOR EVERY COMMUNITY</span><h2>When Girls Are Given a Choice, Communities Grow Stronger</h2><p>Educated and empowered girls can become teachers, doctors, entrepreneurs, leaders, and caring parents. Supporting girls benefits families, communities, and the future of South Sudan.</p></div><div className="future-icons" aria-label="Girls can grow into leaders in many fields"><span><School /><small>Teachers</small></span><span><HeartPulse /><small>Doctors</small></span><span><BriefcaseBusiness /><small>Entrepreneurs</small></span><span><Users /><small>Leaders</small></span></div></div></section>

    <section className="home-dowry"><div className="container dowry-inner"><div className="dowry-mark" aria-hidden="true"><HandHeart size={38} /></div><div><span className="eyebrow">DIGNITY AND RESPECT</span><h2>A Girl Is More Than a Bride Price</h2><p>Culture deserves respect, but no tradition should reduce a girl’s value to cattle, money, or property. Her dignity, safety, education, and consent must come first.</p></div></div></section>

    <section className="home-rights"><div className="container rights-inner"><div><span className="eyebrow">EVERY GIRL HAS THE RIGHT TO</span><h2>Know Her Rights</h2><p>Every girl deserves to be safe, respected, and supported in shaping her own future.</p></div><ul>{rights.map((right) => <li key={right}><span aria-hidden="true">✓</span>{right}</li>)}</ul><img src="/home-photo-4.png" alt="A young woman in a yellow headwrap holds a baby while other people sit nearby." /></div></section>

    <section className="home-help"><div className="container help-inner"><div><span className="eyebrow">SMALL ACTIONS CAN MAKE A DIFFERENCE</span><h2>Stand With Girls</h2><ul>{helps.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul><div className="hero-actions"><button className="btn btn-primary" onClick={() => setActiveTab('campaign')}>Join the Campaign</button><button className="btn btn-outline" onClick={() => setActiveTab('learn')}>Learn and Share</button></div></div><div className="help-illustration"><img src="/home-photo-5.png" alt="A woman is carried outside a thatched home as another person stands nearby." /><div><Megaphone size={35} aria-hidden="true" /><p>Listen. Learn. Stand together.</p></div></div></div></section>

    <section className="home-support"><div className="container support-inner"><div><span className="eyebrow">YOU DESERVE SUPPORT</span><h2>Are You Being Pressured to Marry?</h2><p>You are not alone, and it is not your fault. Speak with a trusted adult, teacher, women’s organization, community advocate, or local protection service.</p><p className="support-placeholder"><strong>South Sudan support information:</strong> Clik the link below to get help</p><button className="btn btn-light" onClick={() => setActiveTab('resources')}>Explore Support Resources</button></div><div className="support-icon" aria-hidden="true"><HeartHandshake size={48} /></div></div></section>

  </div>;
};

export default HomePage;
