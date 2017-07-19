const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Path
const APP_PATH = __dirname.match('(.*)skin.*')[1];
const TMPL_PATH = path.resolve(APP_PATH, 'app/head'); 
const publicPath = '/skin/';
const svgDirs = [
    //require.resolve('antd-mobile').replace(/warn\.js$/, ''), // 1. 属于 antd-mobile 内置 svg 文件
    path.resolve(__dirname, 'src/my-project-svg-foler'),  // 2. 自己私人的 svg 存放目录
];
module.exports = {
    entry: {
        'login': path.resolve(__dirname, './build_js/login/index.js'),
        'order': path.resolve(__dirname, './build_js/order/index.js')
    },
    output:{
        path: path.resolve(__dirname, './dist/'),
        publicPath: publicPath+'/dist',
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js',
    },
    module:{
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            }, 
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader'
                }],
                exclude: [
                    path.resolve(APP_PATH, 'node_modules/'), 
                    path.resolve(APP_PATH, 'js/lib/'),
                    path.resolve(APP_PATH, 'js/plugins/'),
                ]
            }, 
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader'
                }],
                exclude: /node_modules/
            }, 
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }, 
            {
                test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/,
                use: ['url-loader']
            }, 
            {
                test: /\.(svg)$/i,
                use: ['svg-sprite-loader'],
                include: svgDirs, 
            }, 
            {
                test: /\.(png|jpg)$/,
                use: ['url-loader?limit=8192&name=images/[hash:8].[name].[ext]']
            }
        ]
    },
    resolve:{
        extensions: [".js", ".scss", ".json"],  
        modules: ['node_modules', path.join(__dirname, './node_modules')],
        alias: {
            scss: path.resolve(__dirname, 'scss'),
            mainpage: path.resolve(__dirname, 'js/mainPage')
        }
    },
    // 不需要打包的模块
    externals: {},
    plugins:[
        new ExtractTextPlugin({
            filename: 'css/[name]-[content:8].css',
            allChunks: true,
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: function(){
                    return [
                        require("autoprefixer")({
                            browsers: ['ie>=8','>1% in CN','last 5 versions', 'Android >= 4.0']
                        }),
                        require('postcss-assets')({
                            loadPaths: [Path.resolve(Var.APP_PATH, './images/')]
                        }), 
                        require('cssnano')({
                            core: true,
                        }),
                        require('postcss-sprites')({
                            styleFilePath: Path.resolve(Var.APP_PATH, './release/css/'),
                            spritePath: Path.resolve(Var.APP_PATH, './images/sprite/'),
                            filterBy: function(image) {
                                if (/sprite/.test(image.url) && !/sprite\./.test(image.url)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject();
                            },
                            groupBy: function(image){

                                var name = image.url.match(/\/images\/sprite\/(.*?)-(.*?)\.png/)[1];
                                if(name){
                                    return Promise.resolve(name);
                                }
                                return Promise.reject();
                            },
                            spritesmith: {
                                padding: 0
                            }
                        })
                    ]
                }
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({   
            name: 'commons',
            filename: 'js/commonsService.js',
            chunks: ['main', 'customer']
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(TMPL_PATH, './registerHead.phtml'),
            chunks: ['main', 'customer'],
            template: path.resolve(TMPL_PATH, '../headTmpl/default.phtml'),
            inject: false,
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(TMPL_PATH, './loginHead.phtml'),
            chunks: ['main', 'customer'],
            template: path.resolve(TMPL_PATH, '../headTmpl/default.phtml'),
            inject: false,
        }),
        new webpack.optimize.ModuleConcatenationPlugin()     // 3.0新功能 范围提升 （Scope Hoisting ）
    ]}