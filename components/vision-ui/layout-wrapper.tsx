"use client";

import * as React from "react";
import { VisionUILayout } from "./layout";

interface VisionUILayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component to ensure VisionUILayout is properly rendered as a client component
 * This prevents server/client component boundary issues
 */
export function VisionUILayoutWrapper({ children }: VisionUILayoutWrapperProps) {
  return <VisionUILayout>{children}</VisionUILayout>;
}

