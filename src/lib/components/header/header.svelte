<script>
	import Nav from './nav.svelte';
	import { page } from '$app/stores';
	import Matrix from './matrix.svelte';
	// import { darkMode, screenType } from '$lib/store/store';

	// import { page } from '$app/stores';
	// import { goto } from '$app/navigation';

	$: showMatrix = ['/', '/theta-imaginary', '/kp-equation', '/tangent-lattice'].includes(
		$page.url.pathname
	);

	// stub data out
	const navItems = [
		{
			name: 'Riemann Theta - Mobius - Real Part (N=2)',
			href: '/'
		},
		{
			name: 'Riemann Theta - Imaginary Part (N=2)',
			href: '/theta-imaginary'
		},
		{
			name: 'KP Equation (N=2)',
			href: '/kp-equation'
		},
		{
			name: 'Theta - Tangent Lattice (N=1)',
			href: '/tangent-lattice'
		}
	];

	// let toggleDarkMode = () => {
	// 	darkMode.set(!$darkMode);
	// 	document.querySelector(':root').classList.toggle('dark-mode');
	// 	};
</script>

<header>
	<main>
		<div />
		{#if showMatrix}
			<Matrix />
		{/if}
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
