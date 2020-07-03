export class States{
    public states: Array<State>;
}

export class Municipality{
    public code: string;
    public name: string;
    public lat: number;
    public lng: number;
}

export class State{
    public code: string;
    public name: string;
    public municipalities: Array<Municipality>;
}