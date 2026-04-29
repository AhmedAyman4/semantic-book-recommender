"use client";

import React from "react";
import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

export const BookCard = ({ book, onClick }: BookCardProps) => {
  return (
    <div
      onClick={() => onClick(book)}
      className="group relative flex flex-col h-full cursor-pointer"
    >
      {/* Minimalist Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-slate-200/50 dark:border-slate-700/50">
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Minimalist Text */}
      <div className="pt-2 pb-1 flex flex-col">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
          {book.title}
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1 font-sans">
          {book.authors}
        </p>
      </div>
    </div>
  );
};
