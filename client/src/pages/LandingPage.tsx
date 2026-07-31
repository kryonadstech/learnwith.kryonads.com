import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/landing.css';

/* ─── Inline SVG Icons ─── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
const IconAds = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11v2a2 2 0 0 0 2 2h1l4 4V5L6 9H5a2 2 0 0 0-2 2Z" /><path d="M16 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13" /></svg>
);
const IconSocial = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></svg>
);
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none" /></svg>
);
const IconNotes = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M15 3v4h4M8.5 12h7M8.5 15.5h7M8.5 8.5h3" /></svg>
);
const IconBroadcast = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13" /></svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4.5 6v6c0 4.6 3.2 8 7.5 9 4.3-1 7.5-4.4 7.5-9V6L12 3Z" /><path d="M9.5 12.2l1.8 1.8 3.2-3.6" /></svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5 9 17l11-11" /></svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" fill="currentColor" /></svg>
);
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" /></svg>
);
const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c.7-3.4 3-5.4 5.5-5.4s4.8 2 5.5 5.4" /><circle cx="17" cy="8.5" r="2.4" /><path d="M15.3 14.8c2.1.3 3.8 2.1 4.3 4.7" /></svg>
);
const IconQuote = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="m6 9 6 6 6-6" /></svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" /></svg>
);

const GrowthUnderline = () => (
  <svg className="growth-underline" viewBox="0 0 220 24" preserveAspectRatio="none">
    <path d="M4 20 L54 14 L94 17 L134 8 L174 10 L216 4" />
  </svg>
);

/* ─── FAQ Data ─── */
const faqs = [
  { q: 'How do I get access after I enrol?', a: 'Once your admission is confirmed and payment is received, our team sets up your student account manually. You will receive a login email within 24 hours of confirmation.' },
  { q: 'How does the login work? Do I need a password?', a: 'No passwords at all. You sign in with a one-time code sent to your registered email — a fresh code every time. It\'s faster and more secure than a traditional password.' },
  { q: 'Can I access the course on my phone?', a: 'Yes. The dashboard is fully responsive and works on mobile browsers. You can watch video lessons, read notes, and join live classes from any device.' },
  { q: 'How are the live classes conducted?', a: 'Live classes are held via Zoom. Once your instructor schedules a session, a join link appears on your dashboard automatically — you\'ll always find it in one place.' },
  { q: 'What if I miss a live class?', a: 'We understand schedules don\'t always cooperate. Contact your instructor to check if a recording or makeup session is available. The self-paced video lessons are always there to fill any gaps.' },
  { q: 'Is this course right for a complete beginner?', a: 'Absolutely. Both the 7-Day Meta Ads Crash Course and the 60-Day Mastery Program are designed to be beginner-friendly — you don\'t need any prior marketing experience.' },
  { q: 'What is the difference between the two courses?', a: 'The 7-Day Crash Course is a focused sprint specifically on Meta (Facebook & Instagram) Ads — ideal if you want one skill fast. The 60-Day Mastery Program covers SEO, Meta Ads, and Social Media Marketing in one complete journey.' },
  { q: 'How do I enquire about enrolment?', a: 'Reach out to us on Instagram (@learn_with_kryon) or through the enquiry form on this page. Admissions are reviewed manually — there\'s no automated open sign-up.' },
];

/* ─── Testimonials ─── */
const testimonials = [
  { name: 'Aisha R.', course: '60-Day Mastery Program', text: 'The structured curriculum and live sessions made all the difference. I went from zero to confidently running my first Meta Ad campaign within weeks.', rating: 5 },
  { name: 'Mohammed K.', course: '7-Day Meta Ads Crash Course', text: 'Incredibly practical — every session was hands-on. The instructors clearly do this work every day, and that shows in the quality of what they teach.', rating: 5 },
  { name: 'Priya S.', course: '60-Day Mastery Program', text: 'I loved how the platform kept everything in one place — videos, notes, and live class links. No hunting around for anything.', rating: 5 },
];

/* ─── FAQ Item Component ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span className={`faq-chevron ${open ? 'open' : ''}`}><IconChevronDown /></span>
      </button>
      <div className="faq-a-wrap" style={{ maxHeight: open ? '300px' : '0' }}>
        <p className="faq-a">{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = rootRef.current?.querySelectorAll('.reveal');
    if (!nodes || nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page" ref={rootRef}>

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link to="/" className="landing-logo">
            <img src={logo} alt="Krayonads" className="logo-img" />
          </Link>
          <div className="landing-nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#courses" className="nav-link">Courses</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link to="/login" className="btn-nav">Student Login</Link>
          </div>
          <button className={`nav-toggle ${navOpen ? 'open' : ''}`} onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu" aria-expanded={navOpen}>
            <span /><span /><span />
          </button>
        </div>
        <div className={`mobile-nav-panel landing-container ${navOpen ? 'open' : ''}`}>
          <a href="#about" onClick={() => setNavOpen(false)}>About</a>
          <a href="#courses" onClick={() => setNavOpen(false)}>Courses</a>
          <a href="#how-it-works" onClick={() => setNavOpen(false)}>How It Works</a>
          <a href="#faq" onClick={() => setNavOpen(false)}>FAQ</a>
          <a href="#pricing" onClick={() => setNavOpen(false)}>Pricing</a>
          <Link to="/login" className="btn-nav" onClick={() => setNavOpen(false)}>Student Login</Link>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="landing-hero">
          <div className="landing-container hero-grid">
            <div className="hero-content">
              <div className="hero-badge reveal">Digital Marketing Training · By Krayonads Agency</div>
              <h1 className="hero-title reveal reveal-1">
                Learn Skill. Build Brands.{' '}
                <span className="growth-underline-wrap">
                  Grow Careers.
                  <GrowthUnderline />
                </span>
              </h1>
              <p className="hero-subtitle reveal reveal-2">
                Two structured programs — a focused 7-day Meta Ads sprint and a complete 60-day Digital Marketing Mastery course — taught by practitioners from our live agency floor, not textbooks.
              </p>
              <div className="hero-cta reveal reveal-3">
                <Link to="/login" className="btn-hero-primary">
                  Start Learning
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
                <a href="#courses" className="btn-hero-secondary">Explore Courses</a>
              </div>
              <div className="hero-trust-row reveal reveal-4">
                <span className="hero-chip"><span className="chip-dot" />Agency-taught curriculum</span>
                <span className="hero-chip"><span className="chip-dot" />Live online classes</span>
                <span className="hero-chip"><span className="chip-dot" />Secure student portal</span>
              </div>
            </div>

            <div className="hero-visual reveal reveal-2">
              <div className="laptop-mock">
                <div className="laptop-screen">
                  <div className="laptop-screen-head">
                    <strong>Campaign Performance</strong>
                    <span>+128% Reach</span>
                  </div>
                  <div className="chart-bars">
                    <span style={{ height: '35%' }} /><span style={{ height: '50%' }} /><span style={{ height: '42%' }} />
                    <span style={{ height: '68%' }} /><span style={{ height: '58%' }} /><span style={{ height: '85%' }} /><span style={{ height: '100%' }} />
                  </div>
                  <div className="chart-labels"><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span></div>
                </div>
                <div className="laptop-base" />
              </div>
              <div className="float-chip chip-seo">
                <span className="chip-icon"><IconSearch /></span>
                <span><strong>SEO Rank</strong><span>Moving up</span></span>
              </div>
              <div className="float-chip chip-ads">
                <span className="chip-icon"><IconTarget /></span>
                <span><strong>Ad ROI</strong><span>3.2x return</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Honest Value Props Bar ── */}
        <section className="value-bar-section">
          <div className="landing-container">
            <div className="value-bar reveal">
              <div className="value-item">
                <div className="value-icon"><IconBroadcast /></div>
                <div><strong>Live Instructor-led Classes</strong><span>Real-time sessions via Zoom</span></div>
              </div>
              <div className="value-divider" />
              <div className="value-item">
                <div className="value-icon"><IconNotes /></div>
                <div><strong>2 Structured Programs</strong><span>7-day sprint or 60-day mastery</span></div>
              </div>
              <div className="value-divider" />
              <div className="value-item">
                <div className="value-icon"><IconAds /></div>
                <div><strong>100% Practical Curriculum</strong><span>Built from active agency work</span></div>
              </div>
              <div className="value-divider" />
              <div className="value-item">
                <div className="value-icon"><IconShield /></div>
                <div><strong>Secure Student Portal</strong><span>OTP login, no passwords needed</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section className="about-section section-alt" id="about">
          <div className="landing-container about-grid">
            <div className="split-text reveal">
              <p className="eyebrow">About Krayonads</p>
              <h2>Taught by marketers who do this for a living.</h2>
              <p>
                Krayonads is a digital marketing agency — we plan and run SEO, Meta Ads, and social media campaigns for real clients every day. <strong>Learn With Kryon</strong> is our training platform, built around that same day-to-day agency work instead of textbook theory.
              </p>
              <ul className="about-points">
                <li><IconCheck />Instructors who run live client campaigns, not just lecture from slides</li>
                <li><IconCheck />Curriculum shaped directly by current agency work</li>
                <li><IconCheck />Manually reviewed admissions — a real seat, not an open sign-up form</li>
                <li><IconCheck />Direct access to instructors through scheduled live classes</li>
              </ul>
            </div>
            <div className="split-visual reveal reveal-2">
              <div className="agency-card">
                <div className="agency-card-head">
                  <strong>What we do at Krayonads</strong>
                  <span>The same services you'll learn to run</span>
                </div>
                <div className="agency-services">
                  <div className="agency-service-row">
                    <span className="chip-icon"><IconSearch /></span>
                    <span><strong>SEO</strong><span>Organic search campaigns for client brands</span></span>
                  </div>
                  <div className="agency-service-row">
                    <span className="chip-icon"><IconAds /></span>
                    <span><strong>Meta Ads</strong><span>Facebook & Instagram ad management</span></span>
                  </div>
                  <div className="agency-service-row">
                    <span className="chip-icon"><IconUsers /></span>
                    <span><strong>Social Media</strong><span>Content strategy and community growth</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Courses ── */}
        <section className="courses-section" id="courses">
          <div className="landing-container">
            <div className="section-head reveal">
              <p className="eyebrow">Our Courses</p>
              <h2>Two ways to start, one destination.</h2>
              <p>Pick a fast, focused sprint or the full program — both are built around the tools brands actually use to grow online.</p>
            </div>
            <div className="courses-grid courses-grid-2">
              <div className="course-card course-card-v2 reveal reveal-1">
                <span className="course-duration">7 Days</span>
                <div className="course-icon"><IconAds /></div>
                <h3>Meta Ads Crash Course</h3>
                <p>A focused, fast-paced sprint into running Facebook & Instagram ad campaigns — from account setup to launching and reading your first results.</p>
                <ul className="course-highlights">
                  <li><IconCheck />Meta Ads fundamentals, taught live</li>
                  <li><IconCheck />Hands-on campaign setup practice</li>
                  <li><IconCheck />Notes and resources included</li>
                </ul>
                <a href="#pricing" className="btn-hero-secondary course-card-cta">View Pricing</a>
              </div>

              <div className="course-card course-card-v2 course-card-featured reveal reveal-2">
                <span className="course-card-tag">Most Comprehensive</span>
                <span className="course-duration">60 Days</span>
                <div className="course-icon"><IconSocial /></div>
                <h3>Digital Marketing Mastery Program</h3>
                <p>Our full program — SEO, Meta Ads, and social media marketing, taught in one structured 60-day journey from fundamentals to real campaigns.</p>
                <ul className="course-highlights">
                  <li><IconCheck />SEO, Meta Ads & Social Media — all included</li>
                  <li><IconCheck />Live classes plus self-paced video lessons</li>
                  <li><IconCheck />Structured notes for every lesson</li>
                </ul>
                <a href="#pricing" className="btn-hero-primary course-card-cta">View Pricing</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features-section section-alt">
          <div className="landing-container">
            <div className="section-head center reveal" style={{ margin: '0 auto 3.25rem' }}>
              <p className="eyebrow">How You'll Learn</p>
              <h2>A classroom that fits your schedule.</h2>
              <p>Everything you need to learn effectively — video lessons, study notes, live classes, and a secure portal — all in one dashboard.</p>
            </div>
            <div className="features-grid">
              <div className="feature-card reveal reveal-1">
                <div className="feature-icon"><IconPlay /></div>
                <h3>Video Lessons</h3>
                <p>Stream lessons straight in the browser — no app to install, no file to download. Watch at your own pace, anytime.</p>
              </div>
              <div className="feature-card reveal reveal-2">
                <div className="feature-icon"><IconNotes /></div>
                <h3>Study Notes (PDF)</h3>
                <p>Every lesson comes with structured notes viewable directly inside the platform — paginated for easy reading on any device.</p>
              </div>
              <div className="feature-card reveal reveal-3">
                <div className="feature-icon"><IconBroadcast /></div>
                <h3>Live Classes</h3>
                <p>Join scheduled sessions with your instructor and get your doubts cleared in real time. Links appear on your dashboard automatically.</p>
              </div>
              <div className="feature-card reveal reveal-4">
                <div className="feature-icon"><IconShield /></div>
                <h3>Secure OTP Login</h3>
                <p>Sign in with a one-time code sent to your email — no password to create or forget. Simple, fast, and secure.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="steps-section" id="how-it-works">
          <div className="landing-container">
            <div className="section-head reveal">
              <p className="eyebrow">Getting Started</p>
              <h2>From enrolment to your first class.</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card reveal reveal-1">
                <div className="step-number-wrap">
                  <span className="step-number">01</span>
                  <div className="step-connector" />
                </div>
                <div className="step-icon"><IconUsers /></div>
                <h3>Enquire & Enrol</h3>
                <p>Reach out via Instagram or the enquiry form. Once your admission is confirmed, your student account is set up for you — no self sign-up.</p>
              </div>
              <div className="step-card reveal reveal-2">
                <div className="step-number-wrap">
                  <span className="step-number">02</span>
                  <div className="step-connector" />
                </div>
                <div className="step-icon"><IconShield /></div>
                <h3>Verify with OTP</h3>
                <p>Sign in with a one-time code sent to your email. No password to create or forget — just open the email and copy the code.</p>
              </div>
              <div className="step-card reveal reveal-3">
                <div className="step-number-wrap">
                  <span className="step-number">03</span>
                </div>
                <div className="step-icon"><IconPlay /></div>
                <h3>Start Learning</h3>
                <p>Watch lessons, read your notes, and join live classes — all from your personal dashboard in one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Live class spotlight ── */}
        <section className="split-section section-alt">
          <div className="landing-container split-grid">
            <div className="split-text reveal">
              <p className="eyebrow">Live Classes</p>
              <h2>Never miss a class.</h2>
              <p>
                When a session goes live, it shows up on your dashboard the moment it starts. One tap takes you straight in — no meeting links to hunt down.
              </p>
              <ul className="split-list">
                <li><IconCheck />Instructors schedule sessions ahead of time</li>
                <li><IconCheck />Join link appears directly on your dashboard</li>
                <li><IconCheck />Rejoin anytime before the session ends</li>
              </ul>
            </div>
            <div className="split-visual reveal reveal-2">
              <div className="live-card">
                <div className="live-card-top">
                  <div className="live-avatar">K</div>
                  <div>
                    <strong>Meta Ads Crash Course</strong>
                    <span className="live-badge"><span className="dot" />LIVE NOW</span>
                  </div>
                </div>
                <div className="live-progress"><div className="live-progress-bar" /></div>
                <span className="btn-join">Join Class</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="testimonials-section" id="testimonials">
          <div className="landing-container">
            <div className="section-head center reveal" style={{ margin: '0 auto 3.25rem' }}>
              <p className="eyebrow">Student Stories</p>
              <h2>What our students are saying.</h2>
              <p>Real feedback from students who have been through our programs. Swap these with your own reviews as they come in.</p>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((t, i) => (
                <div key={i} className={`testimonial-card reveal reveal-${i + 1}`}>
                  <div className="testimonial-quote-icon"><IconQuote /></div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-footer">
                    <div className="testimonial-stars">
                      {Array.from({ length: t.rating }).map((_, j) => <span key={j} className="star"><IconStar /></span>)}
                    </div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{t.name[0]}</div>
                      <div>
                        <strong>{t.name}</strong>
                        <span>{t.course}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section section-alt" id="faq">
          <div className="landing-container">
            <div className="faq-layout">
              <div className="faq-header reveal">
                <p className="eyebrow">FAQ</p>
                <h2>Common questions, straight answers.</h2>
                <p>Still have a question? Reach us on <a href="https://www.instagram.com/learn_with_kryon?igsh=dHFqemZkcXpyaDJ6" target="_blank" rel="noopener noreferrer">Instagram</a> and we'll get back to you.</p>
              </div>
              <div className="faq-list reveal reveal-1">
                {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="pricing-section" id="pricing">
          <div className="landing-container">
            <div className="section-head center reveal" style={{ margin: '0 auto 3.25rem' }}>
              <p className="eyebrow">Pricing</p>
              <h2>Choose your path.</h2>
              <p>Enrol once and get everything in that course included. Seats are limited per batch — admissions are reviewed manually.</p>
            </div>

            <div className="pricing-grid">
              <div className="pricing-card reveal reveal-1">
                <span className="pricing-badge">Fast Track</span>
                <h3>7 Days Meta Ads Crash Course</h3>
                <p>A short, focused sprint into running Meta (Facebook & Instagram) ad campaigns.</p>
                <div className="pricing-amount">
                  <span className="amount">₹X,XXX</span>
                  <span className="cadence">one-time</span>
                </div>
                <p className="pricing-note">Seats are confirmed after a short admission review — no online payment required upfront.</p>
                <ul className="pricing-features">
                  <li><IconCheck />Focused Meta Ads curriculum</li>
                  <li><IconCheck />Live sessions with your instructor</li>
                  <li><IconCheck />Notes to keep after the course ends</li>
                  <li><IconCheck />Secure OTP login — no password to manage</li>
                </ul>
                <Link to="/login?enquire=true" className="btn-hero-secondary">Enquire to Enrol</Link>
                <p className="pricing-fineprint">Already admitted? <Link to="/login">Sign in to your dashboard</Link> instead.</p>
              </div>

              <div className="pricing-card pricing-card-featured reveal reveal-2">
                <span className="pricing-badge pricing-badge-featured">Most Comprehensive</span>
                <h3>60 Days Digital Marketing Mastery Program</h3>
                <p>SEO, Meta Ads, and Social Media Marketing — one structured 60-day program.</p>
                <div className="pricing-amount">
                  <span className="amount">₹XX,XXX</span>
                  <span className="cadence">one-time</span>
                </div>
                <p className="pricing-note">Seats are confirmed after a short admission review — no online payment required upfront.</p>
                <ul className="pricing-features">
                  <li><IconCheck />Full access to SEO, Meta Ads & Social Media courses</li>
                  <li><IconCheck />Structured video lessons + in-platform notes</li>
                  <li><IconCheck />Scheduled live classes with instructors</li>
                  <li><IconCheck />Secure OTP login — no password to manage</li>
                  <li><IconCheck />One dashboard for your entire learning journey</li>
                </ul>
                <Link to="/login?enquire=true" className="btn-hero-primary">
                  Enquire to Enrol
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
                <p className="pricing-fineprint">Already admitted? <Link to="/login">Sign in to your dashboard</Link> instead.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="cta-banner-section">
          <div className="landing-container">
            <div className="cta-banner reveal">
              <div className="cta-banner-content">
                <p className="cta-eyebrow">Ready to start?</p>
                <h2>Build your first campaign with real guidance.</h2>
                <p>Sign in with the email your admission was registered under, or enquire to secure your spot in the next batch.</p>
                <div className="cta-actions">
                  <Link to="/login" className="btn-hero-primary btn-cta-primary">
                    Sign in to Dashboard
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </Link>
                  <Link to="/login?enquire=true" className="btn-cta-outline">
                    Enquire Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-col footer-col-brand">
            <img src={logo} alt="Krayonads" className="logo-img footer-logo" />
            <p className="footer-tagline">Learn Skill. Build Brands. Grow Careers.</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/learn_with_kryon?igsh=dHFqemZkcXpyaDJ6" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-link">
                <IconInstagram />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61591361856824" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-link">
                <IconFacebook />
              </a>
              <a href="mailto:learnwithkryon@gmail.com" aria-label="Email" className="footer-social-link">
                <IconMail />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links-list">
              <li><a href="#about">About Us</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><Link to="/login">Student Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Courses</h4>
            <ul className="footer-links-list">
              <li><a href="#courses">7-Day Meta Ads Crash Course</a></li>
              <li><a href="#courses">60-Day Mastery Program</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Connect</h4>
            <ul className="footer-links-list">
              <li>
                <a href="https://www.instagram.com/learn_with_kryon?igsh=dHFqemZkcXpyaDJ6" target="_blank" rel="noopener noreferrer" className="footer-ig-link">
                  <IconInstagram /> @learn_with_kryon
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/profile.php?id=61591361856824" target="_blank" rel="noopener noreferrer" className="footer-ig-link">
                  <IconFacebook /> Facebook
                </a>
              </li>
              <li><a href="mailto:learnwithkryon@gmail.com" className="footer-email-link"><IconMail /> learnwithkryon@gmail.com</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="landing-container footer-bottom-inner">
            <p>© {new Date().getFullYear()} Kryon. All rights reserved.</p>
            <p>learnwithkryon.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}