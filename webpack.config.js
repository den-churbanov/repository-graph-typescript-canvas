const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProduction) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config
}

const fileName = ext => isDevelopment ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoader = additional => {
    const loader = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {}
        },
        'css-loader'
    ]

    if (additional) {
        loader.push(additional)
    }
    return loader
}

const babelOptions = preset => {
    const opt = {
        loader: "babel-loader",
        options: {
            presets: ['@babel/preset-env']
        }
    }
    if (preset) {
        opt.options.presets.push(preset)
    }
    return opt
}

const plugins = () => {
    const base = [
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './graph.ico',
            minify: {
                collapseWhitespace: isProduction,
                removeComments: isProduction
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src/graph.ico'),
                        to: path.resolve(__dirname, 'dist')
                    }
                ]
            }
        ),
        new MiniCssExtractPlugin({
            filename: fileName('css')
        })
    ]
    // if (isProduction){ base.push(new BundleAnalyzerPlugin())}
    return base
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: isDevelopment ? 'development': 'production',
    devServer: {
        port: 5000,
        hot: isDevelopment
    },
    devtool: isDevelopment ? 'source-map' : '',
    entry: {
        main: ['@babel/polyfill', './app.ts']
    },
    output: {
        filename: fileName('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        alias: {
            '@graph': path.resolve(__dirname, 'src/graph')
        }
    },
    optimization: optimization(),
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoader()
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoader('sass-loader')
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: babelOptions()
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: babelOptions('@babel/preset-typescript')
            }
        ]
    }
}