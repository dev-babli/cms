"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/scroll-reveal";
import React from "react";

export function Header145() {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background -z-10" />

      <div className="px-[5%] py-20 md:py-32 w-full">
        <div className="container max-w-5xl mx-auto">
          <div className="flex w-full flex-col items-center text-center space-y-8">
            <FadeIn>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] max-w-4xl">
                Transforming business with intelligent AI solutions
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Emscale delivers cutting-edge AI technologies that revolutionize
                how companies operate. Our advanced algorithms and machine
                learning models provide unprecedented insights and efficiency.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-medium premium-button shadow-lg"
                >
                  Get started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-medium premium-button"
                >
                  Learn more
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Hero image section with premium styling */}
      <div className="absolute bottom-0 left-0 right-0 px-[5%] pb-8">
        <FadeIn delay={0.4}>
          <div className="container max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
                className="aspect-video w-full object-cover"
                alt="AI Technology Workspace"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
