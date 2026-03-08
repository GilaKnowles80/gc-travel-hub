import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const viewModes = [
  { name: 'Mobile', icon: Smartphone, width: '375px', label: 'Mobile (375px)' },
  { name: 'Tablet', icon: Tablet, width: '768px', label: 'Tablet (768px)' },
  { name: 'Laptop', icon: Laptop, width: '1024px', label: 'Laptop (1024px)' },
  { name: 'Desktop', icon: Monitor, width: '1920px', label: 'Desktop (1920px)' },
];

export default function ViewModeSwitcher() {
  const [viewMode, setViewMode] = useState('full');

  const currentMode = viewModes.find(m => m.name.toLowerCase() === viewMode.toLowerCase());
  const CurrentIcon = currentMode?.icon || Monitor;

  const handleViewChange = (mode) => {
    setViewMode(mode.name.toLowerCase());
    document.documentElement.style.setProperty('--view-width', mode.width);
  };

  const handleFullWidth = () => {
    setViewMode('full');
    document.documentElement.style.setProperty('--view-width', '100%');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs shrink-0">
          <CurrentIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{currentMode?.name || 'Full'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <DropdownMenuItem
              key={mode.name}
              onClick={() => handleViewChange(mode)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{mode.label}</span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem onClick={handleFullWidth} className="border-t">
          <span className="flex-1">Full Width</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}