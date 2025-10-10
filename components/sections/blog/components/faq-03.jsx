"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import React from "react";

export function Faq3() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[.75fr,1fr] lg:gap-x-20">
        <div>
          <h2 className="heading-h2 mb-5 font-bold md:mb-6">FAQs</h2>
          <p className="text-medium">
            Common questions about our AI blog and content strategy
          </p>
          <div className="mt-6 md:mt-8">
            <Button title="Contact" variant="secondary">
              Contact
            </Button>
          </div>
        </div>
        <Accordion type="multiple">
          <AccordionItem value="item-0">
            <AccordionTrigger className="text-medium md:py-5">
              How often do you publish?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              We publish new articles weekly, focusing on cutting-edge AI
              technologies and research. Our goal is to provide consistent,
              high-quality insights.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-medium md:py-5">
              What topics do you cover?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              Our blog covers machine learning, AI ethics, technological
              innovations, research developments, and strategic implementations
              across various industries.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-medium md:py-5">
              Can I contribute?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              We welcome guest contributions from AI experts, researchers, and
              industry professionals. Please send your pitch to our editorial
              team.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-medium md:py-5">
              Are the articles technical?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              We provide a mix of technical and accessible content, ensuring
              readers from different backgrounds can understand complex AI
              concepts.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-medium md:py-5">
              Is the content free?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              All our blog content is completely free. We believe in
              democratizing AI knowledge and making insights accessible to
              everyone.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
