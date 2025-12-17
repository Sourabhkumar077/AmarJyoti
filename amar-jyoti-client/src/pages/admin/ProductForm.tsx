import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductById } from '../../api/products.api';
import { createProduct, updateProduct } from '../../api/admin.api';
import { ArrowLeft, Save } from 'lucide-react';

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // If ID exists, we are editing
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '', // You would ideally use a Category ID here
    fabric: '',
    colors: '', // Comma separated string
    image1: '', // URL 1
    image2: '', // URL 2
  });

  // Fetch data if editing
  useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: isEditMode,
    // When data loads, fill the form
  });
  
  // NOTE: In a real app, use `useEffect` or `onSuccess` in useQuery to setFormData
  // For simplicity, we assume you are adding new products mostly.

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // Format data for Backend
      const payload = {
         ...data,
         colors: data.colors.split(',').map((c: string) => c.trim()),
         images: [data.image1, data.image2].filter(Boolean)
      };
      
      if (isEditMode) return updateProduct(id!, payload);
      return createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      navigate('/admin/products');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin/products')} className="flex items-center text-subtle-text hover:text-dark mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
      </button>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-serif text-dark mb-6">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input 
                required
                type="text" 
                className="w-full border p-2 rounded"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category (ID)</label>
              <input 
                required
                type="text" 
                placeholder="Paste Category ID (e.g., 65a...)"
                className="w-full border p-2 rounded"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
              <p className="text-xs text-subtle-text mt-1">Saree, Suit, or Lehenga ID</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full border p-2 rounded"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input 
                required
                type="number" 
                className="w-full border p-2 rounded"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input 
                required
                type="number" 
                className="w-full border p-2 rounded"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
              <p className="text-xs text-subtle-text mt-1">Set to 0 to make "Out of Stock"</p>
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">Fabric</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded"
                value={formData.fabric}
                onChange={e => setFormData({...formData, fabric: e.target.value})}
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium mb-3">Product Images</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-subtle-text mb-1">Main Image URL</label>
                <input 
                  required
                  type="url" 
                  placeholder="https://ik.imagekit.io/..."
                  className="w-full border p-2 rounded"
                  value={formData.image1}
                  onChange={e => setFormData({...formData, image1: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-subtle-text mb-1">Second Image URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://ik.imagekit.io/..."
                  className="w-full border p-2 rounded"
                  value={formData.image2}
                  onChange={e => setFormData({...formData, image2: e.target.value})}
                />
              </div>
            </div>
          </div>

           <div>
              <label className="block text-sm font-medium mb-1">Colors (Comma separated)</label>
              <input 
                type="text" 
                placeholder="Red, Gold, Blue"
                className="w-full border p-2 rounded"
                value={formData.colors}
                onChange={e => setFormData({...formData, colors: e.target.value})}
              />
            </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="bg-accent text-white px-8 py-3 rounded-md hover:bg-yellow-600 transition-colors flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {mutation.isPending ? 'Saving...' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;