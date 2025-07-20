import type { NextConfig } from 'next';

import initializeBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  // ✅ Migrated from experimental.turbo to turbopack (stable since Next.js 15.3)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  compiler: {
    // Remove console logs only in production, but keep console.error for debugging
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false
  }
};

const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

export default process.env.BUNDLE_ANALYZER_ENABLED === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig;
