export const formatCategory = (category) => {
    if (!category) return '';
    const lower = category.toLowerCase();
    return lower === 'it' ? 'IT' : category;
};
