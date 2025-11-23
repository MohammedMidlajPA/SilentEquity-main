import { useEffect } from 'react';

/**
 * Observes DOM elements and fires callback the first time they intersect.
 * @param {Object} options
 * @param {string|NodeList|Element[]} options.targets - Selector string or NodeList of elements to observe
 * @param {(element: Element) => void} options.onEnter - Callback executed when element enters viewport
 * @param {string} [options.rootMargin='0px 0px -10% 0px']
 * @param {number|number[]} [options.threshold=0.1]
 */
export default function useIntersectionObserver({
  targets,
  onEnter,
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.1,
}) {
  useEffect(() => {
    const elements =
      typeof targets === 'string'
        ? document.querySelectorAll(targets)
        : targets;

    if (!elements || elements.length === 0 || typeof onEnter !== 'function') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onEnter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    const cancelIdle = idle(() => {
      elements.forEach((element) => observer.observe(element));
    });

    return () => {
      observer.disconnect();
      if (typeof cancelIdle === 'number') {
        clearTimeout(cancelIdle);
      } else if (typeof cancelIdle === 'function') {
        cancelIdle();
      }
    };
  }, [targets, onEnter, rootMargin, threshold]);
}

