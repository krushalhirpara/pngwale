import { useEffect, useRef, useState } from 'react'
import { HiMagnifyingGlass, HiMoon, HiSun } from 'react-icons/hi2'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import blackLogo from '../assets/pngwale-black-logo.png'
import whiteLogo from '../assets/pngwale-white-logo.png'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about-us', label: 'About Us' },
  { to: '/contact-us', label: 'Contact Us' },
  { to: '/license', label: 'License' },
]

function Header({ theme, onToggleTheme, transparentOnTop = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const headerRef = useRef(null)
  const [searchText, setSearchText] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchText(params.get('q') ?? '')
  }, [location.search])

  useEffect(() => {
    if (!transparentOnTop) {
      setIsScrolled(false)
      return undefined
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 18)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [transparentOnTop, location.pathname])

  const isOverlayMode = transparentOnTop && !isScrolled
  const activeLogo = theme === 'dark' || isOverlayMode ? whiteLogo : blackLogo

  useEffect(() => {
    const node = headerRef.current
    if (!node) return undefined

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${node.offsetHeight}px`)
    }

    updateHeaderHeight()

    const resizeObserver = new ResizeObserver(updateHeaderHeight)
    resizeObserver.observe(node)
    window.addEventListener('resize', updateHeaderHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [location.pathname, isOverlayMode])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const value = searchText.trim()

    if (!value) {
      navigate('/')
      return
    }

    navigate(`/?q=${encodeURIComponent(value)}`)
  }

  const headerClassName = transparentOnTop
    ? `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isOverlayMode
          ? 'bg-transparent'
          : 'border-b border-brand-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95'
      }`
    : 'sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90'

  const getNavClassName = (isActive) => {
    if (isOverlayMode) {
      return `rounded-full px-3 py-2 text-sm font-semibold transition ${
        isActive ? 'bg-white text-slate-900' : 'text-white/95 hover:bg-white/15'
      }`
    }

    return `rounded-full px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-brand-500 text-white'
        : 'text-brand-900 hover:bg-brand-50 dark:text-slate-100 dark:hover:bg-slate-800'
    }`
  }

  const searchIconClass = isOverlayMode
    ? 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-0'
    : 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'

  const searchInputClass = isOverlayMode
    ? 'w-full rounded-full border border-white/35 bg-white/10 py-2 pl-9 pr-20 text-sm text-white placeholder:text-white/70 outline-none backdrop-blur-sm transition focus:border-white'
    : 'w-full rounded-full border border-brand-100 bg-white py-2 pl-9 pr-20 text-sm outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800'

  const themeBtnClass = isOverlayMode
    ? 'rounded-full border border-white/35 bg-white/10 p-2 text-white transition hover:bg-white/20'
    : 'rounded-full border border-brand-100 bg-white p-2 text-brand-900 transition hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-300 dark:hover:bg-slate-700'

  const searchSubmitClass = isOverlayMode
    ? 'absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-white'
    : 'absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-600'

  return (
    <header ref={headerRef} className={headerClassName}>
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/" className="shrink-0" aria-label="PNGWALE Home">
            <img src={activeLogo} alt="PNGWALE" className="h-12 w-auto" />
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => getNavClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={handleSearchSubmit} className="relative ml-auto w-full max-w-xs">
            <HiMagnifyingGlass className={searchIconClass} />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search images..."
              className={searchInputClass}
            />
            {searchText.trim() && (
              <button type="submit" className={searchSubmitClass}>
                Search
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className={themeBtnClass}
          >
            {theme === 'dark' ? <HiSun className="h-5 w-5" /> : <HiMoon className="h-5 w-5" />}
          </button>
        </div>

        <div className="md:hidden">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link to="/" className="shrink-0" aria-label="PNGWALE Home">
              <img src={activeLogo} alt="PNGWALE" className="h-9 w-auto" />
            </Link>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className={themeBtnClass}
            >
              {theme === 'dark' ? <HiSun className="h-5 w-5" /> : <HiMoon className="h-5 w-5" />}
            </button>
          </div>

          <nav className="mb-3 flex flex-wrap items-center justify-center gap-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => getNavClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={handleSearchSubmit} className="relative">
            <HiMagnifyingGlass className={searchIconClass} />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search images..."
              className={searchInputClass}
            />
            {searchText.trim() && (
              <button type="submit" className={searchSubmitClass}>
                Search
              </button>
            )}
          </form>
        </div>
      </div>
    </header>
  )
}

export default Header
