import { useEffect, useState } from "react";
import { FiArrowUp, FiMic, FiPlus } from "react-icons/fi";
import { useParams, useSearchParams } from "react-router-dom";
import CategoryTabs from "../components/CategoryTabs";
import ImageCard from "../components/ImageCard";
import axios from "axios";
import { BASE_URL } from "../config";
import "../App.css";

const animatedPrompts = [
  "find transparent flower PNG",
  "show latest festival clipart",
  "search vector logo shapes",
  "download clean HD PNG assets",
];

function HomePage() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [heroSearch, setHeroSearch] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  // ✅ FIX 1: Categories API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`);
        setCategories(res.data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ FIX 2: Images API
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/images`, {
          params: {
            category: categorySlug || "all",
            search: query,
          },
        });
        setImages(res.data.data);
      } catch (err) {
        console.error("Error fetching images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [categorySlug, query]);

  // Animated Prompts Logic
  useEffect(() => {
    const currentPrompt = animatedPrompts[promptIndex];
    let delay = isDeleting ? 35 : 65;
    if (!isDeleting && typedPrompt === currentPrompt) delay = 1100;
    if (isDeleting && typedPrompt.length === 0) delay = 260;

    const timeout = setTimeout(() => {
      if (!isDeleting && typedPrompt === currentPrompt) {
        setIsDeleting(true);
        return;
      }
      if (isDeleting && typedPrompt.length === 0) {
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % animatedPrompts.length);
        return;
      }
      if (isDeleting) {
        setTypedPrompt(currentPrompt.slice(0, typedPrompt.length - 1));
      } else {
        setTypedPrompt(currentPrompt.slice(0, typedPrompt.length + 1));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [typedPrompt, isDeleting, promptIndex]);

  const handleHeroSearch = (event) => {
    event.preventDefault();
    const value = heroSearch.trim();
    if (!value) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: value });
  };

  return (
    <section>
      {/* UI same che — no change */}
      <CategoryTabs
        categories={categories}
        activeCategorySlug={categorySlug}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((item) => (
            <ImageCard
              key={item._id}
              item={{
                id: item._id,
                title: item.title,
                src: item.imageUrl,
                category: item.category?.name || "Uncategorized",
                description: `${item.title} transparent PNG.`,
                keywords: item.tags,
              }}
            />
          ))}
        </div>
      )}

      {!loading && images.length === 0 && (
        <p className="rounded-xl border border-brand-100 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          No images found for this selection.
        </p>
      )}
    </section>
  );
}

export default HomePage;