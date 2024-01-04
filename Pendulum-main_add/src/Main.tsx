import { Box, Grid, Stack } from '@mui/material'
import React, { useState } from 'react'

// 同ディレクトリ内の他のコンポーネントとフックをインポートしています
import { Controls } from './Controls'
import { Footer } from './Footer'
import { PhaseGraph } from './PhaseGraph'
import { Scene } from './Scene'
import { usePhaseGraphEventHandlers } from './usePhaseGraphEventHandlers'
import { useSceneEventHandlers } from './useSceneEventHandlers'
import { useStateAnimation } from './useStateAnimation'

// Mainコンポーネントを定義しています。これはReactの関数コンポーネントです。
export const Main: React.FC = () => {
  // graphというstateを定義しています。
  // このstateはHTMLDivElementまたはnullを保持することができます。
  const [graph, setGraph] = useState<HTMLDivElement | null>(null)

  // カスタムフックを使っていくつかのイベントハンドラを取得しています。
  // これらのイベントハンドラはPhaseGraphとSceneコンポーネントに渡されます。
  const phaseGraphEventHandlers = usePhaseGraphEventHandlers({ element: graph })
  const sceneEventHandlers = useSceneEventHandlers()

  // useStateAnimationフックを呼び出しています。
  // このフックは内部でアニメーションの状態を管理しています。
  useStateAnimation()

  // UIを構築しています。Stack, Grid, Boxコンポーネントを使ってレイアウトを作成しています。
  // また、Scene, PhaseGraph, Controls, Footerコンポーネントもここで配置されます。
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        userSelect: 'none'
      }}
      spacing={{ xs: 1, sm: 4, md: 5 }}
      padding={{ xs: 0, sm: 6, md: 7 }}
      paddingBottom={{ xs: 6, sm: 8, md: 9 }}
    >
      <Grid container spacing={{ xs: 0, sm: 6, md: 8 }} sx={{ flexGrow: 1 }}>
        <Grid item xs={12}>
          {/* Sceneコンポーネントを配置し、sceneEventHandlersを渡しています */}
          <Scene {...sceneEventHandlers} />
        </Grid>
        <Grid item xs={12}>
          {/* PhaseGraphコンポーネントを配置し、setGraph関数をrefとして、phaseGraphEventHandlersを渡しています */}
          <PhaseGraph ref={setGraph} {...phaseGraphEventHandlers} />
        </Grid>
      </Grid>
      <Box
        component='div'
        paddingLeft={{ xs: 2, sm: 0 }}
        paddingRight={{ xs: 2, sm: 0 }}
      >
        {/* Controlsコンポーネントを配置しています */}
        <Controls />
      </Box>
      {/* Footerコンポーネントを配置しています */}
      <Footer />
    </Stack>
  )
}
