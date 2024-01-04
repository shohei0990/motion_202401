import { styled } from '@mui/material'
// MUI (Material-UI) のスタイリング機能をインポート
import {
  // React Three Fiber と Drei から3Dレンダリングに必要なコンポーネントをインポート
  Box,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  softShadows,
  useTexture
} from '@react-three/drei'
import { Canvas, MeshProps } from '@react-three/fiber'
// React Three Fiber から基本的な3Dレンダリングのためのコンポーネントをインポート
import { EffectComposer, Noise } from '@react-three/postprocessing'
// ポストプロセッシング（後処理）のエフェクトをインポート
import {
  // Framer Motion からアニメーション関連のフックとユーティリティをインポート
  MotionValue,
  motionValue,
  useIsomorphicLayoutEffect,
  useSpring,
  useTransform
} from 'framer-motion'
import { motion } from 'framer-motion-3d'
// 3DアニメーションのためのFramer Motionの拡張をインポート
import { useAtomValue } from 'jotai'
// jotai からグローバルステートの値を取得するためのフックをインポート

// その他のライブラリから必要な関数や定数をインポート
import { BlendFunction } from 'postprocessing'
import React, {
  ComponentPropsWithRef,
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useState
} from 'react'
import { MOUSE, PerspectiveCamera as PerspectiveCameraImpl, TOUCH } from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

// このコンポーネントで使用するグローバルステートをインポート
import { paramsStore, stateStore } from './stores'
// シーンのイベントハンドラをインポート
import { SceneEventHandlers } from './useSceneEventHandlers'

// ソフトシャドウ（柔らかい影）のエフェクトを有効にする
softShadows()

// ルートコンポーネントのスタイルを定義
const Root = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%'
})

// ペンデュラムのプロパティを定義するインターフェース
interface PendulumProps extends Omit<MeshProps, 'args'> {
  angle: MotionValue<number>
  length: MotionValue<number>
  bobRadius?: number
  armRadius?: number
  pivotRadius?: number
  pivotLength?: number
  wingLength?: MotionValue<number> // 羽の長さを制御するプロパティ
  wingWidth?: MotionValue<number> // 羽の幅を制御するプロパティ
}

// ペンデュラムコンポーネントの定義
const Pendulum: React.FC<PendulumProps> = ({
  angle,
  length,
  bobRadius = 0.6,
  armRadius = 0.04,
  pivotRadius = 0.1,
  pivotLength = 2,
  wingLength = motionValue(2), // 羽の長さのデフォルト値
  wingWidth = motionValue(0.2), // 羽の幅のデフォルト値
  ...props
}) => {
  // ペンデュラムの各部分の位置やスケールを計算するための変換を定義
  const groupY = useTransform(length, length => length + 2)
  const armY = useTransform(length, length => -length / 2 + bobRadius / 2)
  const armScaleY = useTransform(length, length => length - bobRadius)
  const bobY = useTransform(length, length => -length + 0.5)
  const [cylinderHeight, setCylinderHeight] = useState<number>(23)
  // 羽の変換を定義
  const wingY = useTransform(wingLength, length => -length / 2)
  const wingScaleY = useTransform(wingLength, length => length)

  useEffect(() => {
    // groupY から実際の値を取得して cylinderHeight state を更新します。
    groupY.onChange(v => setCylinderHeight(v))
  }, [groupY])

  // マットキャップテクスチャを使用して3Dオブジェクトの見た目を定義
  const matcap = useTexture(
    'https://raw.githubusercontent.com/spite/spherical-environment-mapping/master/matcap2.jpg'
  )

  // ペンデュラムの3Dオブジェクトをレンダリング
  return (
    // motion.groupは、子要素のアニメーションをグループ化するためのコンポーネントです。
    // この場合、ペンデュラムのアームとボブをグループ化しています。
    <motion.group position-y={groupY} position-z={pivotLength}>
      {/* motion.groupは、ペンデュラムのアームとボブの回転を制御します。 */}
      <motion.group rotation-z={angle}>
        {/* motion.meshは、ペンデュラムのアームの3Dオブジェクトを表します。
            このオブジェクトは、シリンダーの形状を持っています。 
                       
        <motion.mesh position-y={armY} scale-y={armScaleY} castShadow>
          <cylinderGeometry
            args={[armRadius, armRadius, 1, 32]} // シリンダーの形状を定義 具体的には、シリンダーの上部と下部の半径、高さ、およびセグメントの数を指定します。[armRadius, armRadius, 1, 32]
            attach='geometry'
          />
          <meshMatcapMaterial matcap={matcap} />{' '}
          {/* マットキャップテクスチャを適用 }
        </motion.mesh>*/}

        {/* 新しく追加されたコード: 中心座標に配置するための縦の円柱の追加です。
            position-yプロパティでY座標を設定し、position-xプロパティでX座標を設定しています。
            ここでは0を指定してペンデュラムの中心に配置しています。 
        <motion.mesh position-y={0} position-x={0} castShadow>
          <cylinderGeometry
            args={[0.1, 0.1, pivotLength + 0.2, 32]}
            attach='geometry'
          />
          <meshMatcapMaterial matcap={matcap} />
        </motion.mesh> */}

        {/* motion.meshは、ペンデュラムのボブの3Dオブジェクトを表します。
            このオブジェクトは、球の形状を持っています。 
        <motion.mesh position-y={bobY} castShadow receiveShadow>
          <sphereGeometry args={[bobRadius, 32, 32]} attach='geometry' />{' '}
          {/* 球の形状を定義 }
          <meshMatcapMaterial matcap={matcap} />{' '}
          {/* マットキャップテクスチャを適用 }
        </motion.mesh> */}

        {/* このオブジェクトは、風車の羽です。 */}
        {[0, 90, 180, 270].map((rotation, index) => (
          <motion.mesh
            key={index}
            rotation-z={rotation * (Math.PI / 180)}
            position-z={0.1}
            position-y={0} // ここで position-y を wingY の半分に設定していますarmY.get()
            position-x={0} // ここで position-x を wingWidth の半分に設定していますarmY.get()
            scale-y={wingScaleY}
          >
            <planeGeometry args={[0.6, 8]} attach='geometry' />

            <meshStandardMaterial color={0x000010} />
          </motion.mesh>
        ))}
      </motion.group>

      {/* このmeshは、ペンデュラムのピボット（回転の中心点）を表します。
            このオブジェクトもシリンダーの形状を持っています。 
      <mesh
        position={[0, 0, -(pivotLength - 0.2) / 2]} // ピボットの位置を変更
        rotation={[-Math.PI / 2, 0, 0]} // ピボットの回転を変更
        castShadow // 影を落とす
      >
        <cylinderGeometry
          args={[pivotRadius, pivotRadius, pivotLength + 0.2, 32]} // シリンダーの形状を定義
          attach='geometry' // シリンダーの形状を適用
        />
        <meshMatcapMaterial matcap={matcap} />{' '}
        {/* マットキャップテクスチャを適用 
      </mesh>*/}

      {/* Planeは、ペンデュラムの動きを検出するための透明な平面を表します。
            この平面は、ユーザーのインタラクションを検出するために使用されますが、実際には表示されません。 */}
      <Plane args={[1000, 1000]} {...props}>
        {' '}
        {/* Planeの形状を定義 */}
        <meshBasicMaterial visible={false} /> {/* 平面を非表示にする */}
      </Plane>

      <CylinderComponent
        radiusTop={pivotRadius}
        radiusBottom={pivotRadius}
        height={cylinderHeight / 2} // ここでpivotLengthをCylinderComponentに渡します。
        {...props}
      />
    </motion.group>
  )
}

const CylinderComponent = ({
  radiusTop = 0.1, // 上端の半径。
  radiusBottom = 0.1, // 下端の半径
  height = 23, // ここで高さを受け取ります。デフォルト値として2を設定しています。
  radialSegments = 32, // 円柱の周りのセグメントの数
  rotationX = 0, // X軸周りの回転（ラジアン）
  rotationY = 0, // Y軸周りの回転（ラジアン）
  rotationZ = 0, // Z軸周りの回転（ラジアン）
  ...props // その他のプロパティを受け取るためのスプレッド構文。これにより、このコンポーネントは多くの異なる用途で使用
}) => {
  return (
    // 3Dオブジェクトのメッシュを作成します。外部から受け取ったpropsをmeshコンポーネントに渡します。
    <mesh
      {...props}
      rotation={[rotationX, rotationY, rotationZ]}
      position={[0, -height, 0]}
      castShadow
    >
      {/* 
        cylinderGeometryコンポーネントを使用して円柱の形状を定義します。
        argsプロパティを使用して、円柱の上部と下部の半径、高さ、およびセグメントの数を指定します。
      */}
      <cylinderGeometry
        args={[radiusTop, radiusBottom, 2 * height, radialSegments]} // ここでheightを高さとして使用しています。
        attach='geometry'
      />
      <meshStandardMaterial color={0x000000} />
    </mesh>
  )
}

// シーン内の構造（床や壁）を定義するコンポーネント
const Structure: React.FC = () => {
  // 床の3Dオブジェクトを定義する関数
  const Floor = useCallback(
    (props: Omit<MeshProps, 'args'>) => (
      // Boxは3Dの四角形を表現するコンポーネント
      <Box
        args={[5000, 1000, 10]}
        position={[0, -5, 500]} // 0, -5, 500
        rotation={[-Math.PI / 2, 0, 0]}
        {...props}
      />
    ),
    []
  )
  // 壁の3Dオブジェクトを定義する関数
  const Wall = useCallback(
    (props: Omit<MeshProps, 'args'>) => (
      // Boxは3Dの四角形を表現するコンポーネント
      <Box args={[5000, 1000, 10]} position={[0, 500, -5]} {...props} />
    ),
    []
  )

  // 影はtransparentをtrueにして、opacityを0.3にすることで透明にしている
  return (
    <>
      <Floor>
        <meshStandardMaterial color={0xf8f8f6} />
      </Floor>
      <Wall>
        <meshStandardMaterial color={0xf8f8f6} />
      </Wall>
      <Floor receiveShadow>
        <shadowMaterial color={0x007a88} transparent opacity={0.3} />
      </Floor>
      <Wall receiveShadow>
        <shadowMaterial color={0x007a88} transparent opacity={0.3} />
      </Wall>

      {/* 新しく追加されたCylinderComponentを追加 
       <CylinderComponent position={[0, 0, 0]} />*/}
    </>
  )
}
// f8f8f6 0x007a88

// シーン内の照明を定義するコンポーネント
// このコンポーネントは、ペンデュラムの3Dオブジェクトに影を落とすために必要
// 影を落とすためには、照明のintensityを0より大きく、3DオブジェクトのcastShadowをtrueにする必要がある
// 影は自動で落ちないので、照明の位置を調整する必要がある。
const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.3} />
    <pointLight intensity={0.4} position={[0, 10, 5]} />
    <directionalLight
      position={[40, 100, 40]}
      intensity={2}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0}
      shadow-camera-far={500}
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={40}
      shadow-camera-bottom={-10}
    />
  </>
)

// シーンのプロパティを定義するインターフェース
// omit関数を使用して、SceneEventHandlersのプロパティを除外している
// これにより、Sceneコンポーネントには、onPointerMoveとonPointerDownのイベントハンドラを渡すことができる
export interface SceneProps
  extends Omit<ComponentPropsWithRef<typeof Root>, keyof SceneEventHandlers>,
    Partial<SceneEventHandlers> {}

// コンポーネントを組み合わせて、ペンデュラムの3Dシーン全体を表示する主要なコンポーネントです。
export const Scene = forwardRef<HTMLDivElement, SceneProps>(
  ({ onPointerMove, onPointerDown, ...props }, forwardedRef) => {
    // jotaiからペンデュラムのパラメータを取得
    const params = useAtomValue(paramsStore)
    // jotaiからペンデュラムの現在の状態を取得
    const state = useAtomValue(stateStore)

    // ペンデュラムの長さをアニメーションするための値
    // useSpringは、アニメーションのための値を作成するフック
    // このフックは、引数にアニメーションのパラメータを渡す
    // このフックは、アニメーションのパラメータを変更すると、自動的にアニメーションを開始する
    const length: MotionValue<number> = useSpring(params.length)
    useEffect(() => {
      length.set(params.length)
    }, [params.length, length])

    // カメラとコントロールの状態を管理するためのstate
    // カメラ位置を変更するためには、OrbitControlsのtargetを変更する必要がある
    // カメラのズームを変更するためには、カメラのzoomを変更する必要がある
    // これらの値を変更すると、カメラの位置やズームが変更される
    const [camera, setCamera] = useState<PerspectiveCameraImpl | null>(null)
    const [controls, setControls] = useState<OrbitControlsImpl | null>(null)

    // ペンデュラムの長さに応じてカメラの位置を更新する関数
    // useCallbackを使用して、この関数をメモ化している
    // これにより、この関数は、lengthが変更されたときだけ再計算される
    // もし、lengthが変わった際にカメラを回転したい場合は、この関数を変更する必要がある
    // 例として、カメラの位置を変更する代わりに、カメラの回転を変更するという方法がある
    // この場合、カメラの位置を変更する必要はないので、カメラの位置を変更するコードを削除する
    // そして、カメラの回転を変更するコードを追加する
    const updateCamera = useCallback(
      (length: number) => {
        if (camera == null || controls == null) {
          return
        }
        // Track pendulum. // ペンデュラムを追跡
        controls.target.y = length / 2 + 1.25
        camera.zoom = (1 / (length + 2)) * 50
        camera.updateProjectionMatrix()
        controls.update()
      },
      [camera, controls]
    )

    // カメラとコントロールの状態が変わったときにカメラの位置を更新
    useIsomorphicLayoutEffect(() => {
      if (camera != null && controls != null) {
        updateCamera(length.get())
      }
    }, [length, camera, controls, updateCamera])

    // ペンデュラムの長さが変わったときにカメラの位置を更新
    useIsomorphicLayoutEffect(() => {
      return length.onChange(length => {
        updateCamera(length)
      })
    }, [length, updateCamera])

    // ペンデュラムの角度を取得
    const angle = useTransform(state, ({ angle }) => angle)
    // 既存のペンデュラムの角度を基に、120度と240度ずれた新しい角度を生成

    const angle120 = useTransform(angle, value => value + (120 * Math.PI) / 180)
    const angle240 = useTransform(angle, value => value + (240 * Math.PI) / 180)

    return (
      <Root ref={forwardedRef} {...props}>
        {/* 3DシーンをレンダリングするためのCanvas */}
        <Canvas shadows style={{ position: 'absolute' }}>
          {/* 透視投影カメラを設定 */}
          <PerspectiveCamera
            ref={setCamera}
            makeDefault
            position={[0, 0, length.get() + 130]} // カメラの位置を変更 -20, 60, 30
            //lookAt={[0, length.get() / 2, 0]} // カメラの向きを変更
            up={[0, 0, 1]} // カメラの上向き方向をz軸正の方向に設定
            near={10}
            far={5000}
            //up={[0, 1, 0]} // Z軸に沿ったロール回転を模倣
          />
          {/* カメラの操作を可能にするOrbitControls */}
          <OrbitControls
            ref={setControls}
            mouseButtons={{
              LEFT: MOUSE.PAN,
              MIDDLE: MOUSE.DOLLY,
              RIGHT: MOUSE.ROTATE
            }}
            touches={{
              ONE: TOUCH.PAN,
              TWO: TOUCH.DOLLY_ROTATE
            }}
            enablePan={true}
            enableZoom={true}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
            minPolarAngle={0} // {Math.PI / 4}
            maxPolarAngle={Math.PI} // Math.PI / 2
          />
          {/* シーン内の照明を追加 */}
          <Lights />
          {/* シーン内の構造（床や壁）を追加 */}
          <Structure />
          {/* ペンデュラムの3Dオブジェクトをレンダリング */}
          <Suspense fallback={null}>
            <Pendulum
              angle={angle}
              length={length}
              onPointerMove={onPointerMove}
              onPointerDown={onPointerDown}
            />
          </Suspense>
          {/* 120度ずれたペンデュラム 
          <Suspense fallback={null}>
            <Pendulum
              angle={angle120} // 120度ずれた角度を利用
              length={length} // 既存の長さを利用
              onPointerMove={onPointerMove}
              onPointerDown={onPointerDown}
            />
          </Suspense>

          {/* 240度ずれたペンデュラム }
          <Suspense fallback={null}>
            <Pendulum
              angle={angle240} // 240度ずれた角度を利用
              length={length} // 既存の長さを利用
              onPointerMove={onPointerMove}
              onPointerDown={onPointerDown}
            />
          </Suspense>
          */}

          {/* シーンにノイズエフェクトを追加
              具体的には、EffectComposer は、シーンにポストプロセッシングエフェクトを追加するためのコンポーネントです。
              この中にある Noise コンポーネントは、シーンにノイズ（粒子状のランダムなパターン）を追加するエフェクトを表しています。
          */}
          <EffectComposer>
            <Noise blendFunction={BlendFunction.MULTIPLY} opacity={0.1} />
          </EffectComposer>
        </Canvas>
      </Root>
    )
  }
)
