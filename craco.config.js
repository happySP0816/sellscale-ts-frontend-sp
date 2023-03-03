const CracoAlias = require('craco-alias');
const { ESLINT_MODES } = require("@craco/craco");

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        tsConfigPath: './tsconfig.path.json',
      },
    },
  ],
  eslint: {
    mode: ESLINT_MODES,
    loaderOptions: (eslintOptions) => {
      eslintOptions.ignore = true;
      return eslintOptions;
    },
    configure: (eslintConfig, { env, paths }) => {
      return eslintConfig;
    },
  },
};
