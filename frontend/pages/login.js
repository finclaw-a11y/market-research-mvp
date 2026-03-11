import Head from 'next/head'
import Auth from '../components/Auth'

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Market Research</title>
      </Head>
      <Auth />
    </>
  )
}
