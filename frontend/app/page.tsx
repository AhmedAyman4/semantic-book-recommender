"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookOpen, AlertCircle } from "lucide-react";
import { Book } from "@/types/book";
import { BookCard } from "@/components/BookCard";
import { BookModal } from "@/components/BookModal";
import { SearchForm } from "@/components/SearchForm";
import { Footer } from "@/components/Footer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register GSAP plugin if needed (not needed for basic tweens)

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

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Entrance animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    tl.from(".hero-icon", {
      scale: 0,
      rotate: -45,
      opacity: 0,
      duration: 1.2,
      ease: "back.out(1.7)",
    })
    .from(".hero-title", {
      y: 40,
      opacity: 0,
      duration: 1,
    }, "-=0.8")
    .from(".hero-subtitle", {
      y: 20,
      opacity: 0,
      duration: 0.8,
    }, "-=0.6")
    .from(".search-panel", {
      y: 30,
      opacity: 0,
      duration: 1,
    }, "-=0.4");
  }, { scope: headerRef });

  // Results animation when results change
  useGSAP(() => {
    if (results.length > 0 && !isLoading) {
      gsap.from(".book-card-anim", {
        y: 30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "all",
      });
    }
  }, [results, isLoading]);

  const fetchRecommendations = async (
    searchQuery: string,
    searchCategory: string,
    searchTone: string,
  ) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: searchQuery.trim() || "popular books",
        category: searchCategory,
        tone: searchTone,
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

  useEffect(() => {
    fetch("https://ahmed-ayman-book-recommender-backend.hf.space/api/metadata")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
        if (data.tones) setTones(data.tones);
      })
      .catch((err) => {
        console.error("Could not load metadata from backend:", err);
        setCategories(["All", "Fiction", "Nonfiction", "Mystery", "Sci-Fi"]);
        setTones(["All", "Happy", "Suspenseful", "Sad", "Inspirational"]);
      });

    fetchRecommendations("popular books", "All", "All");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations(query, category, tone);
  };

  const currentIndex = selectedBook
    ? results.findIndex((b) => b.id === selectedBook.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < results.length - 1;

  const goToNext = () => {
    if (hasNext) setSelectedBook(results[currentIndex + 1]);
  };

  const goToPrev = () => {
    if (hasPrev) setSelectedBook(results[currentIndex - 1]);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#080808] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        
        {/* Header */}
        <header ref={headerRef} className="flex flex-col items-center justify-center space-y-4 mb-10 mt-8 text-center">
          <div className="hero-icon p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="hero-title text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-1 font-display">
              Semantic Book <span className="text-blue-600 dark:text-blue-400">Search</span>
            </h1>
            <p className="hero-subtitle text-base text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed font-sans">
              Discover your next read based on mood, category, and meaning.
            </p>
          </div>
        </header>

        {/* Search Panel */}
        <div className="search-panel relative z-30">
          <SearchForm
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            tone={tone}
            setTone={setTone}
            categories={categories}
            tones={tones}
            isLoading={isLoading}
            onSearch={handleSearch}
          />
        </div>

        {/* Error Notice */}
        {error && (
          <div className="max-w-4xl mx-auto w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/20 text-sm font-semibold shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results Gallery */}
        <main className="flex-1" ref={resultsRef}>
          {hasSearched && (
            <div className="space-y-8">
              <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                    Recommendations
                  </h2>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 font-sans">
                    Handpicked based on your interests
                  </p>
                </div>
                {!isLoading && (
                  <div className="bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {results.length} Matches Found
                    </span>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse space-y-2"
                    >
                      <div className="bg-slate-200 dark:bg-slate-800/50 rounded-xl aspect-[2/3] w-full" />
                      <div className="space-y-1.5">
                        <div className="h-3 bg-slate-200 dark:bg-slate-800/50 rounded-md w-3/4" />
                        <div className="h-2 bg-slate-100 dark:bg-slate-800/30 rounded-md w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                  {results.length > 0 ? (
                    results.map((book) => (
                      <div key={book.id} className="book-card-anim">
                        <BookCard
                          book={book}
                          onClick={setSelectedBook}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-32 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 text-slate-300 dark:text-slate-600">
                        <BookOpen className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">No books found</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium font-sans">
                        Try adjusting your filters or using a different search query.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onNext={goToNext}
          onPrev={goToPrev}
          hasNext={hasNext}
          hasPrev={hasPrev}
          currentIndex={currentIndex}
          totalResults={results.length}
        />
      )}
    </div>
  );
}
