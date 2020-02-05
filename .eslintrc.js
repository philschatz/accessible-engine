// module.exports = {
//   root: true,
//   parser: '@typescript-eslint/parser',
//   plugins: [
//     '@typescript-eslint',
//   ],
//   extends: [
//     'eslint:recommended',
//     'plugin:@typescript-eslint/eslint-recommended',
//     'plugin:@typescript-eslint/recommended',
//   ],
// };

module.exports = {
  "extends": "standard-with-typescript",
  "parserOptions": {
      "project": "./tsconfig.json"
  }
}