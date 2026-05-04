import NavLink from "../models/navLink.model.js";

/* GET all nav links (public) */
export const getNavLinks = async (req, res) => {
  try {
    const links = await NavLink.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* CREATE nav link (admin) */
export const createNavLink = async (req, res) => {
  try {
    const { label, url, isExternal, isVisible, order } = req.body;
    if (!label || !url) return res.status(400).json({ success: false, message: "Label and URL required" });
    const count = await NavLink.countDocuments();
    const link = await NavLink.create({ label, url, isExternal, isVisible, order: order ?? count });
    res.status(201).json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* UPDATE nav link (admin) */
export const updateNavLink = async (req, res) => {
  try {
    const link = await NavLink.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* BULK REORDER (admin) — receives array of { _id, order } */
export const reorderNavLinks = async (req, res) => {
  try {
    const { links } = req.body; // [{ _id, order }]
    await Promise.all(links.map(l => NavLink.findByIdAndUpdate(l._id, { order: l.order })));
    const updated = await NavLink.find().sort({ order: 1 });
    res.json({ success: true, links: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* DELETE nav link (admin) */
export const deleteNavLink = async (req, res) => {
  try {
    const link = await NavLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Nav link not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
