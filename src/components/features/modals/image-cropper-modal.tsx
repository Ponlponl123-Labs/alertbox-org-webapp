"use client";
import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import getCroppedImg from "@/lib/crop";
import { cn } from "@/lib/utils";
import { PhotoStraightenSlider } from "@/components/kokonutui/photo-straighten";
import { Crop } from "@/components/animate-ui/icons/hugeicons/crop";
import Image from "next/image";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Check } from "@/components/animate-ui/icons/hugeicons/check";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/custom-ui/dialog";

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

function ImageCropperBody({
  image,
  onClose,
  onCropComplete,
  aspect,
  cropShape,
  title,
  applyLabel,
  cancelLabel,
  zoomLabel,
  isSubmitting,
  setIsSubmitting,
}: Required<Pick<ImageCropperModalProps, "aspect" | "cropShape" | "title" | "applyLabel" | "cancelLabel" | "zoomLabel">> & {
  image: string | null;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropAreaComplete = useCallback((_: Area, clippedAreaPixels: Area) => {
    setCroppedAreaPixels(clippedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!image || !croppedAreaPixels || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
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
    <div
      className={cn(
        "transition-opacity duration-200",
        isSubmitting && "pointer-events-none opacity-60",
      )}
    >
      <DialogHeader>
        <DialogTitle className="text-base font-semibold font-sans select-none flex items-center">
          <Crop className="inline mr-2.25" size={24} /> {title}
        </DialogTitle>
      </DialogHeader>

      <div className="relative w-full h-96 mt-4 rounded-3xl overflow-hidden bg-foreground/5">
        {image && (
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            objectFit={aspect > 1 ? "horizontal-cover" : "cover"}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onCropComplete={onCropAreaComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            showGrid={false}
            classes={{
              containerClassName: "rounded-3xl",
              cropAreaClassName: "rounded-sm",
            }}
          />
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <PhotoStraightenSlider
          label={zoomLabel}
          min={1}
          max={3}
          step={0.05}
          defaultValue={1}
          value={zoom}
          onChange={setZoom}
        />

        <PhotoStraightenSlider
          label="Straighten"
          min={-45}
          max={45}
          step={1}
          defaultValue={0}
          value={rotation}
          onChange={setRotation}
        />
      </div>

      <DialogFooter className="gap-2 bg-transparent border-0">
        <AnimateIcon animateOnHover>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl p-3 h-max flex-1 min-w-0"
          >
            {cancelLabel}
          </Button>
        </AnimateIcon>
        <AnimateIcon animateOnHover>
          <Button
            onClick={handleDone}
            disabled={isSubmitting}
            className="rounded-2xl p-3 h-max flex-1 min-w-0"
          >
            {isSubmitting ? (
              <Spinner />
            ) : (
              <>
                <Check className="mr-0.5" size={32} /> {applyLabel}
              </>
            )}
          </Button>
        </AnimateIcon>
      </DialogFooter>
    </div>
  );
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !isSubmitting && onClose()}>
      <AnimateIcon animateOnHover>
        <DialogContent
          showCloseButton={false}
          className={cn("max-w-2xl bg-background/80 backdrop-blur-md rounded-4xl overflow-hidden", className)}
        >
          {image && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-4xl">
              <Image
                src={image}
                width={50}
                height={50}
                unoptimized
                className="w-full scale-200 blur-3xl opacity-40 dark:opacity-20 transform-gpu will-change-transform"
                alt="Backdrop"
              />
            </div>
          )}
          <AnimatePresence mode="wait">
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-t from-indigo-500/40 via-emerald-500/20 to-transparent backdrop-blur-xs pointer-events-none"
              >
                <Spinner className="size-8 text-foreground" />
              </motion.div>
            )}
          </AnimatePresence>

          <ImageCropperBody
            key={`${image ?? "empty"}-${open ? "open" : "closed"}`}
            image={image}
            onClose={onClose}
            onCropComplete={onCropComplete}
            aspect={aspect}
            cropShape={cropShape}
            title={title}
            applyLabel={applyLabel}
            cancelLabel={cancelLabel}
            zoomLabel={zoomLabel}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </DialogContent>
      </AnimateIcon>
    </Dialog>
  );
}
