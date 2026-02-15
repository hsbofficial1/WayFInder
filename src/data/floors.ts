export interface Floor {
    id: string;
    number: number;
    label: string;
    mapImage?: string;
    isUnavailable?: boolean;
}

export const floors: Floor[] = [
    { id: "G", number: 0, label: "Ground Floor" },
    { id: "F1", number: 1, label: "First Floor" },
];
