'use client'

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsChanging(true)
    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark")
      setTimeout(() => setIsChanging(false), 600)
    }, 100)
  }

  if (!mounted) {
    return null
  }
  
  const isDark = theme === "dark"
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative overflow-hidden"
      disabled={isChanging}
    >
      <div className="relative w-[1.2rem] h-[1.2rem]">
        {/* Sun */}
        <Sun 
          className={`absolute top-0 left-0 h-full w-full transition-all duration-500 ease-in-out
            ${isDark 
              ? "opacity-0 translate-x-full" 
              : isChanging 
                ? "opacity-0 -translate-x-full" 
                : "opacity-100 translate-x-0"
            }`}
        />
        
        {/* Moon */}
        <Moon 
          className={`absolute top-0 left-0 h-full w-full transition-all duration-500 ease-in-out
            ${!isDark 
              ? "opacity-0 -translate-x-full" 
              : isChanging 
                ? "opacity-0 translate-x-full" 
                : "opacity-100 translate-x-0"
            }`}
        />
        
        {/* Horizon line (optional) */}
        <div className={`absolute top-1/2 left-0 w-full h-[1px] bg-foreground/20 transition-opacity duration-300 
          ${isChanging ? "opacity-100" : "opacity-0"}`} />
      </div>
    </Button>
  )
}