// Types based on test-data.json structure

export interface Person {
    id: string;
    person: {
        name: string;
        avatar_url: string;
        bio: string;
    };
    private_data: {
        legal_name: string;
        email: string;
        phone: string;
        address: string;
        emergency_contact: string;
        time_zone: string;
        location: string;
    };
    roles: Role[];
}

export interface Role {
    role_name: string;
    description: string;
    assigned_at: string;
}

export interface ResourceSpecification {
    id: string;
    name: string;
    description: string;
    category: string;
    image_url: string;
    tags: string[];
    governance_rules: string[];
    created_by: string;
    created_at: string;
    is_active: boolean;
}

export interface EconomicResource {
    id: string;
    conforms_to: string;
    quantity: number;
    unit: string;
    custodian: string;
    created_by: string;
    created_at: string;
    current_location: string;
    state: 'active' | 'maintenance' | 'inactive' | 'archived';
}

export interface Commitment {
    id: string;
    action: 'Transfer' | 'Use' | 'Modify' | 'Produce';
    provider: string;
    receiver: string;
    resource_inventoried_as: string;
    due_date: string;
    note: string;
    committed_at: string;
}

// UI-specific types
export interface EntityPosition {
    x: number;
    y: number;
    z: number; // depth layer (0=micro, 1=meso, 2-4=macro)
    proximity_score: number;
}

export interface LandscapeEntity {
    id: string;
    type: 'person' | 'resource' | 'commitment';
    data: Person | EconomicResource | Commitment;
    position: EntityPosition;
    state: 'available' | 'needs_attention' | 'critical' | 'in_use' | 'dormant' | 'pending';
}

export interface AgentContext {
    id: string;
    role: string;
    location: string;
    capabilities: string[];
    perspective: 'role' | 'resource' | 'agent' | 'geographic';
}

export interface ProximityWeights {
    role_relevance: number;
    geographic_distance: number;
    interaction_frequency: number;
    temporal_urgency: number;
    governance_access: number;
}
