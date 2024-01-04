import { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material'
// Next.jsのAppProps型をインポートしています。これを使ってAppコンポーネントのpropsの型を定義します。
import { AppProps as NextAppProps } from 'next/app'
// Next.jsのHeadコンポーネントをインポートしています。これを使ってHTMLの<head>部分を変更できます。
import Head from 'next/head'
import React from 'react'

// 自身で定義したCssBaselineコンポーネントと、
// emotionのcacheを作成する関数、そしてテーマをインポートしています。
import { CssBaseline } from '../src/CssBaseline'
import { createEmotionCache } from '../src/createEmotionCache'
import { theme } from '../src/theme'

import 'normalize.css'

// createEmotionCache関数を使って
// クライアントサイドのemotion cacheを作成しています。
const clientSideEmotionCache = createEmotionCache()

// AppProps型を定義しています。これはNextAppPropsを拡張しており
// 追加でemotionCacheプロパティを持っています。
interface AppProps extends NextAppProps {
  emotionCache?: EmotionCache
}

// Appコンポーネントを定義しています。これはAppProps型のpropsを受け取ります。
const App: React.FC<AppProps> = ({
  emotionCache = clientSideEmotionCache,
  Component,
  pageProps
}) => {
  return (
    // CacheProviderコンポーネントを
    // 使ってアプリケーションで使用するemotion cacheを提供しています。
    <CacheProvider value={emotionCache}>
      {/* 
        Headコンポーネントを使ってHTMLの<head>部分に<title>と<meta>タグを追加しています。
        これにより、ページのタイトルと説明を設定しています。
      */}
      <Head>
        <title>Pendulum</title>
        <meta
          name='description'
          content='An interactive visualization of the motion of a damped pendulum and the phase portrait.'
        />
      </Head>
      {/* 
        ThemeProviderコンポーネントを使ってアプリケーションのテーマを提供しています。
        このテーマは'../src/theme'からインポートされています。
      */}
      <ThemeProvider theme={theme}>
        {/* 
          CssBaselineコンポーネントを描画しています。これは基本的なCSSのリセットと、
          アプリケーションの基本的なスタイルを提供します。
        */}
        <CssBaseline />
        {/* 
          このComponentはNext.jsが自動的に提供するコンポーネントです。
          これにより、各ページのコンポーネントが描画されます。
          pagePropsは各ページのコンポーネントに渡されるpropsです。
        */}
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}

// Appコンポーネントをエクスポートしています。これにより、このコンポーネントを他の場所で使用できます。
export default App
