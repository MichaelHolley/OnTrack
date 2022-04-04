import {
	ActionIcon,
	createStyles,
	Group,
	Navbar,
	useMantineColorScheme,
} from '@mantine/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	Home,
	LayoutSidebarLeftCollapse,
	LayoutSidebarLeftExpand,
	List,
	MoonStars,
	Plus,
	Star,
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
	{ link: 'activities/favorites', label: 'Favorites', icon: Star },
	{ link: 'activities', label: 'Activities', icon: List },
	{ link: 'add', label: 'Add', icon: Plus },
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
			onClick={(event) => {
				setActiveRoute(item.link);
			}}>
			<item.icon className={classes.linkIcon} />
			{!collapsed && <span className={classes.linkText}>{item.label}</span>}
		</Link>
	));

	return (
		<Navbar width={{ xs: !collapsed ? 300 : 80 }} p="md">
			<Navbar.Section grow>
				<Group
					className={classes.header}
					position={collapsed ? 'center' : 'left'}>
					<ActionIcon
						onClick={() => setCollapsed(!collapsed)}
						title={`${collapsed ? 'Extend' : 'Collapse'} sidebar`}>
						{collapsed ? (
							<LayoutSidebarLeftExpand size={24} />
						) : (
							<LayoutSidebarLeftCollapse size={24} />
						)}
					</ActionIcon>
				</Group>
				{links}
			</Navbar.Section>

			<Navbar.Section className={classes.footer}>
				<Group position={collapsed ? 'center' : 'left'}>
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
