import { orbit } from "@/data/content";

// Pure CSS orbit: rings rotate, pills counter-rotate so text stays upright.
const rings = [
  { items: orbit.inner, size: 230, speed: 38, dir: 1 },
  { items: orbit.middle, size: 350, speed: 56, dir: -1 },
  { items: orbit.outer, size: 470, speed: 78, dir: 1 },
];

export default function Orbit() {
  return (
    <div className="orbit-scale" aria-hidden="true">
      <div className="orbit">
        <div className="orbit-core"><img src="/akhand.jpg" alt="" /></div>
        {rings.map((r) => (
          <div
            key={r.size}
            className="ring"
            style={{
              width: r.size,
              height: r.size,
              margin: `-${r.size / 2}px 0 0 -${r.size / 2}px`,
              animationDuration: `${r.speed}s`,
              animationDirection: r.dir === 1 ? "normal" : "reverse",
            }}
          >
            {r.items.map((label, i) => {
              const angle = (360 / r.items.length) * i;
              return (
                <div
                  key={label}
                  className="slot"
                  style={{ transform: `rotate(${angle}deg) translateY(-${r.size / 2}px) rotate(${-angle}deg)` }}
                >
                  <div className="chip-pos"><span
                    className="chip"
                    style={{
                      animationDuration: `${r.speed}s`,
                      animationDirection: r.dir === 1 ? "reverse" : "normal",
                    }}
                  >
                    {label}
                  </span></div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
