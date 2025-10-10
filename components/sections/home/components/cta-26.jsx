"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/ui/scroll-reveal";
import React from "react";

export function Cta26() {
  return (
    <section className="px-[5%] py-24 md:py-32">
      <div className="container max-w-4xl mx-auto">
        <FadeIn>
          <div className="premium-card p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Start your AI transformation
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Get personalized insights and recommendations for your business
              technology strategy.
            </p>
            <div className="max-w-md mx-auto">
              <form className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  className="h-12 px-4 text-base flex-1"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8 text-base font-medium premium-button whitespace-nowrap"
                >
                  Get started
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4">
                Free 14-day trial · No credit card required
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
