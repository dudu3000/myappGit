class failUser extends Error{
    constructor(args){
        super(args);
        this.name = 'failUser';       
    }
}

class failPost extends Error{
    constructor(args){
        super(args);
        this.name = 'failPost';
    }
}


module.exports={
    failUser: function(args){
        throw new failUser(args);
    },
    failPost: function(args){
        throw new failPost(args);
    }
}