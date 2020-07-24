class failLogin extends Error{
    constructor(args){
        super(args);
        this.name = 'failLogin';       
    }
}