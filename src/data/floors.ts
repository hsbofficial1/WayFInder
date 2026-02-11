export interface Floor {
    id: string;
    number: number;
    label: string;
    mapImage?: string;
    isUnavailable?: boolean;
}

export const floors: Floor[] = [
    { id: "floor-0", number: 0, label: "Ground Floor" },
    { id: "floor-1", number: 1, label: "First Floor" },
    { id: "floor-2", number: 2, label: "Second Floor" },
];
