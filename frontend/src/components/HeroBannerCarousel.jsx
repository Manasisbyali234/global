import { useEffect, useRef, useState } from "react";
import { publicUrlFor } from "../globals/constants";

const BANNER = publicUrlFor("images/photo_2026-07-02_15-20-31.jpg");
const SLIDES = [BANNER, BANNER, BANNER];
const TOTAL = SLIDES.length;

export default function HeroBannerCarousel() {
    const [current, setCurrent] = useState(0);
    const currentRef = useRef(0);

    useEffect(() => {
        const id = setInterval(() => {
            const next = (currentRef.current + 1) % TOTAL;
            currentRef.current = next;
            setCurrent(next);
        }, 3500);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{ width: "100%", padding: "0 15px", boxSizing: "border-box", marginBottom: "32px" }}>
            <div style={{ width: "100%", overflow: "hidden", borderRadius: "16px" }}>
                <div
                    style={{
                        display: "flex",
                        transform: `translateX(-${current * 100}%)`,
                        transition: "transform 0.65s ease",
                        willChange: "transform",
                    }}
                >
                    {SLIDES.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`Banner ${i + 1}`}
                            style={{
                                minWidth: "100%",
                                width: "100%",
                                height: "auto",
                                display: "block",
                                userSelect: "none",
                                pointerEvents: "none",
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
