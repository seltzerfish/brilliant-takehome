import Phaser from 'phaser';

import LoadingSplash from './scenes/Splash';
import PreloaderScene from './scenes/PreloaderScene';
import MainScene from './scenes/MainScene';

export const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: window.innerWidth,
	height: window.innerHeight,
	physics: {
		default: 'matter',
		matter: {
			autoUpdate: false,
			gravity: {
				x: 0,
				y: 1
			}
		}
	},
	pixelArt: true,
	transparent: true,
	scale: {
		mode: Phaser.Scale.NONE
	},

	scene: [LoadingSplash, PreloaderScene, MainScene]
};
