import React from 'react'
import { Link, useLocation } from '@remix-run/react'

interface ComponentProps {}

const LoginButton: React.FC<ComponentProps> = () => {
    const { pathname } = useLocation()

    return <Link to={`/login?redirectTo=${pathname}`}>Login</Link>
}

export default LoginButton
