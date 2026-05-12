import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const SubCategoryContext = createContext();

export const SubCategoryProvider = ({ children }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subcategories");
      setSubCategories(res.data.data || res.data.subCategories || []);
    } catch (err) {
      console.error("fetchSubCategories error:", err);
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // { name, category, imageFile? }
  const addSubCategory = async ({ name, category, imageFile = null }) => {
    try {
      let res;
      if (imageFile) {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("category", category);
        fd.append("image", imageFile);
        res = await api.post("/subcategories", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/subcategories", { name, category });
      }
      const newSub = res.data.data || res.data.subCategory;
      if (!newSub) throw new Error("No data returned");

      // Populate category name if missing
      const populated = newSub.category?._id
        ? newSub
        : { ...newSub, category: { _id: category, name: "" } };

      setSubCategories((prev) => [...prev, populated]);
      return populated;
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server warm ho raha hai — thora wait karo aur dobara try karo"
          : err.response?.data?.message || "Sub-category add karne mein masla";
      toast.error(msg);
      throw err;
    }
  };

  // data: { name?, category?, imageFile?, removeImage? }
  const updateSubCategory = async (id, data) => {
    try {
      let res;
      const { name, category, imageFile, removeImage } = data;

      if (imageFile || removeImage) {
        const fd = new FormData();
        if (name) fd.append("name", name);
        if (category) fd.append("category", category);
        if (imageFile) fd.append("image", imageFile);
        if (removeImage) fd.append("removeImage", "true");
        res = await api.put(`/subcategories/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.put(`/subcategories/${id}`, { name, category });
      }
      const updated = res.data.data || res.data.subCategory;
      setSubCategories((prev) => prev.map((s) => (s._id === id ? updated : s)));
      return updated;
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server warm ho raha hai — thora wait karo"
          : err.response?.data?.message || "Sub-category update mein masla hua";
      toast.error(msg);
      throw err;
    }
  };

  const removeSubCategory = async (id) => {
    try {
      await api.delete(`/subcategories/${id}`);
      setSubCategories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server warm ho raha hai — thora wait karo"
          : err.response?.data?.message || "Sub-category delete mein masla hua";
      toast.error(msg);
      throw err;
    }
  };

  useEffect(() => { fetchSubCategories(); }, []);

  return (
    <SubCategoryContext.Provider value={{
      subCategories, loading,
      fetchSubCategories, addSubCategory, updateSubCategory, removeSubCategory,
    }}>
      {children}
    </SubCategoryContext.Provider>
  );
};

export const useSubCategories = () => useContext(SubCategoryContext);
