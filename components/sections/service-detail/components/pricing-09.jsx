"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { BiCheck } from "react-icons/bi";

export function Pricing9() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg">
        <div className="mx-auto mb-8 max-w-lg text-center md:mb-10 lg:mb-12">
          <p className="mb-3 font-semibold md:mb-4">Flexible</p>
          <h1 className="heading-h2 mb-5 font-bold md:mb-6">Pricing plan</h1>
          <p className="text-medium">
            Scalable solutions designed to meet your unique business
            requirements
          </p>
        </div>
        <Tabs defaultValue="monthly">
          <TabsList className="mx-auto mb-12 w-fit items-center justify-center rounded-button border border-scheme-border bg-scheme-foreground p-1">
            <TabsTrigger
              value="monthly"
              className="rounded-button data-[state=active]:bg-scheme-background data-[state=active]:font-medium data-[state=inactive]:border-0 data-[state=inactive]:bg-transparent"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="rounded-button data-[state=active]:bg-scheme-background data-[state=active]:font-medium data-[state=inactive]:border-0 data-[state=inactive]:bg-transparent"
            >
              Yearly
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="monthly"
            className="data-[state=active]:animate-tabs"
          >
            <Card className="flex h-full flex-col justify-between px-6 py-8 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-4 flex flex-col items-start justify-end">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                      alt="Relume icon 1"
                      className="size-12"
                    />
                  </div>
                  <h5 className="heading-h5 mb-2 font-bold">Starter plan</h5>
                  <p>Perfect for small to medium businesses</p>
                </div>
                <div className="text-right">
                  <h1 className="heading-h1 font-bold">$49/mo</h1>
                </div>
              </div>
              <div className="my-8 h-px w-full shrink-0 bg-scheme-border" />
              <p>Includes</p>
              <div className="mt-4 mb-8 grid grid-cols-1 gap-x-6 gap-y-4 py-2 md:grid-cols-2">
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Basic AI model development</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Data integration support</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Monthly performance reports</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Standard machine learning models</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Email support</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Cloud storage</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Basic security protocols</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Initial consultation</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Quarterly strategy review</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Scalability assessment</p>
                </div>
              </div>
              <div>
                <Button title="Start now" className="w-full">
                  Start now
                </Button>
              </div>
            </Card>
          </TabsContent>
          <TabsContent
            value="yearly"
            className="data-[state=active]:animate-tabs"
          >
            <Card className="flex h-full flex-col justify-between px-6 py-8 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-4 flex flex-col items-start justify-end">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                      alt="Relume icon 2"
                      className="size-12"
                    />
                  </div>
                  <h5 className="heading-h5 mb-2 font-bold">Enterprise plan</h5>
                  <p>Comprehensive solution for large organizations</p>
                </div>
                <div className="text-right">
                  <h1 className="heading-h1 font-bold">$480/yr</h1>
                  <p className="mt-2 font-medium">
                    Save 20% with annual commitment
                  </p>
                </div>
              </div>
              <div className="my-8 h-px w-full shrink-0 bg-scheme-border" />
              <p>Includes</p>
              <div className="mt-4 mb-8 grid grid-cols-1 gap-x-6 gap-y-4 py-2 md:grid-cols-2">
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Advanced AI model development</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Comprehensive data integration</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Weekly performance insights</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Custom machine learning frameworks</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Dedicated support team</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Enterprise-grade cloud infrastructure</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Advanced security protocols</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Quarterly strategic workshops</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Continuous optimization</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Priority feature development</p>
                </div>
              </div>
              <div>
                <Button title="Get started" className="w-full">
                  Get started
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
