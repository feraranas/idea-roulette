"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "@/lib/trpc/react";
import { ThemeAwareToast } from "@/components/theme/ThemeAwareToast";

const createQueryClient = () => new QueryClient();

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCReactProvider queryClient={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ThemeAwareToast />
        </ThemeProvider>
      </TRPCReactProvider>
    </QueryClientProvider>
  );
}
