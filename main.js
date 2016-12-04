/*
 * A simple Node.js application to gather temperature for compost
 * Supported Intel IoT development boards are identified in the code.
 *
 * See LICENSE.md for license terms and conditions.
 *
 * 
 */

"use strict" ;

var APP_NAME = "IoT Temperature Sensor" ;
var cfg = require("./cfg-app-platform.js")() ;          // init and config I/O resources

console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n") ;   // poor man's clear console
console.log("Initializing " + APP_NAME) ;


// confirm that we have a version of libmraa and Node.js that works
// exit this app if we do not

cfg.identify() ;                // prints some interesting platform details to console

// Load modules
var groveSensor = require('jsupm_grove');

// Create the temperature sensor object using AIO pin 0
var temp = new groveSensor.GroveTemp(0);
console.log(temp.name());

// Init some stuff for later calculation
var i = 0;
var temperatureArray = [];

// Read the temperature twenty times and store an array to average
var gatherTemperature = function() {
    for( var i = 0; i < 20; i++ ){
        var celsius = temp.value();
        temperatureArray.push(celsius);
    } return temperatureArray}

var getTemperature = function() {
    // Get a sample of temperature readings
    var temperatureArray = gatherTemperature();
    
    // Remove the first tempurature reading 
    temperatureArray.shift();
    
    // average the values
    var sum = 0;
    for( var i = 0; i < temperatureArray.length; i++ ){
        sum += parseInt( temperatureArray[i], 10 ); //don't forget to add the base
    }
    var avg = sum/temperatureArray.length;
    
    // limit to two decimal points and convert to a float
    return +(avg).toFixed(2)
}

console.log(getTemperature());

// Get the piezo sensor
var sensorModule = require('jsupm_ldt0028');

var NUMBER_OF_SECONDS = 10;
var MILLISECONDS_PER_SECOND = 1000;
var SAMPLES_PER_SECOND = 50;
var THRESHOLD = 100;

// Create the LDT0-028 Piezo Vibration Sensor object using AIO pin 1
var sensor = new sensorModule.LDT0028(1);

// Read the signal every 20 milliseconds for 10 seconds
var buffer = [];
for (var i=0; i < NUMBER_OF_SECONDS * SAMPLES_PER_SECOND; i++) {
    buffer.push(sensor.getSample());
    delay(MILLISECONDS_PER_SECOND / SAMPLES_PER_SECOND );
}

// Print the number of times the reading was greater than the threshold
var count = 0;
for (var i=0; i < NUMBER_OF_SECONDS * SAMPLES_PER_SECOND; i++) {
    if (buffer[i] > THRESHOLD) {
        count++;
    }
}
console.log(sensor.name() + " exceeded the threshold value of " +
        THRESHOLD + " a total of " + count + " times,");
console.log("out of a total of " + NUMBER_OF_SECONDS*SAMPLES_PER_SECOND +
            " readings.");
console.log("");

// Print a graphical representation of the average value sampled
// each second for the past 10 seconds, using a scale factor of 15
console.log("Now printing a graphical representation of the average reading ");
console.log("each second for the last " + NUMBER_OF_SECONDS + " seconds.");
var SCALE_FACTOR = 15;
for (var i=0; i < NUMBER_OF_SECONDS; i++) {
    var sum = 0;
    for (var j=0; j < SAMPLES_PER_SECOND; j++) {
        sum += buffer[i*SAMPLES_PER_SECOND+j];
    }
    var average = sum / SAMPLES_PER_SECOND;
    var stars_to_print = Math.round(average / SCALE_FACTOR);
    var string = "(" + ("    " + Math.round(average)).slice(-4) + ") | ";
    for (var j=0; j < stars_to_print; j++) {
        string += "*";
    }
    console.log(string);
}

function delay( milliseconds ) {
    var startTime = Date.now();
    while (Date.now() - startTime < milliseconds);
}

var http = require('http');

var options = {
  host: '0.0.0.0',
  path: '/',
  //since we are listening on a custom port, we need to specify it by hand
  port: '8000',
};

var callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}

http.request(options, callback).end();