declare module 'react-signature-canvas' {
  import * as React from 'react'

  export interface SignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>
    clearOnResize?: boolean
    penColor?: string
    backgroundColor?: string
    dotSize?: number
    minWidth?: number
    maxWidth?: number
    throttle?: number
    velocityFilterWeight?: number
    onBegin?: () => void
    onEnd?: () => void
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear: () => void
    getTrimmedCanvas: () => HTMLCanvasElement
    fromDataURL: (dataURL: string) => void
    toDataURL: (type?: string, encoderOptions?: number) => string
    isEmpty: () => boolean
    fromData: (data: any[]) => void
    toData: () => any[]
  }
} 