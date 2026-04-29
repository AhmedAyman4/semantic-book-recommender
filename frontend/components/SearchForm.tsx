"use client";

import React from "react";
import { Search, Filter, Sparkles, Loader2 } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

interface SearchFormProps {
  query: string;
  setQuery: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  tone: string;
  setTone: (val: string) => void;
  categories: string[];
  tones: string[];
  isLoading: boolean;
  onSearch: (e: React.FormEvent) => void;
}

export const SearchForm = ({
  query,
  setQuery,
  category,
  setCategory,
  tone,
  setTone,
  categories,
  tones,
  isLoading,
  onSearch,
}: SearchFormProps) => {
  return (
    <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 md:p-6 shadow-xl shadow-slate-200/20 dark:shadow-none max-w-5xl mx-auto w-full mb-10 relative">
      {/* Background decoration - wrapped in overflow-hidden to prevent bleed but allow dropdowns to show */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-500/5 dark:bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      <form onSubmit={onSearch} className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 font-sans">
        {/* Query Input */}
        <div className="md:col-span-6 space-y-1.5">
          <label
            htmlFor="query"
            className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ml-1 font-sans"
          >
            What are you looking for?
          </label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., A story about forgiveness and redemption"
              className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 focus:border-slate-900 dark:focus:border-white outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm font-sans"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="md:col-span-3">
          <CustomSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories}
            icon={Filter}
          />
        </div>

        {/* Tone Dropdown */}
        <div className="md:col-span-3">
          <CustomSelect
            label="Tone / Mood"
            value={tone}
            onChange={setTone}
            options={tones}
            icon={Sparkles}
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-12 flex justify-end pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold py-2.5 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto shadow-lg shadow-slate-900/10 dark:shadow-none hover:scale-[1.02] active:scale-95 font-display tracking-wide"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
