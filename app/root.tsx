import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from 'remix'
import type { MetaFunction } from 'remix'
import globalStyles from './styles/global.css'
import globalMediumStyles from './styles/global-medium.css'
import globalLargeStyles from './styles/global-large.css'

export const links = () => [
    {
        rel: 'stylesheet',
        href: globalStyles,
    },
    {
        rel: 'stylesheet',
        href: globalMediumStyles,
        media: 'print, (min-width: 640px)',
    },
    {
        rel: 'stylesheet',
        href: globalLargeStyles,
        media: 'screen and (min-width: 1024px)',
    },
]

export const meta: MetaFunction = () => {
    const description = `Learn Remix and at the same time!`
    return {
        description,
        keywords: 'Remix,jokes',
        'twitter:image': 'https://remix-jokes.lol/social.png',
        'twitter:card': 'summary_large_image',
        'twitter:creator': '@remix_run',
        'twitter:site': '@remix_run',
        'twitter:title': 'Remix Jokes',
        'twitter:description': description,
    }
}

const Document: React.FC<{ title? }> = ({ children, title = "Remix: it's really cool!" }) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>{title}</title>
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                {process.env.NODE_ENV === 'development' && <LiveReload />}
            </body>
        </html>
    )
}

export default function App() {
    return (
        <Document>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
        </Document>
    )
}

export const CatchBoundary = () => {
    const caught = useCatch()

    return (
        <Document title={`${caught.status} ${caught.statusText}`}>
            <div className="error-container">
                <pre>{JSON.stringify(caught.data, undefined, 4)}</pre>
            </div>
        </Document>
    )
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
    console.log(error)

    return (
        <Document title="App Crashed">
            <div className="error-container">
                <h1>Application Error</h1>
                <pre>{error.message}</pre>
            </div>
        </Document>
    )
}
