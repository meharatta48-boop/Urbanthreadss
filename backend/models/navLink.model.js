import mongoose from "mongoose";

const navLinkSchema = new mongoose.Schema({
  label:     { type: String, required: true },
  url:       { type: String, required: true },
  isExternal:{ type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
}, { timestamps: true });

const NavLink = mongoose.model("NavLink", navLinkSchema);
export default NavLink;
