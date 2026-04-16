import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiUpload, FiFolder, FiGrid, FiLogOut, FiPlus } from 'react-icons/fi';

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('/api/admin/categories', 
        { name: newCatName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Category added!');
        setNewCatName('');
        setShowAddCategory(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="flex h-full">
        <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 space-y-8">
          <div className="text-2xl font-bold text-blue-500">Pngwale Admin</div>
          
          <nav className="space-y-2">
            <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl transition-all">
              <FiGrid /> Dashboard
            </Link>
            <Link to="/admin/upload" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all">
              <FiUpload /> Upload Images
            </Link>
          </nav>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-all w-full"
          >
            <FiLogOut /> Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back, Admin</h1>
              <p className="text-slate-400 mt-1">Manage your categories and images from here.</p>
            </div>
            
            <button 
              onClick={() => setShowAddCategory(true)}
              className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30"
            >
              <FiPlus /> Add Category
            </button>
          </header>

          {/* Categories Grid */}
          <section>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiFolder className="text-blue-500" /> Image Categories
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map(cat => (
                  <Link 
                    key={cat._id}
                    to={`/admin/upload?categoryId=${cat._id}`}
                    className="group relative h-32 bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition-all overflow-hidden"
                  >
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">Click to upload here</p>
                    </div>
                    <FiFolder className="absolute -bottom-4 -right-4 text-8xl text-slate-900 group-hover:text-slate-700/50 transition-all opacity-20" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl skew-y-0 rotate-0">
            <h2 className="text-2xl font-bold mb-6">Create New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Festival, Backgrounds" 
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
