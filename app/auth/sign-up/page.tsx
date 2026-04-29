'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [fullName, setFullName]         = useState('')
  const [department, setDepartment]     = useState('')
  const [pin, setPin]                   = useState('')
  const [confirmPin, setConfirmPin]     = useState('')
  const [error, setError]               = useState<string | null>(null)
  const [isLoading, setIsLoading]       = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }
    if (pin.length < 4) {
      setError('O PIN deve ter pelo menos 4 dígitos')
      setIsLoading(false)
      return
    }
    if (pin !== confirmPin) {
      setError('Os PINs não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department,
            role: 'employee',
          },
        },
      })
      if (signUpError) throw signUpError

      // Salva o PIN no perfil assim que o usuário é criado
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ pin })
          .eq('id', data.user.id)
      }

      sessionStorage.setItem('wayne-show-splash', '1')
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Preencha os dados para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome completo"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@wayne.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              placeholder="Ex: Segurança"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repeatPassword">Confirmar Senha</Label>
            <Input
              id="repeatPassword"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="bg-input/50"
            />
          </div>

          <div className="border-t border-border/40 pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              O PIN será usado nas verificações de segurança do sistema.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN de Acesso</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="4–6 dígitos"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="bg-input/50 font-mono tracking-widest text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirmar PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="4–6 dígitos"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="bg-input/50 font-mono tracking-widest text-center"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Conta
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-primary hover:underline underline-offset-4 font-medium">
              Entrar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
