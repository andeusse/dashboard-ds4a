export class Users{
    public users: Array<User> = [];
    constructor(){
        let temp = new User("Ceballos Arroyo, Alberto Mario", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Eusse Giraldo, Andrés Felipe", "assets/images/AboutUs/EusseGiraldo.png", "https://www.linkedin.com/in/andres-eusse-babb8a1a6/", "Electronic engineer and electrical engineer. Master in Engineering with an emphasis on Transmission and Distribution. Great interest in areas related to object oriented programming, visualization systems in electrical systems, analysis of power systems, and Smart Grids.");
        this.users.push(temp);
        temp = new User("Kertznus Rivera, Iván", "assets/images/AboutUs/KertznusIvan.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Londoño Céspedes, Verónica", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Medina Nieto, Diana", "assets/images/AboutUs/MedinaDiana.jpg", "https://www.linkedin.com/in/dianamedina-/", "National University of Colombia (BBA). Selected interests: data analysis, machine learning and women's empowerment. ");
        this.users.push(temp);
        temp = new User("Rodríguez Ortiz, Manuel Alejandro", "assets/images/LogoSmall.png", "https://www.linkedin.com/in/manuel-alejandro-rodriguez-ortiz-a3796a135/", "Economist (Universidad del Valle), Master in Economics (Universidad EAFIT). Interests in applying machine learning techniques to the Colombian electricity market, the education sector, among others");
        this.users.push(temp);
        temp = new User("Vargas Bermúdez, Andrés Guillermo", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Hervieux-Moore, Zach (TA)", "assets/images/AboutUs/Hervieux - MooreZach.png", "https://www.linkedin.com/in/zacharyhervieuxmoore/", "Queens University (BA); Princeton University (PhD). Selected interests: Biking; expertise includes computer architecture and digital systems.");
        this.users.push(temp);
        temp = new User("Lopez, Ana (TA)", "assets/images/AboutUs/LopezAna.png", "https://www.linkedin.com/in/amlopez81/", "Pontificia Uni. Javeriana(B.S.); ICESI (M.S.); National Uni. of Colombia (M.S., Statistics). Selected interests: developing solutions in a range of sectors, including infrastructure, development, business intelligence, and data analysis");
        this.users.push(temp);
    }
}

export class User{
    public name: string;
    public image: string;
    public description: string;
    public linkedIn: string;
    constructor(name:string, image: string, linkedIn: string, description: string){
        this.name = name;
        this.image = image;
        this.description = description;
        this.linkedIn = linkedIn;
    }
}