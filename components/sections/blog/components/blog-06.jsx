"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Blog6() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 w-full max-w-lg md:mb-18 lg:mb-20">
          <div className="w-full max-w-lg">
            <p className="mb-3 font-semibold md:mb-4">Trending</p>
            <h1 className="heading-h1 mb-5 font-bold md:mb-6">
              Latest AI insights and stories
            </h1>
            <p className="text-medium">
              Discover groundbreaking AI research and transformative technology
              trends
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-start">
          <div className="mb-12 grid grid-cols-1 items-center gap-6 md:mb-16 md:grid-cols-2 md:gap-12">
            <a href="#" className="w-full">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                alt="Relume placeholder image"
                className="aspect-[3/2] size-full rounded-image object-cover"
              />
            </a>
            <div className="flex h-full flex-col items-start justify-center">
              <div className="mb-4 flex w-full items-center justify-start">
                <Badge className="mr-4">AI</Badge>
                <p className="text-small inline font-semibold">5 min read</p>
              </div>
              <a className="mb-2" href="#">
                <h3 className="heading-h4 mb-2 font-bold">
                  Machine learning transforms enterprise strategy
                </h3>
              </a>
              <p>
                Deep dive into advanced neural network architectures and their
                real-world applications
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
            </div>
          </div>
          <Tabs defaultValue="view-all" className="flex flex-col justify-start">
            <TabsList className="mb-12 ml-[-5vw] no-scrollbar flex w-screen items-center overflow-auto py-1 pl-[5vw] md:mb-16 md:ml-0 md:w-full md:overflow-hidden md:pl-0">
              <TabsTrigger
                value="view-all"
                className="rounded-button px-4 py-2 data-[state=inactive]:border-transparent"
              >
                View all
              </TabsTrigger>
              <TabsTrigger
                value="category-one"
                className="rounded-button px-4 py-2 data-[state=inactive]:border-transparent"
              >
                AI tech
              </TabsTrigger>
              <TabsTrigger
                value="category-two"
                className="rounded-button px-4 py-2 data-[state=inactive]:border-transparent"
              >
                Machine learning
              </TabsTrigger>
              <TabsTrigger
                value="category-three"
                className="rounded-button px-4 py-2 data-[state=inactive]:border-transparent"
              >
                Data science
              </TabsTrigger>
              <TabsTrigger
                value="category-four"
                className="rounded-button px-4 py-2 data-[state=inactive]:border-transparent"
              >
                Innovation
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="view-all"
              className="data-[state=active]:animate-tabs"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Ethical considerations in artificial intelligence
                    </h2>
                  </a>
                  <p>
                    Exploring the critical balance between technological
                    advancement and human values
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Strategy</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI implementation in modern businesses
                    </h2>
                  </a>
                  <p>
                    Practical approaches to integrating intelligent systems
                    across different industry sectors
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Innovation</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Future of intelligent technologies
                    </h2>
                  </a>
                  <p>
                    Emerging trends and breakthrough developments in artificial
                    intelligence research
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Development</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Neural networks and deep learning
                    </h2>
                  </a>
                  <p>
                    Advanced techniques for creating more responsive and
                    adaptive AI systems
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI in scientific discovery
                    </h2>
                  </a>
                  <p>
                    How intelligent algorithms are accelerating research across
                    multiple disciplines
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Technology</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Quantum computing and AI
                    </h2>
                  </a>
                  <p>
                    Exploring the intersection of quantum technologies and
                    advanced machine learning
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
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="category-one"
              className="data-[state=active]:animate-tabs"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Ethical considerations in artificial intelligence
                    </h2>
                  </a>
                  <p>
                    Exploring the critical balance between technological
                    advancement and human values
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Strategy</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI implementation in modern businesses
                    </h2>
                  </a>
                  <p>
                    Practical approaches to integrating intelligent systems
                    across different industry sectors
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Innovation</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Future of intelligent technologies
                    </h2>
                  </a>
                  <p>
                    Emerging trends and breakthrough developments in artificial
                    intelligence research
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Development</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Neural networks and deep learning
                    </h2>
                  </a>
                  <p>
                    Advanced techniques for creating more responsive and
                    adaptive AI systems
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI in scientific discovery
                    </h2>
                  </a>
                  <p>
                    How intelligent algorithms are accelerating research across
                    multiple disciplines
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Technology</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Quantum computing and AI
                    </h2>
                  </a>
                  <p>
                    Exploring the intersection of quantum technologies and
                    advanced machine learning
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
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="category-two"
              className="data-[state=active]:animate-tabs"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Ethical considerations in artificial intelligence
                    </h2>
                  </a>
                  <p>
                    Exploring the critical balance between technological
                    advancement and human values
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Strategy</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI implementation in modern businesses
                    </h2>
                  </a>
                  <p>
                    Practical approaches to integrating intelligent systems
                    across different industry sectors
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Innovation</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Future of intelligent technologies
                    </h2>
                  </a>
                  <p>
                    Emerging trends and breakthrough developments in artificial
                    intelligence research
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Development</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Neural networks and deep learning
                    </h2>
                  </a>
                  <p>
                    Advanced techniques for creating more responsive and
                    adaptive AI systems
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI in scientific discovery
                    </h2>
                  </a>
                  <p>
                    How intelligent algorithms are accelerating research across
                    multiple disciplines
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Technology</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Quantum computing and AI
                    </h2>
                  </a>
                  <p>
                    Exploring the intersection of quantum technologies and
                    advanced machine learning
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
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="category-three"
              className="data-[state=active]:animate-tabs"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Ethical considerations in artificial intelligence
                    </h2>
                  </a>
                  <p>
                    Exploring the critical balance between technological
                    advancement and human values
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Strategy</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI implementation in modern businesses
                    </h2>
                  </a>
                  <p>
                    Practical approaches to integrating intelligent systems
                    across different industry sectors
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Innovation</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Future of intelligent technologies
                    </h2>
                  </a>
                  <p>
                    Emerging trends and breakthrough developments in artificial
                    intelligence research
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Development</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Neural networks and deep learning
                    </h2>
                  </a>
                  <p>
                    Advanced techniques for creating more responsive and
                    adaptive AI systems
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI in scientific discovery
                    </h2>
                  </a>
                  <p>
                    How intelligent algorithms are accelerating research across
                    multiple disciplines
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Technology</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Quantum computing and AI
                    </h2>
                  </a>
                  <p>
                    Exploring the intersection of quantum technologies and
                    advanced machine learning
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
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="category-four"
              className="data-[state=active]:animate-tabs"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Ethical considerations in artificial intelligence
                    </h2>
                  </a>
                  <p>
                    Exploring the critical balance between technological
                    advancement and human values
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Strategy</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI implementation in modern businesses
                    </h2>
                  </a>
                  <p>
                    Practical approaches to integrating intelligent systems
                    across different industry sectors
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Innovation</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Future of intelligent technologies
                    </h2>
                  </a>
                  <p>
                    Emerging trends and breakthrough developments in artificial
                    intelligence research
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Development</Badge>
                    <p className="text-small inline font-semibold">
                      5 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Neural networks and deep learning
                    </h2>
                  </a>
                  <p>
                    Advanced techniques for creating more responsive and
                    adaptive AI systems
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Research</Badge>
                    <p className="text-small inline font-semibold">
                      3 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      AI in scientific discovery
                    </h2>
                  </a>
                  <p>
                    How intelligent algorithms are accelerating research across
                    multiple disciplines
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
                </div>
                <div className="flex size-full flex-col items-start justify-start text-start">
                  <a href="#" className="mb-6 w-full">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                      alt="Relume placeholder image"
                      className="aspect-[3/2] size-full rounded-image object-cover"
                    />
                  </a>
                  <div className="mb-4 flex w-full items-center justify-start">
                    <Badge className="mr-4">Technology</Badge>
                    <p className="text-small inline font-semibold">
                      4 min read
                    </p>
                  </div>
                  <a className="mb-2 flex justify-start text-start" href="#">
                    <h2 className="heading-h5 font-bold">
                      Quantum computing and AI
                    </h2>
                  </a>
                  <p>
                    Exploring the intersection of quantum technologies and
                    advanced machine learning
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
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
