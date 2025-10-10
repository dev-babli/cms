"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

export function Cta26() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg text-center">
        <div>
          <h2 className="heading-h2 mb-5 font-bold md:mb-6">
            Start your AI journey
          </h2>
          <p className="text-medium">
            Get personalized insights and recommendations tailored to your
            business needs.
          </p>
          <div className="mx-auto mt-6 w-full max-w-sm md:mt-8">
            <form className="mb-4 grid max-w-sm grid-cols-1 gap-y-3 sm:grid-cols-[1fr_max-content] sm:gap-4">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
              />
              <Button
                title="Sign up"
                size="sm"
                className="items-center justify-center px-6 py-3"
              >
                Sign up
              </Button>
            </form>
            <p className="text-tiny">
              By signing up, you agree to our terms and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
