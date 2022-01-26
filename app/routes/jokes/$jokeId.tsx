import { Joke } from '@prisma/client'
import { ActionFunction, ErrorBoundaryComponent, Form, LoaderFunction, useCatch, useLoaderData } from 'remix'
import JokeDisplay from '../../components/JokeDisplay'
import { prisma } from '~/utils/prisma.server'
import { getUserId, requireUserId } from '~/utils/session.server'

type LoaderData = {
    joke: Joke
    isOwner: boolean
}

export const loader: LoaderFunction = async ({ request, params }): Promise<LoaderData> => {
    const userId = await getUserId(request)
    const joke = await prisma.joke.findUnique({
        where: { id: params.jokeId },
        // rejectOnNotFound: true,
    })
    if (!joke) throw new Response('Joke not found!', { status: 404 })
    return {
        joke,
        isOwner: joke.authorId === userId,
    }
}

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData()
    if (formData.get('_method') === 'delete') {
        const userId = await requireUserId(request)
        const joke = await prisma.joke.findUnique({ where: { id: params.jokeId } })
        if (!joke) throw new Response("Can't delete what does not exist", { status: 404 })
        if (joke.authorId !== userId) throw new Response("You don't own this joke", { status: 401 })
    }
}

export default () => {
    const { joke, isOwner } = useLoaderData<LoaderData>()

    return <JokeDisplay isOwner={isOwner} canDelete={isOwner} joke={joke} />
}

export const ErrorBoundary: ErrorBoundaryComponent = () => <div className="error-container">Something gone wrong with this joke. LUL</div>

export const CatchBoundary = () => {
    const caught = useCatch()

    if ([404, 401].includes(caught.status)) return <div className="error-container">{caught.data}</div>
    throw new Error(`Unhandled response: ${JSON.stringify(caught)}`)
}
