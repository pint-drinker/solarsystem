# Solar System Simulator #

Using three.js and initial conditions from JPL's Horizons System, this repository allows
you to navigate the solar system in style...zipping back and forth between the sun, planets,
their moons, and even a spaceship!

### What does it do? ###

* Models the solar system using Newton's universal law of gravitation with an Eulerian approximation
* Allows for navigation amongst major celestial bodies in the solar system
* Connects to JPL's Horizons System, telnet (https://ssd.jpl.nasa.gov/horizons/) to collect initial conditions on celestial bodies for a point in time
* The simulation begins at the initial time (controlled by running a python script - see more below), and lets you move forward or backward through time
* Brings in a basic rendering of the Hermes, the crew ship from the movie *The Martian*, and lets you perform basic yaw, pitch, and roll controls with Q/E, A/D, W/S

### How do I get set up? ###

This repository comes loaded with initial conditions for the following celestial bodies in our solar system as of 2015-Jan-4 01:37:00:
* Sun
* Mercury
* Venus
* Earth
  * Moon
* Mars
* Jupiter
  * Io
  * Europa
  * Ganymede
  * Callisto
* Saturn
  * Triton
* Uranus
* Neptune
  * Triton
* Pluto

These initial conditions are found in the `src/info-example` directory and are parsed into a JS object in the `src/PLANET_DATA_EXAMPLE` file.

To run the simulator with these initial conditions, follow these steps:

1. Copy the `src/PLANET_DATA_EXAMPLE.js` file to the `src/PLANET_DATA.js` file using `cp src/PLANET_DATA_EXAMPLE.js src/PLANET_DATA.js`
2. Navigate to the `src` directory 
3. Once there, run the `python -m http.server`. 
4. The simulator will now run on the `0.0.0.0:8000` address on your browser 
5. Copy and paste this url: `http://localhost:8000/` or `http://0.0.0.0:8000/` into your browser to start exploring!

To generate your own initial conditions (not required), follow these steps:

* Navigate to `python` directory and run `python -m telnet` and enter the desired start date (or use the default date)
* Once the script finishes (should take less than 60 seconds), follow steps 2-5 from above

### Insights for future simulators... ###

The physics involved with a dynamic simulation like this is surprisingly small. A simple Eulerian application of Newton's Law of Gravitation between all bodies is all that is required to properly simulate the solar system. 

It is the collection of proper initial conditions and finding an elegant way to display all the bodies that is the truly difficult and comprehensive part. 

Dynamic down-scaling of distances, planet sizes, and kinematic values is necessary to allow for something as large as a solar system to render on a computer screen. 

To allow for a more inclusive user experience, the sizes of certain planets and the distances between them are not to scale, while their real-valued quantities are used in the back end to maintain simulation accuracy. 

As a final word to the wise for any future simulators, develop your solar system the way you would want to explore space. If you had no limit on speed, fuel, control, or time, how would you want to zip around the solar system? What would you want to look at when you got to Mars? What would you want to know about it when you got there? 

A project like this one is as much about the experience as it is rigorous physics, coding, and data management. 

I wish happy and safe travels!

Best,

pint_drinker
    

