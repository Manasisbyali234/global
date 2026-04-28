import "./PageLoader.css";

function PageLoader({ pageName = "Page", compact = false, loadingText }) {
    const loaderText = loadingText || `${pageName} Loading.....`;

    return (
        <div
            className={`page-loader${compact ? " page-loader--compact" : ""}`}
            role="status"
            aria-live="polite"
            aria-label={`${pageName} is loading`}
        >
            <div className="page-loader__orb">
                <i className="fa fa-spinner fa-spin page-loader__icon" aria-hidden="true"></i>
            </div>
            <p className="page-loader__text">{loaderText}</p>
        </div>
    );
}

export default PageLoader;
