import {resolve} from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const isDevelopment = process.env.NODE_ENV !== 'production';

const exports = {
    mode: isDevelopment? "development" : 'production',
    entry: {
        app: "./source/app.jsx"
    },
    output: {
        path: resolve("./out/src/"),
        filename: "[name].js",
        publicPath: "/src/"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react', ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [{loader: 'style-loader'}, {loader: 'css-loader'}]
            },
            {
                test: /\.svg$/,
                issuer: /\.[jt]sx?$/,
                use: {
                    loader: "@svgr/webpack"
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: "asset/resource",
                generator: {
                    filename: 'fonts/[name][ext]',
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'node-modules',
                    chunks: "all"
                }
            }
        }
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: resolve('./out/index.html'),
            template: "./index.html"
        }),
        {
            apply: (compiler) => {
                compiler.hooks.compilation.tap('HtmlPluginFormatting', (compilation) => {
                    HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                        'HtmlPluginFormatting',
                        (data, callback) => {
                            data.html = data.html
                                .replace(/<\/script>/g, '</script>\n\t')
                                .replace(/<script/g, '\t<script');
                            callback(null, data);
                        }
                    );
                });
            }
        }
    ],
    devServer: {
        static: "./out/",
        port: 8000,
        hot: true,
        historyApiFallback: true
    }
}
export default exports;