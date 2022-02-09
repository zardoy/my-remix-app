import { unlinkSync } from 'fs'

if (process.env.CI) {
    // remove development .env on CI
    unlinkSync('.env')
}
