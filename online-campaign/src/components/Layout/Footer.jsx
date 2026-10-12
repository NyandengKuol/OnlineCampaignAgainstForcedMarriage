import { Circle } from 'lucide-react';
import './Footer.css';

const Footer = ({ setActiveTab }) => <footer className="site-footer"><div className="container footer-main"><nav>{['About', 'Learn', 'Prevention', 'Campaign', 'FAQ', 'Resources'].map((item) => <button key={item} onClick={() => setActiveTab(item.toLowerCase())}>{item}</button>)}</nav><div className="social-links"><Circle size={8} /><Circle size={8} /><Circle size={8} /></div></div><div className="footer-copy">© 2026 Online Campaign Against Forced Marriage. All rights reserved.</div></footer>;
export default Footer;
