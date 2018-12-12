# Booklub
A social media app for books! Booklub!
Using npm

# WIP!

### Dependencies
1. Express - primary server framework
2. Mongoose - mongodb api
3. Passport - authentication
4. Passport-jwt - for json webtokens
5. Jsonwebtoken - generates the tokens
6. Body-parser - parse incoming data
7. Bcryptjs - password hashing
8. Validator - its in the name


#### Dev Dependencies
1. nodemon - live updating dev server
2. Linting rules: 
   * eslint, babel-eslint, eslint-config-airbnb
   * Run the follow bash to get airbnb and all it's dependencies:
   * `$(export PKG=eslint-config-airbnb;
npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm i -D "$PKG@latest")`


#### Notes
1. `npm run server` to start nodemon
2. Models
   * filenames: singular and capitalized 