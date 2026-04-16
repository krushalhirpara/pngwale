import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const fileNameFromTitle = (title) =>
  `${
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "image"
  }.png`;

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const canvasToPngBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG conversion failed"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });

function ImagePreviewModal({ item, onClose, allItems = [], onSelectItem }) {
  const [zoom, setZoom] = useState(1);
  const [dimension, setDimension] = useState("Loading...");
  const [fileSize, setFileSize] = useState("Loading...");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!item) return undefined;

    const image = new Image();
    image.src = item.src;
    image.onload = () => {
      setDimension(`${image.naturalWidth} x ${image.naturalHeight}`);
    };
    image.onerror = () => {
      setDimension("Unknown");
    };

    fetch(item.src)
      .then((response) => response.blob())
      .then((blob) => setFileSize(formatBytes(blob.size)))
      .catch(() => setFileSize("Unknown"));

    const onEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);

    return () => {
      window.removeEventListener("keydown", onEsc);
    };
  }, [item, onClose]);

  useEffect(() => {
    if (item) {
      setZoom(1);
      setDimension("Loading...");
      setFileSize("Loading...");
      setIsDownloading(false);
    }
  }, [item]);

  if (!item) return null;

  const categorySuggestions = allItems
    .filter(
      (candidate) =>
        candidate.category === item.category && candidate.id !== item.id,
    )
    .slice(0, 8);

  const handleDownload = async (event) => {
    event.stopPropagation();
    setIsDownloading(true);

    try {
      const image = await loadImageElement(item.src);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;

      const context = canvas.getContext("2d", { alpha: true });
      if (!context) {
        throw new Error("Canvas context unavailable");
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const pngBlob = await canvasToPngBlob(canvas);
      const objectUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileNameFromTitle(item.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3"
      onClick={onClose}
    >
      <div
        className="max-h-[95vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-100 p-4 dark:border-slate-700">
          <h3 className="text-base font-bold text-brand-900 dark:text-slate-100 md:text-lg">
            {item.category} Preview
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-900 dark:bg-slate-800 dark:text-slate-100"
          >
            Close
          </button>
        </div>

        <div className="grid items-start gap-6 p-4 md:grid-cols-2 md:p-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setZoom((prev) => Math.max(0.5, +(prev - 0.2).toFixed(1)))
                }
                className="rounded-lg border border-brand-100 px-3 py-2 text-sm font-semibold dark:border-slate-700"
              >
                Zoom Out
              </button>
              <button
                type="button"
                onClick={() =>
                  setZoom((prev) => Math.min(3, +(prev + 0.2).toFixed(1)))
                }
                className="rounded-lg border border-brand-100 px-3 py-2 text-sm font-semibold dark:border-slate-700"
              >
                Zoom In
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div
              className="flex h-80 items-center justify-center overflow-auto rounded-xl border border-brand-100 p-6 dark:border-slate-700 md:h-[28rem]"
              style={{
                backgroundColor: "#f8fafc",
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
              }}
            >
              <img
                src={item.src}
                alt={item.title}
                style={{ transform: `scale(${zoom})` }}
                className="max-h-full max-w-full object-contain transition"
                draggable="false"
                onContextMenu={(event) => event.preventDefault()}
              />
            </div>
          </div>

          <div className="h-full rounded-xl border border-brand-100 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300 md:p-5">
            <div className="space-y-3">
              <p>
                <strong className="text-brand-900 dark:text-slate-100">
                  Title:
                </strong>{" "}
                {item.title}
              </p>
              <p>
                <strong className="text-brand-900 dark:text-slate-100">
                  Image:
                </strong>{" "}
                Preview available on left panel
              </p>
              <p>
                <strong className="text-brand-900 dark:text-slate-100">
                  Description:
                </strong>{" "}
                {item.description}
              </p>
              <p>
                <strong className="text-brand-900 dark:text-slate-100">
                  Keyword:
                </strong>{" "}
                {item.keywords.join(", ")}
              </p>
              <p>
                <strong className="text-brand-900 dark:text-slate-100">
                  Image Dimension:
                </strong>{" "}
                {dimension}
              </p>
              <p>
                <strong className="text-brand-900 dark:text-slate-100">
                  File Size:
                </strong>{" "}
                {fileSize}
              </p>
              <p>
                <strong className="text-brand-900 dark:text-slate-100">
                  File Type:
                </strong>{" "}
                {item.fileType}
              </p>
            </div>

            <div className="my-4">
              <p className="mb-2">
                <strong className="text-brand-900 dark:text-slate-100">
                  Download Btn:
                </strong>
              </p>
              <button
                type="button"
                className="w-full max-w-[260px] rounded-md bg-brand-500 px-4 py-3 text-base font-semibold text-white"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download PNG"}
              </button>
            </div>

            <p>
              <strong className="text-brand-900 dark:text-slate-100">
                License:
              </strong>{" "}
              Free for personal and commercial use with attribution to{" "}
              <Link
                to="/contact-us"
                className="font-bold underline decoration-2 underline-offset-2 hover:text-brand-600 dark:hover:text-brand-300"
              >
                PNGWALE
              </Link>
              .
            </p>
          </div>
        </div>

        {categorySuggestions.length > 0 && (
          <div className="border-t border-brand-100 p-4 dark:border-slate-700 md:p-6">
            <h4 className="mb-3 text-base font-bold text-brand-900 dark:text-slate-100">
              More {item.category} Images
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categorySuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => onSelectItem?.(suggestion)}
                  className="rounded-lg border border-brand-100 bg-white p-2 text-left transition hover:border-brand-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-md bg-brand-50 dark:bg-slate-900">
                    <img
                      src={suggestion.src}
                      alt={suggestion.title}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {suggestion.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImagePreviewModal;
