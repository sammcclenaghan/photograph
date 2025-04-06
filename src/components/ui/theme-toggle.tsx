'use client'

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [targetTheme, setTargetTheme] = useState<string | null>(null)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (isAnimating) return
    
    const newTheme = theme === "dark" ? "light" : "dark"
    setTargetTheme(newTheme)
    setIsAnimating(true)
    
    // Apply theme change after animation is halfway done
    setTimeout(() => {
      setTheme(newTheme)
    }, 350)
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false)
      setTargetTheme(null)
    }, 700)
  }

  if (!mounted) {
    return null
  }
  
  const isDark = theme === "dark"
  const isGoingDark = targetTheme === "dark"
  const isGoingLight = targetTheme === "light"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative overflow-hidden w-10 h-10"
      disabled={isAnimating}
    >
      {/* Horizon line */}
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-foreground/10 z-10" />
      
      <div className="relative w-full h-full">
        {/* Sun */}
        <Sun 
          className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 transition-all duration-700 ease-in-out ${
            !isDark && !isGoingDark
              ? "top-0 opacity-100" // Visible in light mode
              : isDark && isGoingLight
                ? "translate-y-[-100%] opacity-100" // Rising when going to light
                : "translate-y-[100%] opacity-0" // Set/hidden otherwise
          }`}
        />
        
        {/* Moon */}
        <Moon 
          className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 transition-all duration-700 ease-in-out ${
            isDark && !isGoingLight
              ? "top-0 opacity-100" // Visible in dark mode
              : !isDark && isGoingDark
                ? "translate-y-[-100%] opacity-100" // Rising when going to dark
                : "translate-y-[100%] opacity-0" // Set/hidden otherwise
          }`}
        />
      </div>
    </Button>
  )
}