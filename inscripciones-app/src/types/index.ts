export interface EventConfig {
    id: string;
    eventName: string;
    eventDescription: string;
    activeCategories: string[];
    registration_close_date: string;
    nequi_number?: string;
    daviplata_number?: string;
}

export interface Participant {
    id?: string;
    event_id: string;
    documentnumber: string;
    licensenumber?: string;
    dob: string;
    fullname: string;
    category: string;
    club?: string;
    sponsor?: string;
    gender: 'M' | 'F';
    email: string;
    mobile: string;
    payment_method?: 'Nequi' | 'Daviplata' | string;
    payment_id?: string;
    registration_date?: string;
}
