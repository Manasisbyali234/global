import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, placeholder = "Search...", className = "" }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div className={`search-bar-container ${className}`}>
            <div className="search-input-wrapper">
                <i className="fa fa-search search-icon"></i>
                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleSearch}
                />

            </div>
        </div>
    );
}

export default SearchBar;