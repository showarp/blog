'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useFilter } from '@/contexts/FilterContext';
import FilterMenu from './FilterMenu';

interface HeaderProps {
  tags: string[];
  categories: string[];
}

export default function Header({ tags, categories }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery, selectedTag, setSelectedTag, selectedCategory, setSelectedCategory } = useFilter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const inPopup = popupRef.current?.contains(event.target as Node);
      const searchButton = document.querySelector('.action-button');
      const inSearchButton = searchButton?.contains(event.target as Node);
      // Check for any filter menu (popup or desktop variant inside search popup)
      const filterMenus = document.querySelectorAll('.filter-menu .filter-menu-item');
      let inFilterMenu = false;
      filterMenus.forEach(menu => {
        if (menu.contains(event.target as Node)) inFilterMenu = true;
      });

      console.log('[Header] handleClickOutside:', {
        target: (event.target as HTMLElement).className,
        targetTag: (event.target as HTMLElement).tagName,
        inPopup,
        inSearchButton,
        inFilterMenu,
        filterMenusLength: filterMenus.length
      });

      // Don't close if clicking inside the popup
      if (inPopup) return;
      // Don't close if clicking the search trigger button
      if (inSearchButton) return;
      // Don't close if clicking inside the filter menu (tags/categories dropdown)
      if (inFilterMenu) return;

      setSearchPopupOpen(false);
    };

    if (searchPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchPopupOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const toggleSearchPopup = () => {
    if (searchPopupOpen) {
      closeSearchPopup();
    } else {
      setSearchPopupOpen(true);
      setIsClosing(false);
    }
  };

  const closeSearchPopup = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setSearchPopupOpen(false);
      setIsClosing(false);
    }, 250);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          {/* Logo */}
          <Link href="/" className="logo">
            <span className="logo-mark">/</span>
            <span className="logo-text">blog</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav-desktop">
            <Link href="/" className="nav-link">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Home</span>
            </Link>
            <Link href="/about" className="nav-link">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>About</span>
            </Link>
            <Link href="/archive" className="nav-link">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span>Archive</span>
            </Link>

            {/* Action Buttons Group - Search and Theme Toggle */}
            <div className="header-actions">
              {/* Search Popup Trigger */}
              <button
                className="action-button"
                onClick={toggleSearchPopup}
                aria-label="Toggle search"
                aria-expanded={searchPopupOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>

              {/* Search Popup */}
              {searchPopupOpen && (
                <div ref={popupRef} className={`search-popup ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                  <div className="search-popup-header">
                    <span className="search-popup-title">Search & Filter</span>
                    <button
                      className="search-popup-close"
                      onClick={closeSearchPopup}
                      aria-label="Close search"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div className="search-popup-content">
                    <div className="search-popup-input-wrapper">
                      <svg className="search-popup-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                      <input
                        type="text"
                        className="search-popup-input"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    </div>
                    <div className="search-popup-filters">
                      <FilterMenu tags={tags} categories={categories} variant="popup" />
                    </div>
                    <button className="search-submit-btn" onClick={() => {
                      const params = new URLSearchParams();
                      if (searchQuery) params.set('q', searchQuery);
                      if (selectedTag) params.set('tag', selectedTag);
                      if (selectedCategory) params.set('category', selectedCategory);

                      const queryString = params.toString();
                      // Navigate to homepage with search params and hash for scrolling
                      // scroll: false prevents Next.js from scrolling to top
                      router.push(`/?${queryString}#posts`, { scroll: false });
                      closeSearchPopup();
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              )}

              {mounted && (
                <button
                  className="theme-toggle"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"/>
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 18"/>
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="header-search-mobile">
              <svg className="header-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
              />
            </div>
            <FilterMenu tags={tags} categories={categories} variant="mobile" />
            <div className="mobile-nav-links">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/archive" onClick={() => setMobileMenuOpen(false)}>
                Archive
              </Link>
              {mounted && (
                <button
                  className="mobile-theme-toggle"
                  onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMobileMenuOpen(false); }}
                >
                  <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {theme === 'dark' ? (
                      <>
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                      </>
                    ) : (
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    )}
                  </svg>
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
