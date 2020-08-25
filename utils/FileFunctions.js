const fileSystem = require('fs');
const errors = require('./../utils/ErrorsHandler.js');
//Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)
const AWS = require('aws-sdk')

//Used to add a photo when a post reqest comes
function addFile(data, userName){

    var path = './db/photos/' + userName.userName + '-' + userName.id + '.jpg';
    try{
        fileSystem.writeFileSync(path, data);
    }catch(err){
        errors.failPost('Error posting the photo! Please try again.');
    }
};

function getFile(path){
    var fileData = fileSystem.readFileSync(path);
    return fileData;
}

//Used to remove a photo when a deleting request comes
function removeFile(userName, id){

    var path = './db/photos/' + userName + '-' + id + '.jpg';
    try{
        fileSystem.unlinkSync(path);
    }catch(err){
        errors.failPost('Could not find the file that you are trying to delete!');
    }

}



function faceRecognition(image){
    var imageParams;
   const bucket = 'myappfacerecognition' // the bucketname without s3://
   const photo  = image
   const config = new AWS.Config({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     region: process.env.AWS_REGION
   });
   const client = new AWS.Rekognition();
   const params = {
     Image: {
       Bytes: photo
     },
     Attributes: ['ALL']
   }
   return new Promise((resolve, reject) => {
    client.detectFaces(params, function(err, response) {
        if(err){
            return reject(err.message);
        }
        
        response.FaceDetails.forEach(data => {
            let low  = data.AgeRange.Low
            let high = data.AgeRange.High
            imageParams = data;
          })
        return resolve(imageParams);
   });
   });



}

module.exports = {
    addFile: function(data, userName){
        return addFile(data, userName);
    },
    removeFile: function(userName, id){
        return removeFile(userName, id);
    },
    faceRecognition: function(image){
        return faceRecognition(image);
    },
    getFile: function(path){
        return getFile(path);
    }
};

/*

     if (err) {
       console.log(err, err.stack); // an error occurred
     } else {
       response.FaceDetails.forEach(data => {
         let low  = data.AgeRange.Low
         let high = data.AgeRange.High
        imageParameters = data.Emotions[0].Type
       }) // for response.faceDetails
     } // if
*/
        //  console.log(`The detected face is between: ${low} and ${high} years old`)
        //  console.log("All other attributes:")
        //  console.log(`  BoundingBox.Width:      ${data.BoundingBox.Width}`)
        //  console.log(`  BoundingBox.Height:     ${data.BoundingBox.Height}`)
        //  console.log(`  BoundingBox.Left:       ${data.BoundingBox.Left}`)
        //  console.log(`  BoundingBox.Top:        ${data.BoundingBox.Top}`)
        //  console.log(`  Age.Range.Low:          ${data.AgeRange.Low}`)
        //  console.log(`  Age.Range.High:         ${data.AgeRange.High}`)
        //  console.log(`  Smile.Value:            ${data.Smile.Value}`)
        //  console.log(`  Smile.Confidence:       ${data.Smile.Confidence}`)
        //  console.log(`  Eyeglasses.Value:       ${data.Eyeglasses.Value}`)
        //  console.log(`  Eyeglasses.Confidence:  ${data.Eyeglasses.Confidence}`)
        //  console.log(`  Sunglasses.Value:       ${data.Sunglasses.Value}`)
        //  console.log(`  Sunglasses.Confidence:  ${data.Sunglasses.Confidence}`)
        //  console.log(`  Gender.Value:           ${data.Gender.Value}`)
        //  console.log(`  Gender.Confidence:      ${data.Gender.Confidence}`)
        //  console.log(`  Beard.Value:            ${data.Beard.Value}`)
        //  console.log(`  Beard.Confidence:       ${data.Beard.Confidence}`)
        //  console.log(`  Mustache.Value:         ${data.Mustache.Value}`)
        //  console.log(`  Mustache.Confidence:    ${data.Mustache.Confidence}`)
        //  console.log(`  EyesOpen.Value:         ${data.EyesOpen.Value}`)
        //  console.log(`  EyesOpen.Confidence:    ${data.EyesOpen.Confidence}`)
        //  console.log(`  MouthOpen.Value:        ${data.MouthOpen.Value}`)
        //  console.log(`  MouthOpen.Confidence:   ${data.MouthOpen.Confidence}`)
        //  console.log(`  Emotions[0].Type:       ${data.Emotions[0].Type}`)
        //  console.log(`  Emotions[0].Confidence: ${data.Emotions[0].Confidence}`)
        //  console.log(`  Landmarks[0].Type:      ${data.Landmarks[0].Type}`)
        //  console.log(`  Landmarks[0].X:         ${data.Landmarks[0].X}`)
        //  console.log(`  Landmarks[0].Y:         ${data.Landmarks[0].Y}`)
        //  console.log(`  Pose.Roll:              ${data.Pose.Roll}`)
        //  console.log(`  Pose.Yaw:               ${data.Pose.Yaw}`)
        //  console.log(`  Pose.Pitch:             ${data.Pose.Pitch}`)
        //  console.log(`  Quality.Brightness:     ${data.Quality.Brightness}`)
        //  console.log(`  Quality.Sharpness:      ${data.Quality.Sharpness}`)
        //  console.log(`  Confidence:             ${data.Confidence}`)
        //  console.log("------------")
        //  console.log("")
