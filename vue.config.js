module.exports = {
  outputDir: "./dist", // ファイルの出力先ルート
  pages: {
    index: {
      entry: 'src/main.ts', // 必須パラメータ
      title: 'まとめ画像ジェネレータ'
    }
  },
  configureWebpack: {
    output: {
      filename: '[name].[hash:8].js'
    }
  }
};

