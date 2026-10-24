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
import Grainient from "@/components/Grainient";
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
  const [zoom, setZoom] = useState(0.95);
  const [rotation, setRotation] = useState(0);
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
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AnimateIcon animateOnHover>
        <DialogContent
          showCloseButton={false}
          className={cn("max-w-2xl bg-background/80 backdrop-blur-md rounded-4xl overflow-hidden", className)}
        >
          {
            image && <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-4xl">
              <Image
                src={image}
                width={50}
                height={50}
                unoptimized
                className="w-full scale-200 blur-3xl opacity-40 dark:opacity-20"
                alt="Backdrop"
              />
            </div>
          }
          <AnimatePresence mode="wait">
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 z-50 flex items-center justify-center">
                <Grainient
                  className="absolute inset-0 pointer-events-none mask-t-from-0"
                  opacity={0.9}
                  colors={[
                    "transparent",
                    "rgba(239, 68, 68, 0.3)",
                    "rgba(234, 179, 8, 0.6)",
                    "rgba(16, 185, 129, 0.9)",
                    "rgba(99, 102, 241, 1)",
                  ]}
                  angle={196}
                  flow={2}
                  silk={1}
                  grainAmount={0.15}
                  type="linear"
                  bands={1}
                  softness={1}
                  scale={1}
                  speed={3}
                  grainSize={1.2}
                  grainAnimated={false}
                  contrast={1.6}
                  saturation={1}
                  variation={15}
                  interactive={false}
                  stir={1}
                  clickSwirl={false}
                  intro={false}
                  lightMode={false}
                />
              </motion.div>
            )}

          </AnimatePresence>

          <div className={cn(
            "transition-all duration-200",
            isSubmitting && "blur-xs pointer-events-none opacity-80"
          )}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold font-sans select-none flex items-center">
                <Crop className="inline mr-2.25" size={24} />{" "}
                {title}
              </DialogTitle>
            </DialogHeader>

            <div className="relative w-full h-96 mt-4 rounded-3xl overflow-hidden bg-foreground/5">
              {image && (
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  cropShape={cropShape}
                  onCropChange={onCropChange}
                  onCropComplete={onCropAreaComplete}
                  onZoomChange={onZoomChange}
                  onRotationChange={setRotation}
                  showGrid={false}
                  classes={{
                    containerClassName: "rounded-3xl",
                    cropAreaClassName: "rounded-sm"
                  }}
                />
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <PhotoStraightenSlider
                label={zoomLabel}
                min={0.95}
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
                      <Check className="mr-0.5" size={32} />{" "}
                      {applyLabel}
                    </>
                  )}
                </Button>
              </AnimateIcon>
            </DialogFooter>
          </div>
        </DialogContent>
      </AnimateIcon>
    </Dialog>
  );
}
