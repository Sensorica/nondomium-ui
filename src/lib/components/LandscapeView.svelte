<script lang="ts">
	import { onMount } from 'svelte';
	import type { LandscapeEntity, AgentContext } from '../types';
	import EntityIcon from './EntityIcon.svelte';
	import EntityModal from './EntityModal.svelte';
	import PerspectiveSelector from './PerspectiveSelector.svelte';
	import { calculateProximity, assignLayer } from '../proximity-calculator';

	const props = $props<{
		entities: LandscapeEntity[];
		agentContext: AgentContext | null;
		onAgentContextChange: (context: AgentContext) => void;
	}>();

	let entities = $state(props.entities);
	let agentContext = $state(props.agentContext);

	// Keep entities and agentContext in sync with props
	$effect(() => {
		entities = props.entities;
		agentContext = props.agentContext;
	});

	let landscapeContainer: HTMLDivElement;
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let dragStart = { x: 0, y: 0 };
	let selectedEntity: LandscapeEntity | null = $state(null);
	let hoveredEntity: LandscapeEntity | null = $state(null);

	// Layer navigation state
	let currentLayerIndex = $state(0); // 0 = initial position, 1 = first ArrowUp, etc.
	let layerHistory: LandscapeEntity[][] = $state([]); // Track layers as we navigate
	let canGoDown = $state(false); // Track if we can go back down
	let visibleLayers = $state([2, 3, 4]); // Currently visible layer numbers (start with actual populated layers)

	// Viewport dimensions
	let viewportWidth = 1000;
	let viewportHeight = 600;

	onMount(() => {
		if (landscapeContainer) {
			const observer = new ResizeObserver((entries) => {
				const entry = entries[0];
				viewportWidth = entry.contentRect.width;
				viewportHeight = entry.contentRect.height;
			});
			observer.observe(landscapeContainer);

			// Make the landscape container focusable
			landscapeContainer.focus();
			landscapeContainer.setAttribute('tabindex', '0');

			return () => observer.disconnect();
		}
	});

	// Pan interaction handlers
	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
		dragStart = { x: event.clientX - panX, y: event.clientY - panY };
	}

	function handleMouseMove(event: MouseEvent) {
		if (isDragging) {
			panX = event.clientX - dragStart.x;
			panY = event.clientY - dragStart.y;

			// Constrain panning to reasonable bounds
			panX = Math.max(-1000, Math.min(1000, panX));
			panY = Math.max(-300, Math.min(300, panY));
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	// Entity interaction handlers
	function handleEntityClick(entity: LandscapeEntity) {
		selectedEntity = entity;
	}

	function handleEntityHover(entity: LandscapeEntity) {
		hoveredEntity = entity;
	}

	function closeModal() {
		selectedEntity = null;
	}

	// Layer navigation
	function jumpToLayer(targetLayer: number) {
		// Animate entities moving between layers
		entities = entities.map((entity: LandscapeEntity) => {
			if (entity.position.z > targetLayer) {
				entity.position.z = Math.max(1, entity.position.z - 1);
				entity.position.y -= 120 * 0.3; // Move forward
			}
			return entity;
		});
	}

	// Initialize layer history with current entities
	$effect(() => {
		if (entities.length > 0 && layerHistory.length === 0) {
			layerHistory = [entities];
		}
	});

	// Function to move one layer deeper (ArrowUp)
	function moveDeeper() {
		// Save current state to history before any changes
		layerHistory = [...layerHistory, [...entities]];

		// Update visible layers
		visibleLayers = visibleLayers.map((layer) => layer + 1);
		const newLastLayer = visibleLayers[2] + 1;

		// Update entities:
		// 1. Remove layer 1 entities (they disappear)
		// 2. Keep other entities in their current layers
		entities = entities.filter((entity: LandscapeEntity) => entity.position.z > 1);

		// Calculate proximity for potential new entities in the new last layer
		// Find entities that could be in the new layer based on proximity
		const potentialNewEntities = props.entities
			.filter(
				(e: LandscapeEntity) => !entities.some((existing: LandscapeEntity) => existing.id === e.id)
			) // Not already visible
			.map((e: LandscapeEntity) => ({
				...e,
				position: {
					...e.position,
					proximity_score: calculateProximity(e, props.agentContext)
				}
			}))
			.filter((e: LandscapeEntity) => {
				const layer = assignLayer(e.position.proximity_score);
				return layer === visibleLayers[2]; // Should be in the last visible layer
			})
			.map((e: LandscapeEntity) => ({
				...e,
				position: {
					...e.position,
					z: visibleLayers[2] // Place in last visible layer
				}
			}));

		// Add new entities if found
		if (potentialNewEntities.length > 0) {
			// New entities added to last layer
			entities = [...entities, ...potentialNewEntities];
		}

		currentLayerIndex++;
		canGoDown = true;

		// Layer distribution updated
	}

	// Function to move one layer back (ArrowDown)
	function moveBack() {
		if (canGoDown && layerHistory.length > 0) {
			// Update visible layers first
			visibleLayers = visibleLayers.map((layer) => layer - 1);
			// Restore previous layer state
			const previousEntities = layerHistory.pop();
			if (previousEntities) {
				// Completely replace current entities with previous state
				entities = [...previousEntities];
				currentLayerIndex--;
				canGoDown = currentLayerIndex > 0;
			}
		}
	}

	// Keyboard navigation
	function handleKeyDown(event: KeyboardEvent) {
		// Handle keyboard navigation

		// Prevent default behavior for arrow keys
		if (event.key.startsWith('Arrow')) {
			event.preventDefault();
		}

		switch (event.key) {
			case 'ArrowLeft':
				panX = panX + 50;
				break;
			case 'ArrowRight':
				panX = panX - 50;
				break;
			case 'ArrowUp':
				moveDeeper(); // Move deeper into layers
				break;
			case 'ArrowDown':
				moveBack(); // Come back to front
				break;
			case 'Escape':
				selectedEntity = null;
				break;
		}
	}

	// Calculate parallax effect for different layers
	function getParallaxTransform(layer: number): string {
		const parallaxFactor = 1 - (layer - 1) * 0.3; // Slower movement for distant layers
		const x = panX * parallaxFactor;
		const y = panY * parallaxFactor * 0.5; // Less vertical movement
		return `translate(${x}px, ${y}px)`;
	}

	// Group entities by layer for rendering
	const entityLayers = $derived(
		entities.reduce(
			(layers: Record<number, LandscapeEntity[]>, entity: LandscapeEntity) => {
				const layer = entity.position.z;
				if (!layers[layer]) layers[layer] = [];
				layers[layer].push(entity);
				return layers;
			},
			{} as Record<number, LandscapeEntity[]>
		)
	);

	// Track entity distribution across layers
	$effect(() => {
		// Layer distribution tracking
	});
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} onkeydown={handleKeyDown} />

<div class="landscape-view" bind:this={landscapeContainer}>
	<!-- Perspective selector -->
	<PerspectiveSelector {agentContext} onChange={props.onAgentContextChange} />

	<!-- Navigation hints -->
	<div class="navigation-hints">
		<div class="hint">↔ Pan landscape</div>
		<div class="hint">↕ Change depth</div>
		<div class="hint">Click entities for details</div>
	</div>

	<!-- Landscape container -->
	<button
		class="landscape-container"
		class:dragging={isDragging}
		onmousedown={handleMouseDown}
		aria-label="Nondominium resource landscape"
	>
		<!-- Layer rows stacked vertically -->
		<div class="landscape-layers">
			<!-- Always show three layers, using visibleLayers state -->
			{#each visibleLayers as layerNumber, index}
				<div
					class="landscape-layer layer-{layerNumber}"
					style="transform: {getParallaxTransform(layerNumber)}"
				>
					<div class="layer-background"></div>
					<div class="layer-label">
						{#if layerNumber === visibleLayers[0]}
							Primary Focus
						{:else if layerNumber === visibleLayers[1]}
							Extended Context
						{:else}
							Background Context
						{/if}
					</div>
					{#if entityLayers[layerNumber]}
						{#each entityLayers[layerNumber] as entity (entity.id)}
							{@const relativeLayerPos = visibleLayers.indexOf(layerNumber) + 1}

							<EntityIcon
								{entity}
								relativeLayer={relativeLayerPos}
								onEntityClick={handleEntityClick}
								onEntityHover={handleEntityHover}
							/>
						{/each}
					{/if}
				</div>
			{/each}
		</div>

		<!-- Horizon line -->
		<div class="horizon" style="transform: {getParallaxTransform(4)}"></div>
	</button>

	<!-- Entity tooltip on hover -->
	{#if hoveredEntity}
		<div class="entity-tooltip">
			<h3>{hoveredEntity.type}</h3>
			<p>Proximity: {(hoveredEntity.position.proximity_score * 100).toFixed(0)}%</p>
			<p>Layer: {hoveredEntity.position.z}</p>
		</div>
	{/if}

	<!-- Agent context display -->
	{#if agentContext}
		<div class="agent-context">
			<div class="context-role">{agentContext.role}</div>
			<div class="context-perspective">{agentContext.perspective} view</div>
		</div>
	{/if}
</div>

<!-- Modal for entity details (micro layer) -->
{#if selectedEntity}
	<EntityModal entity={selectedEntity} onClose={closeModal} />
{/if}

<style>
	.landscape-view {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background: linear-gradient(
			to bottom,
			#87ceeb 0%,
			/* Sky blue at top */ #98fb98 40%,
			/* Light green above horizon */ #f4a460 60%,
			/* Sandy color below horizon */ #d2691e 100% /* Darker earth tone at bottom */
		);
		cursor: grab;
	}

	.landscape-container {
		position: relative;
		width: 100%;
		height: 100%;
		perspective: 1000px;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		cursor: grab;
		display: block;
	}

	.landscape-layers {
		position: absolute;
		width: 100%;
		height: 70%; /* Take up 70% of the screen height */
		bottom: 15%; /* Position from bottom, leaving 15% margin */
		display: flex;
		flex-direction: column-reverse; /* Reverse the stacking order */
		justify-content: flex-end; /* Align to bottom */
		gap: 40px; /* Increased spacing between layers */
	}

	.landscape-layer {
		position: relative;
		width: 100%;
		height: 60px;
		transition: transform 0.3s ease-out;
		pointer-events: auto;
		overflow: visible;
		transform-origin: bottom center; /* Set transform origin to bottom */
	}

	.layer-background {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
	}

	/* Layer-specific backdrop blur */
	.layer-1 .layer-background {
		backdrop-filter: none;
	}

	.layer-2 .layer-background {
		backdrop-filter: blur(1px);
	}

	.layer-3 .layer-background {
		backdrop-filter: blur(2px);
	}

	.layer-4 .layer-background {
		backdrop-filter: blur(3px);
	}

	.layer-label {
		position: absolute;
		left: 20px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 12px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}

	/* Layer-specific styling for depth perception */
	.layer-1 {
		background: rgba(59, 130, 246, 0.15);
		z-index: 10;
		border: 1px solid rgba(59, 130, 246, 0.3);
		width: 90%;
		margin-left: 5%;
		transform: perspective(1000px) rotateX(0deg); /* No rotation for focus layer */
	}

	.layer-2 {
		background: rgba(16, 185, 129, 0.1);
		z-index: 8;
		border: 1px solid rgba(16, 185, 129, 0.2);
		width: 85%;
		margin-left: 7.5%;
		transform: perspective(1000px) rotateX(10deg) translateY(20px); /* Slight tilt */
	}

	.layer-3 {
		background: rgba(245, 158, 11, 0.08);
		z-index: 6;
		border: 1px solid rgba(245, 158, 11, 0.15);
		width: 80%;
		margin-left: 10%;
		transform: perspective(1000px) rotateX(20deg) translateY(40px); /* More tilt */
	}

	.layer-4 {
		background: rgba(107, 114, 128, 0.05);
		z-index: 4;
		border: 1px solid rgba(107, 114, 128, 0.1);
		width: 75%;
		margin-left: 12.5%;
		transform: perspective(1000px) rotateX(30deg) translateY(60px); /* Most tilt */
	}

	.horizon {
		position: absolute;
		bottom: 40%; /* Align with the middle of the screen */
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.3), transparent);
		z-index: 2;
		pointer-events: none;
	}

	.navigation-hints {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 20;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.hint {
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 6px 12px;
		border-radius: 16px;
		font-size: 12px;
		backdrop-filter: blur(10px);
	}

	.agent-context {
		position: absolute;
		bottom: 20px;
		left: 20px;
		z-index: 20;
		background: rgba(255, 255, 255, 0.9);
		padding: 12px 16px;
		border-radius: 12px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.context-role {
		font-weight: 600;
		color: #374151;
		margin-bottom: 4px;
	}

	.context-perspective {
		font-size: 12px;
		color: #6b7280;
		text-transform: capitalize;
	}

	.entity-tooltip {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 20;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 12px 16px;
		border-radius: 8px;
		backdrop-filter: blur(10px);
		pointer-events: none;
	}

	.entity-tooltip h3 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
		text-transform: capitalize;
	}

	.entity-tooltip p {
		margin: 0 0 4px 0;
		font-size: 12px;
		opacity: 0.9;
	}

	.entity-tooltip p:last-child {
		margin-bottom: 0;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.navigation-hints {
			position: relative;
			background: rgba(0, 0, 0, 0.8);
			color: white;
			padding: 8px;
			margin: 0;
			top: 0;
			left: 0;
		}

		.hint {
			background: transparent;
			padding: 2px 0;
		}

		.agent-context {
			position: relative;
			bottom: auto;
			left: auto;
			margin: 10px;
		}
	}

	/* Focus styles for accessibility */
	.landscape-container:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}
</style>
