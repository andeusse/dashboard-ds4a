export class News{
    public title: string;
    public source: string;
    public url: string;
    constructor(title: string, source: string, url: string){
        this.title = title;
        this.source = source;
        this.url = url;
    }
}