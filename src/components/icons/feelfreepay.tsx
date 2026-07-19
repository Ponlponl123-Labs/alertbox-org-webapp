import { SVGProps } from "react";

export function FeelFreePay(props: SVGProps<SVGSVGElement>) {
  // The original SVG uses multiple paths shifted by (-1, 1) to create a 3D effect.
  // We can use a loop to render these paths to keep the file size manageable.

  const f1Path =
    "M165.45,83.94,64.61,40.33V97.91L152,135.72v22.07L64.61,120v84.22L40,193.57V7.61L165.45,61.87Z";
  const f2Path =
    "M336.14,83.94,235.3,40.33V97.91l87.4,37.81v22.07L235.3,120v84.22l-24.61-10.64V7.61L336.14,61.87Z";

  // The top-most "white" paths
  const f1Top =
    "M130.45,118.94,29.61,75.33v57.58L117,170.72v22.07L29.61,155v84.22L5,228.57v-186L130.45,96.87Z";
  const f2Top =
    "M301.14,118.94,200.3,75.33v57.58l87.4,37.81v22.07L200.3,155v84.22l-24.61-10.64v-186L301.14,96.87Z";

  const render3DPath = (baseD: string) => {
    return Array.from({ length: 36 }).map((_, i) => (
      <path
        key={i}
        fill="none"
        stroke="#3e8ab0"
        strokeMiterlimit={10}
        strokeWidth={10}
        d={baseD}
        transform={`translate(${-i}, ${i})`}
      />
    ));
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 341.14 246.82"
      {...props}
    >
      <g id="Layer_2" data-name="Layer 2">
        <g id="LOGO">
          <path d={f1Top} fill="currentColor" />
          <path d={f2Top} fill="currentColor" />

          {render3DPath(f1Path)}
          {render3DPath(f2Path)}

          <path d={f1Top} fill="white" />
          <path d={f2Top} fill="white" />
        </g>
      </g>
    </svg>
  );
}
