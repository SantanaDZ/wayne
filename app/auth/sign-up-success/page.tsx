import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Conta Criada com Sucesso!</CardTitle>
        <CardDescription>
          Verifique seu email para confirmar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Enviamos um link de confirmacao para o seu email. 
          Clique no link para ativar sua conta e comecar a usar o sistema.
        </p>
        <div className="p-4 rounded-md bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            Nao recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Login
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
