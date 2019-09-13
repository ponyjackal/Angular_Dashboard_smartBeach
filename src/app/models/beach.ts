import { User } from './user';
import { BeachSetting } from './beach.settings';
import { Place } from './place';
import { Country } from './country';

export class Beach {

    id: string;

    name: string;

    image: string;

    rating: number;

    rating_count: number;

    seats_count: number;

    reservation_count : number;

    order_count : number;

    features: [string];

    description: string;

    status: string;

    ratings: [any];

    reviews: [any];

    calendar: [any];

    client_id: string;

    client: User;

    place_id: string;

    place: Place;

    country_id: string;

    country: Country;

    settings_id: string;

    settings: BeachSetting;

}