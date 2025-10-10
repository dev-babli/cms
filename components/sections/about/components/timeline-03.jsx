"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { RxChevronRight } from "react-icons/rx";

const Circle = () => {
  const circleRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: circleRef,
    offset: ["start center", "start start"],
  });
  const backgroundColor = {
    backgroundColor: useTransform(
      scrollYProgress,
      [0, 0.5],
      ["var(--color-neutral)", "var(--color-scheme-text)"]
    ),
  };
  return (
    <div className="absolute flex h-full w-8 items-start justify-center md:-ml-24 md:w-24 lg:-ml-32 lg:w-32">
      <motion.div
        ref={circleRef}
        style={backgroundColor}
        className="z-20 mt-7 size-4 rounded-full shadow-[0_0_0_8px_#fff] md:mt-8"
      />
    </div>
  );
};

export function Timeline3() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="relative grid auto-cols-fr grid-cols-1 items-start justify-center gap-6 sm:gap-12 md:grid-cols-2 md:gap-24 lg:gap-32">
          <div className="relative top-0 z-10 md:sticky md:top-20 md:z-auto md:pr-4">
            <p className="mb-3 font-semibold md:mb-4">Journey</p>
            <h1 className="heading-h2 mb-5 font-bold md:mb-6">
              Our path of technological innovation and growth
            </h1>
            <p className="text-medium">
              Emscale has consistently pushed the boundaries of AI technology.
              Our journey reflects continuous innovation and strategic
              development.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Button title="View timeline" variant="secondary">
                View timeline
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
          <div className="absolute z-0 flex h-full w-8 flex-col items-center justify-self-start [grid-area:2/1/3/2] md:z-auto md:justify-self-center md:[grid-area:auto]">
            <div className="absolute z-10 h-16 w-1 bg-gradient-to-b from-scheme-background to-transparent" />
            <div className="sticky top-0 mt-[-50vh] h-[50vh] w-[3px] bg-scheme-text" />
            <div className="h-full w-[3px] bg-scheme-text/20" />
            <div className="absolute bottom-0 z-0 h-16 w-1 bg-gradient-to-b from-transparent to-scheme-background" />
            <div className="absolute top-[-50vh] h-[50vh] w-full bg-scheme-background" />
          </div>
          <div className="grid auto-cols-fr gap-x-12 gap-y-8 sm:gap-y-12 md:gap-x-20 md:gap-y-20">
            <div className="relative">
              <Circle />
              <div className="mt-4 ml-12 grid auto-cols-fr grid-cols-1 gap-8 md:ml-0 md:gap-12">
                <div>
                  <h2 className="heading-h3 mb-3 font-bold md:mb-4">2018</h2>
                  <h3 className="heading-h5 mb-3 font-bold md:mb-4">
                    Company foundation
                  </h3>
                  <p>
                    Emscale was established with a bold vision to revolutionize
                    AI technologies. We began with a small team of dedicated
                    researchers and engineers.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                    <Button title="Read more" variant="secondary">
                      Read more
                    </Button>
                    <Button
                      title="Details"
                      variant="link"
                      size="link"
                      iconRight={<RxChevronRight />}
                    >
                      Details
                    </Button>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    className="w-full rounded-image"
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image 1"
                  />
                </div>
              </div>
            </div>
            <div className="relative">
              <Circle />
              <div className="mt-4 ml-12 grid auto-cols-fr grid-cols-1 gap-8 md:ml-0 md:gap-12">
                <div>
                  <h2 className="heading-h3 mb-3 font-bold md:mb-4">2020</h2>
                  <h3 className="heading-h5 mb-3 font-bold md:mb-4">
                    First breakthrough
                  </h3>
                  <p>
                    Developed our first proprietary machine learning algorithm
                    that significantly improved predictive accuracy across
                    multiple domains.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                    <Button title="Explore" variant="secondary">
                      Explore
                    </Button>
                    <Button
                      title="Details"
                      variant="link"
                      size="link"
                      iconRight={<RxChevronRight />}
                    >
                      Details
                    </Button>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    className="w-full rounded-image"
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image 2"
                  />
                </div>
              </div>
            </div>
            <div className="relative">
              <Circle />
              <div className="mt-4 ml-12 grid auto-cols-fr grid-cols-1 gap-8 md:ml-0 md:gap-12">
                <div>
                  <h2 className="heading-h3 mb-3 font-bold md:mb-4">2022</h2>
                  <h3 className="heading-h5 mb-3 font-bold md:mb-4">
                    Global expansion
                  </h3>
                  <p>
                    Opened international offices and secured major partnerships
                    with leading technology companies worldwide.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                    <Button title="Learn more" variant="secondary">
                      Learn more
                    </Button>
                    <Button
                      title="Details"
                      variant="link"
                      size="link"
                      iconRight={<RxChevronRight />}
                    >
                      Details
                    </Button>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    className="w-full rounded-image"
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image 3"
                  />
                </div>
              </div>
            </div>
            <div className="relative">
              <Circle />
              <div className="mt-4 ml-12 grid auto-cols-fr grid-cols-1 gap-8 md:ml-0 md:gap-12">
                <div>
                  <h2 className="heading-h3 mb-3 font-bold md:mb-4">2024</h2>
                  <h3 className="heading-h5 mb-3 font-bold md:mb-4">
                    AI ethics initiative
                  </h3>
                  <p>
                    Launched comprehensive AI ethics framework to ensure
                    responsible and transparent technological development.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                    <Button title="Read more" variant="secondary">
                      Read more
                    </Button>
                    <Button
                      title="Details"
                      variant="link"
                      size="link"
                      iconRight={<RxChevronRight />}
                    >
                      Details
                    </Button>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    className="w-full rounded-image"
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image 4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
