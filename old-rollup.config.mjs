import fs from 'node:fs/promises';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import path from 'path';
import { createRequire } from 'node:module';

const rawPackageJSON = await fs.readFile('package.json', { encoding: 'utf8' });

/** @type {import('./package.json')} */
const { name, version, main } = JSON.parse(rawPackageJSON);

const require = createRequire(import.meta.url);
/**
 * @param {string} p
 * @returns {string}
 */
const resolve = (p) => path.resolve(process.cwd(), p);
const pkg = require(resolve(`package.json`));
const libOutputPath = main.replace(/\.[cm]?js$/, '');
const camelCaseName = name.replace(/-./g, (x) => x[1].toUpperCase());

/**
 * @param {Array<string>} externalArr
 * @returns {(id: string)=> boolean}
 */
const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return (id) => pattern.test(id);
};

/**
 * @param {string} id
 * @returns {boolean}
 */
const isExternal =
	process.platform === 'win32'
		? (/** @type {string} */ id) => !/^(([a-zA-Z]{1}\:\\)|[.\\])/.test(id)
		: (/** @type {string} */ id) => !/^[./]/.test(id);

/**
 * @param {import('rollup').RollupOptions} config
 * @returns {import('rollup').RollupOptions}
 */
const bundle = (config) => ({
	...config,
	input: './src/index.ts',
	external: isExternal
});

export default [
	// Output for NodeJS
	bundle({
		plugins: [esbuild({ target: 'es6' })],
		output: [
			{
				file: `${libOutputPath}.js`,
				format: 'cjs',
				sourcemap: false,
				compact: false
			},
			{
				file: `${libOutputPath}.esm.js`,
				format: 'esm',
				sourcemap: false,
				compact: false
			}
		],
	}),

	// Output for Typescript's .d.ts
	bundle({
		plugins: [dts()],
		output: {
			file: `${libOutputPath}.d.ts`,
			format: 'es'
		}
	}),

	// Output for browser
	bundle({
		plugins: [esbuild({ target: 'esnext', minify: true })],
		output: {
			file: `./dist/${libOutputPath}.esm-browser.js`,
      format: 'es',
			name: camelCaseName,
			sourcemap: true,
			compact: true,
      // allow all globals
      globals: (value) => value
		},
	})
];
