import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  const errorMessages: Record<string, string> = {
    'access_denied': 'Acesso negado. Voce nao tem permissao para acessar este recurso.',
    'invalid_request': 'Requisicao invalida. Tente novamente.',
    'server_error': 'Erro no servidor. Tente novamente mais tarde.',
    'temporarily_unavailable': 'Servico temporariamente indisponivel.',
  }

  const errorMessage = params?.error 
    ? errorMessages[params.error] || `Erro: ${params.error}`
    : 'Ocorreu um erro inesperado.'

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-bold">Algo deu errado</CardTitle>
        <CardDescription>
          Nao foi possivel completar a operacao
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive text-center">
            {errorMessage}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Login
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
