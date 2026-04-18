import Image from 'next/image'
import { cn } from '@/lib/utils'

interface WayneLogoProps {
  className?: string
  src?: string
}

export function WayneLogo({ className, src = '/logo transparente.png' }: WayneLogoProps) {
  return (
    <Image
      src={src}
      alt="Wayne Industries"
      width={32}
      height={32}
      className={cn('object-contain', className)}
    />
  )
}
