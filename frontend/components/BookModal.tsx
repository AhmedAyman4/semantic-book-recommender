"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Book } from "@/types/book";

interface BookModalProps {
  book: Book;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  currentIndex: number;
  totalResults: number;
}

export const BookModal = ({
  book,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  currentIndex,
  totalResults,
}: BookModalProps) => {
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onNext, onPrev, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111] w-full max-w-2xl md:max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-hidden rounded-[2rem] md:rounded-3xl shadow-2xl relative flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all z-20 hover:scale-110 active:scale-95 shadow-sm"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Image Section */}
        <div className="w-full md:w-[38%] p-4 md:p-8 bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/60 overflow-hidden">
          <div className="relative group">
             <img
                src={book.imageUrl || "/cover-not-found.jpg"}
                alt={book.title}
                className="w-full max-w-[200px] md:max-w-none rounded-xl shadow-2xl object-cover aspect-[2/3] transition-transform duration-500 group-hover:scale-[1.02]"
                onError={(e) => {
                  e.currentTarget.src = "/cover-not-found.jpg";
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none" />
          </div>
        </div>

        {/* Modal Content Section */}
        <div className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
          <div className="mb-6 pr-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight font-display">
              {book.title}
            </h2>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 font-sans">
              {book.authors}
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2 flex items-center">
                  <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800 mr-2" />
                  Description
                </h3>
                <div className="prose dark:prose-invert prose-slate prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  <p>{book.description.replace(/\.\.\.$/, "")}...</p>
                </div>
            </div>
            
            {/* Action buttons could go here (e.g. "Want to Read", "Buy Now") */}
            <div className="flex flex-wrap gap-2 pt-1">
                 <button 
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(book.title + " " + book.authors + " book")}`, '_blank')}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/10 font-display tracking-wide"
                 >
                    Get this book
                 </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={`flex items-center text-xs font-bold transition-all px-2 py-1.5 rounded-lg ${hasPrev ? "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>

            <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-[0.2em] uppercase mb-0.5">
                  Progress
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold tabular-nums">
                  {currentIndex + 1} <span className="text-slate-300 dark:text-slate-700 mx-1">/</span> {totalResults}
                </span>
            </div>

            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`flex items-center text-xs font-bold transition-all px-2 py-1.5 rounded-lg ${hasNext ? "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
