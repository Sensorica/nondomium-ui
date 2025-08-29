<script lang="ts">
	import type { AgentContext } from '../types';

	let {
		agentContext,
		onChange
	}: {
		agentContext: AgentContext;
		onChange: (context: AgentContext) => void;
	} = $props();

	const perspectives = [
		{ id: 'role', name: 'Role', icon: '👷', description: 'View resources relevant to your role' },
		{
			id: 'resource',
			name: 'Resource',
			icon: '📦',
			description: 'Focus on specific resource types'
		},
		{ id: 'agent', name: 'Agent', icon: '👥', description: 'Social view of community members' },
		{ id: 'geographic', name: 'Geographic', icon: '📍', description: 'Location-based organization' }
	] as const;

	let isOpen = $state(false);

	function selectPerspective(perspectiveId: (typeof perspectives)[number]['id']) {
		onChange({
			...agentContext,
			perspective: perspectiveId
		});
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('.perspective-selector')) {
			isOpen = false;
		}
	}

	const currentPerspective = $derived(perspectives.find((p) => p.id === agentContext.perspective));
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeyDown} />

<div class="perspective-selector">
	<button
		class="perspective-button"
		class:open={isOpen}
		onclick={toggleDropdown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-label="Select perspective view"
	>
		<span class="perspective-icon">{currentPerspective?.icon}</span>
		<span class="perspective-name">{currentPerspective?.name} View</span>
		<span class="dropdown-arrow" class:rotated={isOpen}>▼</span>
	</button>

	{#if isOpen}
		<div class="perspective-dropdown" role="listbox">
			{#each perspectives as perspective}
				<button
					class="perspective-option"
					class:active={perspective.id === agentContext.perspective}
					onclick={() => selectPerspective(perspective.id)}
					role="option"
					aria-selected={perspective.id === agentContext.perspective}
				>
					<div class="option-content">
						<span class="option-icon">{perspective.icon}</span>
						<div class="option-text">
							<div class="option-name">{perspective.name}</div>
							<div class="option-description">{perspective.description}</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.perspective-selector {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 30;
	}

	.perspective-button {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 10px 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 14px;
		font-weight: 500;
		color: #374151;
		min-width: 140px;
	}

	.perspective-button:hover {
		background: rgba(255, 255, 255, 1);
		border-color: rgba(0, 0, 0, 0.2);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.perspective-button.open {
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
		border-bottom-color: transparent;
	}

	.perspective-icon {
		font-size: 16px;
	}

	.perspective-name {
		flex: 1;
		text-align: left;
	}

	.dropdown-arrow {
		font-size: 10px;
		transition: transform 0.2s ease;
		color: #6b7280;
	}

	.dropdown-arrow.rotated {
		transform: rotate(180deg);
	}

	.perspective-dropdown {
		position: absolute;
		top: calc(100% - 1px);
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-top: none;
		border-radius: 0 0 12px 12px;
		overflow: hidden;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.perspective-option {
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.perspective-option:hover {
		background: rgba(59, 130, 246, 0.05);
	}

	.perspective-option.active {
		background: rgba(59, 130, 246, 0.1);
	}

	.option-content {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		text-align: left;
	}

	.option-icon {
		font-size: 16px;
		width: 20px;
		text-align: center;
	}

	.option-text {
		flex: 1;
	}

	.option-name {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
		margin-bottom: 2px;
	}

	.option-description {
		font-size: 12px;
		color: #6b7280;
		line-height: 1.3;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.perspective-selector {
			position: relative;
			top: auto;
			right: auto;
			margin: 10px;
			order: -1;
		}

		.perspective-button {
			min-width: auto;
			width: 100%;
			justify-content: space-between;
		}

		.perspective-dropdown {
			position: fixed;
			top: auto;
			bottom: 0;
			left: 0;
			right: 0;
			border-radius: 16px 16px 0 0;
			max-height: 50vh;
			overflow-y: auto;
		}

		.option-content {
			padding: 16px;
		}
	}

	/* Focus styles for accessibility */
	.perspective-button:focus,
	.perspective-option:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}
</style>
