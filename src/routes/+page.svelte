<script lang="ts">
	import { onMount } from 'svelte';
	import LandscapeView from '$lib/components/LandscapeView.svelte';
	import type { LandscapeEntity, AgentContext } from '$lib/types';
	import { createLandscapeEntities, createTestAgentContext } from '$lib/entity-factory';

	let entities = $state<LandscapeEntity[]>([]);
	let agentContext = $state<AgentContext | null>(null);
	let selectedAgent = $state('agent_bob');

	// Available test agents
	const testAgents = [
		{ id: 'agent_lynn', name: 'Lynn Martin', role: 'Community Founder' },
		{ id: 'agent_bob', name: 'Bob Chen', role: 'Resource Steward' },
		{ id: 'agent_carol', name: 'Carol Rivera', role: 'Resource Coordinator' },
		{ id: 'agent_dave', name: 'Dave Thompson', role: 'Simple Member' },
		{ id: 'agent_eve', name: 'Eve Patel', role: 'Community Advocate' }
	];

	onMount(() => {
		loadAgentContext(selectedAgent);
	});

	function loadAgentContext(agentId: string) {
		try {
			const newContext = createTestAgentContext(agentId, agentContext || undefined);
			agentContext = newContext;
			entities = createLandscapeEntities(newContext);
			selectedAgent = agentId;
		} catch (error) {
			console.error('Failed to load agent context:', error);
		}
	}

	function handleAgentContextChange(newContext: AgentContext) {
		console.log('Handling agent context change:', newContext);
		agentContext = newContext;
		console.log('Updated agentContext:', agentContext);
		entities = createLandscapeEntities(agentContext);
	}

	function switchAgent(agentId: string) {
		loadAgentContext(agentId);
	}
</script>

<div class="app-container">
	<!-- Header with agent selector -->
	<header class="app-header">
		<div class="header-content">
			<h1 class="app-title">
				<span class="title-icon">🏛️</span>
				Nondominium
			</h1>

			<div class="agent-selector">
				<label for="agent-select" class="agent-label">View as:</label>
				<select
					id="agent-select"
					bind:value={selectedAgent}
					onchange={() => switchAgent(selectedAgent)}
					class="agent-select"
				>
					{#each testAgents as agent}
						<option value={agent.id}>{agent.name} ({agent.role})</option>
					{/each}
				</select>
			</div>
		</div>
	</header>

	<!-- Main landscape view -->
	<main class="app-main">
		{#if agentContext && entities.length > 0}
			<LandscapeView {entities} {agentContext} onAgentContextChange={handleAgentContextChange} />
		{:else}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading landscape...</p>
			</div>
		{/if}
	</main>

	<!-- Footer with info -->
	<footer class="app-footer">
		<div class="footer-content">
			<p class="footer-text">
				<strong>Landscape View:</strong> Navigate with arrow keys or mouse. Click entities for details.
				Change perspectives with the dropdown.
			</p>
			<div class="entity-count">
				{entities.length} entities in landscape
			</div>
		</div>
	</footer>
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f8fafc;
	}

	.app-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 24px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.app-title {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 0;
		font-size: 24px;
		font-weight: 700;
		color: #1f2937;
		letter-spacing: -0.025em;
	}

	.title-icon {
		font-size: 28px;
	}

	.agent-selector {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.agent-label {
		font-size: 14px;
		font-weight: 500;
		color: #6b7280;
	}

	.agent-select {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 14px;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 200px;
	}

	.agent-select:hover {
		border-color: #9ca3af;
	}

	.agent-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.app-main {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 16px;
		color: #6b7280;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e5e7eb;
		border-top: 3px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.app-footer {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.footer-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 24px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.footer-text {
		margin: 0;
		font-size: 12px;
		color: #6b7280;
		line-height: 1.4;
	}

	.entity-count {
		font-size: 12px;
		color: #9ca3af;
		font-weight: 500;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: 12px;
			padding: 16px;
		}

		.app-title {
			font-size: 20px;
		}

		.agent-selector {
			width: 100%;
			justify-content: space-between;
		}

		.agent-select {
			flex: 1;
			min-width: auto;
		}

		.footer-content {
			flex-direction: column;
			gap: 8px;
			padding: 12px 16px;
			text-align: center;
		}

		.footer-text {
			font-size: 11px;
		}
	}
</style>
