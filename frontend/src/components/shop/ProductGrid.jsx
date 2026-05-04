import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const products = [
  {
    id: 1,
    name: "Men Hoodie",
    price: 4999,
    category: "men",
  },
  {
    id: 2,
    name: "Women Jacket",
    price: 6999,
    category: "women",
  },
  {
    id: 3,
    name: "Kids T-Shirt",
    price: 2499,
    category: "kids",
  },
  {
    id: 4,
    name: "Summer Tee",
    price: 2999,
    category: "summer",
  },
  {
    id: 5,
    name: "Winter Coat",
    price: 8999,
    category: "winter",
  },
]

export default function ProductGrid({ category }) {
  const filtered =
    category === "all"
      ? products
      : products.filter((p) => p.category === category)

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {filtered.map((product) => (
        <motion.div
          key={product.id}
          whileHover={{ scale: 1.05 }}
          className="bg-gray-900 p-4 rounded-2xl"
        >
          {/* IMAGE PLACEHOLDER */}
          <div className="h-56 bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
            <span className="text-gray-500">Image</span>
          </div>

          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-emerald-400 font-semibold mt-1">Rs. {product.price?.toLocaleString()}</p>

          <Link
            to={`/product/${product.id}`}
            className="block mt-4 text-center bg-purple-600 py-2 rounded-lg hover:bg-purple-700"
          >
            View Product
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
