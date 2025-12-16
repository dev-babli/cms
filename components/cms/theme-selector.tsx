"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSelectorProps {
    onThemeChange?: (theme: Theme) => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
    const [theme, setTheme] = useState<Theme>('light');

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        onThemeChange?.(newTheme);
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="sm" className="h-9">
                    <Palette className="w-4 h-4 mr-2" />
                    Theme
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[180px] bg-white border border-border rounded-lg shadow-xl p-1 z-50">
                    <DropdownMenu.Item
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none ${
                            theme === 'light' ? 'bg-primary/10 text-primary' : ''
                        }`}
                        onSelect={() => handleThemeChange('light')}
                    >
                        <Sun className="w-4 h-4" />
                        Light
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none ${
                            theme === 'dark' ? 'bg-primary/10 text-primary' : ''
                        }`}
                        onSelect={() => handleThemeChange('dark')}
                    >
                        <Moon className="w-4 h-4" />
                        Dark
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none ${
                            theme === 'system' ? 'bg-primary/10 text-primary' : ''
                        }`}
                        onSelect={() => handleThemeChange('system')}
                    >
                        <Monitor className="w-4 h-4" />
                        System
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

