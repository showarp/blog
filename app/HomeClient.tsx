'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';
import LiquidGradient from '@/components/LiquidGradient';
import Header from '@/components/Header';
import { useFilter } from '@/contexts/FilterContext';
import { useStaggerAnimation } from '@/lib/animations';
import { animate } from 'animejs';

interface HomeClientProps {
  tags: string[];
  categories: string[];
}

export default function HomeClient({ tags, categories }: HomeClientProps) {
  const { searchQuery, selectedTag, selectedCategory } = useFilter();
  const heroRef = useRef<HTMLElement>(null);
  const postsRef = useRef<HTMLElement>(null);

  // Stagger animation for post cards
  const { containerRef: postsContainer } = useStaggerAnimation('.post-card', {
    delay: 100,
    duration: 600,
    offsetY: 40,
    trigger: 'scroll',
  });

  // Scroll to posts section
  const scrollToPosts = useCallback(() => {
    const postsSection = document.querySelector('.home-posts-section');
    if (postsSection) {
      postsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const postsRes = await fetch('/api/posts');
        const postsData = await postsRes.json();
        setAllPosts(postsData.posts || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Animate hero content on mount
  useEffect(() => {
    const eyebrow = document.querySelector('.home-hero-eyebrow');
    const title = document.querySelector('.home-hero-title');
    const subtitle = document.querySelector('.home-hero-subtitle');
    const arrow = document.querySelector('.scroll-indicator');

    if (eyebrow && title && subtitle) {
      animate([eyebrow, title, subtitle], {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: animate.stagger(150, { start: 200 }),
        duration: 1000,
        easing: 'easeOutExpo',
      });
    }

    if (arrow) {
      animate(arrow, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 1000,
        duration: 800,
        easing: 'easeOutExpo',
      });
    }
  }, []);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }

      if (selectedCategory && post.category !== selectedCategory) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(query);
        const matchSummary = post.summary?.toLowerCase().includes(query);
        if (!matchTitle && !matchSummary) {
          return false;
        }
      }

      return true;
    });
  }, [allPosts, selectedTag, selectedCategory, searchQuery]);

  return (
    <>
      {/* Header with integrated filters */}
      <Header tags={tags} categories={categories} />

      {/* Hero Section */}
      <section ref={heroRef} className="home-hero">
        <LiquidGradient />
        <div className="container home-hero-content-wrapper">
          <div className="home-hero-content">
            <p className="home-hero-eyebrow">Technical Blog</p>
            <h1 className="home-hero-title">
              Thoughts on <span className="accent">code</span>,
              <br />
              design & everything in between.
            </h1>
            <p className="home-hero-subtitle">
              Exploring software development, one article at a time.
            </p>
          </div>
          <div className="home-hero-decoration home-hero-decoration-1" />
          <div className="home-hero-decoration home-hero-decoration-2" />
        </div>

        {/* Scroll Indicator */}
        <div
          className="scroll-indicator"
          onClick={scrollToPosts}
          onKeyDown={(e) => e.key === 'Enter' && scrollToPosts()}
          tabIndex={0}
          role="button"
          aria-label="Scroll to articles"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <div className="container">
        <section ref={postsRef} className="home-posts-section">
          {loading ? (
            <div className="home-loading-wrapper">
              <div className="loading-spinner" />
              <p>Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="home-empty-state">
              <p className="home-empty-title">No articles found</p>
              <p className="home-empty-subtitle">
                {searchQuery || selectedTag || selectedCategory
                  ? 'Try adjusting your filters'
                  : 'Add some posts to your Notion database to get started.'}
              </p>
            </div>
          ) : (
            <div ref={postsContainer} className="home-posts-grid">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="post-card stagger-item"
                >
                  {post.cover && (
                    <div className="post-cover">
                      <Image src={post.cover} alt={post.title} fill unoptimized />
                    </div>
                  )}
                  <div className="post-content">
                    <div className="post-meta">
                      {post.date && <span className="post-date">{formatDate(post.date)}</span>}
                      {post.category && (
                        <>
                          <span className="post-separator">/</span>
                          <span className="post-category">{post.category}</span>
                        </>
                      )}
                    </div>
                    <h2 className="post-card-title">{post.title}</h2>
                    {post.summary && <p className="post-summary">{post.summary}</p>}
                    {post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="post-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
