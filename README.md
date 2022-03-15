# grid-image-generator

Twitterに自分が投稿した画像を選び、それらをまとめた1枚の画像を作るサービスです。

動作させるにはTwitter api, Firebase Authの設定が必要です。

以下のファイルに Twitter API Key & secret と Firebase Auth ドメイン、Firebase API Keyを記述してください。
env/.env.local.ts
env/.env.prod.ts

記述が終わったらファイル名先頭の . を削除してください。
以下のようになれば準備完了です。
env/env.local.ts
env/env.prod.ts


## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
