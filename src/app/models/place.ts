import { Country } from "./country";

export class Place {

    id: string;

    name: string;

    latitude: number;

    longitude: number;

    country_id: string;

    country: Country;
}