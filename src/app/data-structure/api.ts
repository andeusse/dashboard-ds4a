export class CountryAPI {
    public dengue: Array<Dengue>;
    public severe_dengue: Array<SevereDengue>;
    public deaths_by_dengue: Array<DeathsByDengue>;
}

export class StateCityAPI {
    public code: string;
    public name:string;
    public dengue: Array<Dengue>;
    public severe_dengue: Array<SevereDengue>;
    public deaths_by_dengue: Array<DeathsByDengue>;
}

export class Dengue {
    public year: string;
    public value: string;
    public pct_change: string;
    public incidence: string;
    public pct_change_incidence: string;
    public weekly: Array<Week>;
}

export class SevereDengue {
    public year: string;
    public value: string;
    public pct_change: string;
    public incidence: string;
    public pct_change_incidence: string;
    public weekly: Array<Week>;
}

export class DeathsByDengue {
    public year: string;
    public value: string;
    public pct_change: string;
    public lethality: string;
    public mortality_rate: string;
    public pct_change_mortality_rate: string;
    public weekly: Array<Week>;
}

export class Week {
    public week: string;
    public timestamp: string;
    public value: string;
    public incidence: string;
    public P25: string;
    public median: string;
    public P75: string;
    public lower_limit: string;
    public upper_limit: string;
    public observed_reason: string;
    public expected_reason: string;
    public lower_limit_IC95: string;
    public upper_limit_IC95: string;
    public threshold_IC95: string;
}