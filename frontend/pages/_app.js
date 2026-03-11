import '../styles/globals.css'
import Head from 'next/head'
import Header from '../components/Header'
import { useRouter } from 'next/router'

const publicPages = ['/', '/login']

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const isPublicPage = publicPages.includes(router.pathname)

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {!isPublicPage && <Header />}
      
      <main className={!isPublicPage ? '' : ''}>
        <Component {...pageProps} />
      </main>
    </>
  )
}

export default MyApp
