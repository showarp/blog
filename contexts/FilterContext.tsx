'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface FilterState {
  searchQuery: string;
  selectedTag: string | null;
  selectedCategory: string | null;
}

interface FilterContextValue extends FilterState {
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FilterState>({
    searchQuery: '',
    selectedTag: null,
    selectedCategory: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from URL on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setState({
        searchQuery: params.get('q') || '',
        selectedTag: params.get('tag'),
        selectedCategory: params.get('category'),
      });
      setIsInitialized(true);
    }
  }, []);

  const updateUrl = useCallback((newState: FilterState) => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (newState.searchQuery) params.set('q', newState.searchQuery);
    if (newState.selectedTag) params.set('tag', newState.selectedTag);
    if (newState.selectedCategory) params.set('category', newState.selectedCategory);

    const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => {
      const newState = { ...prev, searchQuery: query };
      updateUrl(newState);
      return newState;
    });
  }, [updateUrl]);

  const setSelectedTag = useCallback((tag: string | null) => {
    setState(prev => {
      const newState = { ...prev, selectedTag: tag };
      updateUrl(newState);
      return newState;
    });
  }, [updateUrl]);

  const setSelectedCategory = useCallback((category: string | null) => {
    setState(prev => {
      const newState = { ...prev, selectedCategory: category };
      updateUrl(newState);
      return newState;
    });
  }, [updateUrl]);

  const clearFilters = useCallback(() => {
    const emptyState = { searchQuery: '', selectedTag: null, selectedCategory: null };
    setState(emptyState);
    updateUrl(emptyState);
  }, [updateUrl]);

  // Don't render children until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <FilterContext.Provider value={{ ...state, setSearchQuery, setSelectedTag, setSelectedCategory, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
