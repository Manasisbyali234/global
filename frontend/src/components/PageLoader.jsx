import "./PageLoader.css";

function PageLoader({ pageName = "Page" }) {
    return (
        <div className="page-loader" role="status" aria-live="polite" aria-label={`${pageName} is loading`}>
            <div className="page-loader__orb">
                <i className="fa fa-spinner fa-spin page-loader__icon" aria-hidden="true"></i>
            </div>
            <p className="page-loader__text">{pageName} Loading.....</p>
        </div>
    );
}

export default PageLoader;
