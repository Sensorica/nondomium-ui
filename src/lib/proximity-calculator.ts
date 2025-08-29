import type { LandscapeEntity, AgentContext, ProximityWeights, Person, EconomicResource } from './types';
import { getPersonById, getResourceSpecForResource } from './data-loader';

// Default proximity weights from the design document
const DEFAULT_WEIGHTS: ProximityWeights = {
    role_relevance: 0.4,
    geographic_distance: 0.2,
    interaction_frequency: 0.2,
    temporal_urgency: 0.1,
    governance_access: 0.1
};

export function calculateProximity(entity: LandscapeEntity, agentContext: AgentContext, weights: ProximityWeights = DEFAULT_WEIGHTS): number {
    let roleMatch = 0;
    let geoDistance = 0;
    let interactionFreq = 0;
    let urgency = 0;
    let accessLevel = 0;

    // Calculate role relevance based on entity type
    if (entity.type === 'person') {
        const person = entity.data as Person;
        roleMatch = calculateRoleMatch(person, agentContext);
    } else if (entity.type === 'resource') {
        const resource = entity.data as EconomicResource;
        roleMatch = calculateResourceRoleMatch(resource, agentContext);
    }

    // Calculate geographic distance (simplified - in real app would use actual coordinates)
    geoDistance = calculateGeographicDistance(entity, agentContext);

    // Calculate interaction frequency (simplified - would use actual history)
    // Add some variation based on entity ID to ensure distribution
    const entityIdHash = entity.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    interactionFreq = (entityIdHash % 50) / 100 + 0.25; // 0.25 to 0.75

    // Calculate urgency based on entity state
    urgency = calculateUrgency(entity);

    // Calculate governance access level
    accessLevel = calculateAccessLevel(entity, agentContext);

    const proximityScore =
        weights.role_relevance * roleMatch +
        weights.geographic_distance * (1 - geoDistance) +
        weights.interaction_frequency * interactionFreq +
        weights.temporal_urgency * urgency +
        weights.governance_access * accessLevel;

    return Math.min(1.0, Math.max(0.0, proximityScore));
}

function calculateRoleMatch(person: Person, agentContext: AgentContext): number {
    // Simple role matching - in real app would be more sophisticated
    const agentRoles = person.roles.map(r => r.role_name.toLowerCase());
    const contextRole = agentContext.role.toLowerCase();

    if (agentRoles.includes(contextRole)) return 1.0;
    if (agentRoles.includes('resource steward') && contextRole.includes('maintenance')) return 0.8;
    if (agentRoles.includes('resource coordinator') && contextRole.includes('logistics')) return 0.8;
    return 0.3; // Base relevance for all community members
}

function calculateResourceRoleMatch(resource: EconomicResource, agentContext: AgentContext): number {
    const contextRole = agentContext.role.toLowerCase();

    // Match role to resource state and type
    if (resource.state === 'maintenance' && contextRole.includes('steward')) return 0.9;
    if (resource.state === 'active' && contextRole.includes('coordinator')) return 0.7;

    const spec = getResourceSpecForResource(resource);
    if (spec) {
        // Match role to resource category
        if (spec.category === 'workshop_tools' && contextRole.includes('steward')) return 0.8;
        if (spec.category === 'transportation' && contextRole.includes('coordinator')) return 0.8;
    }

    return 0.4; // Base relevance
}

function calculateGeographicDistance(entity: LandscapeEntity, agentContext: AgentContext): number {
    // Simplified distance calculation - would use actual coordinates in real app
    if (entity.type === 'person') {
        const person = entity.data as Person;
        return person.private_data.location === agentContext.location ? 0.1 : 0.6;
    } else if (entity.type === 'resource') {
        const resource = entity.data as EconomicResource;
        return resource.current_location.includes('Montreal') ? 0.2 : 0.8;
    }
    return 0.5;
}

function calculateUrgency(entity: LandscapeEntity): number {
    if (entity.type === 'resource') {
        const resource = entity.data as EconomicResource;
        switch (resource.state) {
            case 'maintenance': return 0.8;
            case 'active': return 0.3;
            case 'inactive': return 0.1;
            default: return 0.2;
        }
    }
    return 0.2;
}

function calculateAccessLevel(entity: LandscapeEntity, agentContext: AgentContext): number {
    // Simplified access calculation
    if (agentContext.role.includes('Founder') || agentContext.role.includes('Coordinator')) return 1.0;
    if (agentContext.role.includes('Steward')) return 0.8;
    return 0.6; // Simple Member access
}

// Layer assignment based on proximity score
export function assignLayer(proximityScore: number): number {
    if (proximityScore >= 0.8) return 1; // meso layer (candidates for micro)
    if (proximityScore >= 0.6) return 2; // macro layer 1
    if (proximityScore >= 0.4) return 3; // macro layer 2
    return 4; // macro layer 3 (background)
}

// Generate entity positions based on proximity and layer
export function generateEntityPositions(entities: LandscapeEntity[], agentContext: AgentContext): LandscapeEntity[] {
    // Group entities by layer first
    const layerGroups = entities.reduce((groups, entity) => {
        const proximityScore = calculateProximity(entity, agentContext);
        const layer = assignLayer(proximityScore);
        entity.position.proximity_score = proximityScore;
        entity.position.z = layer;

        if (!groups[layer]) groups[layer] = [];
        groups[layer].push(entity);
        return groups;
    }, {} as Record<number, LandscapeEntity[]>);

    // Debug: Log entity distribution
    console.log('Entity distribution by layer:', Object.entries(layerGroups).map(([layer, entities]) =>
        `Layer ${layer}: ${entities.length} entities`
    ));

    // Position entities within each layer (coordinates relative to layer container)
    Object.entries(layerGroups).forEach(([layerStr, layerEntities]) => {
        const layer = parseInt(layerStr);

        // Layer-specific dimensions (matching the CSS in LandscapeView.svelte)
        const layerConfigs: Record<number, { width: number; marginLeft: number }> = {
            1: { width: 0.90, marginLeft: 0.05 }, // 90% width, 5% margin-left
            2: { width: 0.85, marginLeft: 0.075 }, // 85% width, 7.5% margin-left
            3: { width: 0.80, marginLeft: 0.10 }, // 80% width, 10% margin-left
            4: { width: 0.75, marginLeft: 0.125 } // 75% width, 12.5% margin-left
        };

        const config = layerConfigs[layer];

        // Calculate the actual center of the visible layer panel
        // The layer panel is positioned with margin-left and has a specific width
        // We need to find the center of this visible panel
        const screenWidth = 1200; // Approximate screen width for calculations
        const panelLeft = screenWidth * config.marginLeft; // Left edge of the panel
        const panelWidth = screenWidth * config.width; // Width of the panel
        const panelCenter = panelLeft + (panelWidth / 2); // Center of the panel

        // Calculate total width needed for all entities in this layer
        const entitySpacing = 80; // Minimum spacing between entities
        const totalEntitiesWidth = layerEntities.length * entitySpacing;

        // Calculate starting position to center the group of entities around the panel center
        const startX = panelCenter - (totalEntitiesWidth / 2) + (entitySpacing / 2);

        console.log(`Layer ${layer}: ${layerEntities.length} entities, panel center: ${panelCenter}px, spacing: ${entitySpacing}px, total width: ${totalEntitiesWidth}px, startX: ${startX}px`);

        layerEntities.forEach((entity, index) => {
            // X coordinate: start from the calculated start position and space entities evenly
            const x = startX + (index * entitySpacing);
            // Y coordinate: center vertically in the 60px layer
            const y = 0;

            entity.position.x = x;
            entity.position.y = y;

            console.log(`  Entity ${entity.id}: x=${x}px, y=${y}px`);
        });
    });

    return entities;
}
