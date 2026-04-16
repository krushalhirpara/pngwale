import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiUpload, FiImage, FiTag, FiFolder, FiLock, FiX, FiCheckCircle, FiFileText, FiPlus } from 'react-icons/fi';

const AdminUpload = () => {
  console.log("AdminUpload: Rendering component...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategoryId = searchParams.get('categoryId') || '';

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: initialCategoryId,
    tags: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("AdminUpload: Fetching categories...");
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/admin/categories');
        console.log("AdminUpload: Categories received", response.data.data);
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("AdminUpload: Category fetch error", error);
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Filter for images and zips
    const validFiles = selectedFiles.filter(file =>
      file.type.startsWith('image/') ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed'
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Some files were rejected. Only images and ZIP files are allowed.');
    }

    setFiles(prev => [...prev, ...validFiles]);

    // Create previews for images
    const newPreviews = validFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => URL.createObjectURL(file));

    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const removedFile = newFiles.splice(index, 1)[0];
    setFiles(newFiles);

    if (removedFile.type.startsWith('image/')) {
      // This logic is a bit simple for previews, but works for basic UI
      setPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) return toast.error('Please select at least one file');
    if (!formData.categoryId) return toast.error('Please select a category');

    setLoading(true);
    const toastId = toast.loading(`Uploading ${files.length} files...`);

    try {
      const token = localStorage.getItem('adminToken');
      const data = new FormData();

      files.forEach(file => {
        data.append('files', file);
      });
      data.append('categoryId', formData.categoryId || categoryId);
      data.append('tags', formData.tags);

      const response = await axios.post('http://localhost:5000/api/admin/upload', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message, { id: toastId });
        setFiles([]);
        setPreviews([]);
        setFormData({ ...formData, tags: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiUpload className="text-blue-500" /> Advanced Upload
            </h1>
            <p className="text-slate-400 mt-2">Upload images, multiple files, or ZIP archives.</p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FiTag className="text-blue-500" /> Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Default Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">These tags will apply to all images in this batch.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || files.length === 0}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg transition-all ${loading || files.length === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40'
                }`}
            >
              {loading ? 'Processing...' : `Upload ${files.length} Assets`}
            </button>
          </div>

          {/* Right Column: File Selection & Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center hover:border-blue-500 transition-all cursor-pointer relative"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <FiPlus className="text-2xl text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Select Files</h3>
                <p className="text-slate-400 mt-2">Drop images or ZIP files here to upload</p>
                <div className="flex gap-4 mt-6 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> PNG / JPG / WEBP</span>
                  <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> Bulk ZIP Support</span>
                </div>
              </div>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  Selected Files ({files.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative group bg-slate-900 rounded-xl border border-slate-700 overflow-hidden aspect-square flex flex-col items-center justify-center p-2">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-full object-cover rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <FiFileText className="text-4xl text-blue-500" />
                          <span className="text-[10px] text-center truncate w-full px-2">{file.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUpload;