module.exports = [{
  entry: ['./app.scss', './app.js'],
  output: {
      // This is necessary for webpack to compile
      // But we never use style-bundle.js
      filename: 'bundle.js',
  },
  module: {
      rules: [{
          test: /\.scss$/,
          use: [{
                  loader: 'file-loader',
                  options: {
                      name: 'bundle.css',
                  },
              },
              {
                  loader: 'extract-loader'
              },
              {
                  loader: 'css-loader'
              },
              {
                  loader: 'sass-loader',
                  options: {
                      includePaths: ['./node_modules']
                  }
              },

          ],

<<<<<<< HEAD
      }, {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
              presets: ['@babel/preset-env'],
          },
      }]
  },
=======
        }, {
            test: /\.js$/,
            loader: 'babel-loader?cacheDirectory',
            exclude: /node_modules/,
            query: {
                presets: ['@babel/preset-env'],
            },
        }]
    },
>>>>>>> webapp
}];