import { Joke } from '@prisma/client'
import { Form } from '@remix-run/react'

type ComponentProps = {
    joke: Pick<Joke, 'name' | 'content'>
    isOwner: boolean
    canDelete: boolean
}

function JokeDisplay({ joke, isOwner, canDelete }: ComponentProps) {
    return (
        <div>
            <h3>
                Here's your hilarious joke: <b>{joke.name}</b>
            </h3>
            <p>{joke.content}</p>
            {isOwner && (
                <Form method="post">
                    <input type="hidden" name="_method" value="delete" />
                    <button type="button" className="button" style={{ width: 150 }} disabled={!canDelete}>
                        Delete
                    </button>
                </Form>
            )}
        </div>
    )
}

export default JokeDisplay
