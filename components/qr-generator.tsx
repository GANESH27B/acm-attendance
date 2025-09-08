"use client"

import { useEffect, useRef } from "react"

interface QRGeneratorProps {
  data: string
  size?: number
}

export function QRGenerator({ data, size = 200 }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // In a real app, you would use a QR code library like 'qrcode'
      // For now, we'll create a placeholder
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Clear canvas
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, size, size)

        // Draw QR code pattern (simplified)
        ctx.fillStyle = "black"
        const moduleSize = size / 25

        // Create a simple pattern
        for (let i = 0; i < 25; i++) {
          for (let j = 0; j < 25; j++) {
            if (Math.random() > 0.5) {
              ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
            }
          }
        }

        // Add corner markers
        ctx.fillRect(0, 0, moduleSize * 7, moduleSize * 7)
        ctx.fillStyle = "white"
        ctx.fillRect(moduleSize, moduleSize, moduleSize * 5, moduleSize * 5)
        ctx.fillStyle = "black"
        ctx.fillRect(moduleSize * 2, moduleSize * 2, moduleSize * 3, moduleSize * 3)
      }
    }
  }, [data, size])

  return <canvas ref={canvasRef} width={size} height={size} className="border border-gray-300 rounded" />
}
