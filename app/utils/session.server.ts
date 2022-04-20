import bcrypt from 'bcryptjs'
import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { prisma } from '~/utils/prisma.server'

export const login = async (username: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { username },
    })
    if (!user) return null
    const passwordMatch = await bcrypt.compare(password, user.passwardHash)
    if (!passwordMatch) return null

    return user
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) throw new Error('SESSION_SECRET must be set')

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: '__session',

        secure: process.env.NODE_ENV === 'production',
        secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
})

export const getUserSession = async (request: Request) => getSession(request.headers.get('Cookie'))

export const getUserId = async (request: Request) => {
    const session = await getUserSession(request)
    const userId = session.get('userId')
    if (typeof userId !== 'string') return
    return userId
}

export const getUser = async (request: Request) => {
    const userId = await getUserId(request)
    if (!userId) return
    const user = await prisma.user.findUnique({
        where: { id: userId },
    })
    if (!user) throw await logout(request)
    return user
}

export const requireUserId = async (request: Request, redirectTo = new URL(request.url).pathname) => {
    const session = await getUserSession(request)
    const userId = session.get('userId')
    if (typeof userId !== 'string') {
        const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
        throw redirect(`/login?${searchParams.toString()}`)
    }

    return userId
}

export const createUserSesstion = async (userId: string, redirectTo: string) => {
    const session = await getSession()
    session.set('userId', userId)
    return redirect(redirectTo, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    })
}

export const logout = async (request: Request, redirectTo = new URL(request.url).pathname) => {
    const session = await getUserSession(request)
    // stay on the same page
    return redirect(redirectTo, {
        headers: {
            'Set-Cookie': await destroySession(session),
        },
    })
}

export const register = async (username: string, password: string) =>
    prisma.user.create({
        data: {
            username,
            passwardHash: await bcrypt.hash(password, 10),
        },
    })
