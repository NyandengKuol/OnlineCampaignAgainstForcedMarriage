import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhoneCall, ShieldAlert, BookOpen, Scale, Shield, ExternalLink, Search, Users, Heart } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { readSavedResourceIds, writeSavedResourceIds } from '../utils/savedResources';
import supportReferralImage from '../assets/support-referral.png';
import './ResourcesPage.css';

const resourceCategories = ['All', 'Child Protection', 'Health & Protection', 'Legal Aid', 'Scholarships'];

const ResourcesPage = () => {
  const { resources } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [savedIds, setSavedIds] = useState(() => readSavedResourceIds(user?.id));
  useEffect(() => setSearchQuery(searchParams.get('search') || ''), [searchParams]);
  useEffect(() => {
    const sync = (event) => { if (!event?.detail?.userId || event.detail.userId === user?.id) setSavedIds(readSavedResourceIds(user?.id)); };
    window.addEventListener('saved-resources-changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('saved-resources-changed', sync); window.removeEventListener('storage', sync); };
  }, [user?.id]);
  const toggleSaved = (resourceId) => {
    if (!user?.id) { navigate('/login'); return; }
    const id = String(resourceId);
    const next = savedIds.includes(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id];
    setSavedIds(next);
    writeSavedResourceIds(user.id, next);
  };
  const filteredResources = resources.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (selectedCategory === 'All' || item.category === selectedCategory)
      && (item.title.toLowerCase().includes(query) || (item.desc || '').toLowerCase().includes(query) || (item.provider || '').toLowerCase().includes(query));
  });
  const iconFor = (category) => {
    if (category === 'Scholarships') return <BookOpen size={24} className="res-icon" aria-hidden="true" />;
    if (category === 'Legal Aid') return <Scale size={24} className="res-icon" aria-hidden="true" />;
    if (category === 'Health & Protection') return <HeartProtectionIcon />;
    if (category === 'Child Protection') return <Users size={24} className="res-icon" aria-hidden="true" />;
    return <BookOpen size={24} className="res-icon" aria-hidden="true" />;
  };

  return <div className="resources-page">
    <div className="page-header text-center"><div className="container"><span className="badge badge-primary mb-2">South Sudan Information</span><h1>Resources, Support &amp; Scholarships</h1><p className="page-subtitle">Find support organizations, practical resources, and scholarship opportunities.</p></div></div>
    <div className="container section-padding">
      <section className="support-safety-note mb-4" aria-labelledby="support-safety-title">
        <ShieldAlert size={30} className="alert-icon" aria-hidden="true" />
        <div><h2 id="support-safety-title">If you or someone you know may be at risk</h2><p>If it is safe to do so, speak with a trusted adult, social worker, health worker, or local child-protection professional. The contacts below are general offices or information services, not a verified 24-hour emergency hotline. Contact an organization first to confirm current services and safe ways to reach them.</p></div>
      </section>

      <section className="legal-summary mb-4" aria-labelledby="legal-summary-title">
        <div className="legal-summary-icon"><Scale size={26} aria-hidden="true" /></div>
        <div><span className="eyebrow">LEGAL INFORMATION</span><h2 id="legal-summary-title">South Sudan Child Act 2008</h2><p>The Act defines a child as a person under 18. It directs the government to take measures to abolish child marriage and other harmful practices (section 36(2)(o)). It also says suspected infringements of a child’s rights may be reported to a Chief or Social Worker, a local government official, the police, or the Public Attorney (section 34). <a href="https://www.mogei.gov.ss/super/assets/documents/resources/South%20Sudan_Child%20ACT_2008_en.pdf" target="_blank" rel="noreferrer">Read the Act from the Ministry of General Education and Instruction (PDF)</a>.</p><p className="legal-note">This is general information, not legal advice. A qualified South Sudan legal professional can explain how the law applies to an individual situation.</p></div>
      </section>

      <div className="resources-controls-bar mb-4"><div className="search-box"><Search size={18} className="search-icon" /><input type="search" placeholder="Search support information..." aria-label="Search support information" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div><div className="category-pills" aria-label="Filter resources by category">{resourceCategories.map((category) => <button key={category} className={`pill-btn ${selectedCategory === category ? 'active' : ''}`} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div></div>

      <div className="resources-grid">{filteredResources.length === 0 ? <p className="no-resources">No resources match your search.</p> : filteredResources.map((item) => <article key={item.id} className="resource-card"><div className="card-top">{iconFor(item.category)}<span className="resource-category-badge">{item.category || 'Resource'}</span></div><h3>{item.title}</h3>{item.provider && <p className="resource-detail"><strong>Provider:</strong> {item.provider}</p>}<p className="res-desc">{item.desc}</p>{item.type === 'scholarship' && <div className="scholarship-details">{item.award && <p className="resource-detail"><strong>Award:</strong> {item.award}</p>}{item.studyLevel && <p className="resource-detail"><strong>Study level:</strong> {item.studyLevel}</p>}{item.eligibility && <p className="resource-detail"><strong>Eligibility:</strong> {item.eligibility}</p>}{item.deadline && <p className="resource-detail"><strong>Deadline:</strong> {item.deadline}</p>}</div>}{item.phone && <p className="resource-detail"><strong>Phone:</strong> <a href={`tel:${item.phone.replaceAll(' ', '')}`}>{item.phone}</a></p>}{item.email && <p className="resource-detail"><strong>Email:</strong> <a href={`mailto:${item.email}`}>{item.email}</a></p>}{item.address && <p className="resource-detail"><strong>Area / service location:</strong> {item.address}</p>}{item.hours && <p className="resource-detail"><strong>Availability:</strong> {item.hours}</p>}<div className="resource-card-actions"><button type="button" className={`resource-save-button ${savedIds.includes(String(item.id)) ? 'saved' : ''}`} onClick={() => toggleSaved(item.id)} aria-pressed={savedIds.includes(String(item.id))}><Heart size={15} fill={savedIds.includes(String(item.id)) ? 'currentColor' : 'none'} />{savedIds.includes(String(item.id)) ? 'Saved' : user ? 'Save resource' : 'Log in to save'}</button><a href={item.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm w-100 resource-link">{item.linkLabel || (item.type === 'scholarship' ? 'View scholarship / apply' : 'Visit website')} <ExternalLink size={14} aria-hidden="true" /></a></div></article>)}</div>

      <section className="resources-visual"><div><span className="eyebrow">YOU DESERVE TO FEEL SAFE</span><h2>Ask for a current, safe referral</h2><p>Service availability and referral locations can change. When contacting an organization, ask which child-protection, GBV, health, or legal-aid service is operating now and how to reach it safely.</p></div><img src={supportReferralImage} alt="A young woman sitting among a group of people" loading="lazy" /></section>
      <div className="safety-tips-box mt-4"><div className="tips-header"><Shield size={22} className="tips-icon" aria-hidden="true" /><h4>Private & safer browsing</h4></div><p>If you think someone may monitor your device or internet history, use a safer device if available, or close this page when needed. Contact an organization only in a way that feels safe to you.</p></div>
    </div>
  </div>;
};

const HeartProtectionIcon = () => <PhoneCall size={24} className="res-icon" aria-hidden="true" />;

export default ResourcesPage;
