import { useEffect, useRef, useState } from 'react';
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5 9 17l11-11" />
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
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c.7-3.4 3-5.4 5.5-5.4s4.8 2 5.5 5.4" />
    <circle cx="17" cy="8.5" r="2.4" />
    <path d="M15.3 14.8c2.1.3 3.8 2.1 4.3 4.7" />
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
  const [navOpen, setNavOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal: fade + rise any .reveal element into place as it
  // enters the viewport, once, then stop observing it.
  useEffect(() => {
    const nodes = rootRef.current?.querySelectorAll('.reveal');
    if (!nodes || nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page" ref={rootRef}>
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link to="/" className="landing-logo">
            <img src={logo} alt="Krayonads" className="logo-img" />
          </Link>

          <div className="landing-nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#courses" className="nav-link">Courses</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link to="/login" className="btn-nav">Student Login</Link>
          </div>

          <button
            className={`nav-toggle ${navOpen ? 'open' : ''}`}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle menu"
            aria-expanded={navOpen}
          >
            <span /><span /><span />
          </button>
        </div>

        <div className={`mobile-nav-panel landing-container ${navOpen ? 'open' : ''}`}>
          <a href="#about" onClick={() => setNavOpen(false)}>About</a>
          <a href="#courses" onClick={() => setNavOpen(false)}>Courses</a>
          <a href="#how-it-works" onClick={() => setNavOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setNavOpen(false)}>Pricing</a>
          <Link to="/login" className="btn-nav" onClick={() => setNavOpen(false)}>Student Login</Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="landing-hero">
          <div className="landing-container hero-grid">
            <div className="hero-content">
              <div className="hero-badge reveal">Digital Marketing Training</div>
              <h1 className="hero-title reveal reveal-1">
                Learn Skill. Build Brands.{' '}
                <span className="growth-underline-wrap">
                  Grow Careers.
                  <GrowthUnderline />
                </span>
              </h1>
              <p className="hero-subtitle reveal reveal-2">
                SEO, Meta Ads, and social media marketing — taught through live online
                classes, video lessons, and hands-on notes, all in one student dashboard.
              </p>
              <div className="hero-cta reveal reveal-3">
                <Link to="/login" className="btn-hero-primary">
                  Start Learning
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
                <a href="#courses" className="btn-hero-secondary">View Courses</a>
              </div>
              <div className="hero-chips reveal reveal-4">
                <span className="hero-chip"><span className="chip-dot" />SEO</span>
                <span className="hero-chip"><span className="chip-dot" />Meta Ads</span>
                <span className="hero-chip"><span className="chip-dot" />Social Media</span>
                <span className="hero-chip"><span className="chip-dot" />Online Classes</span>
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

        {/* About */}
        <section className="about-section section-alt" id="about">
          <div className="landing-container about-grid">
            <div className="split-text reveal">
              <p className="eyebrow">About Krayonads</p>
              <h2>Taught by marketers who do this for a living.</h2>
              <p>
                Krayonads is a digital marketing agency — we plan and run SEO, Meta Ads,
                and social media campaigns for real clients every day. Learn With Kryon
                is our training platform, built around that same day-to-day work instead
                of textbook theory. "Learn Skill. Build Brands. Grow Careers." isn't just
                a tagline for us — it's what our agency floor already does, taught to you
                step by step.
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

        {/* Courses */}
        <section className="courses-section" id="courses">
          <div className="landing-container">
            <div className="section-head reveal">
              <p className="eyebrow">What you'll learn</p>
              <h2>Three skills, one career path.</h2>
              <p>Every course is built around the tools brands actually use to grow online.</p>
            </div>
            <div className="courses-grid">
              <div className="course-card reveal reveal-1">
                <div className="course-icon"><IconSearch /></div>
                <h3>SEO</h3>
                <p>Rank higher, drive organic traffic, and understand how search really works — from keywords to technical basics.</p>
              </div>
              <div className="course-card reveal reveal-2">
                <div className="course-icon"><IconAds /></div>
                <h3>Meta Ads</h3>
                <p>Plan, launch, and optimize Facebook and Instagram ad campaigns that turn budget into results.</p>
              </div>
              <div className="course-card reveal reveal-3">
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
            <div className="section-head center reveal" style={{ margin: '0 auto 3.25rem' }}>
              <p className="eyebrow">How you'll learn</p>
              <h2>A classroom that fits your schedule.</h2>
            </div>
            <div className="features-grid">
              <div className="feature-card reveal reveal-1">
                <div className="feature-icon"><IconPlay /></div>
                <h3>Video Lessons</h3>
                <p>Stream lessons straight in the browser — no app to install, no file to download.</p>
              </div>
              <div className="feature-card reveal reveal-2">
                <div className="feature-icon"><IconNotes /></div>
                <h3>Study Notes</h3>
                <p>Every lesson comes with its own notes and reading material, kept alongside the video.</p>
              </div>
              <div className="feature-card reveal reveal-3">
                <div className="feature-icon"><IconBroadcast /></div>
                <h3>Live Classes</h3>
                <p>Join scheduled sessions with your instructor and get your doubts cleared in real time.</p>
              </div>
              <div className="feature-card reveal reveal-4">
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
            <div className="section-head reveal">
              <p className="eyebrow">Getting started</p>
              <h2>From enrolment to your first class.</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card reveal reveal-1">
                <span className="step-number">01</span>
                <h3>Enrol</h3>
                <p>Once your admission is confirmed, your student account is set up for you — no self sign-up.</p>
              </div>
              <div className="step-card reveal reveal-2">
                <span className="step-number">02</span>
                <h3>Verify with OTP</h3>
                <p>Sign in with a one-time code sent to your email. No password to create or forget.</p>
              </div>
              <div className="step-card reveal reveal-3">
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
            <div className="split-text reveal">
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
            <div className="split-visual reveal reveal-2">
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

        {/* Pricing */}
        <section className="pricing-section" id="pricing">
          <div className="landing-container">
            <div className="section-head center reveal" style={{ margin: '0 auto 3.25rem' }}>
              <p className="eyebrow">Pricing</p>
              <h2>One program. Everything included.</h2>
              <p>No confusing tiers — enrol once and get full access to every course, every class, and every resource.</p>
            </div>

            <div className="pricing-card-wrap reveal reveal-1">
              <div className="pricing-card">
                <span className="pricing-badge">Full Access</span>
                <h3>60 Days Digital Marketing Mastery Program</h3>
                <p>SEO, Meta Ads, and Social Media Marketing — one structured 60-day program.</p>

                <div className="pricing-amount">
                  <span className="amount">₹XX,XXX</span>
                  <span className="cadence">one-time</span>
                </div>
                <p className="pricing-note">Seats are confirmed after a short admission review — no online payment required upfront.</p>

                <ul className="pricing-features">
                  <li><IconCheck />Full access to SEO, Meta Ads & Social Media courses</li>
                  <li><IconCheck />Structured video lessons + downloadable-style notes</li>
                  <li><IconCheck />Scheduled live classes with instructors</li>
                  <li><IconCheck />Secure OTP login — no password to manage</li>
                  <li><IconCheck />One dashboard for your entire learning journey</li>
                </ul>

                <a
                  href="https://www.instagram.com/kryonads/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-primary"
                >
                  Enquire to Enrol
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </a>
                <p className="pricing-fineprint">Already admitted? <Link to="/login">Sign in to your dashboard</Link> instead.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-banner-section">
          <div className="landing-container">
            <div className="cta-banner reveal">
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
            <a href="#about">About</a>
            <a href="#courses">Courses</a>
            <a href="#pricing">Pricing</a>
            <Link to="/login">Student Login</Link>
            <a href="https://www.instagram.com/kryonads/" target="_blank" rel="noopener noreferrer" className="footer-ig-link">
              <IconInstagram /> Instagram
            </a>
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