import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products.api';
import ProductCard from '../components/product/ProductCard';
import {  ChevronDown } from 'lucide-react';

const Category: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [sortBy, setSortBy] = useState<string>('newest');

  // React Query Hook
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['products', categoryParam, sortBy],
    queryFn: () => fetchProducts({
      category: categoryParam || undefined,
      sortBy
    }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <div className="min-h-screen py-8">
      {/* Used your .container class */}
      <div className="container">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-subtle-text/10 pb-6">
          <div>
            <h1 className="text-4xl font-serif text-dark capitalize mb-2">
              {categoryParam ? `${categoryParam} Collection` : 'All Products'}
            </h1>
            <p className="text-subtle-text">
              {isLoading ? 'Loading inventory...' : `${products?.length || 0} items found`}
            </p>
          </div>

          <div className="flex gap-4">
             {/* Sort Dropdown */}
            <div className="relative group">
              <select 
                className="appearance-none bg-white border border-subtle-text/20 pl-4 pr-10 py-2 rounded-md text-sm focus:outline-none focus:border-accent cursor-pointer min-w-45"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-subtle-text absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-3/4 rounded-md mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20 bg-red-50 rounded-lg">
            <h3 className="text-error font-medium mb-2">Unable to load products</h3>
            <p className="text-sm text-subtle-text">Please check your internet connection or try again later.</p>
          </div>
        )}

        {/* Product Grid */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products?.length === 0 && (
          <div className="text-center py-24">
            <h2 className="text-2xl font-serif text-subtle-text mb-4">No products found</h2>
            <p className="text-subtle-text max-w-md mx-auto">
              We couldn't find any items in this category. Try checking back later or browsing our other collections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;