"use client";

import React from "react";
import { Github, Linkedin, Mail, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto pt-16 pb-8 text-center">
      <div className="w-10 h-[1px] bg-slate-200 dark:bg-slate-800 mx-auto mb-6" />
      <div className="flex flex-col items-center space-y-4">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 flex flex-col items-center space-y-1.5">
          <span className="font-sans">Designed and built by</span>
          <span className="text-slate-900 dark:text-slate-200 font-bold tracking-tight text-sm font-display">
            Ahmed Ayman Alhofy
          </span>
        </p>

        <div className="flex items-center space-x-5">
          <a
            href="https://ahmedayman.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
            title="Portfolio"
          >
            <Globe className="w-4.5 h-4.5" />
          </a>
          <a
            href="https://github.com/AhmedAyman4"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
            title="GitHub"
          >
            <Github className="w-4.5 h-4.5" />
          </a>
          <a
            href="https://www.linkedin.com/in/ahmed-alhofy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors duration-300"
            title="LinkedIn"
          >
            <Linkedin className="w-4.5 h-4.5" />
          </a>
          <a
            href="mailto:ahmedalhofy42@gmail.com"
            className="text-slate-400 hover:text-red-500 transition-colors duration-300"
            title="Email"
          >
            <Mail className="w-4.5 h-4.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
