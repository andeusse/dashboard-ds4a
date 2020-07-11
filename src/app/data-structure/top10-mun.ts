export class top10Mun{
    public state: string;
    public municipality: string;
    public incidence: number;
    public lethatily: number;
    constructor(state: string, municipality: string, incidence: number, lethatily: number){
        this.state = state;
        this.municipality = municipality;
        this.incidence = incidence;
        this.lethatily = lethatily;
    }
}