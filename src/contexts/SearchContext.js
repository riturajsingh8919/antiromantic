"use client";

import { createContext, useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleGlobalSearch = (searchTerm) => {
    setGlobalSearchTerm(searchTerm);

    // If we're not on the products page, navigate there with search params
    if (!pathname.includes("/admin/products")) {
      router.push(`/admin/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const clearGlobalSearch = () => {
    setGlobalSearchTerm("");
  };

  return (
    <SearchContext.Provider
      value={{
        globalSearchTerm,
        setGlobalSearchTerm,
        handleGlobalSearch,
        clearGlobalSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
