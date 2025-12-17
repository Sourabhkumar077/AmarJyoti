import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAdminProducts, deleteProduct } from '../../api/admin.api';
import Loader from '../../components/common/Loader';
import type { Product } from '../../api/products.api';

const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();

  // 1. Destructure 'isError' and 'error' to catch API failures
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: fetchAdminProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Loader />;

  // 2. Handle API Errors explicitly so the app doesn't crash
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-dark">Inventory Management</h1>
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
              {products?.map((product :Product) => (
                <tr key={product._id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    {/* 3. Safer Image Handling: Check if images exist before accessing [0] */}
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/40'} 
                      alt="" 
                      className="w-10 h-10 rounded object-cover bg-gray-100" 
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-dark">{product.name}</td>
                  {/* 4. Safer Category Access */}
                  <td className="px-6 py-4 text-subtle-text">{product.category?.name || 'Uncategorized'}</td>
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
              ))}
            </tbody>
          </table>
        </div>
        {(!products || products.length === 0) && (
           <div className="p-8 text-center text-subtle-text">No products found. Start adding some!</div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;