import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Plus, Edit, Trash2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAdminProducts, deleteProduct } from '../../api/admin.api';
import Loader from '../../components/common/Loader';
import type { Product } from '../../api/products.api';
import toast from 'react-hot-toast';

const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminProducts', page],
    queryFn: () => fetchAdminProducts({ page, limit }),
    placeholderData: keepPreviousData,
  });

  const products = data?.products || [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success("Product deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete product");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg">
        <h3 className="font-bold">Error Loading Products</h3>
        <p className="text-sm">{(error as Error).message || "Could not fetch inventory."}</p>
        <p className="text-xs mt-2">Check if your Backend server is running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-serif text-dark">Inventory Management</h1>
           <p className="text-sm text-subtle-text mt-1">
             Total {pagination?.totalProducts || 0} Products
           </p>
        </div>
        <Link 
          to="/admin/products/new" 
          className="bg-accent text-white px-4 py-2 rounded-md flex items-center hover:bg-yellow-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? (
                products.map((product :Product) => (
                  <tr key={product._id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/40'} 
                        alt="" 
                        className="w-10 h-10 rounded object-cover bg-gray-100" 
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">{product.name}</td>
                    <td className="px-6 py-4 text-subtle-text">
                        {product.category?.name || 'Uncategorized'}
                        {product.subcategory && <span className="block text-xs text-gray-400">{product.subcategory}</span>}
                    </td>
                    <td className="px-6 py-4">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      {product.stock === 0 ? (
                        <span className="text-red-500 font-bold flex items-center">
                          Out of Stock
                        </span>
                      ) : product.stock < 5 ? (
                        <span className="text-orange-500 font-bold flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {product.stock}
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">{product.stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <Link to={`/admin/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-subtle-text">
                     No products found. Start adding some!
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalProducts)}</span> of <span className="font-medium">{pagination.totalProducts}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => setPage(old => Math.max(old - 1, 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 bg-white focus:outline-offset-0">
                                {page}
                            </span>
                            <button
                                onClick={() => setPage(old => (pagination.totalPages > old ? old + 1 : old))}
                                disabled={page === pagination.totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;