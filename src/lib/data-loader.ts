import type { Person, ResourceSpecification, EconomicResource, Commitment } from './types';
import testData from './data/test-data.json';

export interface TestData {
    persons: Person[];
    resource_specifications: ResourceSpecification[];
    economic_resources: EconomicResource[];
    commitments: Commitment[];
}

export function loadTestData(): TestData {
    return {
        persons: testData.persons,
        resource_specifications: testData.resource_specifications,
        economic_resources: testData.economic_resources,
        commitments: testData.commitments
    };
}

// Helper functions to find related data
export function getPersonById(id: string): Person | undefined {
    return testData.persons.find(p => p.id === id);
}

export function getResourceSpecById(id: string): ResourceSpecification | undefined {
    return testData.resource_specifications.find(r => r.id === id);
}

export function getEconomicResourceById(id: string): EconomicResource | undefined {
    return testData.economic_resources.find(r => r.id === id);
}

export function getResourcesByPerson(personId: string): EconomicResource[] {
    return testData.economic_resources.filter(r => r.custodian === personId);
}

export function getCommitmentsByPerson(personId: string): Commitment[] {
    return testData.commitments.filter(c => c.provider === personId || c.receiver === personId);
}

export function getResourceSpecForResource(resource: EconomicResource): ResourceSpecification | undefined {
    return getResourceSpecById(resource.conforms_to);
}
