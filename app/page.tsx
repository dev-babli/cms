import { redirect } from "next/navigation";

/**
 * Intellectt CMS - Content Management System
 * 
 * This CMS is used to manage content for the Intellectt website.
 * All public pages are served by the main Intellectt website.
 * 
 * Redirect to admin dashboard for content management.
 */
export default function HomePage() {
    redirect("/admin");
}

