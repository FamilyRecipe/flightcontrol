import { redirect } from 'next/navigation'

export default function CommitsPage({
  params,
}: {
  params: { projectId: string }
}) {
  redirect(`/projects/${params.projectId}/alignment/commits`)
}

