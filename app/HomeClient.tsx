'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';

export default function HomeClient() {
  // 滚动到文章区域
  const scrollToPosts = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  }, []);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 首次加载时获取所有数据
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [postsRes, tagsRes, categoriesRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/tags'),
          fetch('/api/categories'),
        ]);

        const postsData = await postsRes.json();
        const tagsData = await tagsRes.json();
        const categoriesData = await categoriesRes.json();

        setAllPosts(postsData.posts || []);
        setAllTags(tagsData.tags || []);
        setAllCategories(categoriesData.categories || []);
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
    <div className="container">
      {/* Hero Section */}
      <section className="home-hero">
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

        {/* Scroll Indicator */}
        <div className="scroll-indicator" onClick={scrollToPosts} onKeyDown={(e) => e.key === 'Enter' && scrollToPosts()} tabIndex={0} role="button" aria-label="Scroll to articles">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="filters-section">
        <div className="home-search-wrapper animate-fade-in-up">
          <svg className="home-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="home-search-input"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {allTags.length > 0 && (
          <div className="home-tags-wrapper animate-fade-in-up">
            <span className="home-filter-label">Tags:</span>
            <div className="home-tags-list">
              <button className={`tag ${selectedTag === null ? 'active' : ''}`} onClick={() => setSelectedTag(null)}>All</button>
              {allTags.map((tag) => (
                <button key={tag} className={`tag ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>{tag}</button>
              ))}
            </div>
          </div>
        )}

        {allCategories.length > 0 && (
          <div className="home-categories-wrapper animate-fade-in-up">
            <span className="home-filter-label">Category:</span>
            <div className="home-categories-list">
              <button className={`category-btn ${selectedCategory === null ? 'active' : ''}`} onClick={() => setSelectedCategory(null)}>All</button>
              {allCategories.map((category) => (
                <button key={category} className={`category-btn ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}>{category}</button>
              ))}
            </div>
          </div>
        )}
      </section>

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
              {searchQuery || selectedTag || selectedCategory ? 'Try adjusting your filters' : 'Add some posts to your Notion database to get started.'}
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
  );
}
