module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    // prettier-ignore
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "google",
        "prettier",
        "prettier/@typescript-eslint"
    ]
};
