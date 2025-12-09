

export type VehicleType = 'car' | 'bike' | 'van' | 'SUV';
export type AvailabilityStatus = 'available' | 'booked';

export interface VehicleRow {
    id: number;
    vehicle_name: string;
    type: VehicleType;
    registration_number: string;
    daily_rent_price: number;
    availability_status: AvailabilityStatus
};

interface CreateVehicleInput {
    vehicle_name: string;
    type: VehicleType;
    registration_number: string;
    daily_rent_price: number;
    availability_status?: AvailabilityStatus
};

interface UpdateVehicleInput {
    vehicle_name?: string;
    type?: VehicleType;
    registration_number?: string;
    daily_rent_price?: number;
    availability_status?: AvailabilityStatus
};