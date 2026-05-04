const categories = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
  { id: "summer", label: "Summer" },
  { id: "winter", label: "Winter" },
]

export default function Categories({ active, setActive }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-12">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActive(cat.id)}
          className={`px-6 py-2 rounded-full border transition
            ${
              active === cat.id
                ? "bg-purple-600 border-purple-600"
                : "border-gray-700 hover:border-purple-500"
            }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
