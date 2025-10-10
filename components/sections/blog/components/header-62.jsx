"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/scroll-reveal";
import React from "react";

export function Header62() {
  return (
    <section className="px-[5%] py-20 md:py-32 lg:py-40">
      <div className="container max-w-4xl mx-auto text-center">
        <FadeIn>
          <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">
            Insights
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
            Latest from our blog
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Explore insights, trends, and innovations in artificial intelligence
            and machine learning.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="premium-button">
              Subscribe
            </Button>
            <Button size="lg" variant="outline" className="premium-button">
              View All
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
