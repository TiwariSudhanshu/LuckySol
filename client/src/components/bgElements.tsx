import Image from "next/image";

const elements = [
  { src: "/investment.png", alt: "investment", size: 60 },
  { src: "/lightning.png", alt: "lightning", size: 50 },
  { src: "/night-party.png", alt: "night-party", size: 70 },
  { src: "/payment.png", alt: "payment", size: 55 },
  { src: "/shooting-star.png", alt: "shooting-star", size: 80 },
];

// Safe edge-only zones
const zones = [
  { top: "5%", left: "5%" },
  { top: "10%", left: "80%" },
  { top: "25%", left: "10%" },
  { top: "25%", left: "85%" },
  { top: "70%", left: "5%" },
  { top: "70%", left: "85%" },
  { top: "85%", left: "15%" },
  { top: "85%", left: "75%" },
];

export default function BgElements() {
  return (
    <div
      className="
        absolute inset-0 z-0 pointer-events-none
        opacity-20 
        md:opacity-90
      "
    >
      {elements.map((el, i) =>
        Array.from({ length: 2 }).map((_, j) => {
          const zone = zones[(i * 2 + j) % zones.length];

          return (
            <Image
              key={`${el.alt}-${i}-${j}`}
              src={el.src}
              alt={el.alt}
              width={el.size}
              height={el.size}
              className="absolute"
              style={{ top: zone.top, left: zone.left }}
            />
          );
        })
      )}
    </div>
  );
}
