export class Users{
    public users: Array<User> = [];
    constructor(){
        let temp = new User("Ceballos Arroyo, Alberto Mario", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Eusse Giraldo, Andrés Felipe", "assets/images/AboutUs/EusseGiraldo.png", "https://www.linkedin.com/in/andres-eusse-babb8a1a6/", "Texto");
        this.users.push(temp);
        temp = new User("Kertznus Rivera, Iván", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Londoño Céspedes, Verónica", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Medina Nieto, Diana", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Rodríguez Ortiz, Manuel Alejandro", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Vargas Bermúdez, Andrés Guillermo", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("Hervieux-Moore, Zach (TA)", "assets/images/LogoSmall.png", "", "Texto");
        this.users.push(temp);
        temp = new User("ez, Ana (TA)", "assets/images/LogoSmall.png", "", "Texto");
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