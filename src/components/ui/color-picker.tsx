import React from "react";
import { Saturation, Hue, hsvaToHex, hexToHsva } from "@uiw/react-color";

export interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

export function ColorPicker({
  color,
  onChange,
  presetColors = [
    "#6366f1",
    "#3b82f6",
    "#10b981",
    "#ef4444",
    "#f59e0b",
    "#ec4899",
  ],
}: ColorPickerProps) {
  const hsva = hexToHsva(color);

  return (
    <div className="w-full flex flex-col gap-2 bg-background/30 p-2.5 rounded-2xl border border-foreground/5 overflow-hidden">
      <div className="h-32 w-full relative rounded-lg overflow-hidden">
        <Saturation
          hsva={hsva}
          onChange={(newColor) => {
            onChange(hsvaToHex({ ...hsva, ...newColor }));
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <div className="w-full relative rounded-sm overflow-hidden">
        <Hue
          hue={hsva.h}
          onChange={(newHue) => {
            onChange(hsvaToHex({ ...hsva, h: newHue.h }));
          }}
        />
      </div>

      {presetColors.length > 0 && (
        <div className="flex gap-2 justify-center mt-1">
          {presetColors.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className="size-6 rounded-full border border-foreground/10 active:scale-90 transition-transform cursor-pointer"
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
