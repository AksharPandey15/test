export default {
  plugins: {
    'postcss-nested': {},
    'postcss-flexbugs-fixes': {},
    'postcss-custom-properties': {
      preserve: true,
      fallback: true,
    },
    'autoprefixer': {
      flexbox: true,
      overrideBrowserslist: [
        'ios >= 4',
        'safari >= 4',
        'ie >= 9',
        '> 0.5%',
        'not dead'
      ]
    },
  },
};
