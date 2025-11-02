import { NextPage } from 'next'

type Page = NextPage & {
  noLayout?: boolean
  noNav?: boolean
}

export default Page
