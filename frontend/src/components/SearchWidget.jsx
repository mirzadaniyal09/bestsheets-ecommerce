import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchWidget = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      setKeyword('');
    }
  };

  const handleClear = () => {
    setKeyword('');
  };

  return (
    <form className="d-flex" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="search"
          className="form-control"
          placeholder="Search bedsheets..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {keyword && (
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={handleClear}
            title="Clear search"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
        <button
          className="btn btn-outline-light"
          type="submit"
          disabled={!keyword.trim()}
          title="Search"
        >
          <i className="fas fa-search"></i>
        </button>
      </div>
    </form>
  );
};

export default SearchWidget;