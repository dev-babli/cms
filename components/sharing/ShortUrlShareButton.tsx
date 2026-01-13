'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createShortUrlServer } from '@/lib/utils/url-shortener';

interface ShortUrlShareButtonProps {
  url: string;
  label?: string;
  onShortUrlCreated?: (shortUrl: string) => void;
}

export function ShortUrlShareButton({ 
  url, 
  label = 'Copy Short Link',
  onShortUrlCreated 
}: ShortUrlShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateShortUrl = async () => {
    setLoading(true);
    setCopied(false);
    
    try {
      const short = await createShortUrlServer(url);
      setShortUrl(short);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(short);
      setCopied(true);
      
      // Callback if provided
      if (onShortUrlCreated) {
        onShortUrlCreated(short);
      }
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to create short URL:', error);
      alert('Failed to create short URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleCreateShortUrl}
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </>
        ) : copied ? (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {label}
          </>
        )}
      </Button>
      
      {shortUrl && !copied && (
        <span className="text-sm text-muted-foreground">
          {shortUrl.replace(/^https?:\/\//, '').substring(0, 30)}...
        </span>
      )}
    </div>
  );
}

