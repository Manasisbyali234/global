import { publicUrlFor } from "../../globals/constants";

function JobZImage({ src, alt, ...props }) {
    const fullSrc = publicUrlFor(src);
    if (src && src.includes('logo-skin-8')) {
        const webpSrc = fullSrc.replace(/\.gif$/i, '.webp');
        // Always provide explicit width/height to prevent CLS
        const w = props.width || 160;
        const h = props.height || 80;
        return (
            <picture style={{ display: 'inline-block', width: props.style?.width || 'auto', height: props.style?.height || h + 'px' }}>
                <source srcSet={webpSrc} type="image/webp" />
                <img
                    {...props}
                    src={fullSrc}
                    alt={alt}
                    width={w}
                    height={h}
                    style={{ ...props.style, aspectRatio: `${w}/${h}` }}
                />
            </picture>
        );
    }
    return <img {...props} src={fullSrc} alt={alt} />;
}

export default JobZImage;
