'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';

interface PostWithHeadings extends Post {
  headings?: { id: string; text: string; level: number }[];
}

// JSON-LD Component for Article structured data
function ArticleJsonLd({ post }: { post: Post }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const postUrl = `${SITE_URL}/post/${post.slug}`;
  const imageUrl = post.cover || `${SITE_URL}/og-image.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary,
    "url": postUrl,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": "Your Name",
      "url": SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tech & Thoughts Blog",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "image": {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": "1200",
      "height": "630"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "keywords": post.tags?.join(', ') || '',
    "articleSection": post.category || ''
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Lightbox component for image and mermaid zoom
function Lightbox({
  src,
  isOpen,
  onClose,
  type = 'image'
}: {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  type?: 'image' | 'mermaid';
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mount state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle open/close animation AND hide custom cursor when open
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
      // Hide custom cursor when lightbox is open
      document.body.classList.add('lightbox-open');
    } else {
      // Start closing animation - keep lightbox-open class during animation
      setIsClosing(true);
      // Don't remove lightbox-open class yet - wait for animation to complete
      // This allows the fade-out transition to work
      const timeoutId = setTimeout(() => {
        document.body.style.overflow = '';
        document.body.classList.remove('lightbox-open');
        setIsClosing(false);
      }, 300); // Match CSS transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Reset scale and position when opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle drag - allow initial drag to start positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent native browser drag
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Don't render anything if not mounted or completely hidden
  if (!isMounted || (!isOpen && !isClosing)) return null;

  const lightboxElement = (
    <div
      className={`lightbox-overlay ${isOpen || isClosing ? 'lightbox-visible' : ''}`}
      onClick={onClose}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div className="lightbox-controls">
        <button onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(3, s + 0.25)); }} title="Zoom In">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(0.5, s - 0.25)); }} title="Zoom Out">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); setScale(1); setPosition({ x: 0, y: 0 }); }} title="Reset">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        <button onClick={onClose} title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
        }}
      >
        {type === 'image' && src ? (
          <img src={src} alt="Zoomed" />
        ) : type === 'mermaid' && src ? (
          <div
            className="mermaid-lightbox-content"
            dangerouslySetInnerHTML={{ __html: src }}
          />
        ) : null}
      </div>
    </div>
  );

  // Use portal to render at body level to avoid parent element issues
  return createPortal(lightboxElement, document.body);
}

// Mermaid diagram component
function MermaidChart({
  definition,
  onZoom,
  isLightTheme
}: {
  definition: string;
  onZoom?: (svg: string) => void;
  isLightTheme: boolean;
}) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef(''); // Use ref to always get the latest SVG value
  const onZoomRef = useRef(onZoom); // Keep ref in sync with onZoom callback

  useEffect(() => {
    onZoomRef.current = onZoom;
  }, [onZoom]);

  useEffect(() => {
    mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, definition)
      .then(({ svg }) => {
        setSvg(svg);
        svgRef.current = svg; // Keep ref in sync
      })
      .catch((err) => setError(err.message));
  }, [definition, isLightTheme]); // Re-render when theme changes

  const handleClick = useCallback(() => {
    // Use ref to get the latest SVG value (might not be set in state yet)
    const currentSvg = svgRef.current;
    if (currentSvg && onZoomRef.current) {
      onZoomRef.current(currentSvg);
    }
  }, []);

  if (error) {
    return (
      <div className="mermaid-error">
        <pre>Mermaid Diagram Error: {error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svg }}
      onClick={handleClick}
    />
  );
}

// Copy button component
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button
      className={`copy-button ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
}

export default function PostClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeHeading, setActiveHeading] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [lightboxType, setLightboxType] = useState<'image' | 'mermaid'>('image');
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Detect theme for mermaid configuration
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightTheme(isLight);
    };
    checkTheme();

    const observer = new MutationObserver(() => {
      checkTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize mermaid with theme-aware configuration
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isLightTheme ? 'base' : 'dark',
      securityLevel: 'loose',
      fontFamily: 'var(--font-mono)',
      themeVariables: isLightTheme ? {
        // Light theme - white/blue 配色
        primaryColor: '#dbeafe',
        primaryTextColor: '#1e3a8a',
        primaryBorderColor: '#2563eb',
        lineColor: '#2563eb',
        secondaryColor: '#e0e7ff',
        tertiaryColor: '#f8fafc',
        mainBkg: '#ffffff',
        fontSize: '16px',
      } : {
        // Dark theme - lime green accent
        primaryColor: '#1a2f1a',
        primaryTextColor: '#e8ff47',
        primaryBorderColor: '#e8ff47',
        lineColor: '#e8ff47',
        secondaryColor: '#0d1f0d',
        tertiaryColor: '#0a0a0a',
        mainBkg: '#0a0a0a',
        fontSize: '16px',
      }
    });
  }, [isLightTheme]);

  // Extract headings from content for TOC
  const extractHeadings = useCallback((markdown: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: { id: string; text: string; level: number }[] = [];
    const idCounts: Record<string, number> = {};
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const baseId = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Make ID unique if duplicates exist
      let id = baseId;
      if (idCounts[baseId] !== undefined) {
        idCounts[baseId]++;
        id = `${baseId}-${idCounts[baseId]}`;
      } else {
        idCounts[baseId] = 0;
      }

      headings.push({ id, text, level });
    }

    return headings;
  }, []);

  // Add IDs to headings in rendered content
  useEffect(() => {
    if (!content || !contentRef.current) return;

    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const idCounts: Record<string, number> = {};
    headingElements.forEach((el) => {
      const text = el.textContent || '';
      const baseId = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Make ID unique if duplicates exist
      let id = baseId;
      if (idCounts[baseId] !== undefined) {
        idCounts[baseId]++;
        id = `${baseId}-${idCounts[baseId]}`;
      } else {
        idCounts[baseId] = 0;
      }
      el.id = id;
    });

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        // Get all visible headings and pick the topmost one
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by position (topmost first)
          visibleEntries.sort((a, b) => {
            const rectA = a.boundingClientRect;
            const rectB = b.boundingClientRect;
            return rectA.top - rectB.top;
          });
          setActiveHeading(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  // Handle TOC link click - immediately update active heading
  const handleTocClick = useCallback((headingId: string) => {
    setActiveHeading(headingId);
  }, []);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/post/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.post) {
          const headings = extractHeadings(data.content);
          setPost({ ...data.post, headings });
          setContent(data.content);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, extractHeadings]);

  if (loading) {
    return (
      <div className="post-loading">
        <div className="loading-spinner" />
        <p>Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="not-found-container">
        <div className="not-found-wrapper">
          <div className="not-found-number">404</div>
          <div className="not-found-divider"></div>
          <h1 className="not-found-title">Article Not Found</h1>
          <p className="not-found-message">
            The article you&apos;re looking for has been lost in the void.
            <br />
            Perhaps it was never written, or perhaps it was deleted.
          </p>
          <div className="not-found-actions">
            <Link href="/" className="not-found-btn primary">
              <span className="btn-text">Return Home</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link href="/archive" className="not-found-btn secondary">
              Browse Archive
            </Link>
          </div>
        </div>
        <div className="not-found-decoration">
          <div className="not-found-circle"></div>
          <div className="not-found-circle-2"></div>
        </div>
      </div>
    );
  }

  return (
    <article className="post-article">
      {/* JSON-LD Structured Data */}
      <ArticleJsonLd post={post} />

      {/* Cover */}
      {post.cover && (
        <div className="post-cover-wrapper">
          <img src={post.cover} alt={post.title} className="post-cover-image" />
        </div>
      )}

      <div className="container">
        <header className={`post-header ${post.headings && post.headings.length > 0 ? 'has-toc' : ''}`}>
          <Link href="/" className="back-link">← Back to Home</Link>

          <div className="post-meta">
            {post.date && <span className="post-date">{formatDate(post.date)}</span>}
            {post.category && (
              <>
                <span className="post-separator">/</span>
                <span className="post-category">{post.category}</span>
              </>
            )}
          </div>

          <h1 className="post-title">{post.title}</h1>

          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="post-tag">#{tag}</span>
              ))}
            </div>
          )}
        </header>

        <div className="post-content-wrapper">
          {/* Table of Contents Sidebar */}
          {post.headings && post.headings.length > 0 && (
            <nav className="toc-sidebar">
              <div className="toc-title">Contents</div>
              <ul className="toc-list">
                {post.headings.map((heading) => (
                  <li
                    key={heading.id}
                    className={`toc-item toc-level-${heading.level} ${activeHeading === heading.id ? 'active' : ''}`}
                  >
                    <a
                      href={`#${heading.id}`}
                      onClick={() => handleTocClick(heading.id)}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="post-content" ref={contentRef}>
            <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[
                [rehypeKatex, {
                  throwOnError: false,
                  trust: true,
                  strict: false,
                  displayMode: false,
                  output: 'html'
                }],
                rehypeRaw
              ]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;
                  const language = match ? match[1] : '';
                  const code = String(children).replace(/\n$/, '');

                  // Handle mermaid diagrams
                  if (language === 'mermaid') {
                    const chartDef = code;
                    return (
                      <MermaidChart
                        key={chartDef}
                        definition={chartDef}
                        isLightTheme={isLightTheme}
                        onZoom={(svg) => {
                          setMermaidSvg(svg);
                          setLightboxType('mermaid');
                          setLightboxOpen(true);
                        }}
                      />
                    );
                  }

                  return !inline ? (
                    <div className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-language">{language}</span>
                        <CopyButton code={code} />
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle ={{
                          margin:0,
                          borderRadius: '0 0 8px 8px',
                          fontSize: '14px',
                        }}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                video({ src, controls }) {
                  return (
                    <video
                      src={src}
                      controls={controls}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: '8px',
                        margin: '24px 0',
                      }}
                    />
                  );
                },
                a({ href, children }) {
                  // Check if it's a video link
                  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
                  const isVideoLink = videoExtensions.some(ext => href?.toLowerCase().endsWith(ext));

                  if (isVideoLink) {
                    return (
                      <video
                        src={href}
                        controls
                        style={{
                          width: '100%',
                          maxWidth: '400px',
                          borderRadius: '8px',
                          margin: '24px 0',
                        }}
                      >
                        <track kind="captions" />
                        您的浏览器不支持视频播放
                      </video>
                    );
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
                img({ src, alt, ...props }) {
                  const imageSrc = typeof src === 'string' ? src : '';
                  // Use native img tag for better click handling
                  return (
                    <img
                      src={imageSrc}
                      alt={alt || ''}
                      style={{
                        maxWidth: '100%',
                        width: '400px',
                        height: 'auto',
                        borderRadius: '8px',
                        margin: '24px auto',
                        display: 'block',
                        cursor: 'zoom-in'
                      }}
                      onClick={() => {
                        setLightboxSrc(imageSrc);
                        setLightboxType('image');
                        setLightboxOpen(true);
                      }}
                    />
                  );
                },
                h1({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                  return <h1 id={id}>{children}</h1>;
                },
                h2({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                  return <h2 id={id}>{children}</h2>;
                },
                h3({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                  return <h3 id={id}>{children}</h3>;
                },
                h4({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                  return <h4 id={id}>{children}</h4>;
                },
                h5({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                  return <h5 id={id}>{children}</h5>;
                },
                h6({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                  return <h6 id={id}>{children}</h6>;
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        </div>
      </div>

      {/* Lightbox for image and mermaid zoom */}
      <Lightbox
        src={lightboxType === 'mermaid' ? mermaidSvg : lightboxSrc}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        type={lightboxType}
      />
    </article>
  );
}
