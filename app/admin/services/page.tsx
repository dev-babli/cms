"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/cms/types";

export default function ServicesList() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="px-[5%] py-12">
                <div className="container max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/admin">
                                <Button variant="outline" className="mb-4">
                                    ← Back to Dashboard
                                </Button>
                            </Link>
                            <h1 className="text-4xl font-semibold tracking-tight mb-2">
                                Services
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your service offerings
                            </p>
                        </div>
                        <Link href="/admin/services/new">
                            <Button size="lg">+ New Service</Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : services.length === 0 ? (
                        <div className="premium-card p-12 text-center">
                            <p className="text-muted-foreground mb-4">No services yet</p>
                            <Link href="/admin/services/new">
                                <Button>Create your first service</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {services.map((service) => (
                                <div key={service.id} className="premium-card p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {service.icon && (
                                                <span className="text-3xl mb-3 block">{service.icon}</span>
                                            )}
                                            <h3 className="text-xl font-semibold mb-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                {service.description}
                                            </p>
                                            {service.price && (
                                                <p className="text-primary font-semibold">
                                                    {service.price}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm mt-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${service.published
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {service.published ? "Published" : "Draft"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 ml-4">
                                            <Link href={`/admin/services/edit/${service.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(service.id!)}
                                            >
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
        </div>
    );
}



