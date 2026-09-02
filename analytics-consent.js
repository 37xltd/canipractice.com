(() => {
  'use strict';

  const measurementId = 'G-SWVLQ1LFZ7';
  const storageKey = 'canipractice-analytics-consent';

  // The production tag must never run on Pages previews or other temporary hosts.
  if (location.protocol !== 'https:' || location.hostname !== 'canipractice.com') return;

  function enableAnalytics() {
    if (window.__canIPracticeAnalyticsLoaded) return;
    window.__canIPracticeAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }

  if (localStorage.getItem(storageKey) === 'granted') {
    enableAnalytics();
    return;
  }
  if (localStorage.getItem(storageKey) === 'denied') return;

  const banner = document.createElement('aside');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Analytics choice');
  banner.style.cssText = 'position:fixed;z-index:1000;right:1rem;bottom:1rem;max-width:28rem;padding:1rem;border:1px solid #1b4d4a;border-radius:.75rem;background:#fff;color:#17201f;box-shadow:0 12px 36px #0002;font:inherit';
  banner.innerHTML = '<strong>Optional analytics</strong><p style="margin:.5rem 0">May we use privacy-conscious Google Analytics to understand which pages are useful? Advertising storage and personalisation stay disabled.</p><div style="display:flex;gap:.5rem"><button type="button" data-consent="grant">Allow analytics</button><button type="button" data-consent="deny">No thanks</button></div>';
  banner.addEventListener('click', (event) => {
    const choice = event.target.closest('[data-consent]')?.dataset.consent;
    if (!choice) return;
    localStorage.setItem(storageKey, choice === 'grant' ? 'granted' : 'denied');
    banner.remove();
    if (choice === 'grant') enableAnalytics();
  });
  document.body.append(banner);
})();
