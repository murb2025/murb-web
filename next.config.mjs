/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
			{
				protocol: "http",
				hostname: "**",
			},
			{
				protocol: "https",
				hostname: "localhost",
			},
		],
		dangerouslyAllowSVG: true,
	},
	// Optimize development performance
	reactStrictMode: true,
	swcMinify: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	// Development optimizations
	onDemandEntries: {
		// period (in ms) where the server will keep pages in the buffer
		maxInactiveAge: 25 * 1000,
		// number of pages that should be kept simultaneously without being disposed
		pagesBufferLength: 2,
	},
	experimental: {
		// Optimize memory usage
		memoryBasedWorkersCount: true,
		// Optimize server components
		serverComponentsExternalPackages: ["@prisma/client"],
	},
	// Optimize build performance
	webpack: (config, { dev, isServer }) => {
		// Enable fast refresh in development
		if (dev && !isServer) {
			config.optimization = {
				...config.optimization,
				runtimeChunk: "single",
				splitChunks: {
					chunks: "all",
					cacheGroups: {
						default: false,
						vendors: false,
						commons: {
							test: /[\\/]node_modules[\\/]/,
							name: "vendors",
							chunks: "all",
						},
					},
				},
			};
		}
		return config;
	},
};

export default nextConfig;
