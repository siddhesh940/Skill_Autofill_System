/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  // Configure webpack for pdfjs-dist
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize pdfjs-dist on server to avoid worker issues
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'commonjs canvas',
      });
    }
    
    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
    };
    
    return config;
  },
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
}

module.exports = nextConfig
