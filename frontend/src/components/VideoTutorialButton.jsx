import { useState } from 'react';
import { createPortal } from 'react-dom';

function VideoTutorialButton({ videoId, style, pinned = true }) {
    const [show, setShow] = useState(false);
    const wrapperStyle = pinned
        ? { position: 'absolute', top: '12px', right: '16px', zIndex: 10 }
        : { display: 'inline-flex', verticalAlign: 'middle' };
    return (
        <>
            <div style={wrapperStyle}>
            <button
                onClick={() => setShow(true)}
                style={{ background: '#ff0000', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer', fontSize: '9px', fontWeight: '600', lineHeight: '1.4', ...style }}
            >
                <i className="fa fa-play-circle" style={{ fontSize: '9px' }}></i> How it Works
            </button>
            </div>
            {show && createPortal(
                <div onClick={() => setShow(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2147483647, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '60%', maxWidth: '480px', background: '#000', borderRadius: '8px', overflow: 'visible' }}>
                        <button onClick={() => setShow(false)} className="video-close-btn" style={{ position: 'absolute', top: '-40px', right: '-40px' }}>&times;</button>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '8px', overflow: 'hidden' }}>
                            <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title="Tutorial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default VideoTutorialButton;
