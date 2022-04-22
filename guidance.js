function guidance(position, velocity, orientation, thrust, mass) {
  // takes position, velocity, orientation, thrust, mass parameters
  // return throttle, destruct/abort command (true/false), target orientation
  // other return and input parameters will think of later
  
  // stupid guidance below
  
  
  if (position[1] < 100 && velocity[1] < -30) { // about to crash at 68 miles per hour
    return [0,True];
  }
  else {
    return [1,False,[0,1,0]]; // fly straight up
  }
}
