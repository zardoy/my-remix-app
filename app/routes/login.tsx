import { ActionFunction, json, Link, useActionData, LoaderFunction, MetaFunction, redirect } from 'remix'
import { createUserSesstion, getUser, login, register } from '~/utils/session.server'
import loginStyles from '../styles/login.css'

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
    if (typeof username !== 'string' || username.length < 3) {
        return `Usernames must be at least 3 characters long`
    }
}

function validatePassword(password: unknown) {
    if (typeof password !== 'string' || password.length < 6) {
        return `Passwords must be at least 6 characters long`
    }
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
    fields?: Fields
}

const badRequest = (data: ActionData) => json(data, { status: 400 })

export const action: ActionFunction = async ({ request }) => {
    // zod
    const body = await request.formData()
    const fields = Object.fromEntries(body.entries()) as Fields
    const redirectTo = new URL(request.url).searchParams.get('redirectTo') || '/jokes'
    const { username, password, loginType } = fields
    if ([username, password, loginType].some(str => typeof str !== 'string'))
        return badRequest({
            formError: 'Form not submitted correctly.',
        })
    const fieldErrors = {
        username: validateUsername(username),
        password: validatePassword(password),
    }
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors, fields })
    }
    switch (loginType) {
        case 'login':
            const user = await login(username, password)
            if (!user)
                return badRequest({
                    fields,
                    formError: 'Username or Password incorrect',
                })
            return createUserSesstion(user.id, redirectTo)
        case 'register': {
            const user = await register(username, password)
            return createUserSesstion(user.id, redirectTo)
        }

        default:
            return
            break
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    if (await getUser(request)) return redirect('/jokes')
    return []
}

export default () => {
    const actionData = useActionData<ActionData>()

    return (
        <div className="container">
            <div className="content" data-light="">
                <h1>Login</h1>
                <form method="post" aria-describedby={actionData?.formError ? 'form-error-message' : undefined}>
                    <fieldset>
                        <legend className="sr-only">Login or Register?</legend>
                        <label>
                            <input
                                type="radio"
                                name="loginType"
                                value="login"
                                defaultChecked={!actionData?.fields?.loginType || actionData?.fields?.loginType === 'login'}
                            />{' '}
                            Login
                        </label>
                        <label>
                            <input type="radio" name="loginType" value="register" defaultChecked={actionData?.fields?.loginType === 'register'} /> Register
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
                </form>
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
