"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  footer?: React.ReactNode;
  variant?: "default" | "gradient";
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  footer,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <Card 
      data-slot="card"
      className={cn(
        "@container/card relative overflow-hidden",
        variant === "gradient" && "bg-gradient-to-t from-primary/5 to-card",
        className
      )}
    >
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline" className={cn(
              "gap-1",
              trend.isPositive ? "text-success border-success/20" : "text-destructive border-destructive/20"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {(subtitle || footer) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {subtitle && (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {subtitle}
              {trend?.isPositive && <TrendingUp className="size-4 text-success" />}
              {trend && !trend.isPositive && <TrendingDown className="size-4 text-destructive" />}
            </div>
          )}
          {footer && (
            <div className="text-muted-foreground">{footer}</div>
          )}
        </CardFooter>
      )}
      {icon && (
        <div className="absolute top-4 right-4 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary opacity-80">
          {icon}
        </div>
      )}
    </Card>
  );
}

