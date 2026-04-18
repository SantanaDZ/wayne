'use client'

import { Fragment } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

const pathTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/equipment': 'Equipamentos',
  '/dashboard/vehicles': 'Veiculos',
  '/dashboard/security-devices': 'Dispositivos de Seguranca',
  '/dashboard/users': 'Usuarios',
  '/dashboard/activity-logs': 'Logs de Atividade',
  '/dashboard/settings': 'Configurações',
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const pathname = usePathname()
  
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: { title: string; href: string; isLast: boolean }[] = []
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const title = pathTitles[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({
        title,
        href: currentPath,
        isLast: index === segments.length - 1,
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  const getRoleBadgeVariant = (role: string | undefined) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'manager':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'manager':
        return 'Gerente'
      default:
        return 'Funcionario'
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 mx-2" />
      
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant={getRoleBadgeVariant(profile?.role)} className="hidden sm:inline-flex bg-blue-500 text-white">

          {getRoleLabel(profile?.role)}
        </Badge>
      </div>
    </header>
  )
}
