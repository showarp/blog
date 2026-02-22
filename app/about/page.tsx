'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AboutInfo } from '@/types';

export default function About() {
  const [about, setAbout] = useState<AboutInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        setAbout(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="home-loading-wrapper">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!about) {
    return (
      <div className="container">
        <div className="about-empty">
          <h1>About</h1>
          <p>No about information found. Add data to your Notion database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="about-hero">
        <div className="about-content-wrapper">
          {about.avatar && (
            <div className="about-avatar">
              <img src={about.avatar} alt={about.name} className="avatar-image" />
            </div>
          )}
          <h1 className="about-name">{about.name}</h1>
          <p className="about-bio">{about.bio}</p>
          {about.bioExtended && <p className="about-bio-extended">{about.bioExtended}</p>}
        </div>
      </section>

      <section className="about-contact">
        <h2>Get in Touch</h2>
        <div className="contact-list">
          {about.email && (
            <a href={`mailto:${about.email}`} className="contact-item">
              <span className="contact-label">Email</span>
              <span className="contact-value">{about.email}</span>
            </a>
          )}
          {about.github && (
            <a href={about.github} target="_blank" rel="noopener noreferrer" className="contact-item">
              <span className="contact-label">GitHub</span>
              <span className="contact-value">{about.github}</span>
            </a>
          )}
          {about.leetcode && (
            <a href={about.leetcode} target="_blank" rel="noopener noreferrer" className="contact-item">
              <span className="contact-label">LeetCode</span>
              <span className="contact-value">{about.leetcode}</span>
            </a>
          )}
          {about.wechat && (
            <div className="contact-item">
              <span className="contact-label">WeChat</span>
              <span className="contact-value">{about.wechat}</span>
            </div>
          )}
          {about.qq && (
            <div className="contact-item">
              <span className="contact-label">QQ</span>
              <span className="contact-value">{about.qq}</span>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .about-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }
        .about-empty {
          text-align: center;
          padding: 80px 0;
        }
        .about-empty h1 {
          font-size: 32px;
          margin-bottom: 16px;
        }
        .about-empty p {
          color: var(--text-muted);
        }
        .about-hero {
          text-align: center;
          padding: 60px 0;
        }
        .about-content-wrapper {
          padding: 40px 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .about-avatar {
          position: relative;
          margin: 0 auto 24px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--accent);
        }
        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .about-name {
          font-size: 36px;
          margin-bottom: 16px;
        }
        .about-bio {
          font-size: 18px;
          color: var(--text-primary);
          max-width: 600px;
          margin: 0 auto 16px;
        }
        .about-bio-extended {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.8;
        }
        .about-contact {
          max-width: 500px;
          margin: 0 auto;
          padding: 40px 0;
        }
        .about-contact h2 {
          font-size: 24px;
          margin-bottom: 24px;
          text-align: center;
        }
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contact-item {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .contact-item:hover {
          border-color: var(--accent);
        }
        .contact-label {
          font-family: var(--font-mono);
          font-size: 12px;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .contact-value {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
