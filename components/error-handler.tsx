"use client";

import { useEffect } from "react";

/**
 * Global error handler for unhandled promise rejections
 * Prevents "[object Event]" errors by properly handling Event objects
 */
export function ErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent default browser behavior
      event.preventDefault();
      
      // Extract error information safely
      const reason = event.reason;
      let errorMessage = "An unhandled error occurred";
      
      if (reason instanceof Error) {
        errorMessage = reason.message;
        console.error("Unhandled promise rejection:", reason);
      } else if (reason instanceof Event) {
        errorMessage = "Network or browser event error occurred";
        console.error("Unhandled promise rejection (Event):", {
          type: reason.type,
          target: reason.target,
        });
      } else if (typeof reason === "string") {
        errorMessage = reason;
        console.error("Unhandled promise rejection:", reason);
      } else {
        errorMessage = String(reason) || "Unknown error";
        console.error("Unhandled promise rejection:", reason);
      }
      
      // In development, show more details
      if (process.env.NODE_ENV === "development") {
        console.error("Promise rejection details:", {
          reason,
          errorMessage,
          stack: reason instanceof Error ? reason.stack : undefined,
        });
      }
    };

    // Handle general errors
    const handleError = (event: ErrorEvent) => {
      // Prevent default browser error display
      event.preventDefault();
      
      const error = event.error;
      let errorMessage = "An error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Global error:", error);
      } else if (error instanceof Event) {
        errorMessage = "Browser event error occurred";
        console.error("Global error (Event):", {
          type: error.type,
          target: error.target,
        });
      } else {
        errorMessage = String(error) || "Unknown error";
        console.error("Global error:", error);
      }
      
      // In development, show more details
      if (process.env.NODE_ENV === "development") {
        console.error("Error details:", {
          error,
          errorMessage,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Cleanup
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null; // This component doesn't render anything
}





