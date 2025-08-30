<script lang="ts">
	import type { LandscapeEntity } from '../types';
	import type { Person, EconomicResource, Commitment } from '../types';
	import { getResourceSpecForResource } from '../data-loader';

	let {
		entity,
		relativeLayer = 1,
		onEntityClick,
		onEntityHover
	}: {
		entity: LandscapeEntity;
		relativeLayer?: number;
		onEntityClick?: (entity: LandscapeEntity) => void;
		onEntityHover?: (entity: LandscapeEntity) => void;
	} = $props();

	// Calculate entity size based on relative layer position
	let calculatedSize = $state(55);

	$effect(() => {
		const baseSize = 55; // Primary Focus layer size (increased to 55px)
		const sizeByLayer: Record<number, number> = {
			1: baseSize, // Primary Focus (55px)
			2: baseSize * 0.75, // Extended Context (41px)
			3: baseSize * 0.6, // Background Context (33px)
			4: baseSize * 0.45 // Far Background (25px)
		};
		const newSize = sizeByLayer[relativeLayer] || baseSize * 0.7;

		calculatedSize = newSize;
	});

	interface LayerStyle {
		opacity: number;
		background: string;
		borderWidth: string;
	}

	type LayerConfig = {
		[key: number]: LayerStyle;
	};

	// Calculate layer-specific visual properties based on relative layer position
	const layerStyles = $derived(() => {
		// Simple styles - no blur for layer 1, increasing blur for others
		const styles = {
			opacity: relativeLayer === 1 ? 1.0 : 0.8,
			background: 'rgba(255, 255, 255, 1)',
			borderWidth: relativeLayer === 1 ? '2px' : '1px'
		};
		return styles;
	});

	// Get state color
	const stateColor = $derived(getStateColor(entity.state));

	// Get entity image or icon
	const entityDisplay = $derived(getEntityDisplay(entity));

	function getStateColor(state: string): string {
		switch (state) {
			case 'available':
				return '#10b981'; // green
			case 'needs_attention':
				return '#f59e0b'; // yellow
			case 'critical':
				return '#ef4444'; // red
			case 'in_use':
				return '#3b82f6'; // blue
			case 'dormant':
				return '#9ca3af'; // gray
			case 'pending':
				return '#8b5cf6'; // purple
			default:
				return '#6b7280'; // neutral gray
		}
	}

	function getEntityDisplay(entity: LandscapeEntity) {
		if (entity.type === 'person') {
			const person = entity.data as Person;
			return {
				image: person.person.avatar_url,
				name: person.person.name,
				subtitle: person.roles[0]?.role_name || 'Member'
			};
		} else if (entity.type === 'resource') {
			const resource = entity.data as EconomicResource;
			const spec = getResourceSpecForResource(resource);
			return {
				image: spec?.image_url || '/default-resource.svg',
				name: spec?.name || 'Resource',
				subtitle: resource.state
			};
		} else if (entity.type === 'commitment') {
			const commitment = entity.data as Commitment;
			return {
				image: '/commitment-icon.svg',
				name: commitment.action,
				subtitle: 'Due: ' + new Date(commitment.due_date).toLocaleDateString()
			};
		}
		return { image: '', name: 'Unknown', subtitle: '' };
	}

	function handleClick() {
		onEntityClick?.(entity);
	}

	function handleMouseEnter() {
		onEntityHover?.(entity);
	}
</script>

<div
	class="entity-icon {relativeLayer === 1 ? 'primary-focus' : ''}"
	style="
    width: {calculatedSize}px; 
    height: {calculatedSize}px;
    opacity: {layerStyles().opacity};
    filter: {relativeLayer === 1 ? 'none' : `blur(${relativeLayer}px)`};
    border-color: {stateColor};
    border-width: {layerStyles().borderWidth};
    background: {layerStyles().background};
    transform: {relativeLayer === 1
		? `translate3d(${entity.position.x}px, ${entity.position.y}px, 0)`
		: `translate(${entity.position.x}px, ${entity.position.y}px)`};
  "
	data-entity-type={entity.type}
	data-entity-size={calculatedSize}
	data-relative-layer={relativeLayer}
	data-debug-info="layer:{relativeLayer},size:{calculatedSize}"
	onclick={handleClick}
	onmouseenter={handleMouseEnter}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="entity-image">
		<img src={entityDisplay.image} alt={entityDisplay.name} />
	</div>

	<!-- State indicator glow -->
	<div
		class="state-glow"
		style="box-shadow: 0 0 {entity.state === 'critical' ? '20' : '10'}px {stateColor};"
	></div>

	<!-- Peripheral state indicators -->
	<div class="state-indicators">
		{#if entity.state === 'available'}
			<div class="state-indicator available" title="Available/Healthy">🟢</div>
		{:else if entity.state === 'needs_attention'}
			<div class="state-indicator needs-attention" title="Needs Attention">🟡</div>
		{:else if entity.state === 'critical'}
			<div class="state-indicator critical" title="Critical/Blocked">🔴</div>
		{:else if entity.state === 'in_use'}
			<div class="state-indicator in-use" title="In Use/Reserved">🔵</div>
		{:else if entity.state === 'dormant'}
			<div class="state-indicator dormant" title="Dormant/Archive">⚪</div>
		{:else if entity.state === 'pending'}
			<div class="state-indicator pending" title="Pending">🟣</div>
		{/if}
	</div>

	<!-- Activity pulse for urgent items -->
	{#if entity.state === 'critical' || entity.state === 'needs_attention'}
		<div class="pulse-ring" style="border-color: {stateColor};"></div>
	{/if}

	<!-- Label (only visible on meso layer) -->
	{#if entity.position.z <= 1}
		<div class="entity-label">
			<div class="entity-name">{entityDisplay.name}</div>
			<div class="entity-subtitle">{entityDisplay.subtitle}</div>
		</div>
	{/if}
</div>

<style>
	:global(.landscape-layers) {
		transform-style: preserve-3d;
		perspective: 1000px;
		will-change: transform;
	}

	.entity-icon {
		position: absolute;
		transform-style: preserve-3d;
		cursor: pointer;
		transform-origin: center;
		border-radius: 50%;
		user-select: none;
		transition: none;
		/* Ensure perfect circular shape */
		aspect-ratio: 1 / 1 !important;
		flex-shrink: 0;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Force size to be respected */
		min-width: unset !important;
		min-height: unset !important;
		max-width: none !important;
		max-height: none !important;
	}

	/* Force sharpness for primary focus layer */
	.entity-icon.primary-focus {
		filter: none !important;
		opacity: 1 !important;
	}

	/* Temporarily disabled hover effects to debug */
	/* .entity-icon:hover {
		box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
		z-index: 10;
	} */

	.entity-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
		position: relative;
	}

	.entity-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		display: block;
	}

	.state-glow {
		position: absolute;
		inset: -3px;
		border-radius: 50%;
		pointer-events: none;
		opacity: 0.6;
	}

	.pulse-ring {
		position: absolute;
		inset: -10px;
		border: 2px solid;
		border-radius: 50%;
		animation: pulse 2s infinite;
		pointer-events: none;
	}

	.state-indicators {
		position: absolute;
		inset: -15px;
		pointer-events: none;
	}

	.state-indicator {
		position: absolute;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(4px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease;
	}

	/* Position state indicators around the entity */
	.state-indicator.available {
		top: -8px;
		right: -8px;
	}

	.state-indicator.needs-attention {
		top: -8px;
		left: -8px;
	}

	.state-indicator.critical {
		bottom: -8px;
		right: -8px;
	}

	.state-indicator.in-use {
		bottom: -8px;
		left: -8px;
	}

	.state-indicator.dormant {
		top: 50%;
		right: -8px;
		transform: translateY(-50%);
	}

	.state-indicator.pending {
		top: 50%;
		left: -8px;
		transform: translateY(-50%);
	}

	/* Hover effect for state indicators */
	.entity-icon:hover .state-indicator {
		transform: scale(1.2);
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1.4);
			opacity: 0;
		}
	}

	.entity-label {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 8px;
		text-align: center;
		pointer-events: none;
		white-space: nowrap;
	}

	.entity-name {
		font-size: 12px;
		font-weight: 600;
		color: #374151;
		margin-bottom: 2px;
	}

	.entity-subtitle {
		font-size: 10px;
		color: #6b7280;
	}

	/* Responsive sizing */
	@media (max-width: 768px) {
		.entity-name {
			font-size: 10px;
		}

		.entity-subtitle {
			font-size: 8px;
		}
	}
</style>
