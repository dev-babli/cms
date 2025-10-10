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
            Innovate
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
            AI services that transform
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Empower your business with cutting-edge AI solutions that drive
            efficiency and unlock unprecedented growth potential.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="premium-button">
              Explore
            </Button>
            <Button size="lg" variant="outline" className="premium-button">
              Contact
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
