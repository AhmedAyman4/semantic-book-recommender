"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  icon?: React.ElementType;
  label?: string;
}

export const CustomSelect = ({
  value,
  onChange,
  options,
  icon: Icon,
  label,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="space-y-1.5 flex-1" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
        )}

        <div
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer flex items-center justify-between transition-all focus-within:ring-2 focus-within:ring-slate-900/10 dark:focus-within:ring-white/10 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className="truncate text-xs font-medium text-slate-900 dark:text-slate-200 select-none">
            {value}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>

        {isOpen && (
          <ul className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-auto py-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
            {options.map((option) => (
              <li
                key={option}
                className={`px-3 py-1.5 flex items-center cursor-pointer select-none transition-colors
                  ${value === option ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"}
                `}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span className="w-5 shrink-0 flex justify-center">
                  {value === option && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="truncate">{option}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
