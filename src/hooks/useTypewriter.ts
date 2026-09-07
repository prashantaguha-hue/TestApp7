import { useEffect, useState } from 'react'

export function useTypewriter(text: string, active: boolean, speed = 16) {
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!active) {
      setOutput('')
      return
    }
    setOutput('')
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setOutput(text.slice(0, i))
      if (i >= text.length) {
        window.clearInterval(id)
      }
    }, speed)
    return () => window.clearInterval(id)
  }, [text, active, speed])

  return output
}
