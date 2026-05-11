import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Always use light theme only
  useEffect(() => {
    const html = document.documentElement
    html.classList.remove("dark")
    localStorage.setItem("theme", "light")
  }, [])

  const toggleTheme = () => {
    // No theme toggle available
    return
  }

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
