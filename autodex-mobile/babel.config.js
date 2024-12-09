/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	presets: [
		'module:@react-native/babel-preset',
		// 'module:metro-react-native-babel-preset',
	],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				extensions: ['.js', '.json'],
				alias: {
					'@': './src',
				},
			},
		],
		["@babel/plugin-transform-react-jsx", {
      "runtime": "automatic"
    }],
		'inline-dotenv',
		'@babel/plugin-proposal-export-namespace-from',
		'react-native-reanimated/plugin'
	],
};
