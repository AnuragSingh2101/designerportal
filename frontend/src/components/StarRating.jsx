import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRatingChange = null, size = 18, interactive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (interactive) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (interactive) setHoverRating(0);
  };

  const handleClick = (index) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= displayRating;
        return (
          <Star
            key={index}
            size={size}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              fill: isFilled ? 'var(--color-gold)' : 'none',
              stroke: isFilled ? 'var(--color-gold)' : 'var(--text-light)',
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            className={interactive ? 'star-interactive' : ''}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
