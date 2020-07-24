const fileSystem = require('fs');
const errors = require('./../utils/ErrorsHandler.js');

//Used to add a photo when a post reqest comes
function addFile(data, userName){

    var path = './db/photos/' + userName.userName + '-' + userName.id + '.jpg';
    try{
        fileSystem.writeFileSync(path, data);
    }catch(err){
        errors.failPost('Error posting the photo! Please try again.');
    }
};

//Used to remove a photo when a deleting request comes
function removeFile(userName, id){

    var path = './db/photos/' + userName + '-' + id + '.jpg';
    try{
        fileSystem.unlinkSync(path);
    }catch(err){
        errors.failPost('Could not find the file that you are trying to delete!');
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