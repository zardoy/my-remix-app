import { ActionFunction, Form, json, redirect, useActionData, useCatch, useTransition } from 'remix'
import JokeDisplay from '~/components/JokeDisplay'
import LoginButton from '~/components/LoginButton'
import { prisma } from '~/utils/prisma.server'
import { getUserId, requireUserId } from '~/utils/session.server'

export const validateJokeName = (name: string) => {
    if (name.length < 2) return "That joke's name is too short"
}

export const validateJokeContent = (content: string) => {
    if (content.length < 10) return 'That joke is too short'
}

type Fields = {
    name: string
    content: string
}

type ActionData = {
    formError?: string
    fieldErrors?: {
        name: string | undefined
        content: string | undefined
    }
    fields?: Fields
}

const badRequest = (data: ActionData) => json(data, { status: 400 })

export const loader = async ({ request }) => {
    // can be annoying
    // await requireUserId(request)

    const userId = await getUserId(request)
    if (userId === undefined) throw new Response('You need to login before adding a joke', { status: 401 })
    return {}
}

export const action: ActionFunction = async ({ request }) => {
    // zod
    const formData = await request.formData()
    const fields = Object.fromEntries(formData.entries()) as Fields
    const { name, content } = fields
    if (typeof name !== 'string' || typeof content !== 'string')
        return badRequest({
            formError: 'Form not submitted correctly.',
        })
    const fieldErrors = {
        name: validateJokeName(name),
        content: validateJokeContent(content),
    }
    if (Object.values(fieldErrors).some(Boolean)) return badRequest({ fieldErrors, fields })

    const newJoke = await prisma.joke.create({
        data: { name, content, authorId: await requireUserId(request) },
    })
    return redirect(`/jokes/${newJoke.id}`)
}

export default () => {
    const actionData = useActionData<ActionData>()
    const { submission } = useTransition()

    if (submission) {
        const fields = Object.fromEntries(submission.formData) as Fields
        const { name, content } = fields
        const fieldErrors = {
            name: validateJokeName(name),
            content: validateJokeContent(content),
        }
        if (!Object.values(fieldErrors).some(Boolean)) return <JokeDisplay canDelete={false} joke={fields} isOwner={true} />
    }

    return (
        <div>
            <p>Add your own hilarious joke</p>
            <Form method="post">
                <div>
                    <label>
                        Name:{' '}
                        <input
                            type="text"
                            name="name"
                            defaultValue={actionData?.fields?.name}
                            aria-invalid={!!actionData?.fieldErrors?.name}
                            aria-describedby={actionData?.fieldErrors?.name ? 'name-error' : undefined}
                        />
                    </label>
                    {actionData?.fieldErrors?.name && (
                        <p className="form-validation-error" role="alert" id="name-error">
                            {actionData.fieldErrors.name}
                        </p>
                    )}
                </div>
                <div>
                    <label>
                        Content: <textarea name="content" defaultValue={actionData?.fields?.content} aria-invalid={!!actionData?.fieldErrors?.content} />
                    </label>
                    {actionData?.fieldErrors?.content && (
                        <p className="form-validation-error" role="alert" id="content-error">
                            {actionData.fieldErrors.content}
                        </p>
                    )}
                </div>
                <div>
                    {/* <button type="submit" className="button" disabled={!!transition.submission}>
                        {transition.submission ? 'Add' : 'Adding...'}
                    </button> */}
                    <button type="submit" className="button">
                        Add
                    </button>
                </div>
            </Form>
        </div>
    )
}

export const CatchBoundary: React.FC = () => {
    const caught = useCatch()

    if (caught.status === 401)
        return (
            <div className="error-container">
                <p>{caught.data}</p> <LoginButton />
            </div>
        )

    throw caught
}
