module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-transform-class-static-block', { loose: true }]
  ],
};
