/* eslint-disable react-refresh/only-export-components */
import { Helmet } from 'react-helmet-async';
import { createStructuredData } from '../utils/structured-data';
import { toolsMetadata } from '../utils/seo-metadata';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  toolId?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, url, toolId }) => {
  const siteUrl = window.location.origin;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  
  // Generate structured data if toolId is provided
  const structuredData = toolId && toolsMetadata[toolId] 
    ? createStructuredData(toolId, toolsMetadata[toolId])
    : null;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Arabic" />
      <meta name="author" content="أدوات كفاءة" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="أدوات كفاءة" />
      <meta property="og:locale" content="ar_AR" />
      <meta property="og:locale:alternate" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:site" content="@kafaatools" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Additional SEO tags */}
      <meta name="theme-color" content="#0066cc" />
      <link rel="manifest" href="/manifest.json" />
    </Helmet>
  );
};

export default SEO;
