import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { useCallback } from 'react'
import loginStyles from '../styles/login.css'
import { createUserSesstion, getUser, login, register } from '~/utils/session.server'

export const links = () => [
    {
        rel: 'stylesheet',
        href: loginStyles,
    },
]

export const meta: MetaFunction = () => ({
    title: 'Remix Jokes | Login',
    description: 'Login to submit your own jokes to Remix Jokes!',
})

function validateUsername(username: unknown) {
    if (typeof username !== 'string' || username.length < 3) return `Usernames must be at least 3 characters long`
    return undefined
}

function validatePassword(password: unknown) {
    if (typeof password !== 'string' || password.length < 6) return `Passwords must be at least 6 characters long`
    return undefined
}

type Fields = {
    username: string
    password: string
    loginType: string
    redirectTo?: string
}

type ActionData = {
    formError?: string
    fieldErrors?: {
        username: string | undefined
        password: string | undefined
    }
}

const badRequest = (data: ActionData) => json(data, { status: 400 })

export const action: ActionFunction = async ({ request }) => {
    // zod
    const body = await request.formData()
    const { redirectTo = '/jokes', username, password, loginType } = Object.fromEntries(body.entries()) as Fields
    if ([redirectTo, username, password, loginType].some(str => typeof str !== 'string'))
        return badRequest({
            formError: 'Form not submitted correctly.',
        })
    const fieldErrors = {
        username: validateUsername(username),
        password: validatePassword(password),
    }
    if (Object.values(fieldErrors).some(Boolean)) return badRequest({ fieldErrors })

    switch (loginType) {
        case 'login': {
            const user = await login(username, password)
            if (!user)
                return badRequest({
                    formError: 'Username or Password incorrect',
                })
            return createUserSesstion(user.id, redirectTo)
        }

        case 'register': {
            const user = await register(username, password)
            return createUserSesstion(user.id, redirectTo)
        }

        default:
            return undefined
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    if (await getUser(request)) return redirect('/jokes')

    // unused
    const referer = request.headers.get('referer')
    try {
        const urlReferer = referer && new URL(referer)
        const requestUrl = new URL(request.url)
        if (urlReferer && urlReferer.host === requestUrl.host && requestUrl.searchParams.get('redirectTo') === null && !/login\/?$/.test(urlReferer.pathname))
            return redirect(`/login?redirectTo=${referer}`)
    } catch {}

    return []
}

export default () => {
    const actionData = useActionData<ActionData>()
    const [searchParams] = useSearchParams()

    return (
        <div className="container">
            <div className="content" data-light="">
                <h1>Login</h1>
                <Form method="post" aria-describedby={actionData?.formError ? 'form-error-message' : undefined}>
                    <input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? undefined} />
                    <fieldset>
                        <legend className="sr-only">Login or Register?</legend>
                        <label>
                            <input type="radio" name="loginType" value="login" defaultChecked /> Login
                        </label>
                        <label>
                            <input type="radio" name="loginType" value="register" /> Register
                        </label>
                    </fieldset>
                    <label>
                        Username{' '}
                        <input
                            type="text"
                            id="username-input"
                            name="username"
                            autoCapitalize="off"
                            aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                            aria-describedby={actionData?.fieldErrors?.username ? 'username-error' : undefined}
                        />
                        {actionData?.fieldErrors?.username ? (
                            <p className="form-validation-error" role="alert" id="username-error">
                                {actionData?.fieldErrors.username}
                            </p>
                        ) : null}
                    </label>
                    <label>
                        Password{' '}
                        <input
                            id="password-input"
                            name="password"
                            type="password"
                            aria-invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
                            aria-describedby={actionData?.fieldErrors?.password ? 'password-error' : undefined}
                        />
                        {actionData?.fieldErrors?.password ? (
                            <p className="form-validation-error" role="alert" id="password-error">
                                {actionData?.fieldErrors.password}
                            </p>
                        ) : null}
                    </label>
                    <div id="form-error-message">
                        {actionData?.formError ? (
                            <p className="form-validation-error" role="alert">
                                {actionData?.formError}
                            </p>
                        ) : null}
                    </div>
                    <button type="submit" className="button">
                        Submit
                    </button>
                </Form>
                <div className="links">
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/jokes">Jokes</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
