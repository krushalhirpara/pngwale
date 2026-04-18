import { Link } from 'react-router-dom'

const transparentGridStyle = {
  backgroundColor: '#f8fafc',
  backgroundImage:
    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
  backgroundSize: '24px 24px',
  backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
}

function ImageCard({ item }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-lg shadow-slate-200/40 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <Link
        to={`/image/${item.id}`}
        className="block w-full text-left"
      >
        <div
          className="flex h-56 items-center justify-center overflow-hidden p-6"
          style={transparentGridStyle}
        >
          <img
            src={item.src && item.src !== "undefined"
              ? item.src
              : "https://via.placeholder.com/300x300?text=No+Image"}
            alt={item.title}
            className="h-full w-full object-contain transition duration-500 ease-out group-hover:scale-110"
            loading="lazy"
            draggable="false"
            onContextMenu={(event) => event.preventDefault()}
          />
        </div>
        <div className="space-y-1 p-5 pt-4">
          <p className="line-clamp-1 text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-blue-600 transition-colors">
            {item.title}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">
            {item.category}
          </p>
        </div>
      </Link>
    </article>
  )
}

export default ImageCard
