import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { logout } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => logout(request, request.headers.get('referer') ?? undefined)

export const loader: LoaderFunction = () => redirect('/')
