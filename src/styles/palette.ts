const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

type Step = (typeof steps)[number];
type Scale<T extends string> = Record<`${T}${Step}`, string>;

const rgba = (hex: string, alpha: number) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const reverse = <T extends string>(name: T, scale: Scale<T>) =>
	Object.fromEntries(
		steps.map((step, i) => [`${name}${step}`, scale[`${name}${steps[steps.length - 1 - i]}`]]),
	) as Scale<T>;

const grey: Scale<'grey'> = {
	grey50: '#f9fafb',
	grey100: '#f2f4f6',
	grey200: '#e5e8eb',
	grey300: '#d1d6db',
	grey400: '#b0b8c1',
	grey500: '#8b95a1',
	grey600: '#6b7684',
	grey700: '#4e5968',
	grey800: '#333d4b',
	grey900: '#191f28',
};

const blue: Scale<'blue'> = {
	blue50: '#e8f3ff',
	blue100: '#c9e2ff',
	blue200: '#90c2ff',
	blue300: '#64a8ff',
	blue400: '#4593fc',
	blue500: '#3182f6',
	blue600: '#2272eb',
	blue700: '#1b64da',
	blue800: '#1957c2',
	blue900: '#194aa6',
};

const red: Scale<'red'> = {
	red50: '#ffeeee',
	red100: '#ffd4d6',
	red200: '#feafb4',
	red300: '#fb8890',
	red400: '#f66570',
	red500: '#f04452',
	red600: '#e42939',
	red700: '#d22030',
	red800: '#bc1b2a',
	red900: '#a51926',
};

const greyOpacity: Scale<'greyOpacity'> = {
	greyOpacity50: rgba('#001733', 0.02),
	greyOpacity100: rgba('#022047', 0.05),
	greyOpacity200: rgba('#001b37', 0.1),
	greyOpacity300: rgba('#001d3a', 0.18),
	greyOpacity400: rgba('#001936', 0.31),
	greyOpacity500: rgba('#031832', 0.46),
	greyOpacity600: rgba('#00132b', 0.58),
	greyOpacity700: rgba('#031228', 0.7),
	greyOpacity800: rgba('#000c1e', 0.8),
	greyOpacity900: rgba('#020913', 0.91),
};

const orange: Scale<'orange'> = {
	orange50: '#fff3e0',
	orange100: '#ffe0b0',
	orange200: '#ffcd80',
	orange300: '#ffbd51',
	orange400: '#ffa927',
	orange500: '#fe9800',
	orange600: '#fb8800',
	orange700: '#f57800',
	orange800: '#ed6700',
	orange900: '#e45600',
};

const yellow: Scale<'yellow'> = {
	yellow50: '#fff9e7',
	yellow100: '#ffefbf',
	yellow200: '#ffe69b',
	yellow300: '#ffdd78',
	yellow400: '#ffd158',
	yellow500: '#ffc342',
	yellow600: '#ffb331',
	yellow700: '#faa131',
	yellow800: '#ee8f11',
	yellow900: '#dd7d02',
};

const green: Scale<'green'> = {
	green50: '#f0faf6',
	green100: '#aeefd5',
	green200: '#76e4b8',
	green300: '#3fd599',
	green400: '#15c47e',
	green500: '#03b26c',
	green600: '#02a262',
	green700: '#029359',
	green800: '#028450',
	green900: '#027648',
};

const teal: Scale<'teal'> = {
	teal50: '#edf8f8',
	teal100: '#bce9e9',
	teal200: '#89d8d8',
	teal300: '#58c7c7',
	teal400: '#30b6b6',
	teal500: '#18a5a5',
	teal600: '#109595',
	teal700: '#0c8585',
	teal800: '#097575',
	teal900: '#076565',
};

const purple: Scale<'purple'> = {
	purple50: '#f9f0fc',
	purple100: '#edccf8',
	purple200: '#da9bef',
	purple300: '#c770e4',
	purple400: '#b44bd7',
	purple500: '#a234c7',
	purple600: '#9128b4',
	purple700: '#8222a2',
	purple800: '#73228e',
	purple900: '#65237b',
};

export const lightColors = {
	...grey,
	...blue,
	...red,
	...greyOpacity,
	...orange,
	...yellow,
	...green,
	...teal,
	...purple,
	background: '#ffffff',
	greyBackground: grey.grey100,
	layeredBackground: '#ffffff',
	floatedBackground: '#ffffff',
};

export type ColorTokens = Record<keyof typeof lightColors, string>;

const darkGrey = reverse('grey', grey);

export const darkColors: ColorTokens = {
	...darkGrey,
	...reverse('blue', blue),
	...reverse('red', red),
	greyOpacity50: rgba('#ffffff', 0.02),
	greyOpacity100: rgba('#ffffff', 0.05),
	greyOpacity200: rgba('#ffffff', 0.1),
	greyOpacity300: rgba('#ffffff', 0.18),
	greyOpacity400: rgba('#ffffff', 0.31),
	greyOpacity500: rgba('#ffffff', 0.46),
	greyOpacity600: rgba('#ffffff', 0.58),
	greyOpacity700: rgba('#ffffff', 0.7),
	greyOpacity800: rgba('#ffffff', 0.8),
	greyOpacity900: rgba('#ffffff', 0.91),
	...reverse('orange', orange),
	...reverse('yellow', yellow),
	...reverse('green', green),
	...reverse('teal', teal),
	...reverse('purple', purple),
	background: '#101318',
	greyBackground: '#0b0d11',
	layeredBackground: darkGrey.grey50,
	floatedBackground: darkGrey.grey100,
};
