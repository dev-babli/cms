"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React, { useEffect, useState } from "react";
import { RxChevronRight } from "react-icons/rx";

const useCarousel = () => {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleDotClick = (index) => () => {
    if (api) {
      api.scrollTo(index);
    }
  };

  const dotClassName = (index) => {
    return `mx-[3px] inline-block size-2 rounded-full ${
      current === index + 1 ? "bg-scheme-text" : "bg-scheme-text/20"
    }`;
  };

  return { api, setApi, current, handleDotClick, dotClassName };
};

export function Blog66() {
  const carouselState = useCarousel();
  return (
    <section className="overflow-hidden px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 grid grid-cols-1 items-start justify-start gap-y-8 md:mb-18 md:grid-cols-[1fr_max-content] md:items-end md:justify-between md:gap-x-12 md:gap-y-4 lg:mb-20 lg:gap-x-20">
          <div className="md:mr-12 lg:mr-0">
            <div className="w-full max-w-lg">
              <p className="mb-3 font-semibold md:mb-4">Articles</p>
              <h2 className="heading-h2 mb-3 font-bold md:mb-4">
                All blog posts
              </h2>
              <p className="text-medium">
                Comprehensive collection of AI insights and technological
                perspectives
              </p>
            </div>
          </div>
          <div className="hidden md:flex">
            <Button title="View all" variant="secondary">
              View all
            </Button>
          </div>
        </div>
        <Carousel
          setApi={carouselState.setApi}
          opts={{ loop: true, align: "start" }}
        >
          <CarouselContent className="ml-0">
            <CarouselItem className="basis-[95%] pr-6 pl-0 sm:basis-[80%] md:basis-1/3 md:pr-8">
              <a href="#" className="mb-5 inline-block md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-[3/2] size-full rounded-image object-cover"
                />
              </a>
              <div className="mb-3 flex w-full items-center justify-start md:mb-4">
                <Badge className="mr-4">AI</Badge>
                <p className="text-small font-semibold">5 min read</p>
              </div>
              <a href="#" className="mb-2">
                <h2 className="heading-h5 mb-2 font-bold">
                  Transformative AI technologies
                </h2>
              </a>
              <p>
                Exploring breakthrough innovations reshaping industries and
                technological landscapes
              </p>
              <Button
                title="Read more"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
                className="mt-6 flex items-center justify-center gap-x-2"
              >
                Read more
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pr-6 pl-0 sm:basis-[80%] md:basis-1/3 md:pr-8">
              <a href="#" className="mb-5 inline-block md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-[3/2] size-full rounded-image object-cover"
                />
              </a>
              <div className="mb-3 flex w-full items-center justify-start md:mb-4">
                <Badge className="mr-4">AI</Badge>
                <p className="text-small font-semibold">5 min read</p>
              </div>
              <a href="#" className="mb-2">
                <h2 className="heading-h5 mb-2 font-bold">
                  Transformative AI technologies
                </h2>
              </a>
              <p>
                Exploring breakthrough innovations reshaping industries and
                technological landscapes
              </p>
              <Button
                title="Read more"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
                className="mt-6 flex items-center justify-center gap-x-2"
              >
                Read more
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pr-6 pl-0 sm:basis-[80%] md:basis-1/3 md:pr-8">
              <a href="#" className="mb-5 inline-block md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-[3/2] size-full rounded-image object-cover"
                />
              </a>
              <div className="mb-3 flex w-full items-center justify-start md:mb-4">
                <Badge className="mr-4">AI</Badge>
                <p className="text-small font-semibold">5 min read</p>
              </div>
              <a href="#" className="mb-2">
                <h2 className="heading-h5 mb-2 font-bold">
                  Transformative AI technologies
                </h2>
              </a>
              <p>
                Exploring breakthrough innovations reshaping industries and
                technological landscapes
              </p>
              <Button
                title="Read more"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
                className="mt-6 flex items-center justify-center gap-x-2"
              >
                Read more
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pr-6 pl-0 sm:basis-[80%] md:basis-1/3 md:pr-8">
              <a href="#" className="mb-5 inline-block md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-[3/2] size-full rounded-image object-cover"
                />
              </a>
              <div className="mb-3 flex w-full items-center justify-start md:mb-4">
                <Badge className="mr-4">AI</Badge>
                <p className="text-small font-semibold">5 min read</p>
              </div>
              <a href="#" className="mb-2">
                <h2 className="heading-h5 mb-2 font-bold">
                  Transformative AI technologies
                </h2>
              </a>
              <p>
                Exploring breakthrough innovations reshaping industries and
                technological landscapes
              </p>
              <Button
                title="Read more"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
                className="mt-6 flex items-center justify-center gap-x-2"
              >
                Read more
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pr-6 pl-0 sm:basis-[80%] md:basis-1/3 md:pr-8">
              <a href="#" className="mb-5 inline-block md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-[3/2] size-full rounded-image object-cover"
                />
              </a>
              <div className="mb-3 flex w-full items-center justify-start md:mb-4">
                <Badge className="mr-4">AI</Badge>
                <p className="text-small font-semibold">5 min read</p>
              </div>
              <a href="#" className="mb-2">
                <h2 className="heading-h5 mb-2 font-bold">
                  Transformative AI technologies
                </h2>
              </a>
              <p>
                Exploring breakthrough innovations reshaping industries and
                technological landscapes
              </p>
              <Button
                title="Read more"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
                className="mt-6 flex items-center justify-center gap-x-2"
              >
                Read more
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pr-6 pl-0 sm:basis-[80%] md:basis-1/3 md:pr-8">
              <a href="#" className="mb-5 inline-block md:mb-6">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-[3/2] size-full rounded-image object-cover"
                />
              </a>
              <div className="mb-3 flex w-full items-center justify-start md:mb-4">
                <Badge className="mr-4">AI</Badge>
                <p className="text-small font-semibold">5 min read</p>
              </div>
              <a href="#" className="mb-2">
                <h2 className="heading-h5 mb-2 font-bold">
                  Transformative AI technologies
                </h2>
              </a>
              <p>
                Exploring breakthrough innovations reshaping industries and
                technological landscapes
              </p>
              <Button
                title="Read more"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
                className="mt-6 flex items-center justify-center gap-x-2"
              >
                Read more
              </Button>
            </CarouselItem>
          </CarouselContent>
          <div className="mt-12 flex items-center justify-between md:mt-20">
            <div className="mt-5 flex w-full items-start justify-start">
              <button
                onClick={carouselState.handleDotClick(0)}
                className={carouselState.dotClassName(0)}
              />
              <button
                onClick={carouselState.handleDotClick(1)}
                className={carouselState.dotClassName(1)}
              />
              <button
                onClick={carouselState.handleDotClick(2)}
                className={carouselState.dotClassName(2)}
              />
              <button
                onClick={carouselState.handleDotClick(3)}
                className={carouselState.dotClassName(3)}
              />
              <button
                onClick={carouselState.handleDotClick(4)}
                className={carouselState.dotClassName(4)}
              />
              <button
                onClick={carouselState.handleDotClick(5)}
                className={carouselState.dotClassName(5)}
              />
            </div>
            <div className="flex items-end justify-end gap-2 md:gap-4">
              <CarouselPrevious className="static top-0 right-0 size-12 -translate-y-0" />
              <CarouselNext className="static top-0 right-0 size-12 -translate-y-0" />
            </div>
          </div>
        </Carousel>
        <div className="mt-12 flex justify-end md:hidden">
          <Button title="View all" variant="secondary">
            View all
          </Button>
        </div>
      </div>
    </section>
  );
}
