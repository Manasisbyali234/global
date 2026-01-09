function JobViewPopup() {
    return (
        <>
            <div className="modal fade twm-saved-jobs-view" id="saved-jobs-view" aria-hidden="true" aria-labelledby="sign_up_popupLabel-3" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-header">
                                <h2 className="modal-title" id="sign_up_popupLabel-3">Company Name</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <ul className="list-unstyled">
                                    <li><strong>Job title="" :</strong><p> Web Developer – PHP, HTML, CSS </p></li>
                                    <li><strong>Experience :</strong><p>5 Year 3 Months</p></li>
                                    <li><strong>Deseription :</strong>
                                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry has been the industry's standard dummy text ever since.</p>
                                    </li>
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="site-button" data-bs-dismiss="modal">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
export default JobViewPopup;
