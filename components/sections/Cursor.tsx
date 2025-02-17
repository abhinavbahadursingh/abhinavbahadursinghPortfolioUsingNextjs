// components/Cursor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'

const Cursor = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const cursorStyles = useSpring({
    left: mouse.x - 25, // Adjust for the cursor size (25px)
    top: mouse.y - 25,
    config: { tension: 170, friction: 26 }, // Smooth animation
  })

  return (
    <animated.div
      style={{
        position: 'absolute',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'black',
        pointerEvents: 'none', // Prevent cursor interference
        ...cursorStyles, // Apply animated styles
      }}
    />
  )
}

export default Cursor
