"use client";

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Handle Convex URL - use placeholder if not properly configured yet
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
}