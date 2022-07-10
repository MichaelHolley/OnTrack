import {
	ActionIcon,
	createStyles,
	Group,
	Image,
	Navbar,
	useMantineColorScheme,
} from '@mantine/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	BrandGithub,
	ChartDots,
	Coin,
	Home,
	LayoutSidebarLeftCollapse,
	LayoutSidebarLeftExpand,
	ListCheck,
	MoonStars,
	Sun,
} from 'tabler-icons-react';

const useStyles = createStyles((theme, _params, getRef) => {
	const icon = getRef('icon');

	return {
		header: {
			paddingBottom: theme.spacing.md,
			marginBottom: theme.spacing.md * 1.5,
			borderBottom: `1px solid ${
				theme.colorScheme === 'dark'
					? theme.colors.dark[4]
					: theme.colors.gray[2]
			}`,
		},

		footer: {
			paddingTop: theme.spacing.md,
			marginTop: theme.spacing.md,
			borderTop: `1px solid ${
				theme.colorScheme === 'dark'
					? theme.colors.dark[4]
					: theme.colors.gray[2]
			}`,
		},

		link: {
			...theme.fn.focusStyles(),
			display: 'flex',
			alignItems: 'center',
			textDecoration: 'none',
			fontSize: theme.fontSizes.sm,
			color:
				theme.colorScheme === 'dark'
					? theme.colors.dark[1]
					: theme.colors.gray[7],
			padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
			borderRadius: theme.radius.sm,
			fontWeight: 500,
			marginBottom: 2,

			'&:hover': {
				backgroundColor:
					theme.colorScheme === 'dark'
						? theme.colors.dark[6]
						: theme.colors.gray[0],
				color: theme.colorScheme === 'dark' ? theme.white : theme.black,

				[`& .${icon}`]: {
					color: theme.colorScheme === 'dark' ? theme.white : theme.black,
				},
				cursor: 'pointer',
			},
		},

		linkIcon: {
			ref: icon,
			color:
				theme.colorScheme === 'dark'
					? theme.colors.dark[2]
					: theme.colors.gray[6],
		},

		linkText: {
			marginLeft: 8,
		},

		linkActive: {
			'&, &:hover': {
				backgroundColor:
					theme.colorScheme === 'dark'
						? theme.fn.rgba(theme.colors[theme.primaryColor][8], 0.25)
						: theme.colors[theme.primaryColor][0],
				color:
					theme.colorScheme === 'dark'
						? theme.white
						: theme.colors[theme.primaryColor][7],
				[`& .${icon}`]: {
					color:
						theme.colors[theme.primaryColor][
							theme.colorScheme === 'dark' ? 5 : 7
						],
				},
			},
		},
	};
});

const routes = [
	{ link: '/', label: 'Home', icon: Home },
	{ link: 'activities', label: 'Activities', icon: ChartDots },
	{ link: 'todo', label: 'ToDo', icon: ListCheck },
	{ link: 'expenses', label: 'Monthly Expenses', icon: Coin },
];

export default function VerticalNavbar() {
	const { classes, cx } = useStyles();
	const [activeRoute, setActiveRoute] = useState(
		window.location.pathname !== '/'
			? window.location.pathname.substring(1)
			: window.location.pathname
	);

	const [collapsed, setCollapsed] = useState(false);

	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	const links = routes.map((item) => (
		<Link
			className={cx(classes.link, {
				[classes.linkActive]:
					item.link.toLowerCase() === activeRoute.toLowerCase(),
			})}
			to={item.link}
			key={item.label}
			title={item.label}
			onClick={() => {
				setActiveRoute(item.link);
			}}>
			<item.icon className={classes.linkIcon} />
			{!collapsed && <span className={classes.linkText}>{item.label}</span>}
		</Link>
	));

	return (
		<Navbar
			width={{ base: !collapsed ? 270 : 80 }}
			p="md"
			style={{ transition: 'width ease-in-out 0.5s' }}>
			<Navbar.Section grow>
				<Group
					direction="row"
					noWrap
					className={classes.header}
					position={'apart'}
					style={{ paddingLeft: '10px' }}>
					<ActionIcon
						onClick={() => setCollapsed(!collapsed)}
						title={`${collapsed ? 'Extend' : 'Collapse'} sidebar`}>
						{collapsed ? (
							<LayoutSidebarLeftExpand size={24} />
						) : (
							<LayoutSidebarLeftCollapse size={24} />
						)}
					</ActionIcon>
					<Image src="logo-310.png" height={24} />
				</Group>
				{links}
			</Navbar.Section>

			<Navbar.Section>
				<Group>
					<a
						title="Feedback on GitHub"
						className={cx(classes.link)}
						href="https://github.com/MichaelHolley/OnTrack/discussions"
						key="GitHub"
						target="_blank"
						rel="noreferrer">
						<BrandGithub className={classes.linkIcon} />
						{!collapsed && (
							<span className={classes.linkText}>
								Feedback, Issues & Suggestions
							</span>
						)}
					</a>
				</Group>
				<Group
					className={classes.footer}
					position={'left'}
					style={{ paddingLeft: '10px' }}>
					<ActionIcon
						onClick={() => toggleColorScheme()}
						title="Toggle color scheme">
						{isDark ? <Sun size={24} /> : <MoonStars size={24} />}
					</ActionIcon>
				</Group>
			</Navbar.Section>
		</Navbar>
	);
}
