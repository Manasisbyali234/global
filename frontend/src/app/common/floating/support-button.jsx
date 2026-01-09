import { NavLink } from "react-router-dom";

function SupportFloatingButton() {
    return (
        <div className="support-floating-btn">
            <NavLink 
                to="/support" 
                className="support-btn"
                title="Get Support"
            >
                <i className="fas fa-headset"></i>
                <span>Support</span>
            </NavLink>
            <style jsx>{`
                .support-floating-btn {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                
                .support-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 50px;
                    text-decoration: none;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .support-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                    color: white;
                    text-decoration: none;
                }
                
                .support-btn i {
                    font-size: 16px;
                }
                
                @media (max-width: 768px) {
                    .support-floating-btn {
                        bottom: 15px;
                        right: 15px;
                    }
                    
                    .support-btn {
                        padding: 10px 16px;
                        font-size: 13px;
                    }
                    
                    .support-btn span {
                        display: none;
                    }
                    
                    .support-btn {
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}

export default SupportFloatingButton;
