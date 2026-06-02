"use client";
import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import getCroppedImg from "@/lib/crop";
import { cn } from "@/lib/utils";
import { CheckIcon, CropIcon } from "@phosphor-icons/react";

interface ImageCropperModalProps {
  image: string | null;
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => Promise<void>;
  aspect?: number;
  cropShape?: "rect" | "round";
  title?: string;
  applyLabel?: string;
  cancelLabel?: string;
  zoomLabel?: string;
  className?: string;
}

export function ImageCropperModal({
  image,
  open,
  onClose,
  onCropComplete,
  aspect = 1,
  cropShape = "rect",
  title = "Crop Image",
  applyLabel = "Apply Crop",
  cancelLabel = "Cancel",
  zoomLabel = "Zoom",
  className,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onCropAreaComplete = useCallback((_: Area, clippedAreaPixels: Area) => {
    setCroppedAreaPixels(clippedAreaPixels);
  }, []);

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleDone = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsSubmitting(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        await onCropComplete(croppedImage);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn("max-w-2xl bg-background rounded-4xl", className)}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center">
            <CropIcon className="inline mr-2.25" weight="bold" size={24} />{" "}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-96 mt-4 rounded-3xl overflow-hidden bg-foreground/5 border-2 border-foreground/5">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              onCropChange={onCropChange}
              onCropComplete={onCropAreaComplete}
              onZoomChange={onZoomChange}
              showGrid={false}
              classes={{
                containerClassName: "rounded-3xl",
              }}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-widest ml-1">
            {zoomLabel}
          </label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-xl p-4 flex-1 min-w-0"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleDone}
            disabled={isSubmitting}
            className="rounded-xl p-4 flex-1 min-w-0"
          >
            {isSubmitting ? (
              <Spinner />
            ) : (
              <>
                <CheckIcon weight="bold" className="mr-0.5" size={32} />{" "}
                {applyLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
