'use client';
import { ReactNode } from 'react';
import { FilterProvider } from '@/contexts/FilterContext';
import Header from '@/components/Header';

interface LayoutClientProps {
  children: ReactNode;
  tags: string[];
  categories: string[];
}

export default function LayoutClient({ children, tags, categories }: LayoutClientProps) {
  return (
    <FilterProvider>
      <Header tags={tags} categories={categories} />
      {children}
    </FilterProvider>
  );
}
