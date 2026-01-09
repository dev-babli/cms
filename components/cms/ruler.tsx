"use client";

import { useEffect, useRef, useState } from 'react';

interface RulerProps {
    orientation?: 'horizontal' | 'vertical';
    unit?: 'px' | 'in' | 'cm';
}

export function Ruler({ orientation = 'horizontal', unit = 'px' }: RulerProps) {
    const rulerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (rulerRef.current) {
            setWidth(rulerRef.current.offsetWidth);
        }
    }, []);

    const marks = [];
    const interval = unit === 'px' ? 50 : unit === 'in' ? 1 : 2.54;
    const maxMarks = Math.floor(width / interval);

    for (let i = 0; i <= maxMarks; i++) {
        const value = i * interval;
        marks.push(
            <div
                key={i}
                className="absolute border-l border-border text-xs text-muted-foreground"
                style={{
                    left: `${value}${unit === 'px' ? 'px' : 'px'}`,
                    height: '100%',
                    paddingLeft: '2px',
                }}
            >
                {i % 5 === 0 && (
                    <span className="text-[10px]">{value}</span>
                )}
            </div>
        );
    }

    if (orientation === 'vertical') {
        return (
            <div className="w-6 bg-slate-100 border-r border-border relative" style={{ height: '100%' }}>
                {marks}
            </div>
        );
    }

    return (
        <div
            ref={rulerRef}
            className="h-6 bg-slate-100 border-b border-border relative overflow-hidden"
        >
            {marks}
        </div>
    );
}















