import type { NextConfig } from 'next';

import initializeBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  output: 'standalone'
};

const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

export default process.env.BUNDLE_ANALYZER_ENABLED === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig;
