'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';
import LiquidGradient from '@/components/LiquidGradient';
import Header from '@/components/Header';
import { useFilter } from '@/contexts/FilterContext';

interface HomeClientProps {
  tags: string[];
  categories: string[];
}

export default function HomeClient({ tags, categories }: HomeClientProps) {
  const { searchQuery, selectedTag, selectedCategory } = useFilter();

  // 滚动到文章区域
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

  // 首次加载时获取所有数据
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

  // 本地过滤搜索
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      // Tag 过滤
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }

      // Category 过滤
      if (selectedCategory && post.category !== selectedCategory) {
        return false;
      }

      // 搜索过滤
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

      {/* Hero Section - full viewport width, outside container */}
      <section className="home-hero">
        <LiquidGradient />
        <div className="container home-hero-content-wrapper">
          <div className="home-hero-content">
            <p className="home-hero-eyebrow animate-fade-in">Technical Blog</p>
            <h1 className="home-hero-title animate-fade-in-up">
              Thoughts on <span className="accent">code</span>,
              <br />
              design & everything in between.
            </h1>
            <p className="home-hero-subtitle animate-fade-in-up">
              Exploring software development, one article at a time.
            </p>
          </div>
          <div className="home-hero-decoration home-hero-decoration-1" />
          <div className="home-hero-decoration home-hero-decoration-2" />
        </div>

        {/* Scroll Indicator - outside container, fixed to viewport */}
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

      {/* Rest of content in container */}
      <div className="container">
        {/* Posts Grid */}
        <section className="home-posts-section">
          {loading ? (
            <div className="home-loading-wrapper">
              <div className="loading-spinner" />
              <p>Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="home-empty-state animate-fade-in">
              <p className="home-empty-title">No articles found</p>
              <p className="home-empty-subtitle">
                {searchQuery || selectedTag || selectedCategory
                  ? 'Try adjusting your filters'
                  : 'Add some posts to your Notion database to get started.'}
              </p>
            </div>
          ) : (
            <div className="home-posts-grid stagger-children">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.slug}`} className="post-card">
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
