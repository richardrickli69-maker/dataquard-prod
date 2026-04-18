import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://cdn.jsdelivr.net; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.sightengine.com https://api.anthropic.com https://api.resend.com https://pagespeedonline.googleapis.com https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/ai-trust',
        destination: '/ki-sicherheit',
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
