import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SearchableSelect = ({ options, value, onChange, placeholder, className, isMulti = false, showCategories = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        bottom: 'auto',
        left: 0,
        width: 0,
        maxHeight: 300
    });
    const wrapperRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const clickedTrigger = wrapperRef.current && wrapperRef.current.contains(e.target);
            const clickedMenu = menuRef.current && menuRef.current.contains(e.target);

            if (!clickedTrigger && !clickedMenu) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen || !wrapperRef.current) {
            return undefined;
        }

        const updateMenuPosition = () => {
            if (!wrapperRef.current) {
                return;
            }

            const rect = wrapperRef.current.getBoundingClientRect();
            const viewportPadding = 8;
            const menuGap = 4;
            const visibleOptionCount = options.filter(opt =>
                opt.label.toLowerCase().includes(search.toLowerCase())
            ).length;
            const preferredMenuHeight = Math.min(300, Math.max(180, visibleOptionCount * 36 + 60));
            const spaceAbove = rect.top - viewportPadding;
            const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
            const shouldDropUp = spaceBelow < preferredMenuHeight && spaceAbove > spaceBelow;
            const maxHeight = Math.min(
                300,
                Math.max(140, shouldDropUp ? spaceAbove - menuGap : spaceBelow - menuGap)
            );
            const maxWidth = window.innerWidth - viewportPadding * 2;
            const width = Math.min(rect.width, maxWidth);
            const left = Math.min(
                Math.max(viewportPadding, rect.left),
                Math.max(viewportPadding, window.innerWidth - viewportPadding - width)
            );

            setMenuPosition({
                top: shouldDropUp ? 'auto' : rect.bottom + menuGap,
                bottom: shouldDropUp ? window.innerHeight - rect.top + menuGap : 'auto',
                left,
                width,
                maxHeight
            });
        };

        const frameId = window.requestAnimationFrame(updateMenuPosition);
        window.addEventListener('resize', updateMenuPosition);
        window.addEventListener('scroll', updateMenuPosition, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [isOpen, options, search]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return undefined;

        const panel = wrapper.closest('.panel');
        const panelContainer = wrapper.closest('.panel-body, .wt-panel-body, .twm-panel-inner');

        if (isOpen) {
            panel?.classList.add('dropdown-open-panel');
            panelContainer?.classList.add('dropdown-open-container');
        } else {
            panel?.classList.remove('dropdown-open-panel');
            panelContainer?.classList.remove('dropdown-open-container');
        }

        return () => {
            panel?.classList.remove('dropdown-open-panel');
            panelContainer?.classList.remove('dropdown-open-container');
        };
    }, [isOpen]);

    const filtered = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    // Group options by category if showCategories is true
    const groupedOptions = showCategories ? filtered.reduce((groups, option) => {
        const category = option.category || 'Other';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(option);
        return groups;
    }, {}) : null;

    // Sort categories to show popular ones first
    const sortedCategories = groupedOptions ? Object.keys(groupedOptions).sort((a, b) => {
        const order = { 'Metro Cities': 1, 'Major Cities': 2, 'Other Cities': 3, 'Other': 4 };
        return (order[a] || 999) - (order[b] || 999);
    }) : [];

    const handleOptionClick = (optionValue) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValues);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
        setSearch('');
    };

    const handleAddCustom = () => {
        if (search.trim() && !options.find(opt => opt.label.toLowerCase() === search.toLowerCase())) {
            if (isMulti) {
                const currentValues = Array.isArray(value) ? value : [];
                onChange([...currentValues, search.trim()]);
            } else {
                onChange(search.trim());
                setIsOpen(false);
            }
            setSearch('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustom();
        }
    };

    const removeValue = (valueToRemove) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            onChange(currentValues.filter(v => v !== valueToRemove));
        }
    };

    const renderValue = () => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            if (currentValues.length === 0) {
                return <span className="text-muted">{placeholder}</span>;
            }
            return (
                <div className="d-flex flex-wrap gap-1" style={{
                    paddingRight: '20px',
                    width: '100%',
                    maxHeight: window.innerWidth <= 768 ? '80px' : 'none',
                    overflowY: window.innerWidth <= 768 ? 'auto' : 'visible'
                }}>
                    {currentValues.map((val, index) => (
                        <span key={index} style={{
                            border: '1px solid #007bff', 
                            borderRadius: window.innerWidth <= 768 ? '8px' : '20px', 
                            padding: window.innerWidth <= 768 ? '1px 4px' : '4px 8px 4px 12px', 
                            fontSize: window.innerWidth <= 768 ? '0.6em' : '0.875em', 
                            backgroundColor: '#e3f2fd',
                            color: '#0056b3',
                            fontWeight: '500',
                            flexShrink: 0,
                            marginBottom: window.innerWidth <= 768 ? '1px' : '2px',
                            marginRight: window.innerWidth <= 768 ? '1px' : '2px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: window.innerWidth <= 768 ? '16px' : 'auto',
                            lineHeight: 1,
                            minWidth: window.innerWidth <= 768 ? '40px' : '60px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth <= 768 ? '1px' : '4px' }}>
                                <i className="fa fa-map-marker" style={{ fontSize: window.innerWidth <= 768 ? '0.5em' : '0.8em' }}></i>
                                <span style={{ fontSize: 'inherit', lineHeight: 1 }}>{val}</span>
                            </div>
                            <span
                                style={{ 
                                    fontSize: window.innerWidth <= 768 ? '0.7em' : '0.9em',
                                    opacity: '1',
                                    cursor: 'pointer',
                                    width: window.innerWidth <= 768 ? '12px' : '16px',
                                    height: window.innerWidth <= 768 ? '12px' : '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    marginLeft: '4px'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeValue(val);
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                            >×</span>
                        </span>
                    ))}
                </div>
            );
        } else {
            const selected = options.find(opt => opt.value === value);
            return selected ? selected.label : placeholder;
        }
    };

    const listMaxHeight = Math.max(96, menuPosition.maxHeight - 48);

    const dropdownMenu = isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: menuPosition.top,
                    bottom: menuPosition.bottom,
                    left: menuPosition.left,
                    width: menuPosition.width,
                    backgroundColor: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    maxHeight: menuPosition.maxHeight,
                    overflow: 'hidden',
                    zIndex: 2147483646,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            >
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search or type to add..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onClick={(e) => e.stopPropagation()}
                    style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #dee2e6' }}
                    autoFocus
                />
                <div style={{ maxHeight: listMaxHeight, overflowY: 'auto' }}>
                    {showCategories && groupedOptions ? (
                        sortedCategories.map(category => (
                            <div key={category}>
                                <div style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 'bold',
                                    fontSize: '0.875em',
                                    color: '#495057',
                                    borderBottom: '1px solid #dee2e6',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 10
                                }}>
                                    <i className={`fa ${category === 'Metro Cities' ? 'fa-star' : category === 'Major Cities' ? 'fa-building' : 'fa-map-marker'} me-2`}></i>
                                    {category}
                                </div>
                                {groupedOptions[category].map(opt => {
                                    const isSelected = isMulti
                                        ? Array.isArray(value) && value.includes(opt.value)
                                        : opt.value === value;
                                    return (
                                        <div
                                            key={opt.value}
                                            onClick={() => handleOptionClick(opt.value)}
                                            style={{
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                borderLeft: opt.popular ? '3px solid #007bff' : 'none'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = isSelected ? '#bbdefb' : '#f8f9fa'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = isSelected ? '#e3f2fd' : '#fff'}
                                        >
                                            {isMulti && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    style={{ marginRight: '8px', flexShrink: 0, zIndex: 1 }}
                                                />
                                            )}
                                            <span style={{ flex: 1 }}>{opt.label}</span>
                                            {opt.popular && (
                                                <span style={{
                                                    fontSize: '0.75em',
                                                    color: '#007bff',
                                                    fontWeight: 'bold',
                                                    marginLeft: '8px'
                                                }}>
                                                    POPULAR
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    ) : (
                        filtered.map(opt => {
                            const isSelected = isMulti
                                ? Array.isArray(value) && value.includes(opt.value)
                                : opt.value === value;
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => handleOptionClick(opt.value)}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = isSelected ? '#e3f2fd' : '#fff'}
                                >
                                    {isMulti && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            style={{ marginRight: '8px', flexShrink: 0, zIndex: 1 }}
                                        />
                                    )}
                                    {opt.label}
                                </div>
                            );
                        })
                    )}
                    {search.trim() && !options.find(opt => opt.label.toLowerCase() === search.toLowerCase()) && (
                        <div
                            onClick={handleAddCustom}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: '#f8f9fa',
                                borderTop: '1px solid #dee2e6',
                                fontStyle: 'italic',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        >
                            <i className="fa fa-plus-circle me-2 text-success"></i>
                            Add "{search.trim()}"
                        </div>
                    )}
                    {filtered.length === 0 && !search.trim() && (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#6c757d' }}>
                            <i className="fa fa-search mb-2" style={{ fontSize: '2em', opacity: 0.5 }}></i>
                            <div>Start typing to search locations...</div>
                        </div>
                    )}
                    {filtered.length === 0 && search.trim() && (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#6c757d' }}>
                            <i className="fa fa-exclamation-circle mb-2" style={{ fontSize: '2em', opacity: 0.5 }}></i>
                            <div>No locations found matching "{search}"</div>
                            <small>You can add it as a custom location</small>
                        </div>
                    )}
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div 
                className={className}
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    cursor: 'pointer', 
                    minHeight: '38px',
                    height: 'auto',
                    padding: '6px 36px 6px 12px', 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    position: 'relative'
                }}
            >
                {renderValue()}
                {!isMulti && (
                    <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ 
                        fontSize: '0.8em', 
                        color: '#6c757d',
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}></i>
                )}
            </div>
            {dropdownMenu}
        </div>
    );
};

export default SearchableSelect;
