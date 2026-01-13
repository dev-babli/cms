"use client";

import { lazy, Suspense } from "react";
import { WelcomeSection } from "./welcome-section";
import { EnhancedStatsCards } from "./enhanced-stats-cards";

// Lazy load heavy components for better initial page load
const PerformanceWidget = lazy(() => import("./performance-widget").then(m => ({ default: m.PerformanceWidget })));
const RecentContent = lazy(() => import("./recent-content").then(m => ({ default: m.RecentContent })));
const ContentAnalytics = lazy(() => import("./content-analytics").then(m => ({ default: m.ContentAnalytics })));
const UserActivity = lazy(() => import("./user-activity").then(m => ({ default: m.UserActivity })));
const QuickActions = lazy(() => import("./quick-actions").then(m => ({ default: m.QuickActions })));
const TasksList = lazy(() => import("./tasks-list").then(m => ({ default: m.TasksList })));

// Loading skeleton component
function WidgetSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function DashboardWidgets() {
  return (
    <div className="space-y-6">
      {/* Welcome Section - Load immediately */}
      <WelcomeSection />

      {/* Enhanced Stats Cards - Load immediately (critical data) */}
      <EnhancedStatsCards />

      {/* Main Content Grid - Lazy load below-the-fold content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Analytics - Lazy loaded */}
          <Suspense fallback={<WidgetSkeleton />}>
            <ContentAnalytics />
          </Suspense>

          {/* Recent Content - Lazy loaded */}
          <Suspense fallback={<WidgetSkeleton />}>
            <RecentContent />
          </Suspense>

          {/* Tasks List - Lazy loaded */}
          <Suspense fallback={<WidgetSkeleton />}>
            <TasksList />
          </Suspense>
        </div>

        {/* Right Column - 1 column */}
        <div className="space-y-6">
          {/* Performance Widget - Lazy loaded */}
          <Suspense fallback={<WidgetSkeleton />}>
            <PerformanceWidget />
          </Suspense>

          {/* User Activity - Lazy loaded */}
          <Suspense fallback={<WidgetSkeleton />}>
            <UserActivity />
          </Suspense>

          {/* Quick Actions - Lazy loaded */}
          <Suspense fallback={<WidgetSkeleton />}>
            <QuickActions />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

