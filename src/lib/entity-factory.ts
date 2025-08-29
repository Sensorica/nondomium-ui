import type { LandscapeEntity, AgentContext } from './types';
import { loadTestData, getPersonById } from './data-loader';
import { generateEntityPositions } from './proximity-calculator';

export function createLandscapeEntities(agentContext: AgentContext): LandscapeEntity[] {
    const data = loadTestData();
    const entities: LandscapeEntity[] = [];

    // Convert persons to landscape entities
    data.persons.forEach(person => {
        entities.push({
            id: person.id,
            type: 'person',
            data: person,
            position: { x: 0, y: 0, z: 1, proximity_score: 0 },
            state: getPersonState(person, agentContext)
        });
    });

    // Convert resources to landscape entities
    data.economic_resources.forEach(resource => {
        entities.push({
            id: resource.id,
            type: 'resource',
            data: resource,
            position: { x: 0, y: 0, z: 1, proximity_score: 0 },
            state: getResourceState(resource)
        });
    });

    // Convert commitments to landscape entities
    data.commitments.forEach(commitment => {
        entities.push({
            id: commitment.id,
            type: 'commitment',
            data: commitment,
            position: { x: 0, y: 0, z: 1, proximity_score: 0 },
            state: getCommitmentState(commitment)
        });
    });

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

export function createTestAgentContext(agentId: string = 'agent_bob'): AgentContext {
    const person = getPersonById(agentId);
    if (!person) {
        throw new Error(`Agent with id ${agentId} not found`);
    }

    return {
        id: agentId,
        role: person.roles[0]?.role_name || 'Simple Member',
        location: person.private_data.location,
        capabilities: person.roles.map(r => r.role_name),
        perspective: 'role'
    };
}
