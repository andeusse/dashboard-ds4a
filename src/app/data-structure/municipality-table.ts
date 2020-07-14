export class MunicipalityTable{
    public state: string;
    public municipality: string;
    public incidence: number;
    public lethality: number;
    constructor(state: string, municipality: string, incidence: number, lethality: number){
        this.state = state;
        this.municipality = municipality;
        this.incidence = incidence;
        this.lethality = lethality;
    }
}