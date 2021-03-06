import { Joke } from '@prisma/client'
import { ErrorBoundaryComponent } from '@remix-run/node'
import { Link, useCatch, useLoaderData } from '@remix-run/react'
import { prisma } from '~/utils/prisma.server'

export const loader = async () => {
    const jokesCount = await prisma.joke.count()
    const jokeNumber = Math.floor(Math.random() * jokesCount)
    const randomJoke = await prisma.joke.findFirst({
        skip: jokeNumber,
    })
    if (!randomJoke) throw new Response('There are still no jokes in Database. Try to add one!', { status: 404 })
    return randomJoke
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => <div className="error-container">Oh wow our land just crashed!</div>

export const CatchBoundary: React.FC = () => {
    const caught = useCatch()

    if (caught.status === 404) return <div className="error-container">{caught.data}</div>

    throw caught
}

export default () => {
    const joke: Joke = useLoaderData()
    return (
        <div>
            <h3>Here is random joke: </h3>
            {joke.content} - <Link to={joke.id}>{joke.name}</Link>
        </div>
    )
}
