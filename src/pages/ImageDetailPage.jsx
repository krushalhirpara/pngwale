import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ImageCard from '../components/ImageCard'
import axios from 'axios'

const transparentGridStyle = {
  backgroundColor: '#f8fafc',
  backgroundImage:
    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
  backgroundSize: '24px 24px',
  backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
}

const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const fileNameFromTitle = (title) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'image'}.png`

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

const canvasToPngBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG conversion failed'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })

function ImageDetailPage() {
  const { itemId } = useParams()
  const [zoom, setZoom] = useState(1)
  const [dimension, setDimension] = useState('Loading...')
  const [fileSize, setFileSize] = useState('Loading...')
  const [isDownloading, setIsDownloading] = useState(false)
  
  const [item, setItem] = useState(null)
  const [relatedItems, setRelatedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/image/${itemId}`)
        setItem(res.data.data)
        setRelatedItems(res.data.related || [])
        setError(false)
      } catch (err) {
        console.error("Error fetching image:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [itemId])

  useEffect(() => {
    if (!item) return

    const image = new Image()
    image.src = item.imageUrl
    image.onload = () => {
      setDimension(`${image.naturalWidth} x ${image.naturalHeight}`)
    }
    image.onerror = () => {
      setDimension('Unknown')
    }

    fetch(item.imageUrl)
      .then((response) => response.blob())
      .then((blob) => setFileSize(formatBytes(blob.size)))
      .catch(() => setFileSize('Unknown'))
  }, [item])

  const handleDownload = async () => {
    if (!item) return
    setIsDownloading(true)

    try {
      const image = await loadImageElement(item.imageUrl)
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height

      const context = canvas.getContext('2d', { alpha: true })
      if (!context) throw new Error('Canvas context unavailable')

      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)

      const pngBlob = await canvasToPngBlob(canvas)
      const objectUrl = URL.createObjectURL(pngBlob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileNameFromTitle(item.title)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } finally {
      setIsDownloading(false)
    }
  }

  if (error) return <Navigate to="/" replace />
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading Image...</div>

  return (
    <section className="space-y-8 pt-6 md:pt-8 min-h-screen">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
            {item.category?.name || 'Uncategorized'}
          </p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 md:text-5xl lg:text-6xl tracking-tight">
            {item.title}
          </h1>
        </div>
        <Link
          to="/"
          className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          Back
        </Link>
      </div>

      <div className="grid items-stretch gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(380px,0.7fr)]">
        {/* Preview Area */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setZoom((prev) => Math.max(0.2, +(prev - 0.2).toFixed(1)))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
            >
              Zoom Out
            </button>
            <button
              onClick={() => setZoom((prev) => Math.min(5, +(prev + 0.2).toFixed(1)))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
            >
              Zoom In
            </button>
            <span className="text-sm font-mono text-slate-500">{Math.round(zoom * 100)}%</span>
          </div>

          <div
            className="flex h-[28rem] items-center justify-center overflow-auto rounded-[2rem] border border-slate-100 p-8 dark:border-slate-800 md:h-[40rem]"
            style={transparentGridStyle}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{ transform: `scale(${zoom})` }}
              className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out"
              draggable="false"
              onContextMenu={(event) => event.preventDefault()}
            />
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="flex h-full flex-col justify-center rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="space-y-5 text-sm">
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold mb-4">Image Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Dimensions</p>
                  <p className="font-bold">{dimension}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">File Size</p>
                  <p className="font-bold">{fileSize}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Format</p>
                  <p className="font-bold">PNG (Transparent)</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">License</p>
                  <p className="font-bold">Free Usage</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <p><strong className="text-slate-500">Tags:</strong> {item.tags?.join(', ') || 'No tags'}</p>
              <p className="text-slate-500 leading-relaxed italic">
                This image is available for free download. Personal and commercial projects are allowed with attribution to PNGWALE.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-10">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`w-full py-5 rounded-2xl bg-blue-600 text-white text-lg font-bold shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 ${
                isDownloading ? 'opacity-50' : ''
              }`}
            >
              {isDownloading ? 'Processing...' : 'Download HD PNG'}
            </button>
            <p className="text-center text-xs text-slate-400">
              High resolution original asset • Trusted by creators
            </p>
          </div>
        </div>
      </div>

      {/* Related Section */}
      {relatedItems.length > 0 && (
        <div className="pt-20 space-y-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
              Discover More
            </p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
              Similar {item.category?.name} Assets
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedItems.map((relatedItem) => (
              <ImageCard key={relatedItem._id} item={{
                id: relatedItem._id,
                title: relatedItem.title,
                src: relatedItem.imageUrl,
                category: relatedItem.category?.name || 'Uncategorized',
                keywords: relatedItem.tags
              }} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default ImageDetailPage
