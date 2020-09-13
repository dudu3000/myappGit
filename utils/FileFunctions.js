const fileSystem = require('fs');
const errors = require('./../utils/ErrorsHandler.js');
//Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)
const AWS = require('aws-sdk');

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
            imageParams = data;
          })
        return resolve(imageParams);
   });
   });



}


//!TODO Function ready
// function faceComparing(sourceImage, targetImage){
//    var similarity;
//    const config = new AWS.Config({
//      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//      region: process.env.AWS_REGION
//    });
//    const client = new AWS.Rekognition();
//    const params = {
//      SourceImage: {
//        Bytes: sourceImage
//      },
//      TargetImage:{
//          Bytes: targetImage
//      }
//    }
//    return new Promise((resolve, reject) => {
//     client.compareFaces(params, function(err, response) {
//         if(err){
//             return reject(err.message);
//         }
        
//         response.FaceDetails.forEach(data => {
//             similarity = data.Similarity;
//           })
//         return resolve(similarity);
//    });
//    });
// }


function calculateParameters(params, posts, idOfOriginalPost){
    const GENDER_FINAL_PERCENTAGE = 20;
    const AGE_FINAL_PERCENTAGE = 20;
    const BEARD_FINAL_PERCENTAGE = 20;
    const SMILE_FINAL_PERCENTAGE = 10;
    const EYEGLASSES_FINAL_PERCENTAGE = 10;
    const SUNGLASSES_PERCENTAGE = 10;
    const EMOTION_PERCENTAGE = 10;
    var similarityPercentage = [{
        id: -1,
        percentage: 0
    }];
    var percentages = {
        genderPercentage: 0,
        agePercentage: 0,
        beardPercentage: 0,
        smilePercentage: 0,
        eyeglassesPercentage: 0,
        sunglassesPercentage: 0,
        emotionPercentage: 0
    };
    [
        subjectAgeL,
        subjectAgeH,
        subjectEmotion,
        subjectEmotionType,
        subjectGender,
        subjectGenerType,
        subjectBeard,
        subjectBeardType,
        subjectEyeglasses,
        subjectEyeglassesType,
        subjectSunglasses,
        subjectSunglassesType,
        subjectSmile,
        subjectSmileType
    ]=[
        params.AgeRange.Low,
        params.AgeRange.High,
        params.Emotions[0].Confidence,
        params.Emotions[0].Type,
        params.Gender.Confidence,
        params.Gender.Value,
        params.Beard.Confidence,
        params.Beard.Value,
        params.Eyeglasses.Confidence,
        params.Eyeglasses.Value,
        params.Sunglasses.Confidence,
        params.Sunglasses.Value,
        params.Smile.Confidence,
        params.Smile.Value,
    ];
    
    var age = (subjectAgeL + subjectAgeH)/2;
    
    for(var i = 0; i < posts.length; i++){
        [
            id,
            comparedGenderValue,
            comparedGenderConfidence,
            comparedAgeLow,
            comparedAgeHigh,
            comparedBeardValue,
            comparedBeardConfidence,
            comparedSmileValue,
            comparedSmileConfidence,
            comparedEyeglassesValue,
            comparedEyeglassesConfidence,
            comparedSunglassesValue,
            comparedSunglassesConfidence,
            comparedEmotionValue,
            comparedEmotionConfidence
        ]=[
            posts[i].id,
            posts[i].faceDetection.Gender.Value,
            posts[i].faceDetection.Gender.Confidence,
            posts[i].faceDetection.AgeRange.Low,
            posts[i].faceDetection.AgeRange.High,
            posts[i].faceDetection.Beard.Value,
            posts[i].faceDetection.Beard.Confidence,
            posts[i].faceDetection.Smile.Value,
            posts[i].faceDetection.Smile.Confidence,
            posts[i].faceDetection.Eyeglasses.Value,
            posts[i].faceDetection.Eyeglasses.Confidence,
            posts[i].faceDetection.Sunglasses.Value,
            posts[i].faceDetection.Sunglasses.Confidence,
            posts[i].faceDetection.Emotions[0].Type,
            posts[i].faceDetection.Emotions[0].Confidence
        ]
        var comparedAge = (comparedAgeLow + comparedAgeHigh)/2;
        if(Math.abs(age - comparedAge) > 5)
            percentages.agePercentage = 0;
        else
            percentages.agePercentage = 100 - (Math.abs(age - comparedAge)*25)/100;
        if(subjectGenerType !== comparedGenderValue)
            percentages.genderPercentage = 0;
        else
            percentages.genderPercentage = 100 - (Math.abs(subjectGender - comparedGenderConfidence))/100;
        if(subjectBeardType !== comparedBeardValue)
            percentages.beardPercentage = 0;
        else
            percentages.beardPercentage = 100 - (Math.abs(subjectBeard - comparedBeardConfidence))/100;
        if(subjectSmileType !== comparedSmileValue)
            percentages.smilePercentage = 0;
        else
            percentages.smilePercentage = 100 - (Math.abs(subjectSmile - comparedSmileConfidence))/100;
        if(subjectEyeglassesType !== comparedEyeglassesValue)
            percentages.eyeglassesPercentage = 0;
        else
            percentages.eyeglassesPercentage = 100 - (Math.abs(subjectEyeglasses - comparedEyeglassesConfidence))/100;
        if(subjectSunglassesType !== comparedSunglassesValue)
            percentages.sunglassesPercentage = 0;
        else
            percentages.sunglassesPercentage = 100 - (Math.abs(subjectSunglasses - comparedSunglassesConfidence))/100;
        if(subjectEmotionType !== comparedEmotionValue)
            percentages.emotionPercentage = 0;
        else
            percentages.emotionPercentage = 100 - (Math.abs(subjectEmotion - comparedEmotionConfidence))/100;
        var finalPercentageOfPost = (percentages.agePercentage*AGE_FINAL_PERCENTAGE + 
                                    percentages.genderPercentage*GENDER_FINAL_PERCENTAGE + 
                                    percentages.beardPercentage*BEARD_FINAL_PERCENTAGE + 
                                    percentages.smilePercentage*SMILE_FINAL_PERCENTAGE + 
                                    percentages.eyeglassesPercentage*EYEGLASSES_FINAL_PERCENTAGE + 
                                    percentages.sunglassesPercentage*SUNGLASSES_PERCENTAGE + 
                                    percentages.emotionPercentage*EMOTION_PERCENTAGE
                                    )/100;
        var sortedIndex = 0;       
        for(var increment = 0 ; increment < similarityPercentage.length; increment ++){
            if(similarityPercentage[increment]. percentage > finalPercentageOfPost)
                sortedIndex++;
        }
        similarityPercentage.splice(sortedIndex, 0, {
            id: id,
            percentage: finalPercentageOfPost
        })
    }
    similarityPercentage.splice(similarityPercentage.length-1, 1);
    similarityPercentage.splice(0, 1);

    return similarityPercentage;
    

}


function encode(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                  keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
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
    },
    calculateParameters: function(params, posts, idOfOriginalPost){
        return calculateParameters(params, posts, idOfOriginalPost);
    },
    encode: function(input){
        return encode(input);
    },
    // faceComparing: function(sourceImage, targetImage){
    //     return faceComparing(sourceImage, targetImage);
    // }
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
