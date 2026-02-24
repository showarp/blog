'use client';
import { useState, useEffect, useRef } from 'react';
import { useFilter } from '@/contexts/FilterContext';

interface FilterMenuProps {
  tags: string[];
  categories: string[];
  variant?: 'desktop' | 'mobile';
}

export default function FilterMenu({ tags, categories, variant = 'desktop' }: FilterMenuProps) {
  const { selectedTag, setSelectedTag, selectedCategory, setSelectedCategory } = useFilter();
  const [tagOpen, setTagOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) setTagOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDesktop = variant === 'desktop';

  return (
    <div className={`filter-menu ${variant}`}>
      {/* Tag Filter */}
      <div className="filter-menu-item" ref={tagRef}>
        <button
          className="filter-menu-trigger"
          onClick={() => setTagOpen(!tagOpen)}
          aria-expanded={tagOpen}
          aria-label="Filter by tag"
        >
          <svg className="filter-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span className="filter-menu-label">{selectedTag || 'Tags'}</span>
          <svg className={`filter-menu-arrow ${tagOpen ? 'rotate' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {tagOpen && (
          <div className="filter-menu-dropdown">
            <button
              className={`filter-menu-option ${!selectedTag ? 'active' : ''}`}
              onClick={() => { setSelectedTag(null); setTagOpen(false); }}
            >
              All Tags
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                className={`filter-menu-option ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => { setSelectedTag(tag); setTagOpen(false); }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-menu-item" ref={categoryRef}>
        <button
          className="filter-menu-trigger"
          onClick={() => setCategoryOpen(!categoryOpen)}
          aria-expanded={categoryOpen}
          aria-label="Filter by category"
        >
          <svg className="filter-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span className="filter-menu-label">{selectedCategory || 'Category'}</span>
          <svg className={`filter-menu-arrow ${categoryOpen ? 'rotate' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {categoryOpen && (
          <div className="filter-menu-dropdown">
            <button
              className={`filter-menu-option ${!selectedCategory ? 'active' : ''}`}
              onClick={() => { setSelectedCategory(null); setCategoryOpen(false); }}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-menu-option ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
