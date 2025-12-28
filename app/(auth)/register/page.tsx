import { RegisterForm } from '@/components/auth/RegisterForm'
import { FolderGit2 } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <FolderGit2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">FlightControl</h1>
      </div>
      <RegisterForm />
    </div>
  )
}

