# Simple Project Simulator Electron App

This simple time estimator for projects runs a monte carlo simulation on a list of task to help understand the project's possible future. This version is intended to be built into an electron app for local use. It's also a pretty simple application to that can be used as a demo of electron projects.

The CSV file should have a header row of:

`Task,Max,Min,Confidence`

The rows follow suit, providing a name for each task, the max number of hours estimated for the task, the min number of hours estimated, and the level of confidence (as a percentage) that the actual will fall within the range. An example row for project setup estimated to take 2-5 hours with 90% confidence would look like:

`Setup,5,2,.90`

The project leverages D3 for the histogram, and jquery.css.js to load the file.
