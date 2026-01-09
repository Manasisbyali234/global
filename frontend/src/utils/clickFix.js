// Fix for single click navigation
export const handleSingleClick = (navigate, path) => {
    navigate(path);
};

export const preventDoubleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
};
