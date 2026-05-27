````markdown
## ダウンロードして遊ぶ方法

このゲームは、プログラミングに詳しくない方でも、パソコンにダウンロードして遊ぶことができます。

### 1. ゲームをダウンロードする

1. このページの右上あたりにある緑色の **Code** ボタンをクリックします。
2. 表示されたメニューから **Download ZIP** をクリックします。
3. `shooting-game2-main.zip` というファイルがダウンロードされます。

### 2. ZIPファイルを解凍する

ダウンロードした `shooting-game2-main.zip` をダブルクリックして解凍します。

解凍すると、`shooting-game2-main` というフォルダができます。

### 3. Node.jsをインストールする

このゲームを起動するには、Node.js という無料のソフトが必要です。

まだ入っていない場合は、以下の公式サイトから **LTS版** をダウンロードしてインストールしてください。

https://nodejs.org/

インストールが終わったら、ターミナルを開いて次のコマンドを入力します。

```bash
node -v
````

バージョン番号が表示されればOKです。

例:

```text
v22.0.0
```

### 4. ターミナルでゲームのフォルダを開く

Macの場合は、解凍した `shooting-game2-main` フォルダを右クリックして、
**フォルダに新規ターミナル** または **サービス > フォルダに新規ターミナル** を選びます。

もしそのメニューが出ない場合は、ターミナルを開いて、次のように入力します。

```bash
cd ダウンロードしたフォルダの場所
```

例:

```bash
cd ~/Downloads/shooting-game2-main
```

### 5. 必要なファイルをインストールする

ターミナルで次を入力します。

```bash
npm install
```

これは初回だけ必要です。

### 6. ゲームを起動する

次を入力します。

```bash
npm run dev
```

しばらくすると、ターミナルに次のようなURLが表示されます。

```text
http://localhost:5173/
```

このURLをブラウザで開くと、ゲームをプレイできます。

### 7. ゲームを終了する

遊び終わったら、ターミナルで次のキーを押します。

```text
Control + C
```

「終了しますか？」のような表示が出た場合は、`y` を入力して Enter を押してください。

## 操作方法

| 操作    | キー      |
| ----- | ------- |
| 左に移動  | ← または A |
| 右に移動  | → または D |
| ショット  | Space   |
| 一時停止  | P       |
| リスタート | R       |

スマートフォンやタブレットでは、画面下の操作エリアをドラッグして移動し、タップでショットできます。

## うまく起動しないとき

### `npm` が見つからないと言われる場合

Node.js がインストールされていない可能性があります。
Node.js の公式サイトから LTS版をインストールしてください。

[https://nodejs.org/](https://nodejs.org/)

### ブラウザで開けない場合

`npm run dev` を実行したあと、ターミナルに表示されたURLをコピーして、ブラウザのアドレスバーに貼り付けてください。

多くの場合は以下のURLです。

```text
http://localhost:5173/
```

### 画面が真っ白になる場合

一度ターミナルで `Control + C` を押して終了し、もう一度以下を実行してください。

```bash
npm run dev
```

````

追加したら、念のためもう一度チェックしてください。

```bash
npm run build
npm test
npm run security:check
````

その後コミットです。

```bash
git add README.md
git commit -m "Update README with download and play instructions"
git push
```

[1]: https://github.com/naiveprince/shooting-game2 "naiveprince/shooting-game2 · GitHub"

