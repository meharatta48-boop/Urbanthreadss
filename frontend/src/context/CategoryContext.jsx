import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || res.data.categories || []);
    } catch (err) {
      console.error("fetchCategories error:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // name: string, imageFile: File | null
  const addCategory = async (name, imageFile = null) => {
    try {
      let res;
      if (imageFile) {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("image", imageFile);
        res = await api.post("/categories", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/categories", { name });
      }
      const newCat = res.data.data || res.data.category;
      if (!newCat) throw new Error("No data returned");
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server warm ho raha hai — thora wait karo aur dobara try karo"
          : err.response?.data?.message || "Category add karne mein masla";
      toast.error(msg);
      throw err;
    }
  };

  // data: { name?, imageFile?, removeImage? }
  const updateCategory = async (id, data) => {
    try {
      let res;
      const { name, imageFile, removeImage } = typeof data === "string"
        ? { name: data, imageFile: null, removeImage: false }
        : data;

      if (imageFile || removeImage) {
        const fd = new FormData();
        if (name) fd.append("name", name);
        if (imageFile) fd.append("image", imageFile);
        if (removeImage) fd.append("removeImage", "true");
        res = await api.put(`/categories/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.put(`/categories/${id}`, { name });
      }
      const updated = res.data.data || res.data.category;
      setCategories((prev) => prev.map((c) => (c._id === id ? updated : c)));
      return updated;
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server warm ho raha hai — thora wait karo aur dobara try karo"
          : err.response?.data?.message || "Category update mein masla hua";
      toast.error(msg);
      throw err;
    }
  };

  const removeCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server warm ho raha hai — thora wait karo"
          : err.response?.data?.message || "Category delete mein masla hua";
      toast.error(msg);
      throw err;
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  return (
    <CategoryContext.Provider value={{
      categories, loading,
      fetchCategories, addCategory, updateCategory, removeCategory,
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
