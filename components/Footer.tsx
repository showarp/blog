'use client';

import { useState, useEffect } from 'react';
import { AboutInfo } from '@/types';

export default function Footer() {
  const [about, setAbout] = useState<AboutInfo | null>(null);

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        setAbout(data);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-mark">/</span>
            <span>blog</span>
          </div>
          <div className="footer-links">
            {about?.github && (
              <a href={about.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
            {about?.leetcode && (
              <a href={about.leetcode} target="_blank" rel="noopener noreferrer">LeetCode</a>
            )}
            {about?.email && (
              <a href={`mailto:${about.email}`}>Email</a>
            )}
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
