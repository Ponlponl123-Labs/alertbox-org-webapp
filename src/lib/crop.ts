const MAX_DECODE_DIMENSION = 2048;
const MAX_OUTPUT_DIMENSION = 1600;

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
): Promise<Blob | null> {
  if (pixelCrop.width <= 0 || pixelCrop.height <= 0) return null;

  const image = await createImage(imageSrc);
  const srcWidth = image.naturalWidth || image.width;
  const srcHeight = image.naturalHeight || image.height;
  if (srcWidth <= 0 || srcHeight <= 0) return null;

  const rotRad = getRadianAngle(rotation);
  const { width: rawBBoxW, height: rawBBoxH } = rotateSize(srcWidth, srcHeight, rotation);

  const decodeScale = Math.min(
    1,
    MAX_DECODE_DIMENSION / Math.max(1, rawBBoxW, rawBBoxH),
  );
  const scaledBBoxW = Math.max(1, Math.round(rawBBoxW * decodeScale));
  const scaledBBoxH = Math.max(1, Math.round(rawBBoxH * decodeScale));
  const scaledImgW = srcWidth * decodeScale;
  const scaledImgH = srcHeight * decodeScale;

  const workCanvas = document.createElement("canvas");
  const outCanvas = document.createElement("canvas");

  try {
    workCanvas.width = scaledBBoxW;
    workCanvas.height = scaledBBoxH;
    const workCtx = workCanvas.getContext("2d");
    if (!workCtx) return null;

    workCtx.translate(scaledBBoxW / 2, scaledBBoxH / 2);
    workCtx.rotate(rotRad);
    workCtx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    workCtx.translate(-scaledImgW / 2, -scaledImgH / 2);
    workCtx.drawImage(image, 0, 0, scaledImgW, scaledImgH);

    const sx = Math.max(0, Math.round(pixelCrop.x * decodeScale));
    const sy = Math.max(0, Math.round(pixelCrop.y * decodeScale));
    const sw = Math.max(1, Math.min(scaledBBoxW - sx, Math.round(pixelCrop.width * decodeScale)));
    const sh = Math.max(1, Math.min(scaledBBoxH - sy, Math.round(pixelCrop.height * decodeScale)));

    const outScale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(1, sw, sh));
    const outW = Math.max(1, Math.round(sw * outScale));
    const outH = Math.max(1, Math.round(sh * outScale));

    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return null;

    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = "high";
    outCtx.drawImage(workCanvas, sx, sy, sw, sh, 0, 0, outW, outH);

    return await new Promise<Blob | null>((resolve) => {
      outCanvas.toBlob((file) => resolve(file), "image/webp", 0.9);
    });
  } finally {
    workCanvas.width = 0;
    workCanvas.height = 0;
    outCanvas.width = 0;
    outCanvas.height = 0;
  }
}
