import React from 'react';

const Skeleton = ({ variant = 'text', className = '', style = {}, children, ...props }) => {
  const baseClass = `skeleton skeleton-${variant} ${className}`;
  
  const variants = {
    text: 'skeleton-text',
    'text-large': 'skeleton-text large',
    'text-small': 'skeleton-text small',
    avatar: 'skeleton-avatar',
    button: 'skeleton-button',
    card: 'skeleton-card',
    product: 'skeleton-product'
  };

  const skeletonClass = variants[variant] || variants.text;
  
  if (variant === 'product') {
    return (
      <div className={baseClass} style={style} {...props}>
        <div className="skeleton-product-image" />
        <div className="skeleton-product-title" />
        <div className="skeleton-product-price" />
      </div>
    );
  }

  return (
    <div 
      className={`${baseClass} ${skeletonClass}`} 
      style={style} 
      {...props}
    />
  );
};

export default Skeleton;
