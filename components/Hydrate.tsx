"use client";
import { useEffect } from "react";
import { useJaga } from "@/lib/store";
import { STORAGE_KEY } from "@/lib/mockData";

/** Loads the saved demo state from localStorage, and keeps several browser windows in sync. */
export default function Hydrate() {
  useEffect(() => {
    useJaga.persist.rehydrate();
    // If you open the senior and caregiver apps in two windows, changes show up in both.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) useJaga.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
