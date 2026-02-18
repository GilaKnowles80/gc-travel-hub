import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export function MobileSelect({ value, onValueChange, placeholder, children, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Extract options from children
  const options = React.Children.toArray(children).flatMap(child => {
    if (child.type?.displayName === 'SelectContent') {
      return React.Children.toArray(child.props.children).flatMap(item => {
        if (item.type?.displayName === 'SelectItem') {
          return [{
            value: item.props.value,
            label: item.props.children
          }];
        }
        return [];
      });
    }
    return [];
  });

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  if (!isMobile) {
    return children;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          triggerClassName
        )}
      >
        <span className={value ? "" : "text-muted-foreground"}>{selectedLabel}</span>
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 max-h-[60vh] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left hover:bg-accent",
                  value === option.value && "bg-accent"
                )}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="h-5 w-5" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}