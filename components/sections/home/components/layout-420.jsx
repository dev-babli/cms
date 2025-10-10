"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout420() {
  return (
    <section className="pt-24 md:pt-0">
      <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-y-0">
        <div>
          <div className="md:sticky md:top-0 md:gap-y-0">
            <div className="flex flex-col items-end md:h-screen md:justify-center">
              <div className="mx-[5%] max-w-md md:mr-12 md:ml-[5vw] lg:mr-20">
                <p className="mb-3 font-semibold md:mb-4">Process</p>
                <h2 className="heading-h2 mb-5 font-bold md:mb-6">
                  How Emscale AI transforms your business operations
                </h2>
                <p className="text-medium">
                  Our AI integration process is designed to be seamless,
                  efficient, and tailored to your unique business needs.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
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
            </div>
          </div>
        </div>
        <div>
          <div className="sticky top-0 flex h-screen flex-col justify-center p-10">
            <div className="max-w-md text-white">
              <h3 className="heading-h5 mb-3 font-bold md:mb-4">Assessment</h3>
              <p>
                We analyze your current systems and identify optimization
                opportunities through comprehensive AI evaluation.
              </p>
            </div>
            <div className="absolute inset-0 -z-10">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-1.svg"
                className="size-full object-cover"
                alt="Relume placeholder image 1"
              />
              <div className="absolute inset-0 bg-neutral-darkest/50" />
            </div>
          </div>
          <div className="sticky top-0 flex h-screen flex-col justify-center p-10">
            <div className="max-w-md text-white">
              <h3 className="heading-h5 mb-3 font-bold md:mb-4">Assessment</h3>
              <p>
                We analyze your current systems and identify optimization
                opportunities through comprehensive AI evaluation.
              </p>
            </div>
            <div className="absolute inset-0 -z-10">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-2.svg"
                className="size-full object-cover"
                alt="Relume placeholder image 2"
              />
              <div className="absolute inset-0 bg-neutral-darkest/50" />
            </div>
          </div>
          <div className="sticky top-0 flex h-screen flex-col justify-center p-10">
            <div className="max-w-md text-white">
              <h3 className="heading-h5 mb-3 font-bold md:mb-4">Assessment</h3>
              <p>
                We analyze your current systems and identify optimization
                opportunities through comprehensive AI evaluation.
              </p>
            </div>
            <div className="absolute inset-0 -z-10">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-3.svg"
                className="size-full object-cover"
                alt="Relume placeholder image 3"
              />
              <div className="absolute inset-0 bg-neutral-darkest/50" />
            </div>
          </div>
          <div className="sticky top-0 flex h-screen flex-col justify-center p-10">
            <div className="max-w-md text-white">
              <h3 className="heading-h5 mb-3 font-bold md:mb-4">Assessment</h3>
              <p>
                We analyze your current systems and identify optimization
                opportunities through comprehensive AI evaluation.
              </p>
            </div>
            <div className="absolute inset-0 -z-10">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-4.svg"
                className="size-full object-cover"
                alt="Relume placeholder image 4"
              />
              <div className="absolute inset-0 bg-neutral-darkest/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
