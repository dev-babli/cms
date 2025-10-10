"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout239() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="flex flex-col items-center">
          <div className="mb-12 text-center md:mb-18 lg:mb-20">
            <div className="w-full max-w-lg">
              <p className="mb-3 font-semibold md:mb-4">Solutions</p>
              <h2 className="heading-h2 mb-5 font-bold md:mb-6">
                Comprehensive AI services for modern enterprises
              </h2>
              <p className="text-medium">
                We deliver intelligent technologies that solve complex business
                challenges. Our approach combines deep technical expertise with
                strategic insights.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-6 md:mb-8">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="rounded-image"
                />
              </div>
              <h3 className="heading-h4 mb-5 font-bold md:mb-6">
                AI integration strategies
              </h3>
              <p>
                Seamlessly connect advanced AI technologies with your existing
                infrastructure.
              </p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-6 md:mb-8">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="rounded-image"
                />
              </div>
              <h3 className="heading-h4 mb-5 font-bold md:mb-6">
                Real-time data analytics
              </h3>
              <p>Transform raw data into actionable business intelligence.</p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-6 md:mb-8">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="rounded-image"
                />
              </div>
              <h3 className="heading-h4 mb-5 font-bold md:mb-6">
                Predictive modeling solutions
              </h3>
              <p>Forecast trends and make informed decisions with precision.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
            <Button variant="secondary">Learn more</Button>
            <Button iconRight={<RxChevronRight />} variant="link" size="link">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
