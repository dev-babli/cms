import React from "react";
import { Navbar5 } from "@/components/sections/about/components/navbar-05";
import { Header62 } from "@/components/sections/about/components/header-62";
import { Team1 } from "@/components/sections/about/components/team-01";
import { Timeline3 } from "@/components/sections/about/components/timeline-03";
import { Logo6 } from "@/components/sections/about/components/logo-06";
import { Logo4 } from "@/components/sections/about/components/logo-04";
import { Logo6_1 } from "@/components/sections/about/components/logo-06_1";
import { Contact7 } from "@/components/sections/about/components/contact-07";
import { Footer5 } from "@/components/sections/about/components/footer-05";

export default function AboutUsPage() {
    return (
        <div>
            <Navbar5 />
            <Header62 />
            <Team1 />
            <Timeline3 />
            <Logo6 />
            <Logo4 />
            <Logo6_1 />
            <Contact7 />
            <Footer5 />
        </div>
    );
}

