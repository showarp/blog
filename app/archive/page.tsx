'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';

export default function Archive() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group posts by year
  const postsByYear = posts.reduce((acc, post) => {
    const year = post.date ? new Date(post.date).getFullYear() : 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

  const sortedYears = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  if (loading) {
    return (
      <div className="container">
        <div className="home-loading-wrapper">
          <div className="loading-spinner" />
          <p>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="archive-header">
        <h1>Archive</h1>
        <p>All articles, organized by year</p>
      </section>

      {posts.length === 0 ? (
        <div className="archive-empty">
          <p>No articles found. Add posts to your Notion database.</p>
        </div>
      ) : (
        <section className="archive-list">
          {sortedYears.map(year => (
            <div key={year} className="archive-year">
              <h2 className="year-label">{year}</h2>
              <div className="year-posts">
                {postsByYear[year].map(post => (
                  <Link key={post.id} href={`/post/${post.slug}`} className="archive-item">
                    <span className="archive-date">{formatDate(post.date)}</span>
                    <span className="archive-separator">——</span>
                    <span className="archive-title">{post.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <style jsx>{`
        .archive-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }
        .archive-header {
          padding: 60px 0 40px;
          text-align: center;
        }
        .archive-header h1 {
          font-size: 42px;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        .archive-header p {
          color: var(--text-secondary);
          font-size: 16px;
        }
        .archive-empty {
          text-align: center;
          padding: 60px 0;
          color: var(--text-muted);
        }
        .archive-list {
          max-width: 700px;
          margin: 0 auto;
          padding: 32px 0;
        }
        .archive-year {
          margin-bottom: 40px;
        }
        .year-label {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--accent);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .year-posts {
          display: flex;
          flex-direction: column;
        }
        .archive-item {
          display: flex;
          gap: 24px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
          align-items: baseline;
        }
        .archive-date {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-muted);
          min-width: 140px;
          margin-right: 16px;
        }
        .archive-separator {
          color: var(--accent);
          margin-right: 16px;
          font-family: var(--font-mono);
        }
        .archive-item:hover {
          background: var(--bg-secondary);
          padding-left: 12px;
          padding-right: 12px;
          margin-left: -12px;
          margin-right: -12px;
        }
        .archive-title {
          font-size: 16px;
          color: var(--text-primary);
        }
        @media (max-width: 600px) {
          .archive-item {
            flex-direction: column;
            gap: 4px;
          }
          .archive-date {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
