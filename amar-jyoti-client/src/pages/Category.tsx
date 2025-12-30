import React, { useState, useEffect } from 'react';
// 👇 1. keepPreviousData yahan se import karein
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
// 👇 2. ProductsResponse interface import karein
import { fetchProducts, type ProductsResponse } from '../api/products.api';
import ProductCard from '../components/product/ProductCard';
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// Saree Types List
const SAREE_TYPES = [
  "Banarasi Saree", "Silk Saree", "Banarasi Silk Saree", "Cotton Saree", "Chiffon Saree", 
  "Georgette Saree", "Linen Saree", "Organza Saree", "Crepe Saree", 
  "Satin Saree", "Net Saree"
];

const Category: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  
  // Pagination State
  const [page, setPage] = useState<number>(1);

  // Check for Saree Category
  const isSareeCategory = categoryParam?.toLowerCase().includes('saree'); 

  // Reset page to 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [categoryParam, selectedSubcategory, sortBy]);

  // ✅ 3. Typed useQuery & Fixed keepPreviousData
  const { data, isLoading, isError } = useQuery<ProductsResponse>({
    queryKey: ['products', categoryParam, sortBy, selectedSubcategory, page],
    queryFn: () => fetchProducts({
      category: categoryParam || undefined,
      sortBy,
      subcategory: selectedSubcategory || undefined,
      page: page, 
      limit: 12   
    }),
    // ⚠️ OLD (Error): keepPreviousData: true, 
    // ✅ NEW (Fix):
    placeholderData: keepPreviousData, 
    staleTime: 1000 * 60 * 5, 
  });

  // Extract Data
  const products = data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-subtle-text/10 pb-6">
          
          {/* Title & Product Count */}
          <div>
            <h1 className="text-4xl font-serif text-dark capitalize mb-2">
              {categoryParam ? `${categoryParam} Collection` : 'All Products'}
            </h1>
            <p className="text-subtle-text">
              {isLoading ? 'Loading inventory...' : `${pagination?.totalProducts || 0} items found`}
            </p>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap gap-4">
            
            {/* Saree Type Filter */}
            {isSareeCategory && (
                <div className="relative group animate-in fade-in slide-in-from-top-2">
                  <select 
                    className="appearance-none bg-accent/5 border border-accent/20 pl-4 pr-10 py-2 rounded-md text-sm font-medium text-dark focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent cursor-pointer min-w-45"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                  >
                    <option value="">All Saree Types</option>
                    {SAREE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-accent absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            )}

            {/* Sort Filter */}
            <div className="relative group">
              <select 
                className="appearance-none bg-white border border-subtle-text/20 pl-4 pr-10 py-2 rounded-md text-sm focus:outline-none focus:border-accent cursor-pointer min-w-40"
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
            {[...Array(8)].map((_, i) => (
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
            <p className="text-sm text-subtle-text">Please check your internet connection.</p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          // Empty State
          !isLoading && !isError && (
            <div className="text-center py-24">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Filter className="w-8 h-8" />
               </div>
              <h2 className="text-2xl font-serif text-dark mb-2">No products found</h2>
              <p className="text-subtle-text max-w-md mx-auto">
                Try selecting "All Saree Types" or check back later.
              </p>
              {selectedSubcategory && (
                  <button 
                    onClick={() => setSelectedSubcategory('')}
                    className="mt-4 text-accent font-bold hover:underline"
                  >
                    Clear Filter
                  </button>
              )}
            </div>
          )
        )}

        {/* Pagination Controls */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-16 border-t border-gray-100 pt-8">
                
                {/* Previous Button */}
                <button
                    onClick={() => setPage(old => Math.max(old - 1, 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-dark hover:bg-dark hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-dark disabled:cursor-not-allowed transition-all duration-300"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                {/* Page Info */}
                <span className="text-sm font-serif tracking-wide text-gray-500">
                    Page <span className="text-dark font-bold">{pagination.currentPage}</span> of {pagination.totalPages}
                </span>

                {/* Next Button */}
                <button
                    onClick={() => setPage(old => (pagination.totalPages > old ? old + 1 : old))}
                    disabled={page === pagination.totalPages}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-dark hover:bg-dark hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-dark disabled:cursor-not-allowed transition-all duration-300"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default Category;