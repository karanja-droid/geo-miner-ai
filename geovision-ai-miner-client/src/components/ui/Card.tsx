import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'geological' | 'mining';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  className = '',
  onClick,
  hoverable = false
}) => {
  const baseClasses = 'bg-white rounded-lg border shadow-sm overflow-hidden';
  
  const variantClasses = {
    default: 'border-gray-200 shadow-gray-100',
    geological: 'border-geological-stone shadow-geological',
    mining: 'border-mining-primary shadow-mining'
  };
  
  const hoverClasses = hoverable ? 'cursor-pointer transition-all duration-200 hover:shadow-lg' : '';
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
  
  const MotionComponent = hoverable ? motion.div : 'div';
  const motionProps = hoverable ? {
    whileHover: { y: -2, scale: 1.01 },
    whileTap: { scale: 0.99 },
    transition: { duration: 0.2 }
  } : {};
  
  return (
    <MotionComponent
      className={classes}
      onClick={onClick}
      {...motionProps}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </MotionComponent>
  );
}; 