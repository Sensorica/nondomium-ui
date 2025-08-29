<script lang="ts">
	import type { LandscapeEntity } from '../types';
	import type { Person, EconomicResource, Commitment } from '../types';
	import { getResourceSpecForResource } from '../data-loader';

	let {
		entity,
		onEntityClick,
		onEntityHover
	}: {
		entity: LandscapeEntity;
		onEntityClick?: (entity: LandscapeEntity) => void;
		onEntityHover?: (entity: LandscapeEntity) => void;
	} = $props();

	// Calculate entity size based on proximity score
	const size = $derived(Math.max(40, entity.position.proximity_score * 80 + 20));

	// Calculate opacity based on layer depth
	const opacity = $derived(
		entity.position.z === 1 ? 1.0 : Math.max(0.4, 1.0 - (entity.position.z - 1) * 0.2)
	);

	// Calculate blur based on layer depth
	const blur = $derived(entity.position.z > 1 ? (entity.position.z - 1) * 2 : 0);

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
	class="entity-icon"
	style="
    width: {size}px; 
    height: {size}px;
    opacity: {opacity};
    filter: blur({blur}px);
    border-color: {stateColor};
    transform: translate({entity.position.x}px, {entity.position.y}px);
  "
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
	.entity-icon {
		position: absolute;
		cursor: pointer;
		transform-origin: center;
		border: 3px solid;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		user-select: none;
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
		.entity-icon {
			min-width: 32px;
			min-height: 32px;
		}

		.entity-name {
			font-size: 10px;
		}

		.entity-subtitle {
			font-size: 8px;
		}
	}
</style>
