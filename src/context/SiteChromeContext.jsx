"use client";

import { createContext, useContext } from "react";

const SiteChromeContext = createContext(null);

export const SiteChromeProvider = SiteChromeContext.Provider;

export function useSiteChrome() {
  const value = useContext(SiteChromeContext);
  if (!value) throw new Error("useSiteChrome must be used inside SiteChrome");
  return value;
}
