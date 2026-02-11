export interface Feedback {
    id: string;
    timestamp: string;
    rating: number;
    comment: string;
    from?: string;
    to?: string;
}

export interface UsageStats {
    totalNavigations: number;
    routesFound: number;
    routesNotFound: number;
    popularDestinations: Record<string, number>;
}
