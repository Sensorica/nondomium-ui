<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { LandscapeEntity, Person, EconomicResource, Commitment } from '../types';
	import { getPersonById, getResourceSpecForResource } from '../data-loader';

	let {
		entity,
		onClose
	}: {
		entity: LandscapeEntity;
		onClose: () => void;
	} = $props();

	const dispatch = createEventDispatcher();

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const modalContent = $derived(getModalContent(entity));

	function getModalContent(entity: LandscapeEntity) {
		if (entity.type === 'person') {
			const person = entity.data as Person;
			return {
				title: person.person.name,
				image: person.person.avatar_url,
				details: [
					{ label: 'Bio', value: person.person.bio },
					{ label: 'Location', value: person.private_data.location },
					{ label: 'Roles', value: person.roles.map((r) => r.role_name).join(', ') },
					{ label: 'Contact', value: `${person.private_data.email} • ${person.private_data.phone}` }
				],
				actions: [
					{ label: 'Send Message', action: 'message' },
					{ label: 'Request Contact Info', action: 'request_data' },
					{ label: 'View Resources', action: 'view_resources' }
				]
			};
		} else if (entity.type === 'resource') {
			const resource = entity.data as EconomicResource;
			const spec = getResourceSpecForResource(resource);
			const custodian = getPersonById(resource.custodian);

			return {
				title: spec?.name || 'Resource',
				image: spec?.image_url || '/default-resource.svg',
				details: [
					{ label: 'Description', value: spec?.description || 'No description available' },
					{ label: 'Category', value: spec?.category || 'Unknown' },
					{ label: 'State', value: resource.state },
					{ label: 'Location', value: resource.current_location },
					{ label: 'Custodian', value: custodian?.person.name || 'Unknown' },
					{ label: 'Quantity', value: `${resource.quantity} ${resource.unit}` },
					{ label: 'Tags', value: spec?.tags.join(', ') || 'None' }
				],
				actions: [
					{ label: 'Request Access', action: 'request_access' },
					{ label: 'Schedule Use', action: 'schedule' },
					{ label: 'Report Issue', action: 'report_issue' },
					{ label: 'Contact Custodian', action: 'contact_custodian' }
				]
			};
		} else if (entity.type === 'commitment') {
			const commitment = entity.data as Commitment;
			const provider = getPersonById(commitment.provider);
			const receiver = getPersonById(commitment.receiver);

			return {
				title: `${commitment.action} Commitment`,
				image: '/commitment-icon.svg',
				details: [
					{ label: 'Action', value: commitment.action },
					{ label: 'Provider', value: provider?.person.name || 'Unknown' },
					{ label: 'Receiver', value: receiver?.person.name || 'Unknown' },
					{ label: 'Due Date', value: formatDate(commitment.due_date) },
					{ label: 'Note', value: commitment.note },
					{ label: 'Committed', value: formatDate(commitment.committed_at) }
				],
				actions: [
					{ label: 'Mark Complete', action: 'complete' },
					{ label: 'Request Extension', action: 'extend' },
					{ label: 'Contact Parties', action: 'contact' }
				]
			};
		}

		return { title: 'Unknown Entity', image: '', details: [], actions: [] };
	}

	function handleAction(actionType: string) {
		dispatch('action', { entity, action: actionType });
		// For demo purposes, just close the modal
		onClose();
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
	class="modal-backdrop"
	onclick={handleBackdropClick}
	onkeydown={handleKeyDown}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	tabindex="-1"
>
	<div class="modal-container">
		<!-- Modal header -->
		<div class="modal-header">
			<div class="modal-title-section">
				<img src={modalContent.image} alt={modalContent.title} class="modal-image" />
				<h2 id="modal-title" class="modal-title">{modalContent.title}</h2>
			</div>
			<button class="close-button" onclick={onClose} aria-label="Close modal"> ✕ </button>
		</div>

		<!-- Modal content -->
		<div class="modal-content">
			<!-- Entity details -->
			<div class="details-section">
				<h3>Details</h3>
				<div class="details-grid">
					{#each modalContent.details as detail}
						<div class="detail-item">
							<div class="detail-label">{detail.label}</div>
							<div class="detail-value">{detail.value}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Proximity information -->
			<div class="proximity-section">
				<h3>Landscape Position</h3>
				<div class="proximity-info">
					<div class="proximity-score">
						<span class="proximity-label">Relevance Score</span>
						<div class="proximity-bar">
							<div
								class="proximity-fill"
								style="width: {entity.position.proximity_score * 100}%"
							></div>
						</div>
						<span class="proximity-value"
							>{(entity.position.proximity_score * 100).toFixed(0)}%</span
						>
					</div>
					<div class="layer-info">
						<span class="layer-label">Layer: {entity.position.z}</span>
						<span class="layer-description">
							{entity.position.z === 1
								? 'Meso (Focus)'
								: `Macro (Background ${entity.position.z - 1})`}
						</span>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="actions-section">
				<h3>Actions</h3>
				<div class="actions-grid">
					{#each modalContent.actions as action}
						<button class="action-button" onclick={() => handleAction(action.action)}>
							{action.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.modal-container {
		background: white;
		border-radius: 16px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.modal-title-section {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.modal-image {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #e5e7eb;
	}

	.modal-title {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		color: #111827;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 20px;
		cursor: pointer;
		padding: 8px;
		border-radius: 8px;
		color: #6b7280;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.modal-content {
		padding: 24px;
		overflow-y: auto;
		flex: 1;
	}

	.details-section,
	.proximity-section,
	.actions-section {
		margin-bottom: 32px;
	}

	.details-section h3,
	.proximity-section h3,
	.actions-section h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.details-grid {
		display: grid;
		gap: 16px;
	}

	.detail-item {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 12px;
		align-items: start;
	}

	.detail-label {
		font-weight: 500;
		color: #6b7280;
		font-size: 14px;
	}

	.detail-value {
		color: #374151;
		font-size: 14px;
		line-height: 1.5;
	}

	.proximity-info {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.proximity-score {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.proximity-label {
		font-size: 14px;
		color: #6b7280;
		min-width: 100px;
	}

	.proximity-bar {
		flex: 1;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
	}

	.proximity-fill {
		height: 100%;
		background: linear-gradient(to right, #ef4444, #f59e0b, #10b981);
		transition: width 0.3s ease;
	}

	.proximity-value {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		min-width: 40px;
		text-align: right;
	}

	.layer-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.layer-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.layer-description {
		font-size: 14px;
		color: #6b7280;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}

	.action-button {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.action-button:active {
		transform: translateY(0);
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.modal-container {
			margin: 10px;
			max-height: calc(100vh - 40px);
		}

		.modal-header {
			padding: 16px;
		}

		.modal-title {
			font-size: 20px;
		}

		.modal-content {
			padding: 16px;
		}

		.detail-item {
			grid-template-columns: 1fr;
			gap: 4px;
		}

		.proximity-score {
			flex-direction: column;
			align-items: stretch;
			gap: 8px;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Focus styles for accessibility */
	.close-button:focus,
	.action-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
