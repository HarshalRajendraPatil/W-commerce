import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchVendorProducts,
  updateProductStatus,
  updateProductStock,
  deleteProduct
} from '../../redux/slices/vendorProductsSlice';
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiBarChart2
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';

const VendorProducts = () => {
  const dispatch = useDispatch();
  const { products, statusCounts, pagination, loading, error } = useSelector(
    (state) => state.vendorProducts
  );

  // Local state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [newStockValue, setNewStockValue] = useState(0);

  // Fetch products on initial load and when filters change
  useEffect(() => {
    const params = {
      page: page,
      limit: rowsPerPage,
      sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
      ...(searchTerm && { search: searchTerm }),
      ...(category !== 'all' && { category }),
      ...(stockFilter !== 'all' && { stockStatus: stockFilter }),
      ...(statusFilter !== 'all' && { published: statusFilter === 'published' })
    };
    
    dispatch(fetchVendorProducts(params));
  }, [
    dispatch,
    page,
    rowsPerPage,
    searchTerm,
    category,
    stockFilter,
    statusFilter,
    sortBy,
    sortOrder
  ]);

  // Handle pagination change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setCategory(value);
        break;
      case 'stock':
        setStockFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      case 'order':
        setSortOrder(value);
        break;
      default:
        break;
    }
    setPage(1);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  // Handle product deletion
  const handleDeleteConfirm = () => {
    dispatch(deleteProduct(selectedProduct._id))
      .unwrap()
      .then(() => {
        toast.success('Product deleted successfully');
        setOpenDeleteDialog(false);
        setSelectedProduct(null);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to delete product');
      });
  };

  // Handle product status toggle
  const handleStatusToggle = (product) => {
    dispatch(updateProductStatus({ id: product._id, published: !product.published }))
      .unwrap()
      .then(() => {
        toast.success(`Product ${product.published ? 'unpublished' : 'published'} successfully`);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update product status');
      });
  };

  // Open stock update dialog
  const handleStockClick = (product) => {
    setSelectedProduct(product);
    setNewStockValue(product.stockCount);
    setStockDialogOpen(true);
  };

  // Handle stock update
  const handleStockUpdate = () => {
    dispatch(updateProductStock({ id: selectedProduct._id, stockCount: newStockValue }))
      .unwrap()
      .then(() => {
        toast.success('Stock updated successfully');
        setStockDialogOpen(false);
        setSelectedProduct(null);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update stock');
      });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="p-3">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Products
          </h1>
          <Link 
            to="/vendor/products/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2"
          >
            <FiPlus className="text-lg" /> Add New Product
          </Link>
        </div>
        
        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-4">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div className="md:col-span-2">
            <select
              className="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              {/* Add your categories here */}
            </select>
          </div>
          <div className="md:col-span-2">
            <select
              className="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={stockFilter}
              onChange={(e) => handleFilterChange('stock', e.target.value)}
            >
              <option value="all">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <select
              className="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <select
              className="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="createdAt">Sort by: Date</option>
              <option value="price">Sort by: Price</option>
              <option value="name">Sort by: Name</option>
              <option value="stockCount">Sort by: Stock</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm mb-1">Total Products</h3>
            <p className="text-2xl font-bold">{statusCounts?.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm mb-1">Published</h3>
            <p className="text-2xl font-bold">{statusCounts?.published || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm mb-1">Drafts</h3>
            <p className="text-2xl font-bold">{statusCounts?.draft || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm mb-1">Low Stock</h3>
            <p className="text-2xl font-bold">{statusCounts?.lowStock || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm mb-1">Out of Stock</h3>
            <p className="text-2xl font-bold">{statusCounts?.outOfStock || 0}</p>
          </div>
        </div>
        
        {/* Products Table */}
        <div className="bg-white shadow rounded overflow-hidden">
          {loading ? (
            <div className="p-4 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/50'} 
                              alt={product.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category ? product.category.name : 'Uncategorized'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                        {product.discountPercentage > 0 && (
                          <div className="text-xs text-green-600">
                            {product.discountPercentage}% off
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleStockClick(product)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          <span 
                            className={`inline-flex ${
                              product.stockCount === 0 
                                ? 'text-red-600' 
                                : product.stockCount < 10 
                                  ? 'text-yellow-600' 
                                  : 'text-green-600'
                            }`}
                          >
                            {product.stockCount}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleStatusToggle(product)}
                            className="text-gray-600 hover:text-blue-600"
                            title={product.published ? "Unpublish" : "Publish"}
                          >
                            {product.published ? <FiEyeOff /> : <FiEye />}
                          </button>
                          <div className="flex space-x-1">
                            <Link
                              to={`/products/${product._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="View Product"
                            >
                              <FiEye size={18} />
                            </Link>
                            <Link
                              to={`/vendor/products/stats/${product._id}`}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                              title="Product Statistics"
                            >
                              <FiBarChart2 size={18} />
                            </Link>
                            <Link
                              to={`/vendor/products/edit/${product._id}`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                              title="Edit Product"
                            >
                              <FiEdit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete Product"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No products found. Try adjusting your filters or add a new product.
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.total > 1 &&  (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{products.length}</span> of{' '}
                    <span className="font-medium">{pagination.count}</span> results
                  </p>
                </div>
                <div>
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.total}
                    onPageChange={handleChangePage}
                    siblingCount={1}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setOpenDeleteDialog(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the product: <span className="font-semibold">{selectedProduct?.name}</span>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setOpenDeleteDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Stock update dialog */}
      {stockDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setStockDialogOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Update Stock
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Update stock quantity for <span className="font-semibold">{selectedProduct?.name}</span>
                      </p>
                      <div>
                        <label htmlFor="stockCount" className="block text-sm font-medium text-gray-700">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          id="stockCount"
                          min="0"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={newStockValue}
                          onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleStockUpdate}
                >
                  Update Stock
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setStockDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;