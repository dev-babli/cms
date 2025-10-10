"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import {
  BiLogoFacebookCircle,
  BiLogoInstagram,
  BiLogoLinkedinSquare,
  BiLogoYoutube,
} from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";

const useForm = () => {
  const [email, setEmail] = useState("");
  const handleSetEmail = (event) => {
    setEmail(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({ email });
  };
  return {
    email,
    handleSetEmail,
    handleSubmit,
  };
};

export function Footer5() {
  const formState = useForm();
  return (
    <footer className="px-[5%] py-12 md:py-18 lg:py-20">
      <div className="container">
        <div className="mb-12 block items-start justify-between md:mb-18 lg:mb-20 lg:flex">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-medium font-semibold">Stay connected</h1>
            <p>Get the latest AI insights and industry trends.</p>
          </div>
          <div className="max-w-md lg:min-w-[25rem]">
            <form
              className="mb-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[1fr_max-content] sm:gap-y-4 md:gap-4"
              onSubmit={formState.handleSubmit}
            >
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={formState.email}
                onChange={formState.handleSetEmail}
              />
              <Button title="Subscribe" variant="secondary" size="sm">
                Subscribe
              </Button>
            </form>
            <p className="text-tiny">
              By subscribing, you agree to our privacy policy.
            </p>
          </div>
        </div>
        <div className="mb-12 grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-3 md:mb-18 md:gap-y-12 lg:mb-20 lg:grid-cols-6">
          <a
            href="#"
            className="sm:col-start-1 sm:col-end-4 sm:row-start-1 sm:row-end-2 lg:col-start-auto lg:col-end-auto lg:row-start-auto lg:row-end-auto"
          >
            <img
              src="https://d22po4pjz3o32e.cloudfront.net/logo-image.svg"
              alt="Logo image"
            />
          </a>
          <div className="flex flex-col items-start justify-start">
            <h2 className="mb-3 font-semibold md:mb-4">Company</h2>
            <ul>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  About us
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Careers
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Press
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Contact
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start">
            <h2 className="mb-3 font-semibold md:mb-4">Services</h2>
            <ul>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  AI integration
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Analytics
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Consulting
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Training
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Resources
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start">
            <h2 className="mb-3 font-semibold md:mb-4">Legal</h2>
            <ul>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Terms
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Privacy
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Cookies
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Security
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start">
            <h2 className="mb-3 font-semibold md:mb-4">Connect</h2>
            <ul>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  LinkedIn
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Twitter
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Facebook
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Instagram
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start">
            <h2 className="mb-3 font-semibold md:mb-4">Follow</h2>
            <ul>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Medium publication
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Tech blog
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  AI research papers
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Developer community
                </a>
              </li>
              <li className="text-small py-2">
                <a href="#" className="flex items-center gap-3">
                  Open source projects
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="h-px w-full bg-scheme-border" />
        <div className="text-small flex flex-col-reverse items-start pt-6 pb-4 md:justify-start md:pt-8 md:pb-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col-reverse items-start md:flex-row md:gap-6 lg:items-center">
            <div className="grid grid-flow-row grid-cols-[max-content] justify-center gap-y-4 md:grid-flow-col md:justify-center md:gap-x-6 md:gap-y-0 lg:text-left">
              <p className="mt-8 md:mt-0">
                © 2024 Relume. All rights reserved.
              </p>
              <a href="#" className="underline">
                Privacy policy
              </a>
              <a href="#" className="underline">
                Terms of service
              </a>
              <a href="#" className="underline">
                Cookie settings
              </a>
            </div>
          </div>
          <div className="mb-8 flex items-center justify-center gap-3 lg:mb-0">
            <a href="#">
              <BiLogoFacebookCircle className="size-6" />
            </a>
            <a href="#">
              <BiLogoInstagram className="size-6" />
            </a>
            <a href="#">
              <FaXTwitter className="size-6 p-0.5" />
            </a>
            <a href="#">
              <BiLogoLinkedinSquare className="size-6" />
            </a>
            <a href="#">
              <BiLogoYoutube className="size-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
