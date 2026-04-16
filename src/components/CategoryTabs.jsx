import { NavLink } from 'react-router-dom'

function CategoryTabs({ categories, activeCategorySlug }) {
  // categories: Array<{ name, slug }>
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2 px-2">
      <NavLink
        to="/"
        className={({ isActive }) => `rounded-full border px-6 py-2.5 text-sm font-bold transition-all shadow-sm ${
          isActive && !activeCategorySlug
            ? 'border-blue-600 bg-blue-600 text-white shadow-blue-500/20'
            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
        }`}
      >
        All
      </NavLink>

      {categories.map((cat) => (
        <NavLink
          key={cat._id}
          to={`/${cat.slug}`}
          className={({ isActive }) => `rounded-full border px-6 py-2.5 text-sm font-bold transition-all shadow-sm ${
            isActive
              ? 'border-blue-600 bg-blue-600 text-white shadow-blue-500/20'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          }`}
        >
          {cat.name}
        </NavLink>
      ))}
    </div>
  )
}

export default CategoryTabs
