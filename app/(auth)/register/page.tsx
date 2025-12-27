import { RegisterForm } from '@/components/auth/RegisterForm'
import { FolderGit2 } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <FolderGit2 className="h-8 w-8" />
        <h1 className="text-3xl font-bold">FlightControl</h1>
      </div>
      <RegisterForm />
    </div>
  )
}

