"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout472() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-x-16">
          <div>
            <p className="mb-3 font-semibold md:mb-4">Tagline</p>
            <h2 className="heading-h2 mb-5 font-bold md:mb-6">
              Intelligent solutions for complex business challenges
            </h2>
            <p className="text-medium">
              We develop AI technologies that adapt and evolve with your
              business needs. Our platform integrates seamlessly with existing
              systems to drive performance and growth.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
              <Button title="Explore" variant="secondary">
                Explore
              </Button>
              <Button
                title="Contact"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
              >
                Contact
              </Button>
            </div>
          </div>
          <div className="relative flex">
            <div className="absolute bottom-[10%] left-0 w-[35%]">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-dim.png"
                className="aspect-square size-full rounded-image object-cover"
                alt="Relume placeholder image 1"
              />
            </div>
            <div className="absolute top-[10%] right-0 w-2/5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-dim.png"
                className="aspect-[3/2] size-full rounded-image object-cover"
                alt="Relume placeholder image 2"
              />
            </div>
            <div className="mx-[10%]">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                className="aspect-square size-full rounded-image object-cover"
                alt="Relume placeholder image 3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
