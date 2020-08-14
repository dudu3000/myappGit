//Class used to throw errors on Users model
class FailUser extends Error{
    constructor(args, code){
        super(args);
        this.name = 'failUser';
        this.code = code;

    }
}

//Class used to throw errors on Posts model
class FailPost extends Error{
    constructor(args, code){
        super(args);
        this.name = 'failPost';
        this.code = code;
    }
}


module.exports={
    failUser: function(args, code = 404){
        throw new FailUser(args, code);
    },
    failPost: function(args, code = 404){
        throw new FailPost(args, code);
    }
}