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


function calculateParameters(params, posts){
    var similarityPercentage = ;
    var percentages = {
        genderPercentage: 0,
        agePercentage: 0,
        beardPercentage: 0,
        smilePercentage: 0,
        eyeglassesPercentage: 0,
        sunglassesPercentage: 0,
        emotionPercentage: 0
    }

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
        subjectSmileType,
    ] = [
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
    ]

    var age = (subjectAgeL + subjectAgeH)/2;
    
    for(var i = 0; i < posts.length; i++){
        [
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

        if(abs(age - comparedAge) > 5)
            percentages.agePercentage = 0;
        else
            percentages.agePercentage = 100 - (abs(ag - comparedAge)*25)/100;
        
        if(abs(subjectGender - comparedGenderConfidence) > 30 && subjectGenerType !== comparedGenderValue)
            percentages.genderPercentage = 0;
        else
            percentages.genderPercentage = 100 - (abs(subjectGender - comparedSmileConfidence)*3.33)/100;

        
        if(abs(subjectBeard - comparedBeardConfidence) > 30 && subjectBeardType !== comparedBeardValue)
            percentages.beardPercentage = 0;
        else
            percentages.beardPercentage = 100 - (abs(subjectBeard - comparedBeardConfidence)*3.33)/100;

            
        if(abs(subjectSmile - comparedSmileConfidence) > 30 && subjectSmileType !== comparedSmileValue)
            percentages.smilePercentage = 0;
        else
            percentages.smilePercentage = 100 - (abs(subjectSmile - comparedSmileConfidence)*3.33)/100;

            
        if(abs(subjectEyeglasses - comparedEyeglassesConfidence) > 30 && subjectEyeglassesType !== comparedEyeglassesValue)
            percentages.EyeglassesPercentage = 0;
        else
            percentages.EyeglassesPercentage = 100 - (abs(subjectEyeglasses - comparedEyeglassesConfidence)*3.33)/100;

            
        if(abs(subjectSunglasses - comparedSunglassesConfidence) > 30 && subjectSunglassesType !== comparedSunglassesValue)
            percentages.sunglassesPercentage = 0;
        else
            percentages.sunglassesPercentage = 100 - (abs(subjectSunglasses - comparedSunglassesConfidence)*3.33)/100;

            
        if(abs(subjectEmotion - comparedEmotionConfidence) > 30 && subjectEmotionType !== comparedEmotionValue)
            percentages.emotionPercentage = 0;
        else
            percentages.emotionPercentage = 100 - (abs(subjectEmotion - comparedEmotionConfidence)*3.33)/100;
    }

}



function filterPosts(filterParams, posts, id){
    var indexes = [];
    var indexesIncrement = 0;
    [
        f_gender,
        f_beard,
        f_age,
        f_eyeglasses,
        f_sunglasses,
        f_smile,
        f_emotion,
        f_genderL,
        f_genderH,
        f_beardL,
        f_beardH,
        f_eyeglassesL,
        f_eyeglassesH,
        f_sunglassesL,
        f_sunglassesH,
        f_smileL,
        f_smileH,
        f_emotionL,
        f_emotionH,
        f_ageL,
        f_ageH
    ] = [
        filterParams.gender,
        filterParams.beard,
        filterParams.age, 
        filterParams.eyeglasses,
        filterParams.sunglasses,
        filterParams.smile,
        filterParams.emotion, 
        filterParams.gender_confidence_range.Low, 
        filterParams.gender_confidence_range.High, 
        filterParams.beard_confidence_range.Low, 
        filterParams.beard_confidence_range.High, 
        filterParams.eyeglasses_confidence_range.Low,
        filterParams.eyeglasses_confidence_range.High,    
        filterParams.sunglasses_confidence_range.Low,
        filterParams.sunglasses_confidence_range.High,
        filterParams.smile_confidence_range.Low,
        filterParams.smile_confidence_range.High,
        filterParams.emotion_confidence_range.Low,
        filterParams.emotion_confidence_range.High,
        filterParams.age_range.Low,
        filterParams.age_range.High
    ]
    for(var increment = 0; increment < posts.length; increment++){
        if(posts[increment].id == id){
            indexes[indexesIncrement] = increment;
            indexesIncrement++;
        }
        if(f_gender == posts[increment].faceDetection.Gender.Value && (posts[increment].faceDetection.Gender.Confidence < f_genderL && posts[increment].faceDetection.Gender.Confidence > f_genderH)){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_gender !== posts[increment].faceDetection.Gender.Value){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_beard == posts[increment].faceDetection.Beard.Value && (posts[increment].faceDetection.Beard.Confidence < f_beardL && posts[increment].faceDetection.Beard.Confidence > f_beardH)){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_beard !== posts[increment].faceDetection.Beard.Value){
            indexes[indexesIncrement] = increment;
            indexesIncrement++;
        }else if((posts[increment].faceDetection.AgeRange.Low + posts[increment].faceDetection.AgeRange.High)/2 < f_ageL || (posts[increment].faceDetection.AgeRange.Low + posts[increment].faceDetection.AgeRange.High)/2 > f_ageH){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_eyeglasses == posts[increment].faceDetection.Eyeglasses.Value && (posts[increment].faceDetection.Eyeglasses.Confidence < f_eyeglassesL && posts[increment].faceDetection.Eyeglasses.Confidence > f_eyeglassesH)){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_sunglasses == posts[increment].faceDetection.Sunglasses.Value && (posts[increment].faceDetection.Sunglasses.Confidence < f_sunglassesL && posts[increment].faceDetection.Sunglasses.Confidence > f_sunglassesH)){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_smile == posts[increment].faceDetection.Smile.Value && (posts[increment].faceDetection.Smile.Confidence < f_smileL && posts[increment].faceDetection.Smile.Confidence > f_smileH)){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_emotion == posts[increment].faceDetection.Emotions[0].Type && (posts[increment].faceDetection.Emotions[0].Type == f_emotion && (posts[increment].faceDetection.Emotions[0].Confidence < f_emotionL && posts[increment].faceDetection.Emotions[0].Confidence > f_emotionH))){
                indexes[indexesIncrement] = increment;
                indexesIncrement++;
        }else if(f_eyeglasses !== posts[increment].faceDetection.Eyeglasses.Value && f_sunglasses !== posts[increment].faceDetection.Sunglasses.Value && f_smile !== posts[increment].faceDetection.Smile.Value && f_emotion !== posts[increment].faceDetection.Emotions[0].Type){
            indexes[indexesIncrement] = increment;
            indexesIncrement++;
        }

    }
    var filtered = posts.filter(function(value, index, arr){
        if(!indexes.includes(index))
            return value;
    })
    var result = {};
    if(filtered.length < 3){
        return false;
    }else{
        var result = {
            post0: filtered[0].id,
            post1: filtered[1].id,
            post2: filtered[2].id
        }
    }
    return result;
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
    calculateParameters: function(params, posts){
        return calculateParameters(params, posts);
    },
    filterPosts: function(filterParams, posts, id){
        return filterPosts(filterParams, posts, id);
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
