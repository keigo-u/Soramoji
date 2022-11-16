const path = require("path");
const outputPath = path.resolve(__dirname, "public");
const HtmlWebpackPlugin = require('html-webpack-plugin'); //ここを追加

module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: 'development',

    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: './src/index.ts',

    output: {
        filename: 'bundle.js',
        path: `${outputPath}`
    },

    module: {
        rules: [
            {
                // 拡張子 .ts の場合
                test: /\.ts$/,
                // TypeScript をコンパイルする
                use: 'ts-loader',
            },
        ],
    },
    // import 文で .ts ファイルを解決するため
    // これを定義しないと import 文で拡張子を書く必要が生まれる。
    // フロントエンドの開発では拡張子を省略することが多いので、
    // 記載したほうがトラブルに巻き込まれにくい。
    resolve: {
        // 拡張子を配列で指定
        extensions: [
            '.ts', '.js',
        ],
    },
    // settings for developer server
    devServer: {
        static: `${outputPath}`,
        port: 8080,
        open: true,
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html"
        })
    ]
};