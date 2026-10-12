import { mockFaqs } from './mockFaqs';
import { initialPosts } from './posts';
import { mockResources } from './mockResources';

// Browser-only demo seed. Keep people-generated content empty on first load.
export const seedData = {
  version: 1,
  users: [],
  posts: initialPosts,
  resources: mockResources.map((resource) => ({ ...resource, status: 'active', savedBy: [] })),
  inquiries: [],
  faqs: mockFaqs.map((faq) => ({ ...faq, status: 'published', isSubmitted: false })),
  analytics: { events: [], updatedAt: null }
};
