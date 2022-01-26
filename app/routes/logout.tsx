import { ActionFunction, LoaderFunction, redirect } from 'remix'
import { logout } from '~/utils/session.server'

export const action: ActionFunction = ({ request }) => logout(request, request.headers.get('referer') ?? undefined)

export const loader: LoaderFunction = () => redirect('/')
