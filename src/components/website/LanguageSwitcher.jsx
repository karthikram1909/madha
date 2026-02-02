import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState('english');

  useEffect(() => {
    const storedLang = localStorage.getItem('madha_tv_language') || 'english';
    setCurrentLanguage(storedLang);
  }, []);

  const handleSelectLanguage = (lang) => {
    if (lang !== currentLanguage) {
      localStorage.setItem('madha_tv_language', lang);
      window.location.reload();
    }
  };

  const getLanguageLabel = () => {
    return currentLanguage === 'tamil' ? 'தமிழ்' : 'English';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white px-3 py-2 rounded-lg transition-all duration-200"
        >
          <Languages className="h-4 w-4" />
          <span className="text-sm font-medium">Language</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-black/90 border-gray-700 text-white min-w-[140px] backdrop-blur-sm"
      >
        <DropdownMenuItem 
          onClick={() => handleSelectLanguage('english')} 
          className={`focus:bg-yellow-400/30 cursor-pointer transition-all duration-200 hover:bg-yellow-400/30 hover:text-white ${
            currentLanguage === 'english' 
              ? 'bg-yellow-400/20 text-yellow-300 font-semibold' 
              : 'text-gray-300'
          }`}
        >
          <span className="flex items-center justify-between w-full">
            English
            {currentLanguage === 'english' && (
              <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
            )}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSelectLanguage('tamil')} 
          className={`focus:bg-yellow-400/30 cursor-pointer transition-all duration-200 hover:bg-yellow-400/30 hover:text-white ${
            currentLanguage === 'tamil' 
              ? 'bg-yellow-400/20 text-yellow-300 font-semibold' 
              : 'text-gray-300'
          }`}
        >
          <span className="flex items-center justify-between w-full">
            தமிழ்
            {currentLanguage === 'tamil' && (
              <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
            )}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}