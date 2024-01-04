// MUI（Material-UI）のGlobalStylesとcssをインポートしています。
// GlobalStylesは、グローバルなスタイルを適用するためのコンポーネントです。
// cssは、CSSをJSX内に書くためのヘルパー関数です。

// Next.jsのページとして使われるコンポーネントを型定義するためにNextPageをインポートしています。
import { GlobalStyles, css } from '@mui/material'
import { NextPage } from 'next'
import React from 'react'

// 自身で定義したMainコンポーネントをインポートしています。
// このコンポーネントは'../src/Main'のパスで見つけることができます。
import { Main } from '../src/Main'

// NextPage型を使用してIndexコンポーネントを定義しています。
// これはNext.jsのページコンポーネントとして機能します。

// GlobalStylesコンポーネントを利用して、グローバルなスタイルを設定しています。
// ここではhtml、body、#__nextの各要素に対して100%の幅と高さを設定しています。
const Index: NextPage = () => {
  return (
    <>
      <GlobalStyles
        styles={css`
          html,
          body,
          #__next {
            width: 100%;
            height: 100%;
          }
        `}
      />
      <Main />
    </>
  )
}

// Indexコンポーネントをエクスポートしています。
// これにより、他のファイルからこのコンポーネントをインポートして使用することができます。

export default Index
