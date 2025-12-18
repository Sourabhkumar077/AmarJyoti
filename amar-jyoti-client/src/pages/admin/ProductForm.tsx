import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct, uploadImage } from '../../api/admin.api'; // Added uploadImage
import { ArrowLeft, Save, UploadCloud, X, Loader2 } from 'lucide-react'; // Added icons
import { fetchProductById, fetchCategories } from '../../api/products.api';

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Loading State for Image Uploads
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    fabric: '',
    colors: '',
    image1: '',
    image2: '',
  });

  
  // Fetch Categories for the Dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  // ----------------------------------

  //  Fetch Product Data (if editing)
  const { data: existingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: isEditMode,
  });

  // Populate form when editing data loads
  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price,
        stock: existingProduct.stock,
        category: typeof existingProduct.category === 'object' ? existingProduct.category._id : existingProduct.category,
        fabric: existingProduct.fabric || '',
        colors: existingProduct.colors ? existingProduct.colors.join(', ') : '',
        image1: existingProduct.images?.[0] || '',
        image2: existingProduct.images?.[1] || '',
      });
    }
  }, [existingProduct]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
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
    },
    onError: (err: any) => {
      alert("Failed to save product: " + (err.response?.data?.message || err.message));
    }
  });

  // HANDLER: Handle File Selection & Auto-Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image1' | 'image2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadImage(file);
      // Save the URL returned from backend to the form state
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
    } catch (error) {
      console.error(error);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image1) {
      alert("Please upload at least one main image.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
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
                className="w-full border p-2 rounded focus:ring-accent focus:border-accent"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            {/* --- CHANGED: CATEGORY DROPDOWN --- */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                required
                className="w-full border p-2 rounded focus:ring-accent focus:border-accent bg-white"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {isLoadingCategories ? (
                  <option disabled>Loading...</option>
                ) : (
                  categories?.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            {/* ---------------------------------- */}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full border p-2 rounded focus:ring-accent focus:border-accent"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input
                required
                type="number"
                className="w-full border p-2 rounded focus:ring-accent focus:border-accent"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
                required
                type="number"
                className="w-full border p-2 rounded focus:ring-accent focus:border-accent"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fabric</label>
              <input
                type="text"
                className="w-full border p-2 rounded focus:ring-accent focus:border-accent"
                value={formData.fabric}
                onChange={e => setFormData({ ...formData, fabric: e.target.value })}
              />
            </div>
          </div>

          {/* --- NEW IMAGE UPLOADER SECTION --- */}
          <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-sm font-medium mb-4 flex items-center text-dark">
              <UploadCloud className="w-4 h-4 mr-2" /> Product Images
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Image 1 */}
              <div>
                <label className="block text-xs uppercase text-subtle-text mb-2 font-bold">Main Image *</label>
                {formData.image1 ? (
                  <div className="relative group">
                    <img src={formData.image1} alt="Main" className="w-full h-48 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image1: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-500">Click to upload main image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image1')} />
                  </label>
                )}
              </div>

              {/* Image 2 */}
              <div>
                <label className="block text-xs uppercase text-subtle-text mb-2 font-bold">Secondary Image</label>
                {formData.image2 ? (
                  <div className="relative group">
                    <img src={formData.image2} alt="Secondary" className="w-full h-48 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image2: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-500">Click to upload secondary</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image2')} />
                  </label>
                )}
              </div>

            </div>
          </div>
          {/* ---------------------------------- */}

          <div>
            <label className="block text-sm font-medium mb-1">Colors (Comma separated)</label>
            <input
              type="text"
              placeholder="Red, Gold, Blue"
              className="w-full border p-2 rounded focus:ring-accent focus:border-accent"
              value={formData.colors}
              onChange={e => setFormData({ ...formData, colors: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || isUploading}
            className="bg-accent text-white px-8 py-3 rounded-md hover:bg-yellow-600 transition-colors flex items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" /> Save Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;