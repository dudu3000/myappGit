//Class used to throw errors on Users model
class FailUser extends Error{
    constructor(args){
        super(args);
        this.name = 'failUser';       
    }
}

//Class used to throw errors on Posts model
class FailPost extends Error{
    constructor(args){
        super(args);
        this.name = 'failPost';
    }
}


module.exports={
    failUser: function(args){
        throw new FailUser(args);
    },
    failPost: function(args){
        throw new FailPost(args);
    }
}