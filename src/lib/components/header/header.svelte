<script>
	import Nav from './nav.svelte';
	import { page } from '$app/stores';

	// Prime-focused routes that show the matrix
	$: showMatrix = ['/', '/prime-simple', '/prime-interactive'].includes(
		$page.url.pathname
	);

	// Prime circle navigation items
	const navItems = [
		{
			name: 'Prime Circles - Full Resolution',
			href: '/'
		},
		{
			name: 'Prime Circles - Simple (Performance)',
			href: '/prime-simple'
		},
		{
			name: 'Prime Circles - Interactive',
			href: '/prime-interactive'
		}
	];
</script>

<header>
	<main>
		<div />
		<Nav {navItems} />
	</main>
</header>

<style>
	header {
		user-select: none;
		color: var(--primary);
	}

	main {
		margin: auto;
		max-width: 100vw;
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;

		padding: 20px;
		font-size: 12px;
		height: calc(2 * var(--margin));
	}
</style>