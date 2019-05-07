//由于 webpack 是基于Node进行构建的，所有 webpack 的配置文件中，任何合法的Node代码都是支持的
// var path=require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //通过 npm 安装
const webpack = require("webpack"); //访问内置的插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//当以命令行运行 webpack 或 webpack-dev-server 的时候，工具会发现，没有提供打包的 入口 和 出口 文件，此时，它会检查项目根目录中的配置文件，并读取这个文件，就可以拿到导出的这个配置对象，然后根据这个对象，进行打包构建
module.exports = {
  //配置多页面应用
  entry: {
  signup:__dirname + "/signup/index.js",//注册
  complete_signup:__dirname + "/complete_signup/index.js",//注册成功
   login: __dirname + "/login/index.js", //webpack 打包 输入 路径
   mainmap:__dirname + "/mainmap/index.js",
  },
  output: {
    path: __dirname + "/dist", //webpack 打包 输出 路径
    filename: "[name]bundle.js"
  },
  mode: "development",
  devServer: {
    open:true,//自动拉起浏览器
    contentBase: './dist',
    // hot: true//不加hot可以实现不刷新浏览器自动更新
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
           MiniCssExtractPlugin.loader,
           "css-loader",
      ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
            loader:"file-loader",
            options:{
                name:"[name].[ext]",
                publicPath:"./images/",
                outputPath:"images/"
            }
    }]
      },
      {
        test: /\.(html)$/,
        use: {
            loader: 'html-loader',
            options: {
                attrs: ['img:src', 'img:data-src', 'audio:src'],
                minimize: true
            }
        }
    },
    { // 这里用rules而不是loaders
      test: /\.js$/, // 匹配所有js文件
      exclude: /node_modules/, // 排除掉node_modules这个文件夹的js文件
      loader: 'babel-loader', // 加载babel工具包
      options: { // 这里用options而不是query，虽然可以兼容，但是还是按照规则来吧
          presets: ['env'] // 使用es6工具包
      }
  },
    ]
  },
 

  plugins: [
    new HtmlWebpackPlugin({
      chunks:["signup"],
      title: "USVJH",
      filename: "signup.html",
      template: "./signup/signup.html",
    }),
    new HtmlWebpackPlugin({
      chunks:["complete_signup"],
      title: "USVJH",
      filename: "complete_signup.html",
      template: "./complete_signup/complete_signup.html",
    }),
    new HtmlWebpackPlugin({
      chunks:["login"],
      title: "USVJH",
      filename: "login.html",
      template: "./login/login.html"
    }),
    new HtmlWebpackPlugin({
      chunks:["mainmap"],
      title: "USVJH",
      filename: "mainmap.html",
      template: "./mainmap/main_map.html",
    }),
  
    new MiniCssExtractPlugin({
      　　filename: "[name].css",
   　　 }),
   new webpack.NamedModulesPlugin(),
new webpack.HotModuleReplacementPlugin()
  ] 
};
