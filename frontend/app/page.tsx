"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  BookOpen,
  Filter,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Type definition for our Book results
interface Book {
  id: number;
  title: string;
  authors: string;
  description: string;
  imageUrl: string;
}

// Custom Dropdown Component (Minimalist style)
const CustomSelect = ({
  value,
  onChange,
  options,
  icon: Icon,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  icon?: React.ElementType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon */}
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
      )}

      {/* Dropdown Button */}
      <div
        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer flex items-center justify-between transition-colors focus-within:ring-1 focus-within:ring-slate-900 dark:focus-within:ring-white hover:border-slate-300 dark:hover:border-slate-700"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
      >
        <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-200 select-none">
          {value}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-auto py-1 text-sm font-medium">
          {options.map((option) => (
            <li
              key={option}
              className={`px-3 py-2.5 flex items-center cursor-pointer select-none transition-colors
                ${value === option ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"}
              `}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              <span className="w-6 shrink-0 flex justify-center">
                {value === option && <Check className="w-4 h-4" />}
              </span>
              <span className="truncate">{option}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tone, setTone] = useState("All");

  const [categories, setCategories] = useState<string[]>(["All"]);
  const [tones, setTones] = useState<string[]>(["All"]);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for the expanded modal view
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Fetch categories and tones from backend on load
  useEffect(() => {
    fetch("https://ahmed-ayman-book-recommender-backend.hf.space/api/metadata")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
        if (data.tones) setTones(data.tones);
      })
      .catch((err) => {
        console.error("Could not load metadata from backend:", err);
        setCategories([
          "All",
          "Children's Fiction",
          "Children's Nonfiction",
          "Fiction",
          "Nonfiction",
        ]);
        setTones(["All", "Happy", "Surprising", "Angry", "Suspenseful", "Sad"]);
      });
  }, []);

  // Real API call to your FastAPI backend
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && category === "All" && tone === "All") return;

    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: query.trim() || "books",
        category,
        tone,
      });

      const res = await fetch(
        `https://ahmed-ayman-book-recommender-backend.hf.space/api/recommend?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch recommendations");

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the backend. Please check if the Hugging Face Space is running.",
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedBook) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedBook]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedBook) return;

      const currentIndex = results.findIndex((b) => b.id === selectedBook.id);

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setSelectedBook(results[currentIndex - 1]);
      } else if (e.key === "ArrowRight" && currentIndex < results.length - 1) {
        setSelectedBook(results[currentIndex + 1]);
      } else if (e.key === "Escape") {
        setSelectedBook(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBook, results]);

  // Calculate indices for modal navigation
  const currentIndex = selectedBook
    ? results.findIndex((b) => b.id === selectedBook.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < results.length - 1;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-300">
      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header - Minimalist */}
        <header className="flex flex-col items-center justify-center space-y-4 mb-12 mt-8 text-center">
          <div className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Semantic Book Search
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Discover your next read based on mood, category, and meaning.
            </p>
          </div>
        </header>

        {/* Search Panel */}
        <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto w-full mb-12">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-12 gap-5"
          >
            {/* Query Input */}
            <div className="md:col-span-6 space-y-1.5">
              <label
                htmlFor="query"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1"
              >
                Description
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., A story about forgiveness and redemption"
                  className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-slate-900 dark:focus:ring-white outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3 space-y-1.5">
              <label
                htmlFor="category"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1"
              >
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={setCategory}
                options={categories}
                icon={Filter}
              />
            </div>

            {/* Tone Dropdown */}
            <div className="md:col-span-3 space-y-1.5">
              <label
                htmlFor="tone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1"
              >
                Tone
              </label>
              <CustomSelect
                value={tone}
                onChange={setTone}
                options={tones}
                icon={Sparkles}
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-12 flex justify-end mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium py-3 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Library</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Notice */}
          {error && (
            <div className="mt-6 flex items-start space-x-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results Gallery */}
        <div className="flex-1">
          {hasSearched && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Results
                </h2>
                {!isLoading && (
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {results.length} books found
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-slate-200 dark:bg-slate-800/50 rounded-xl aspect-2/3"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                  {results.length > 0 ? (
                    results.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className="group relative flex flex-col h-full cursor-pointer"
                      >
                        {/* Minimalist Image Container */}
                        <div className="relative aspect-2/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-slate-200/50 dark:border-slate-700/50">
                          <img
                            src={book.imageUrl || "/cover-not-found.jpg"}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = "/cover-not-found.jpg";
                              e.currentTarget.onerror = null;
                            }}
                          />
                        </div>

                        {/* Minimalist Text */}
                        <div className="pt-3 pb-1 flex flex-col">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                            {book.authors}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 font-medium">
                      No books found matching those criteria. Try adjusting your
                      filters or query.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Name */}
        <footer className="mt-auto pt-16 pb-8 text-center border-t border-transparent">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            Designed and built by{" "}
            <span className="text-slate-900 dark:text-slate-300">
              Ahmed Ayman Alhofy
            </span>
          </p>
        </footer>
      </div>

      {/* --- Book Details Modal --- */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white dark:bg-[#111] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors z-10"
              onClick={() => setSelectedBook(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="w-full md:w-2/5 p-6 md:p-8 bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/60 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
              <img
                src={selectedBook.imageUrl || "/cover-not-found.jpg"}
                alt={selectedBook.title}
                className="w-full max-w-50 md:max-w-none rounded-xl shadow-lg object-cover aspect-2/3"
                onError={(e) => {
                  e.currentTarget.src = "/cover-not-found.jpg";
                  e.currentTarget.onerror = null;
                }}
              />
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col">
              <div className="mb-6 pr-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedBook.title}
                </h2>
                <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2">
                  By {selectedBook.authors}
                </p>
              </div>

              <div className="flex-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Description
                </h3>
                <div className="prose dark:prose-invert prose-slate prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                  {/* Using standard text since we receive truncated plain text from backend. 
                      If backend sends full descriptions later, this will automatically handle it beautifully. */}
                  <p>{selectedBook.description.replace(/\.\.\.$/, "")}...</p>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (hasPrev) setSelectedBook(results[currentIndex - 1]);
                  }}
                  disabled={!hasPrev}
                  className={`flex items-center text-sm font-semibold transition-colors ${hasPrev ? "text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>

                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                  {currentIndex + 1} OF {results.length}
                </span>

                <button
                  onClick={() => {
                    if (hasNext) setSelectedBook(results[currentIndex + 1]);
                  }}
                  disabled={!hasNext}
                  className={`flex items-center text-sm font-semibold transition-colors ${hasNext ? "text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
