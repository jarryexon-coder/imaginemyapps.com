import type { ImageSourcePropType } from 'react-native';

export type PortfolioProject = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  challenge: string;
  solution: string;
  features: string[];
  tech: string[];
  image: ImageSourcePropType;
  accent: string;
  featured?: boolean;
  appUrl?: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'sports-analytics', name: 'Sports Analytics', tagline: 'Serious research for smarter sports decisions.', featured: true,
    summary: 'A production-ready sports intelligence platform covering live data, player projections, prop research, AI-assisted parlays, fantasy tools, and subscriber access across major leagues.',
    challenge: 'Sports research is fragmented across box scores, injury reports, projections, betting markets, and fantasy tools. The product needed to combine those workflows without overwhelming the user.',
    solution: 'We built a focused mobile experience that organizes high-value research by league, game, player, and decision type, with premium access managed through native subscriptions.',
    features: ['Live scores and multi-league data', 'Player projections and prop research', 'AI-assisted parlay workflows', 'Fantasy sports tools', 'Premium subscription access', 'Research-friendly mobile navigation'],
    tech: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'RevenueCat'], image: require('../../assets/images/portfolio/sports-analytics.png'), accent: '#E63946', appUrl: 'https://sportsanalyticsgpt.com',
  },
  {
    slug: 'investbook', name: 'InvestBook', tagline: 'Commercial real estate discovery and deal management.',
    summary: 'A native platform for live commercial listings, advanced filters, investor portfolios, secure chat, and App Store subscriptions.',
    challenge: 'Property discovery and investor collaboration often happen across disconnected listing sites, spreadsheets, email, and messaging tools.',
    solution: 'InvestBook brings discovery, filtering, saved opportunities, portfolio organization, and secure communication into one mobile workflow.',
    features: ['Live property listings', 'Advanced investment filters', 'Saved investor portfolios', 'Secure real-time chat', 'Subscription access'],
    tech: ['React Native', 'Expo', 'Node.js', 'WebSockets', 'In-App Purchases'], image: require('../../assets/images/portfolio/investbook.png'), accent: '#1877F2',
  },
  {
    slug: 'fittrack', name: 'FitTrack Pro', tagline: 'Fitness tracking reimagined.',
    summary: 'An all-in-one fitness concept that combines workouts, nutrition planning, personalized guidance, and accountability.',
    challenge: 'Fitness users frequently abandon apps that track activity without helping them build sustainable routines.',
    solution: 'FitTrack Pro combines practical tracking with recommendations and motivating progress experiences.',
    features: ['Workout tracking', 'Meal recommendations', 'Adaptive suggestions', 'Nutrition scanning', 'Challenges and leaderboards'],
    tech: ['React Native', 'Node.js', 'MongoDB', 'Firebase'], image: require('../../assets/images/portfolio/fittrack.png'), accent: '#8B5CF6',
  },
  {
    slug: 'urbanmart', name: 'UrbanMart', tagline: 'E-commerce simplified.',
    summary: 'A shopping tool designed to help customers discover products, compare options, and find lower prices.',
    challenge: 'Online shoppers move between stores and product pages to compare prices and delivery options.',
    solution: 'UrbanMart organizes product discovery and comparison into a clearer mobile-first journey.',
    features: ['Product discovery', 'Price comparison', 'Product details', 'Shopping workflow', 'Delivery-focused experience'],
    tech: ['Next.js', 'Stripe', 'PostgreSQL', 'Responsive UI'], image: require('../../assets/images/portfolio/urbanmart.png'), accent: '#F97316',
  },
  {
    slug: 'datadash', name: 'DataDash', tagline: 'Data-driven decisions.',
    summary: 'A business intelligence dashboard that turns performance data into clear charts, trends, and actionable indicators.',
    challenge: 'Important business signals are difficult to interpret when data is scattered or presented without hierarchy.',
    solution: 'DataDash creates a focused analytics experience built for quick scanning and deeper exploration.',
    features: ['Performance dashboard', 'Interactive charts', 'Real-time presentation', 'Trend visualization', 'Responsive analytics'],
    tech: ['Vue.js', 'D3.js', 'Firebase', 'Data Visualization'], image: require('../../assets/images/portfolio/datadash.png'), accent: '#2563EB',
  },
  {
    slug: 'creator-api-hub', name: 'Creator API Hub', tagline: 'Content automation through connected APIs.',
    summary: 'An API aggregation concept that gives creators and developers a unified place to connect services and automate content workflows.',
    challenge: 'Creators often rely on disconnected platforms and repetitive manual publishing processes.',
    solution: 'Creator API Hub organizes integrations, developer controls, and automated workflows in one product.',
    features: ['API connections', 'Workflow automation', 'Developer controls', 'Integration monitoring', 'Content operations'],
    tech: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs'], image: require('../../assets/images/portfolio/creator-api-hub.png'), accent: '#6D28D9',
  },
  {
    slug: 'nexus-ai', name: 'Nexus AI', tagline: 'Your AI assistant.',
    summary: 'A mobile AI assistant concept combining conversation, voice interaction, information, and task support.',
    challenge: 'AI tools can feel complex when users must learn unfamiliar workflows before getting useful results.',
    solution: 'Nexus AI presents intelligent assistance through familiar, direct mobile interactions.',
    features: ['Conversational interface', 'Voice-first concepts', 'Task support', 'Clear AI feedback', 'Accessible mobile controls'],
    tech: ['Python', 'TensorFlow', 'GPT', 'Mobile UI'], image: require('../../assets/images/portfolio/nexus.png'), accent: '#0284C7',
  },
  {
    slug: 'web-scraper', name: 'Web Scraper Pro', tagline: 'Intelligent data mining.',
    summary: 'A data-extraction platform for discovering, organizing, and reviewing structured information from the web.',
    challenge: 'Web-data workflows often demand technical configuration and produce difficult-to-review output.',
    solution: 'Web Scraper Pro packages crawling, extraction, progress tracking, and results into a clearer product experience.',
    features: ['Guided crawling workflow', 'Source configuration', 'Structured results', 'Progress visibility', 'Export concepts'],
    tech: ['Python', 'Scrapy', 'MongoDB', 'Data Extraction'], image: require('../../assets/images/portfolio/web-scraper.png'), accent: '#0F766E',
  },
];

export const featuredProject = portfolioProjects[0];
export const getProject = (slug?: string) => portfolioProjects.find((project) => project.slug === slug);
