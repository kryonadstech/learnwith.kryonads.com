import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/landing.css';

/* Small inline icon set — plain line SVGs, no external icon
   dependency. */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const IconAds = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11v2a2 2 0 0 0 2 2h1l4 4V5L6 9H5a2 2 0 0 0-2 2Z" />
    <path d="M16 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);
const IconSocial = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
  </svg>
);
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none" />
  </svg>
);
const IconNotes = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M15 3v4h4M8.5 12h7M8.5 15.5h7M8.5 8.5h3" />
  </svg>
);
const IconBroadcast = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 4.5 6v6c0 4.6 3.2 8 7.5 9 4.3-1 7.5-4.4 7.5-9V6L12 3Z" />
    <path d="M9.5 12.2l1.8 1.8 3.2-3.6" />
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5 9 17l11-11" />
  </svg>
);
const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </svg>
);
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

/* Signature: a rising "growth line" underline — a nod to the
   SEO / Ads / Social growth the courses teach. */
const GrowthUnderline = () => (
  <svg className="growth-underline" viewBox="0 0 220 24" preserveAspectRatio="none">
    <path d="M4 20 L54 14 L94 17 L134 8 L174 10 L216 4" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link to="/" className="landing-logo">
            <img src={logo} alt="Krayonads" className="logo-img" />
          </Link>
          <div className="landing-nav-links">
            <a href="#courses" className="nav-link">Courses</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <Link to="/login" className="btn-nav">Student Login</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="landing-hero">
          <div className="landing-container hero-grid">
            <div className="hero-content">
              <div className="hero-badge">Digital Marketing Training</div>
              <h1 className="hero-title">
                Learn Skill. Build Brands.{' '}
                <span className="growth-underline-wrap">
                  Grow Careers.
                  <GrowthUnderline />
                </span>
              </h1>
              <p className="hero-subtitle">
                SEO, Meta Ads, and social media marketing — taught through live online
                classes, video lessons, and hands-on notes, all in one student dashboard.
              </p>
              <div className="hero-cta">
                <Link to="/login" className="btn-hero-primary">
                  Start Learning
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
                <a href="#courses" className="btn-hero-secondary">View Courses</a>
              </div>
              <div className="hero-chips">
                <span className="hero-chip"><span className="chip-dot" />SEO</span>
                <span className="hero-chip"><span className="chip-dot" />Meta Ads</span>
                <span className="hero-chip"><span className="chip-dot" />Social Media</span>
                <span className="hero-chip"><span className="chip-dot" />Online Classes</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="laptop-mock">
                <div className="laptop-screen">
                  <div className="laptop-screen-head">
                    <strong>Campaign Performance</strong>
                    <span>+128% Reach</span>
                  </div>
                  <div className="chart-bars">
                    <span style={{ height: '35%' }} />
                    <span style={{ height: '50%' }} />
                    <span style={{ height: '42%' }} />
                    <span style={{ height: '68%' }} />
                    <span style={{ height: '58%' }} />
                    <span style={{ height: '85%' }} />
                    <span style={{ height: '100%' }} />
                  </div>
                  <div className="chart-labels">
                    <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
                    <span>W5</span><span>W6</span><span>W7</span>
                  </div>
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

        {/* Courses */}
        <section className="courses-section" id="courses">
          <div className="landing-container">
            <div className="section-head">
              <p className="eyebrow">What you'll learn</p>
              <h2>Three skills, one career path.</h2>
              <p>Every course is built around the tools brands actually use to grow online.</p>
            </div>
            <div className="courses-grid">
              <div className="course-card">
                <div className="course-icon"><IconSearch /></div>
                <h3>SEO</h3>
                <p>Rank higher, drive organic traffic, and understand how search really works — from keywords to technical basics.</p>
              </div>
              <div className="course-card">
                <div className="course-icon"><IconAds /></div>
                <h3>Meta Ads</h3>
                <p>Plan, launch, and optimize Facebook and Instagram ad campaigns that turn budget into results.</p>
              </div>
              <div className="course-card">
                <div className="course-icon"><IconSocial /></div>
                <h3>Social Media Marketing</h3>
                <p>Build a content strategy, grow an engaged audience, and manage a brand's presence across platforms.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform features */}
        <section className="features-section section-alt">
          <div className="landing-container">
            <div className="section-head center" style={{ margin: '0 auto 3rem' }}>
              <p className="eyebrow">How you'll learn</p>
              <h2>A classroom that fits your schedule.</h2>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><IconPlay /></div>
                <h3>Video Lessons</h3>
                <p>Stream lessons straight in the browser — no app to install, no file to download.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><IconNotes /></div>
                <h3>Study Notes</h3>
                <p>Every lesson comes with its own notes and reading material, kept alongside the video.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><IconBroadcast /></div>
                <h3>Live Classes</h3>
                <p>Join scheduled sessions with your instructor and get your doubts cleared in real time.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><IconShield /></div>
                <h3>Secure Login</h3>
                <p>Sign in with a one-time code sent to your email — no password to create or forget.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="steps-section" id="how-it-works">
          <div className="landing-container">
            <div className="section-head">
              <p className="eyebrow">Getting started</p>
              <h2>From enrolment to your first class.</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-number">01</span>
                <h3>Enrol</h3>
                <p>Once your admission is confirmed, your student account is set up for you — no self sign-up.</p>
              </div>
              <div className="step-card">
                <span className="step-number">02</span>
                <h3>Verify with OTP</h3>
                <p>Sign in with a one-time code sent to your email. No password to create or forget.</p>
              </div>
              <div className="step-card">
                <span className="step-number">03</span>
                <h3>Start learning</h3>
                <p>Watch lessons, read your notes, and join live classes — all from one dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live class spotlight */}
        <section className="split-section section-alt">
          <div className="landing-container split-grid">
            <div className="split-text">
              <p className="eyebrow">Live classes</p>
              <h2>Never miss a class.</h2>
              <p>
                When a session goes live, it shows up on your dashboard the moment it
                starts. One tap takes you straight in — no meeting links to hunt down.
              </p>
              <ul className="split-list">
                <li><IconCheck />Instructors schedule sessions ahead of time</li>
                <li><IconCheck />You're notified as soon as class starts</li>
                <li><IconCheck />Rejoin anytime before the session ends</li>
              </ul>
            </div>
            <div className="split-visual">
              <div className="live-card">
                <div className="live-card-top">
                  <div className="live-avatar">K</div>
                  <div>
                    <strong>Meta Ads Masterclass</strong>
                    <span className="live-badge"><span className="dot" />LIVE NOW</span>
                  </div>
                </div>
                <div className="live-progress"><div className="live-progress-bar" /></div>
                <span className="btn-join">Join Class</span>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram spotlight */}
        <section className="social-section">
          <div className="landing-container social-grid">
            <div className="split-text">
              <p className="eyebrow">Follow along</p>
              <h2>Straight from our Instagram.</h2>
              <p>
                We share tips, student wins, and behind-the-scenes of every campaign on
                Instagram — follow along even before your class starts.
              </p>
              <a
                href="https://www.instagram.com/kryonads/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-follow"
              >
                <IconInstagram /> Follow @kryonads
              </a>
            </div>
            <div className="ig-card">
              <div className="ig-card-head">
                <span className="ig-avatar">K</span>
                <span>
                  <strong>@kryonads</strong>
                  <span>Digital Marketing Training</span>
                </span>
              </div>
              <ul className="ig-bio">
                <li>💼 Learn Skill. Build Brands. Grow Careers.</li>
                <li>🎓 Digital Marketing Training by @kryonads</li>
                <li>📈 SEO | Meta Ads | Social Media</li>
                <li>📍 Online Classes</li>
              </ul>
              <a
                href="https://www.instagram.com/kryonads/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-follow"
              >
                <IconInstagram /> View Profile
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-banner-section">
          <div className="landing-container">
            <div className="cta-banner">
              <h2>Ready to build your first campaign?</h2>
              <p>Sign in with the email your admission was registered under.</p>
              <Link to="/login" className="btn-hero-primary">
                Start Learning
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="Krayonads" className="logo-img" />
          </div>
          <div className="footer-links">
            <a href="#courses">Courses</a>
            <Link to="/login">Student Login</Link>
            <a href="https://www.instagram.com/kryonads/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
          <div className="footer-meta">
            <p>© {new Date().getFullYear()} Krayonads. All rights reserved.</p>
            <p>learnwith.kryonads.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}