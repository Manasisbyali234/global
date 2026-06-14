import { publicUrlFor } from "../../globals/constants";

function JobZImage({ src, alt, ...props }) {
    const fullSrc = publicUrlFor(src);
    if (src && src.includes('logo-skin-8')) {
        const webpSrc = fullSrc.replace(/\.gif$/i, '.webp');
        const w = props.width || 160;
        const h = props.height || 80;
        const displayH = props.style?.height || (h + 'px');
        const displayW = props.style?.width || 'auto';
        return (
            <picture style={{ display: 'inline-block', width: displayW, height: displayH, flexShrink: 0 }}>
                <source srcSet={webpSrc} type="image/webp" />
                <img
                    {...props}
                    src={fullSrc}
                    alt={alt}
                    width={w}
                    height={h}
                    style={{ ...props.style, height: displayH, width: displayW, aspectRatio: `${w}/${h}` }}
                />
            </picture>
        );
    }
    return <img {...props} src={fullSrc} alt={alt} />;
}

export default JobZImage;
