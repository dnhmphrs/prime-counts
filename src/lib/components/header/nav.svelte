<script>
	import { page } from '$app/stores';
	import { renderer } from '$lib/store/store';

	export let navItems = [];
	export async function load() {
		return {
			props: {
				navItems
			}
		};
	}

	let changeRenerer = (value) => {
		renderer.set(value);
		window.location.reload();
	}
</script>

<nav>

	<p>SHADER::</p>

	{#each navItems as navItem}
		<a href={navItem.href} class="" class:active={navItem.href === $page.url.pathname}
			>{navItem.name}</a
		>
		
	{/each}

	<p>//</p>
	<p>RENDERER::</p>
		<p on:click={() => changeRenerer('three')} on:keypress={(null)} class="clickable" class:active={$renderer === 'three'}>THREE.JS (610kb)</p>
		<!-- <p on:click={() => changeRenerer('regl')} on:keypress={(null)} class="clickable" class:active={$renderer === 'regl'}>REGL.JS (122kb)</p>
		<p on:click={() => changeRenerer('webgl')} on:keypress={(null)} class="clickable" class:active={$renderer === 'webgl'}>WebGL (0kb)</p> -->
	<!-- <a href="https://aufbau.io" target="_blank">EIN AUFBAU DING</a> -->
</nav>

<style>
	nav {
		align-self: baseline;
		display: flex;
		flex-flow: row wrap;
		background: var(--background);
		color: var(--primary);
		border: var(--border);
	}
	nav a,
	nav p {
		padding: 10px 10px;
		font-size: inherit;
		color: inherit;
		opacity: .5;
	}

	nav a,
	nav p.clickable {
		cursor: pointer;
	}

	nav a:hover {
		opacity: 0.6;
	}

	nav a.active, p.active {
		font-weight: 700;
	}

	.active,
	.active:hover {
		opacity: 1;
	}

	@media only screen and (max-width: 768px) {
		nav {
			flex-flow: column wrap;
		}
	}
</style>
