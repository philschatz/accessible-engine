module.exports = {
  "rules": {
    // assertDefined(...) needs these
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    // While porting functions keep the snake_case
    "@typescript-eslint/camelcase": "warn",
    
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
  },
  "extends": "standard-with-typescript",
  "parserOptions": {
      "project": "./tsconfig.json"
  }
}