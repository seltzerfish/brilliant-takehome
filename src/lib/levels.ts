export type Level = {
	canDrawMirrors: boolean;
	eyePosition: {
		x: number;
		y: number;
	};
	objectPosition: {
		x: number;
		y: number;
	};
	mirrors: {
		start: {
			x: number;
			y: number;
		};
		end: {
			x: number;
			y: number;
		};
	}[];
	walls: {
		start: {
			x: number;
			y: number;
		};
		end: {
			x: number;
			y: number;
		};
	}[];
};

export const LEVELS: Level[] = [
	{
		canDrawMirrors: false,
		eyePosition: {
			x: 10000,
			y: -10000
		},
		objectPosition: {
			x: 0,
			y: 0
		},
		mirrors: [],
		walls: []
	},
	{
		canDrawMirrors: false,
		eyePosition: {
			x: 150,
			y: -50
		},
		objectPosition: {
			x: -150,
			y: -50
		},
		mirrors: [],
		walls: []
	},
	{
		canDrawMirrors: false,
		eyePosition: {
			x: 250,
			y: -250
		},
		objectPosition: {
			x: -250,
			y: -250
		},
		mirrors: [
			{
				start: {
					x: -150,
					y: -50
				},
				end: {
					x: 150,
					y: -50
				}
			}
		],
		walls: [
			{
				start: {
					x: 0,
					y: -350
				},
				end: {
					x: 0,
					y: -130
				}
			}
		]
	},
	{
		canDrawMirrors: false,
		eyePosition: {
			x: 0,
			y: 200
		},
		objectPosition: {
			x: -0,
			y: -300
		},
		mirrors: [
			{
				start: {
					x: -200,
					y: -150
				},
				end: {
					x: -200,
					y: 50
				}
			},
			{
				start: {
					x: 200,
					y: -150
				},
				end: {
					x: 200,
					y: 50
				}
			}
		],
		walls: [
			{
				start: {
					x: -100,
					y: -50
				},
				end: {
					x: 100,
					y: -50
				}
			}
		]
	},
	{
		canDrawMirrors: false,
		eyePosition: {
			x: 0,
			y: 200
		},
		objectPosition: {
			x: -0,
			y: -300
		},
		mirrors: [
			{
				start: {
					x: -200,
					y: -240
				},
				end: {
					x: -200,
					y: 140
				}
			},
			{
				start: {
					x: 200,
					y: -240
				},
				end: {
					x: 200,
					y: 140
				}
			}
		],
		walls: []
	},
	{
		canDrawMirrors: true,
		eyePosition: {
			x: 300,
			y: -150
		},
		objectPosition: {
			x: -300,
			y: -150
		},
		mirrors: [],
		walls: []
	}
];
