# Solana Wallet Integration in Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.12.

## npm dependency

```
npm i @solana/spl-token --save
npm i @solana/web3.js --save
```

## module dependency
Add HttpClientModule in the imports
```
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    HttpClientModule
  ],
  ...
})
```
## Add JS compatibility
- Create 'typings' folder at the root of the project
- Create a file 'index.d.ts' inside the 'typings' folder and add the below content

```
declare module 'buffer-layout';
```
- Edit tsconfig.json file. Add the below content at the end of the JSON object

```
 "typeRoots": [
    "./typings",
    "./node_modules/@types/"
  ]
```
- Edit tsconfig.json file. Add the below content in the "compilerOptions" object of the JSON

```
"allowSyntheticDefaultImports": true,
"noImplicitAny": false
```
- Edit polyfills.ts file. Add the below content at the end of the file

```
(window as any).global = window;
```

## Home page preview
![Home Page](/readme/s1.png?raw=true "Home Page")