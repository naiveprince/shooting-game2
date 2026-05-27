# Shooting Game 2

React + TypeScript + Vite で作った、ブラウザで遊べる軽量シューティングゲームです。描画は Canvas 2D に集約し、React の再レンダリングを最小限にして、PC とスマートフォンの両方で素早く動くことを重視しています。

## 遊び方

- **移動**: `WASD` または矢印キー
- **ショット**: `Space`
- **開始 / リスタート**: `Enter` または画面の「スタート」ボタン
- **一時停止**: `P` または画面の「一時停止」ボタン
- **スマートフォン**: キャンバス上をドラッグすると移動し、タッチ中はショットします

敵を撃ち落としてスコアを伸ばしてください。敵と衝突するとライフが減り、ライフがなくなるとゲームオーバーです。ベストスコアはブラウザの `localStorage` に保存されます。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで表示された URL を開くとゲームを遊べます。

## テスト

```bash
npm test
```

ゲームロジックの基本関数を Node.js の標準テストランナーで検証します。

## ビルド

```bash
npm run build
```

TypeScript の型チェック後、Vite で本番用ファイルを生成します。

## セキュリティチェック

```bash
npm run security:check
```

以下のような危険な実装が混入していないかを静的に確認します。

- `dangerouslySetInnerHTML`
- `eval`
- `new Function`
- `innerHTML` への直接代入
- `document.write`

## 軽量化の方針

- ゲーム描画は DOM 要素を大量生成せず、単一の Canvas に集約
- `requestAnimationFrame` を使い、フレームごとの差分時間で移動量を計算
- 弾、敵、パーティクル数に上限を設け、長時間プレイでも負荷が増え続けない設計
- 外部画像・音声アセットなしで、初回ロードを軽量化
- スコア表示以外は React state への依存を抑え、ゲーム状態は `useRef` 中心で管理

## 実装ファイル

- `src/App.tsx`: UI、Canvas 描画、入力処理、ゲームループ
- `src/gameLogic.ts`: 型定義、定数、衝突判定、敵生成、爆発生成
- `src/gameStep.ts`: 1 フレーム分のゲーム状態更新
- `src/styles.css`: レスポンシブ UI
- `tests/gameLogic.test.mjs`: 軽量なロジックテスト
- `scripts/security-check.mjs`: 静的セキュリティチェック
