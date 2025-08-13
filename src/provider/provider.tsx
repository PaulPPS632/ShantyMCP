"use client";
import { HeroUIProvider } from "@heroui/react";

export function ClientProviders({ children }: { readonly children: React.ReactNode }) {
  return (
    <HeroUIProvider>
        {children}
     </HeroUIProvider>
  );
}