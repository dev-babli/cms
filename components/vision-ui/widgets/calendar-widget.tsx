"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color: string;
}

export function VisionUICalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch blog posts with publish dates as calendar events
        const res = await fetch("/api/cms/blog?limit=10", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const calendarEvents: CalendarEvent[] = data.data
              .filter((post: any) => post.publish_date)
              .map((post: any, idx: number) => ({
                id: `event-${post.id}`,
                title: post.title || "Untitled",
                date: new Date(post.publish_date),
                color: post.published ? "#10B981" : "#3B82F6",
              }));
            setEvents(calendarEvents);
          }
        }
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
        // Fallback to default events
        setEvents([
          { id: "1", title: "Team Meeting", date: new Date(), color: "#3B82F6" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="text-lg font-semibold text-white">Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#334155] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#334155] rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-[#94A3B8] py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysBeforeMonth.map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}
        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square p-1 rounded-lg border border-transparent hover:border-[#334155] transition-colors",
                isToday && "bg-[#3B82F6]/20 border-[#3B82F6]",
                !isCurrentMonth && "opacity-30"
              )}
            >
              <div className="text-xs font-medium text-white mb-1">
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {(dayEvents || []).slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="h-1.5 rounded"
                    style={{ backgroundColor: event.color }}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-[#94A3B8]">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Legend */}
      <div className="mt-4 pt-4 border-t border-[#334155]">
        <div className="flex flex-wrap gap-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <span className="text-xs text-[#CBD5E1]">{event.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

