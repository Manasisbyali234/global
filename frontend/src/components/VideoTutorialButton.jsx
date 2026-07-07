import { useState } from 'react';
import { createPortal } from 'react-dom';

function VideoTutorialButton({ videoId, style }) {
    const [show, setShow] = useState(false);
    return (
        <>
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                <button
                    onClick={() => setShow(true)}
                    style={{ background: '#ff0000', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', ...style }}
                >
                    <i className="fa fa-play-circle"></i> How it Works
                </button>
            </div>
            {show && createPortal(
                <div onClick={() => setShow(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2147483647, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '60%', maxWidth: '480px', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                        <button onClick={() => setShow(false)} style={{ position: 'absolute', top: '8px', right: '12px', background: '#ff6b35', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', zIndex: 1, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
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
