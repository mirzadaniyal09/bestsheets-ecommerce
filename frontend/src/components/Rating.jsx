import React from 'react';

const Rating = ({ value, text, color = '#ffc107' }) => {
  return (
    <div className="rating d-flex align-items-center">
      <span>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            style={{ color }}
            className={
              value >= star
                ? 'fas fa-star'
                : value >= star - 0.5
                  ? 'fas fa-star-half-alt'
                  : 'far fa-star'
            }
          ></i>
        ))}
      </span>
      {text && <span className="ms-2 small text-muted">{text}</span>}
    </div>
  );
};

export default Rating;