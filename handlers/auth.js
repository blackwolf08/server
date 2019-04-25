'use strict';
const db = require('../models');
const jwt = require('jsonwebtoken');
const request = require('request');

exports.signin = async function(req, res, next) {
    try {
        const subscriptionKey = 'ad0a99722cbc4ed798694104647ecfe0';

        const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';

        const imageUrl =
            '';

        const params = {
            'returnFaceId': 'true',
            'returnFaceLandmarks': 'false',
            'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
                'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
        };

        const options = {
            uri: uriBase,
            qs: params,
            body: '{"url": ' + '"' + imageUrl + '"}',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key' : subscriptionKey
            }
        };

        request.post(options, (error, response, body) => {
        if (error) {
            console.log('Error: ', error);
            return;
        }
        let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
        console.log('JSON Response\n');
        console.log(jsonResponse);
        });
        let user = await db.User.findOne({
            email: req.body.email
        })
        let { id, username, profileImageUrl } = user;
        let isMatch = await user.comparePassword(req.body.password);
    
        if(isMatch){
            let token = jwt.sign({
                id,
                username,
                profileImageUrl
            },
            process.env.SECRET_KEY
            );
    
        return res.status(200).json({
            id,
            username,
            profileImageUrl,
            token
        })
        }
        else {
            return next({
                status: 400,
                message: "Invalid Email/Password"
            });
        }
        
    } catch (err) {
        return next({
            status: 400,
            message: "Invalid Email/Password"
        });
    }
}

exports.signup = async (req, res, next) => {
    try {
        let user = await db.User.create(req.body);
        let { id, username, profileImageUrl } = user;
        let token = jwt.sign({
            id,
            username,
            profileImageUrl
        }, 
        process.env.SECRET_KEY
        );

        return res.status(200).json({
            id,
            username,
            profileImageUrl,
            token
        });
    } catch (err) {
        if(err.code === 11000) {
            err.message = "Sorry, that username and/or email is taken"
        }
        return next({
            status: 400,
            message: err.message 
        })
    }
}