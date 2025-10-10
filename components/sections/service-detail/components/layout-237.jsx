"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout237() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="flex flex-col items-center">
          <div className="mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
            <p className="mb-3 font-semibold md:mb-4">Advanced</p>
            <h2 className="heading-h2 mb-5 font-bold md:mb-6">
              Core capabilities that drive technological transformation
            </h2>
            <p className="text-medium">
              Our comprehensive approach integrates advanced technologies to
              solve complex business challenges.
            </p>
          </div>
          <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-5 md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                  alt="Relume logo 1"
                  className="size-12"
                />
              </div>
              <h3 className="heading-h4 mb-5 font-bold md:mb-6">
                Machine learning models
              </h3>
              <p>
                Develop predictive algorithms that learn and adapt in real time.
              </p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-5 md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                  alt="Relume logo 1"
                  className="size-12"
                />
              </div>
              <h3 className="heading-h4 mb-5 font-bold md:mb-6">
                Data integration platforms
              </h3>
              <p>Seamlessly connect and analyze disparate data sources.</p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <div className="mb-5 md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                  alt="Relume logo 1"
                  className="size-12"
                />
              </div>
              <h3 className="heading-h4 mb-5 font-bold md:mb-6">
                Enterprise AI solutions
              </h3>
              <p>
                Custom AI frameworks designed for specific organizational needs.
              </p>
            </div>
          </div>
          <div className="mt-10 flex items-center gap-4 md:mt-14 lg:mt-16">
            <Button variant="secondary">Explore</Button>
            <Button iconRight={<RxChevronRight />} variant="link" size="link">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
