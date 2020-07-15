const fileSystem = require('fs');

//Used to add a photo when a post reqest comes
function addFile(data, userName){

    var path = './db/photos/' + userName.userName + '-' + userName.id + '.jpg';
    fileSystem.writeFile(path, data, function(err){
        if(err){
            throw Error('Error creating file');
        }
    });


}
//Used to remove a photo when a deleting request comes
function removeFile(userName, id){

    var path = './db/photos/' + userName + '-' + id + '.jpg';
    try{
        fileSystem.unlinkSync(path);
    }catch(err){
        throw Error('Error finding post');
    }

}

module.exports = {
    addFile: function(data, userName){
        return addFile(data, userName);
    },
    removeFile: function(userName, id){
        return removeFile(userName, id);
    }
};