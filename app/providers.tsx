"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

/**
 * Props for the Providers component.
 *
 * @interface ProvidersProps
 * @property {React.ReactNode} children - The child components to be wrapped by providers.
 * @property {ThemeProviderProps} [themeProps] - Optional props for theme configuration.
 */
export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

/**
 * Global provider component that wraps the application with required providers.
 * Includes:
 * - NextUIProvider for UI component styling and navigation.
 * - NextThemesProvider for theme management (light/dark mode).
 *
 * @param {ProvidersProps} props - The props for the component.
 */
export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter(); // Router instance for handling navigation

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </NextUIProvider>
  );
}
