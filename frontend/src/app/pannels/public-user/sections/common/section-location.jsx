import './section-location.css';

function SectionLocation({ employer }) {
    const hasMapEmbed = () => {
        if (employer?.googleMapsEmbed) {
            const srcMatch = employer.googleMapsEmbed.match(/src=["']([^"']+)["']/);
            return !!srcMatch;
        }
        return false;
    };

    const getMapSrc = () => {
        if (employer?.googleMapsEmbed) {
            const srcMatch = employer.googleMapsEmbed.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
                const mapUrl = srcMatch[1];
                return mapUrl.includes('?') ? `${mapUrl}&color=0xff0000` : `${mapUrl}?color=0xff0000`;
            }
        }
        return '';
    };

    return (
        <>
            <h4 className="section-head-small mb-4">Location</h4>
            {hasMapEmbed() ? (
                <div className="twm-s-map-iframe" style={{filter: 'none', WebkitFilter: 'none'}}>
                    <iframe 
                        height={270} 
                        src={getMapSrc()}
                        style={{border: 0, width: '100%', filter: 'none', WebkitFilter: 'none'}}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            ) : (
                <div className="text-center p-4" style={{backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6'}}>
                    <i className="fa fa-map-marker" style={{fontSize: '48px', color: '#6c757d', marginBottom: '16px'}}></i>
                    <p className="text-muted mb-0" style={{fontSize: '16px'}}>Location not Updated</p>
                </div>
            )}
        </>
    )
}

export default SectionLocation;
