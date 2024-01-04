// 概要: next.config.jsの設定

import withBundleAnalyzer from '@next/bundle-analyzer'

// バンドルサイズを可視化する

/** @type {import('next').NextConfig} */ // これがないとエラーになる

// next.config.jsの設定
const config = {
  // For static export of my use case.
  ...(process.env.NODE_ENV === 'production' && {
    // 本番環境の場合
    assetPrefix: './'
  })
}

// バンドルサイズを可視化する
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true' // ANALYZE=trueの場合
})(config)
