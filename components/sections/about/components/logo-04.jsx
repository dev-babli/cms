"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Logo4() {
  return (
    <section className="px-[5%] py-12 md:py-16 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
          <div>
            <h2 className="heading-h2 mb-5 font-bold md:mb-6">
              Recognized for technological excellence
            </h2>
            <p className="text-medium">
              Our innovations have been acknowledged by leading industry
              organizations and technology experts
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Button title="View awards" variant="secondary">
                View awards
              </Button>
              <Button
                title="Learn more"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
              >
                Learn more
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/webflow-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
            <div className="flex w-full items-start justify-center justify-self-center px-4 pt-3.5 pb-4 md:p-3.5">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/relume-logo.svg"
                alt="Relume placeholder image"
                className="max-h-12 md:max-h-14"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
