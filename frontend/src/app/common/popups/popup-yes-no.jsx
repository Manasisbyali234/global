import { useNavigate } from "react-router-dom";
import { popupType } from "../../../globals/constants";
import { publicUser } from "../../../globals/route-names";
import { useAuth } from "../../../contexts/AuthContext";
import { logout as authLogout } from "../../../utils/auth";

function YesNoPopup(props) {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const yesHandler = () => {
        if(props.type === popupType.LOGOUT) {
            logout();
            authLogout();
            const modal = document.getElementById(props.id);
            if (modal) {
                const bsModal = window.bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }
            navigateToAfterLogin();
        }
    }

    const navigateToAfterLogin = () => {
        navigate(publicUser.INITIAL);
    }

    return (
        <>
            <div className="modal fade twm-model-popup" id={props.id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>

                        <div className="modal-body">
                            <h4 className="modal-title">{props.msg}</h4>
                        </div>

                        <div className="modal-footer" style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                            <button type="button" className="site-button outline-primary" onClick={yesHandler} style={{flex: 1, minWidth: '120px'}}>Yes</button>
                            <button type="button" className="site-button" data-bs-dismiss="modal" style={{flex: 1, minWidth: '120px'}}>No</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default YesNoPopup;
