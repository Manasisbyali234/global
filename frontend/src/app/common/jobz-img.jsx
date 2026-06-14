import { publicUrlFor } from "../../globals/constants";

function JobZImage({ src, alt, ...props }) {
    const fullSrc = publicUrlFor(src);
    if (src && src.includes('logo-skin-8')) {
        const webpSrc = fullSrc.replace(/\.gif$/i, '.webp');
        const w = props.width || 160;
        const h = props.height || 80;
        // Compute explicit pixel width from the display height to avoid width:auto CLS
        const displayH = parseInt(props.style?.height) || h;
        const displayW = Math.round((w / h) * displayH);
        return (
            <picture style={{ display: 'inline-block', width: displayW + 'px', height: displayH + 'px', flexShrink: 0 }}>
                <source srcSet={webpSrc} type="image/webp" />
                <img
                    {...props}
                    src={fullSrc}
                    alt={alt}
                    width={w}
                    height={h}
                    style={{ ...props.style, height: displayH + 'px', width: displayW + 'px', display: 'block' }}
                />
            </picture>
        );
    }
    return <img {...props} src={fullSrc} alt={alt} />;
}

export default JobZImage;
