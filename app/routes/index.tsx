import { Link } from 'remix'
import styled, { css } from 'styled-components'
import indexStyles from '../styles/index.css'

export const links = () => [{ rel: 'stylesheet', href: indexStyles }]

export const meta = []

const ButtonContainer = styled('div')`
    font-family: system-ui, sans-serif;
    line-height: 1.4;
`

export default () => (
    <div className="container">
        <div className="content">
            <h1>
                Remix <span>Jokes!</span>
            </h1>
            <nav>
                <ul>
                    <li>
                        <ButtonContainer>
                            <Link to="jokes">Read jokes</Link>
                        </ButtonContainer>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
)
