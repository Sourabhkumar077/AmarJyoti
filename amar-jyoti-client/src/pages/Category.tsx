import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products.api';
import ProductCard from '../components/product/ProductCard';
import { ChevronDown, Filter } from 'lucide-react';

// Saree Types List
const SAREE_TYPES = [
  "Banarasi Saree", "Silk Saree","Banarasi Silk Saree", "Cotton Saree", "Chiffon Saree", 
  "Georgette Saree", "Linen Saree", "Organza Saree", "Crepe Saree", 
  "Satin Saree", "Net Saree"
];

const Category: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // ✅ Check if Category is Saree
  const isSareeCategory = categoryParam?.toLowerCase().includes('saree'); 

  // React Query
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', categoryParam, sortBy, selectedSubcategory],
    queryFn: () => fetchProducts({
      category: categoryParam || undefined,
      sortBy,
      subcategory: selectedSubcategory || undefined
    }),
    staleTime: 1000 * 60 * 5, 
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-subtle-text/10 pb-6">
          
          {/* Title & Count */}
          <div>
            <h1 className="text-4xl font-serif text-dark capitalize mb-2">
              {categoryParam ? `${categoryParam} Collection` : 'All Products'}
            </h1>
            <p className="text-subtle-text">
              {isLoading ? 'Loading inventory...' : `${products?.length || 0} items found`}
            </p>
          </div>

          {/* ✅ FILTERS & SORTING (Right Side) */}
          <div className="flex flex-wrap gap-4">
            
            {/* 1. SAREE TYPE DROPDOWN (Only Visible for Sarees) */}
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

            {/* 2. SORT DROPDOWN (Always Visible) */}
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

        {isError && (
          <div className="text-center py-20 bg-red-50 rounded-lg">
            <h3 className="text-error font-medium mb-2">Unable to load products</h3>
            <p className="text-sm text-subtle-text">Please check your internet connection.</p>
          </div>
        )}

        {/* PRODUCTS LIST */}
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

      </div>
    </div>
  );
};

export default Category;