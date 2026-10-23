import React from 'react';

/**
 * Reusable AppIcon component
 * Renders uploaded image icons (PNG, JPEG, WebP, Data URL, HTTPS URL)
 * or a clean monogram fallback if no image icon is configured.
 * Preserves aspect ratio, never stretches, and supports responsive sizes.
 */
export default function AppIcon({
  icon,
  name = 'App',
  size = 48,
  className = '',
  style = {},
  fallbackBg = 'bg-blue-600',
  fallbackText = 'text-white'
}) {
  const isImageIcon =
    typeof icon === 'string' &&
    (icon.startsWith('data:image/') ||
      icon.startsWith('http://') ||
      icon.startsWith('https://') ||
      icon.startsWith('/'));

  const initials =
    typeof icon === 'string' && icon.length <= 4 && !icon.includes('/') && !icon.includes(':')
      ? icon.toUpperCase()
      : (name || 'AC')
          .split(/\s+/)
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

  const containerStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    minWidth: typeof size === 'number' ? `${size}px` : size,
    minHeight: typeof size === 'number' ? `${size}px` : size,
    ...style
  };

  if (isImageIcon) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
        style={containerStyle}
      >
        <img
          src={icon}
          alt={`${name} icon`}
          className="w-full h-full object-cover select-none"
          loading="lazy"
          onError={(e) => {
            // Fallback to monogram if image fails to load
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
        <div
          style={{ display: 'none' }}
          className={`w-full h-full font-bold text-xs items-center justify-center select-none ${fallbackBg} ${fallbackText}`}
        >
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold text-xs select-none flex-shrink-0 ${fallbackBg} ${fallbackText} ${className}`}
      style={containerStyle}
      aria-label={`${name} icon`}
    >
      <span>{initials}</span>
    </div>
  );
}
