import { Plugin } from '@/lib/plugins/core';
import { createPluginAPI } from '@/lib/plugins/api';

interface SEOAnalysisResult {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
  metrics: {
    titleLength: number;
    descriptionLength: number;
    headingCount: number;
    imageCount: number;
    linkCount: number;
    wordCount: number;
  };
}

interface SEOIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

const seoAnalyzerPlugin: Plugin = {
  id: 'seo-analyzer',
  name: 'SEO Analyzer',
  version: '1.0.0',
  description: 'Analyzes content for SEO best practices and provides recommendations',
  author: 'Emscale CMS',

  config: {
    minTitleLength: {
      type: 'number',
      label: 'Minimum Title Length',
      description: 'Minimum recommended title length in characters',
      default: 30,
      required: true,
    },
    maxTitleLength: {
      type: 'number',
      label: 'Maximum Title Length',
      description: 'Maximum recommended title length in characters',
      default: 60,
      required: true,
    },
    minDescriptionLength: {
      type: 'number',
      label: 'Minimum Description Length',
      description: 'Minimum recommended meta description length',
      default: 120,
      required: true,
    },
    maxDescriptionLength: {
      type: 'number',
      label: 'Maximum Description Length',
      description: 'Maximum recommended meta description length',
      default: 160,
      required: true,
    },
    minWordCount: {
      type: 'number',
      label: 'Minimum Word Count',
      description: 'Minimum recommended content word count',
      default: 300,
      required: true,
    },
  },

  hooks: {
    onInstall: async function() {
      const api = createPluginAPI('seo-analyzer');
      api.log.info('SEO Analyzer plugin installed');
    },

    onEnable: async function() {
      const api = createPluginAPI('seo-analyzer');
      api.log.info('SEO Analyzer plugin enabled');
      
      // Add UI widget
      api.ui.addWidget('blog-post-editor', {
        id: 'seo-analysis',
        component: 'SEOAnalysisWidget',
        props: { position: 'sidebar' },
      });
    },

    onContentCreate: async function(content: any) {
      const analysis = analyzeSEO(content, this.config || {});
      
      const api = createPluginAPI('seo-analyzer');
      api.log.info('SEO Analysis for new content:', analysis);
      
      // Attach analysis to content
      return {
        ...content,
        seo_analysis: analysis,
      };
    },

    onContentUpdate: async function(content: any) {
      const analysis = analyzeSEO(content, this.config || {});
      
      const api = createPluginAPI('seo-analyzer');
      
      // Log warnings if SEO score is low
      if (analysis.score < 60) {
        api.log.warn(`Low SEO score (${analysis.score}) for content: ${content.title}`);
      }
      
      return {
        ...content,
        seo_analysis: analysis,
      };
    },
  },
};

function analyzeSEO(content: any, config: Record<string, any>): SEOAnalysisResult {
  const issues: SEOIssue[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Analyze title
  const title = content.seo_title || content.title || '';
  const titleLength = title.length;

  if (titleLength === 0) {
    issues.push({
      severity: 'error',
      message: 'Missing SEO title',
      field: 'seo_title',
    });
    score -= 20;
  } else if (titleLength < (config.minTitleLength || 30)) {
    issues.push({
      severity: 'warning',
      message: `Title is too short (${titleLength} chars). Recommended: ${config.minTitleLength}+ chars`,
      field: 'seo_title',
    });
    score -= 10;
    recommendations.push('Add more descriptive words to your title');
  } else if (titleLength > (config.maxTitleLength || 60)) {
    issues.push({
      severity: 'warning',
      message: `Title is too long (${titleLength} chars). Recommended: ${config.maxTitleLength} chars or less`,
      field: 'seo_title',
    });
    score -= 5;
    recommendations.push('Shorten your title to improve search result display');
  }

  // Analyze meta description
  const description = content.seo_description || content.excerpt || '';
  const descriptionLength = description.length;

  if (descriptionLength === 0) {
    issues.push({
      severity: 'error',
      message: 'Missing meta description',
      field: 'seo_description',
    });
    score -= 20;
  } else if (descriptionLength < (config.minDescriptionLength || 120)) {
    issues.push({
      severity: 'warning',
      message: `Meta description is too short (${descriptionLength} chars)`,
      field: 'seo_description',
    });
    score -= 10;
    recommendations.push('Expand your meta description to better describe the content');
  } else if (descriptionLength > (config.maxDescriptionLength || 160)) {
    issues.push({
      severity: 'warning',
      message: `Meta description is too long (${descriptionLength} chars)`,
      field: 'seo_description',
    });
    score -= 5;
  }

  // Analyze content
  const contentText = content.content || '';
  const wordCount = contentText.split(/\s+/).filter((word: string) => word.length > 0).length;
  const headingCount = (contentText.match(/<h[1-6]/g) || []).length;
  const imageCount = (contentText.match(/<img/g) || []).length;
  const linkCount = (contentText.match(/<a /g) || []).length;

  if (wordCount < (config.minWordCount || 300)) {
    issues.push({
      severity: 'warning',
      message: `Content is too short (${wordCount} words). Recommended: ${config.minWordCount}+ words`,
      field: 'content',
    });
    score -= 15;
    recommendations.push('Add more valuable content to improve SEO');
  }

  if (headingCount === 0) {
    issues.push({
      severity: 'info',
      message: 'No headings found in content',
      field: 'content',
    });
    score -= 5;
    recommendations.push('Use headings (H2, H3) to structure your content');
  }

  if (imageCount === 0) {
    issues.push({
      severity: 'info',
      message: 'No images found in content',
      field: 'content',
    });
    recommendations.push('Add relevant images to enhance user experience');
  }

  // Check for featured image
  if (!content.featured_image) {
    issues.push({
      severity: 'warning',
      message: 'Missing featured image',
      field: 'featured_image',
    });
    score -= 10;
    recommendations.push('Add a featured image for better social media sharing');
  }

  // Check for slug
  if (!content.slug || content.slug.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Missing URL slug',
      field: 'slug',
    });
    score -= 15;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    issues,
    recommendations,
    metrics: {
      titleLength,
      descriptionLength,
      headingCount,
      imageCount,
      linkCount,
      wordCount,
    },
  };
}

export default seoAnalyzerPlugin;




