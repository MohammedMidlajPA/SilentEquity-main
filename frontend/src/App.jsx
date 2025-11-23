import React, { useState, useEffect, useCallback, Suspense, lazy, memo } from 'react';
import { Routes, Route, Link, Outlet, useNavigate } from "react-router-dom";

import ErrorBoundary from './components/ErrorBoundary';
import logger from './utils/logger';
import StarField from './components/StarField';
import usePrefersReducedMotion from './hooks/usePrefersReducedMotion';
import useIntersectionObserver from './hooks/useIntersectionObserver';

const WebinarPayment = lazy(() => import('./pages/WebinarPayment'));
const JoinCourse = lazy(() => import('./pages/JoinCourse'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));

const FullScreenLoader = () => (
  <div className="loader">
    <span className="loader__dot" />
    <p>Preparing the experience…</p>
  </div>
);

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    let mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener?.("change", onChange, { passive: true });
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeCuCsPOq0O-npNmHzcfkZ6O_rZvSxNIof9zznbvr426cUm0g/viewform?usp=header";



/* Hamburger menu */



/* Reveals */
function useFadeInOnScroll() {
  useIntersectionObserver({
    targets: ".reveal",
    onEnter: (el) => el.classList.add("in"),
  });
}
function useFadeOnce() {
  useIntersectionObserver({
    targets: ".reveal-line",
    onEnter: (el) => el.classList.add("in"),
    rootMargin: "0px 0px -5% 0px",
  });
}





/* Footer */
function SiteFooter() {
  const isMobile = useMediaQuery("(max-width: 720px)");

  const rowStyle = React.useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "space-between",
    gap: isMobile ? 12 : 16,
    padding: isMobile ? "12px 14px" : "14px 16px",
    maxWidth: 1100,
    margin: "0 auto",
    flexWrap: "wrap",
  }), [isMobile]);

  return (
    <footer className="footer">
      <div className="footer-inner" role="contentinfo" aria-label="Site footer" style={rowStyle}>
        {isMobile ? (
          <>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <div className="footer-brand">
                <img
                  src="https://iili.io/Kh7cDHG.png"
                  alt="Silent Equity"
                  className="footer-logo"
                  width="160"
                  height="40"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              </div>
            </div>

            <nav className="footer-social" aria-label="Social links" style={{ display: "flex", gap: 10 }}>
              <a
                href="https://x.com/silent_equity?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X"
                className="social-btn"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"
                  />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/thesilentequity?igsh=MW15eGZ6NWZqanNpdA%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm6 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
                  />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@SilentEquity10"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe on YouTube"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M23.5 7.2a4 4 0 0 0-2.8-2.8C18.9 4 12 4 12 4s-6.9 0-8.7.4a4 4 0 0 0 .5 7.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 4.8 4 4 0 0 0 2.8 2.8C5.1 20 12 20 12 20s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8A41 41 0 0 0 24 12a41 41 0 0 0-.5-4.8zM9.8 15.3V8.7L15.6 12l-5.8 3.3z"
                  />
                </svg>
              </a>
            </nav>
          </>
        ) : (
          <>
            <address className="footer-address" aria-label="Address" style={{ minWidth: 220, textAlign: "left" }}>
              <div>11 Regent Street</div>
              <div>Leeds, United Kingdom</div>
            </address>

            <div className="footer-brand" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <img
              src="https://iili.io/Kh7cDHG.png"
              alt="Silent Equity"
              className="footer-logo"
              width="160"
              height="40"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
            </div>

            <nav className="footer-social" aria-label="Social links" style={{ display: "flex", gap: 10 }}>
              <a
                href="https://x.com/silent_equity?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X"
                className="social-btn"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"
                  />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/thesilentequity?igsh=MW15eGZ6NWZqanNpdA%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm6 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
                  />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@SilentEquity10"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe on YouTube"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M23.5 7.2a4 4 0 0 0-2.8-2.8C18.9 4 12 4 12 4s-6.9 0-8.7.4a4 4 0 0 0 .5 7.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 4.8 4 4 0 0 0 2.8 2.8C5.1 20 12 20 12 20s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8A41 41 0 0 0 24 12a41 41 0 0 0-.5-4.8zM9.8 15.3V8.7L15.6 12l-5.8 3.3z"
                  />
                </svg>
              </a>
            </nav>
          </>
        )}
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Silent Equity
      </div>
    </footer>
  );
}

/* Root layout */
function RootLayout() {
  return (
    <main className="page">
      <StarField />

      <header className="nav" role="banner">
        <div className="brand">
          <Link to="/" aria-label="Go to home" style={{ display: "inline-block" }}>
            <img
              src="https://iili.io/Kh7cDHG.png"
              alt="Silent Equity logo"
              className="brand-logo"
              width="120"
              height="32"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </Link>
        </div>
      </header>

      
      <Outlet />

      <SiteFooter />
    </main>
  );
}

/* Pages */
function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const handleJoin = () => {
    logger.info('Navigating to join-course from hero CTA');
    navigate('/join-course');
  };

  return (
    <>
      <section className="hero" role="region" aria-label="Hero">
        <h1 className="title gymbrand">
          NO FAKE HYPE <br /> NO GUESSING
        </h1>
        <button 
          className="cta" 
          onClick={handleJoin}
        >
          JOIN THE COURSE
        </button>
        <p className="subtext">Enroll now and start your journey toward consistent, disciplined trading.</p>
      </section>
      
      
    </>
  );
}

function ProductsPage() {
  return (
    <>
      <section className="hero" role="region" aria-label="Products">
        <h1 className="title">Products</h1>
        <p className="subtext">Upcoming programs and tools.</p>
      </section>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <section className="hero" role="region" aria-label="Contact">
        <h1 className="title">Contact Us</h1>
        <p className="subtext">Write to the team for access and support.</p>
      </section>
    </>
  );
}

/* Routes */
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/join-course" element={<JoinCourse />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment" element={<WebinarPayment />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
