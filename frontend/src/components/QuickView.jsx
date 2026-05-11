import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiHeart, FiZoomIn, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import LazyImage from './LazyImage';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getThumbnailUrl, getProductImageUrl } from '../utils/cloudinaryOptimized';

const QuickView = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        quantity,
        size: selectedSize,
        color: selectedColor
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => Math.min(prev + 1, product.stock || 99));
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const getColorHex = (colorName) => {
    const colors = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'brown': '#92400e',
      'gray': '#6b7280',
      'navy': '#1e3a8a',
      'beige': '#f5f5dc',
      'cream': '#fff8dc',
      'olive': '#808000',
      'maroon': '#800000',
      'teal': '#008080',
      'silver': '#c0c0c0'
    };
    return colors[colorName?.toLowerCase()] || '#cccccc';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-(--bg-card) rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              style={{ border: "1px solid var(--border)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-(--border-light)">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Quick View
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-(--bg-surface) transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-(--bg-surface)">
                    <LazyImage
                      src={getProductImageUrl(product.images?.[0])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Thumbnail Images */}
                  {product.images?.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((img, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-(--border)"
                        >
                          <LazyImage
                            src={getThumbnailUrl(img)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  {/* Product Info */}
                  <div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                      {product.category?.name}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-bold" style={{ color: "var(--gold)" }}>
                        Rs. {product.price?.toLocaleString()}
                      </span>
                      {product.comparePrice > product.price && (
                        <span className="text-lg line-through opacity-60" style={{ color: "var(--text-muted)" }}>
                          Rs. {product.comparePrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p style={{ color: "var(--text-secondary)" }} className="leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Size Selection */}
                  {product.sizes?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                        Size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              selectedSize === size
                                ? "bg-(--gold) text-black"
                                : "border border-(--border-light) text-(--text-secondary) hover:border-(--gold)"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {product.colors?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              selectedColor === color
                                ? "bg-(--gold) text-black"
                                : "border border-(--border-light) text-(--text-secondary) hover:border-(--gold)"
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-(--border-light)"
                              style={{ backgroundColor: getColorHex(color) || "#ccc" }}
                            />
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange('decrease')}
                        className="w-10 h-10 rounded-lg border border-(--border-light) flex items-center justify-center hover:border-(--gold) transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="w-16 text-center font-semibold" style={{ color: "var(--text-primary)" }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange('increase')}
                        className="w-10 h-10 rounded-lg border border-(--border-light) flex items-center justify-center hover:border-(--gold) transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div>
                    {product.stock > 0 && product.stock <= 10 && (
                      <p className="text-orange-400 text-sm font-medium animate-pulse">
                        ⚡ Only {product.stock} left in stock!
                      </p>
                    )}
                    {product.stock > 10 && (
                      <p className="text-green-400 text-sm">✓ In Stock</p>
                    )}
                    {product.stock === 0 && (
                      <p className="text-red-400 text-sm font-medium">✗ Out of Stock</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0 || isAdding}
                      className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ padding: "16px 24px" }}
                    >
                      {isAdding ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : showSuccess ? (
                        <>
                          <FiCheck size={20} />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <FiShoppingCart size={20} />
                          Add to Cart
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => window.open(`/product/${product._id}`, '_blank')}
                        className="btn-outline flex items-center justify-center gap-2"
                      >
                        <FiZoomIn size={16} />
                        View Details
                      </button>
                      <button className="btn-outline flex items-center justify-center gap-2">
                        <FiHeart size={16} />
                        Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
