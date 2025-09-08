"use client"

import React from "react"

interface SimpleAvatarProps {
  src?: string
  fallback: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function SimpleAvatar({ src, fallback, className = "", size = "md" }: SimpleAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
  }

  const baseClasses = "rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white"
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${className}`

  if (src) {
    return (
      <div className={combinedClasses}>
        <img 
          src={src} 
          alt="Avatar" 
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // If image fails to load, show fallback text
            e.currentTarget.style.display = 'none'; // Hide the broken image icon
            const parent = e.currentTarget.parentElement;
            if (parent) {
                parent.querySelector('.avatar-fallback-text')?.classList.remove('hidden');
            }
          }}
        />
        <span className="avatar-fallback-text hidden">{fallback}</span>
      </div>
    )
  }

  return (
    <div className={combinedClasses}>
      {fallback}
    </div>
  )
}


