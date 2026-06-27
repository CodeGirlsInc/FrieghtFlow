module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  overrides: [
    {
      test: /\.(tsx|jsx)$/,
      presets: [['@babel/preset-react', { runtime: 'automatic' }]],
    },
  ],
};
