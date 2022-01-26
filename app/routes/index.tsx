import { Link } from 'remix'
import indexStyles from '../styles/index.css'

export const links = () => [{ rel: 'stylesheet', href: indexStyles }]

export const meta = []

export default () => {
    return (
        <div className="container">
            <div className="content">
                <h1>
                    Remix <span>Jokes!</span>
                </h1>
                <nav>
                    <ul>
                        <li>
                            <Link to="jokes">Read jokes</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
