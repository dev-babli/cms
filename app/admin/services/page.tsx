"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/cms/types";
import { useRouter } from "next/navigation";

export default function ServicesList() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            if (res.ok) {
                setAuthenticated(true);
                fetchServices();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/cms/services");
            const data = await res.json();
            if (data.success) {
                setServices(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const res = await fetch(`/api/cms/services/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchServices();
            }
        } catch (error) {
            console.error("Failed to delete service:", error);
        }
    };

    if (!authenticated || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading services...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-white to-indigo-50/20">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/admin"
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Dashboard
                            </Link>
                            <div className="h-6 w-px bg-slate-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">Services</h1>
                                <p className="text-sm text-slate-600 font-medium">{services.length} service{services.length !== 1 ? 's' : ''} available</p>
                            </div>
                        </div>
                        <Link href="/admin/services/new">
                            <Button size="lg" className="btn-premium flex items-center gap-2 group">
                                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Service
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {services.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No services yet</h3>
                        <p className="text-slate-600 mb-6">Get started by creating your first service offering</p>
                        <Link href="/admin/services/new">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Create Your First Service
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div 
                                key={service.id} 
                                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        {service.icon && (
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                                {service.icon}
                                            </div>
                                        )}
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                service.published
                                                    ? "bg-green-100 text-green-700 border border-green-200"
                                                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                            }`}
                                        >
                                            {service.published ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {service.title}
                                    </h3>
                                    
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                        {service.description}
                                    </p>
                                    
                                    {service.price && (
                                        <div className="mb-4">
                                            <span className="text-2xl font-bold text-blue-600">
                                                {service.price}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                        <Link 
                                            href={`/admin/services/edit/${service.id}`}
                                            className="flex-1"
                                        >
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(service.id!)}
                                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
