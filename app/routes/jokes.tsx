import { Form, Link, Outlet, useLoaderData } from '@remix-run/react'
import jokesUrl from '../styles/jokes.css'
import { prisma } from '~/utils/prisma.server'
import { getUser } from '~/utils/session.server'
import LoginButton from '~/components/LoginButton'

export const links = () => [{ rel: 'stylesheet', href: jokesUrl }]

export const loader = async ({ request }) => {
    const user = await getUser(request)
    const jokes = await prisma.joke.findMany({
        select: { id: true, name: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
    })
    return { jokes, user }
}

export default () => {
    const { jokes, user } = useLoaderData<Awaited<ReturnType<typeof loader>>>()

    return (
        <div className="jokes-layout">
            <header className="jokes-header">
                <div className="container">
                    <h1 className="home-link">
                        <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
                            Just jokes!
                        </Link>
                    </h1>
                    {user ? (
                        <div className="user-info">
                            <span>{user.username}</span>
                            <Form action="/logout" method="post">
                                <button type="submit" className="button">
                                    Logout
                                </button>
                            </Form>
                        </div>
                    ) : (
                        <LoginButton />
                    )}
                </div>
                <main className="jokes-main">
                    <div className="container">
                        <div className="jokes-list">
                            <Link to=".">Get a random one!</Link>
                            <p>Here are a few more to check:</p>
                            <ul>
                                {jokes.map(joke => (
                                    <li key={joke.id}>
                                        <Link to={joke.id} prefetch="intent">
                                            {joke.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link to="new" className="button">
                                Add your one
                            </Link>
                        </div>
                        <div className="jokes-outlet">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </header>
        </div>
    )
}
