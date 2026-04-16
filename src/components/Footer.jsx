import { Link } from 'react-router-dom'
import blackLogo from '../assets/pngwale-black-logo.png'
import whiteLogo from '../assets/pngwale-white-logo.png'

const links = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-conditions', label: 'Terms & Conditions' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/dmca', label: 'DMCA' },
]

function Footer({ theme }) {
  const activeLogo = theme === 'dark' ? whiteLogo : blackLogo

  return (
    <footer className="mt-14 border-t border-brand-100 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center md:px-6">
        <img src={activeLogo} alt="PNGWALE" className="h-14 w-auto" />
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-slate-600 hover:text-brand-700 dark:text-brand-100 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-brand-100">
          © {new Date().getFullYear()} PNGWALE. High-quality transparent PNG gallery.
        </p>
      </div>
    </footer>
  )
}

export default Footer
