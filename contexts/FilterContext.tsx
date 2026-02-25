'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [state, setState] = useState<FilterState>({
    searchQuery: searchParams.get('q') || '',
    selectedTag: searchParams.get('tag'),
    selectedCategory: searchParams.get('category'),
  });

  // Sync state when URL params change (from external navigation)
  useEffect(() => {
    setState({
      searchQuery: searchParams.get('q') || '',
      selectedTag: searchParams.get('tag'),
      selectedCategory: searchParams.get('category'),
    });
  }, [searchParams]);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedTag = useCallback((tag: string | null) => {
    setState(prev => ({ ...prev, selectedTag: tag }));
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const clearFilters = useCallback(() => {
    setState({ searchQuery: '', selectedTag: null, selectedCategory: null });
  }, []);

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
