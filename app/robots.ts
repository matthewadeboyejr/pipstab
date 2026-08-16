import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pipstab.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/early-access',
          '/outlooks',
          '/journal',
          '/macro',
          '/analytics',
          '/psychology',
          '/setups',
          '/auth/sign-in',
          '/auth/sign-up',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
