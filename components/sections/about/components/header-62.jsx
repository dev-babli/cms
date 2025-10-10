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
            Pioneering AI solutions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            We build intelligent systems that transform how businesses
            understand and leverage advanced technology
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="premium-button">
              Learn more
            </Button>
            <Button size="lg" variant="outline" className="premium-button">
              Contact us
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
