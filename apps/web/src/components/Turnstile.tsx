import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

const SCRIPT_ID = 'cf-turnstile-script';

/**
 * Renders a Cloudflare Turnstile widget when VITE_TURNSTILE_SITE_KEY is
 * configured. In local development, where no site key is set, this renders
 * nothing and the public submit endpoint simply skips verification (see
 * TURNSTILE_ENFORCED in apps/api/wrangler.toml).
 */
export function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    function render() {
      if (containerRef.current && window.turnstile) {
        window.turnstile.render(containerRef.current, { sitekey: siteKey, callback: onVerify });
      }
    }

    if (window.turnstile) {
      render();
      return;
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = render;
      document.body.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="my-2" />;
}
