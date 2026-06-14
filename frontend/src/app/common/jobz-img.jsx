import { publicUrlFor } from "../../globals/constants";

function JobZImage({ src, alt, ...props }) {
    const fullSrc = publicUrlFor(src);
    // Serve WebP with GIF fallback for animated logos
    if (src && src.includes('logo-skin-8')) {
        const webpSrc = fullSrc.replace(/\.gif$/i, '.webp');
        return (
            <picture>
                <source srcSet={webpSrc} type="image/webp" />
                <img {...props} src={fullSrc} alt={alt} />
            </picture>
        );
    }
    return <img {...props} src={fullSrc} alt={alt} />;
}

export default JobZImage;
