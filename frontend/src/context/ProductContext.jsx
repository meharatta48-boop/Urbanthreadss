import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("[ProductContext] fetchProducts error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (formData) => {
    try {
      const res = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newProduct = res.data.data;
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error("[ProductContext] addProduct error:", err);
      const msg =
        err.code === "ECONNABORTED"
          ? "Server time out — server warm ho raha hai, dobara try karo"
          : err.response?.data?.message || "Product add karne mein masla hua";
      toast.error(msg);
      throw err;
    }
  };

  const updateProduct = async (id, formData) => {
    try {
      const res = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data.data;
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      return updated;
    } catch (err) {
      console.error("[ProductContext] updateProduct error:", err);
      const msg =
        err.code === "ECONNABORTED"
          ? "Server time out — thora wait karo aur dobara try karo"
          : err.response?.data?.message || "Product update karne mein masla hua";
      toast.error(msg);
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("[ProductContext] removeProduct error:", err);
      const msg = err.response?.data?.message || "Product delete karne mein masla hua";
      toast.error(msg);
      throw err;
    }
  };

  const getProductById = async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      return res.data.data;
    } catch (err) {
      console.error("[ProductContext] getProductById error:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        addProduct,
        updateProduct,
        removeProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
