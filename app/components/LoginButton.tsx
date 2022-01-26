import React from 'react'
import { useHref, Link, useLocation } from 'react-router-dom'

interface ComponentProps {}

const LoginButton: React.FC<ComponentProps> = () => {
    const { pathname } = useLocation()

    return <Link to={`/login?redirectTo=${pathname}`}>Login</Link>
}

export default LoginButton
