export class top10Mun{
    public state: string;
    public municipality: string;
    public value: number;
    constructor(state: string, municipality: string, value: number){
        this.state = state;
        this.municipality = municipality;
        this.value = value;
    }
}