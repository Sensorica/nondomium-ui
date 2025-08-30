import type { LandscapeEntity, AgentContext } from './types';
import { loadTestData, getPersonById } from './data-loader';
import { generateEntityPositions } from './proximity-calculator';

export function createLandscapeEntities(agentContext: AgentContext): LandscapeEntity[] {
    const data = loadTestData();
    const entities: LandscapeEntity[] = [];

    // Filter and prioritize entities based on perspective
    switch (agentContext.perspective) {
        case 'role':
            // In role perspective, prioritize resources and commitments related to the role
            data.persons.forEach(person => {
                entities.push({
                    id: person.id,
                    type: 'person',
                    data: person,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getPersonState(person, agentContext)
                });
            });

            data.economic_resources.forEach(resource => {
                entities.push({
                    id: resource.id,
                    type: 'resource',
                    data: resource,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getResourceState(resource)
                });
            });

            data.commitments.forEach(commitment => {
                entities.push({
                    id: commitment.id,
                    type: 'commitment',
                    data: commitment,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getCommitmentState(commitment)
                });
            });
            break;

        case 'resource':
            // In resource perspective, show all resources and related commitments
            data.economic_resources.forEach(resource => {
                entities.push({
                    id: resource.id,
                    type: 'resource',
                    data: resource,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getResourceState(resource)
                });
            });

            // Add related commitments
            data.commitments.forEach(commitment => {
                entities.push({
                    id: commitment.id,
                    type: 'commitment',
                    data: commitment,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getCommitmentState(commitment)
                });
            });

            // Add people with resource-related roles
            data.persons.forEach(person => {
                if (person.roles.some(role =>
                    role.role_name.toLowerCase().includes('steward') ||
                    role.role_name.toLowerCase().includes('coordinator'))) {
                    entities.push({
                        id: person.id,
                        type: 'person',
                        data: person,
                        position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                        state: getPersonState(person, agentContext)
                    });
                }
            });
            break;

        case 'agent':
            // In agent perspective, prioritize people and their interactions
            data.persons.forEach(person => {
                entities.push({
                    id: person.id,
                    type: 'person',
                    data: person,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getPersonState(person, agentContext)
                });
            });

            // Add commitments to show interactions
            data.commitments.forEach(commitment => {
                entities.push({
                    id: commitment.id,
                    type: 'commitment',
                    data: commitment,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getCommitmentState(commitment)
                });
            });

            // Add resources that are currently in use
            data.economic_resources.forEach(resource => {
                if (resource.state === 'active') {
                    entities.push({
                        id: resource.id,
                        type: 'resource',
                        data: resource,
                        position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                        state: getResourceState(resource)
                    });
                }
            });
            break;

        case 'geographic':
            // In geographic perspective, show all entities with location info
            data.persons.forEach(person => {
                entities.push({
                    id: person.id,
                    type: 'person',
                    data: person,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getPersonState(person, agentContext)
                });
            });

            data.economic_resources.forEach(resource => {
                entities.push({
                    id: resource.id,
                    type: 'resource',
                    data: resource,
                    position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                    state: getResourceState(resource)
                });
            });

            // Only show local commitments
            data.commitments.forEach(commitment => {
                const provider = getPersonById(commitment.provider);
                if (provider && provider.private_data.location === agentContext.location) {
                    entities.push({
                        id: commitment.id,
                        type: 'commitment',
                        data: commitment,
                        position: { x: 0, y: 0, z: 1, proximity_score: 0 },
                        state: getCommitmentState(commitment)
                    });
                }
            });
            break;
    }

    // Generate positions based on proximity to agent context
    return generateEntityPositions(entities, agentContext);
}

function getPersonState(person: any, agentContext: AgentContext): LandscapeEntity['state'] {
    // Check if person has roles that need attention
    const hasImportantRole = person.roles.some((role: any) =>
        role.role_name.includes('Founder') || role.role_name.includes('Coordinator')
    );

    if (person.id === agentContext.id) return 'in_use'; // Current agent
    if (hasImportantRole) return 'available';
    return 'dormant';
}

function getResourceState(resource: any): LandscapeEntity['state'] {
    switch (resource.state) {
        case 'active':
            return 'available';
        case 'maintenance':
            return 'needs_attention';
        case 'inactive':
            return 'dormant';
        default:
            return 'available';
    }
}

function getCommitmentState(commitment: any): LandscapeEntity['state'] {
    const dueDate = new Date(commitment.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'critical'; // Overdue
    if (daysUntilDue <= 2) return 'needs_attention'; // Due soon
    if (daysUntilDue <= 7) return 'pending'; // Coming up
    return 'available'; // Not urgent
}

export function createTestAgentContext(agentId: string = 'agent_bob', existingContext?: AgentContext): AgentContext {
    const person = getPersonById(agentId);
    if (!person) {
        throw new Error(`Agent with id ${agentId} not found`);
    }

    return {
        id: agentId,
        role: person.roles[0]?.role_name || 'Simple Member',
        location: person.private_data.location,
        capabilities: person.roles.map(r => r.role_name),
        perspective: existingContext?.perspective || 'role'
    };
}
