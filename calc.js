// currently only supports one stage
function SRB(t,geo) {
  var top,bottom,avg;
  if (t<0) {return 0;}
  if (t>1) {return 0;}
  if (geo == "circular") {
    avg = 1.00596096919;
    top = 7.15853832487*(t**3) - 14.2817979947*(t**2) + 7.12283717675*t + 0.000451083203767;
    bottom = 12.7998297531*(t**6) - 39.9195507656*(t**5) + 44.0987641152*(t**4) - 11.3149390159*(t**3) - 13.6170556358*(t**2) + 7.95567673071*t + 0.00451079034958;
    if (top/bottom < 0 && t<=1) {
      return 0.001;
    }
    else {
      return top/bottom;
    }
  }
}

var flightevents = {
  burnout: undefined,
  crash: undefined,
}

var engine = {
  ispAtm: 230, // both isp in seconds
  ispVac: 250, 
  thrust: 200000, // thrust in newtons
  engine: "solid", // liquid, solid, hybrid, etc.
  geo: "circular"
}
var fuel = 1000; // mass of fuel, in kg
var fuel_orig = 1000;
var tankage = 100; // mass of tankage, in kg
var payload = 300; // mass of payload, in kg

function burnTime(isp, thrust, fuels) {
  var massflow = thrust/(isp*9.80665); 
  return fuels/massflow;
}

function println(line) {
 document.getElementById("console").innerHTML += `<p>${line}</p>`;
}

function normalize(vector) {
  var magnitude = Math.sqrt(vector[0]**2+vector[1]**2+vector[2]**2);
  if (magnitude == 0) {
    return [0,0,0];
  }
  return [vector[0]/magnitude,vector[1]/magnitude,vector[2]/magnitude];
}

function fly() { // incomplete, this is just stupid flying with no guidance, throttling, whatnot
  var Cd = 0.35; // drag coefficient
  var area = 3.14; // cross-sectional area, about 1 meter wide rocket


  var step = 20; // number of steps per simulation second
  var seconds = 1000; // number of simulation seconds the program should run
  var velocity = [0,0,0]; // x,y,z
  var position = [0,0,0]; // y is up/down, x is e/w, z is n/s
  var orientation = [0,1,0]; // a vector on a unit sphere, following previous rules
  // later we might switch from unit vectors to spherical coordinates
  var thrust, TWR, accel;
  var prograde,retrograde;
  var drag1, dragTWR, dragDecel;
  for (let i=0; i<step*seconds; i++) { // say, 10 steps per second of simulation
    if (fuel<=0) {
      fuel = 0;
      thrust = 0;  
    }
    else {
      thrust = engine.ispAtm/engine.ispVac * engine.thrust * SRB((i/step)/burnTime(engine.ispAtm, engine.ispAtm/engine.ispVac * engine.thrust, fuel_orig), "circular");
      fuel = fuel - 1/step * thrust/(9.80665*engine.ispAtm);
    }
    TWR = thrust/(9.80665*(fuel+tankage+payload));
    accel = (TWR-1)*9.80665;

    drag1 = drag(density(position[1]), velocity[1], area, Cd);
    dragDecel = drag1/(fuel+tankage+payload);
    // use F=ma, so a=F/m

    // compute prograde/retrograde directions here as a unit vector
    // take these directions into account and multiply the direction xyz into the decel vector

    prograde = normalize(velocity);
    retrograde = [-prograde[0],-prograde[1],-prograde[2]];
    
    // stupid euler integration or something
    // drag does not count for prograde
    velocity[0] = velocity[0] + accel*orientation[0]/step + retrograde[0]*dragDecel*orientation[0]/step;
    velocity[1] = velocity[1] + accel*orientation[1]/step + retrograde[1]*dragDecel*orientation[1]/step;
    velocity[2] = velocity[2] + accel*orientation[2]/step + retrograde[2]*dragDecel*orientation[2]/step;
    
    position[0] = position[0] + velocity[0]/step;
    position[1] = position[1] + velocity[1]/step;
    position[2] = position[2] + velocity[2]/step;
    if (!flightevents.burnout || i%step == 0) {
      println(`T+${i/step} - Position: ${position}, Velocity: ${velocity}, Thrust: ${thrust}, Mass: ${fuel+tankage+payload}, Acceleration: ${(accel-dragDecel)/9.80665}g`);
    }
    if (thrust==0 && !flightevents.burnout) { // burnout
      println("SRB burnout");
      flightevents.burnout = i/step;
    }
    if (position[1] < 0) { // detect crashes
      println("Rocket crashed");
      flightevents.crash = i/step;
      break;
    }
  }
  // take the engine, fuel, and pressure states to compute rocket parameters
}
/* liquid engine custom stats
throttleRange: [1,1], // number, as a float, as the maximum/minimum throttle this engine can take on
solid motor custom stats
geo: // the type of grain geometry: circular, c-slot, moonburner, 5-finocyl, double anchor, etc.
Circular bore:
top: 7.15853832487*(t**3) - 14.2817979947*(t**2) + 7.12283717675*t + 0.000451083203767
bottom: 12.7998297531*(t**6) - 39.9195507656*(t**5) + 44.0987641152*(t**4) - 11.3149390159*(t**3) - 13.6170556358*(t**2) + 7.95567673071*t + 0.00451079034958
average thrust: 1.00596096919 of rated thrust
*/
function pressure(h) {
  var pressure;
  // use equations in desmos, pressure in kilopascals
  if (h<11000) { // troposphere
    pressure = P1(101.325, 288.15, -0.0065, h, 0);
  }
  else if (h>=11000 && h<20000) { // tropopause
    pressure = P1(22.63210, 216.65, 0, h, 11000);
  }
  else if (h>=20000 && h<32000) { // stratosphere
    pressure = P1(5.47489, 216.65, 0.001, h, 20000);
  }
  else if (h>=32000 && h<47000) { // stratosphere
    pressure = P1(0.86802, 228.65, 0.0028, h, 32000);
  }  
  else if (h>=47000 && h<51000) { // stratopause
    pressure = P1(0.11091, 270.65, 0, h, 47000);
  }
  else if (h>=51000 && h<71000) { // mesosphere
    pressure = P1(0.06694, 270.65, -0.0028, h, 51000);
  }
  else if (h>=71000 && h<83000) { // mesopause
    pressure = P1(0.00396, 214.65, -0.002, h, 71000);
  }
  else if (h>=83000 && h<250000) { // thermosphere
    pressure = 0.0005;
  }
  else { // exosphere, don't want to deal with infinitesimals that annoy calculation with IEEE 754
    pressure = 0;
  }
  return pressure;
}

function density(h) {
  // density in kg/m^3
  var density;
  if (h<11000)   {
    density = D1(1.225, 288.15, -0.0065, h, 0);
  }
  else if (h>=11000 && h<20000) {
    density = D1(0.36391, 216.65, 0, h, 11000);
  }
  else if (h>=20000 && h<32000) {
    density = D1(0.08803, 216.65, 0.001, h, 20000);
  }
  else if (h>=32000 && h<47000) {
    density = D1(0.01322, 228.65, 0.0028, h, 32000);
  }
  else if (h>=47000 && h<51000) {
    density = D1(0.00143, 270.65, 0, h, 47000);
  }
  else if (h>=51000 && h<71000) {
    density = D1(0.00086, 270.65, -0.0028, h, 51000);
  }
  else if (h>=71000 && h<83000) {
    density = D1(0.000064, 214.65, -0.002, h, 71000);
  }
  else if (h>=83000 && h<250000) { // thermosphere
    density = 0.000007;
  }
  else { // exosphere, don't want to deal with infinitesimals that annoy calculation with IEEE 754
    density = 0;
  }
  return density;
}

function P1(refP, refT, lapse, height, refH) { // reference pressure, temp, lapse rate, height, reference height
  if (lapse == 0) {
    return refP * ((refT + (height-refH)*lapse)/refT) ** ((-9.80665*0.0289644)/(8.3144598*lapse));
  }
  else {
    return refP * Math.exp((-9.80665*0.0289644*(height-refH))/(8.3144598*refT));
  }
}

function D1(refD, refT, lapse, height, refH) { // reference density, temp, lapse rate, height, ref height
  if (lapse == 0) {
    return refD*Math.exp((-9.80665*0.0289644*(height-refH))/(8.3144598*refT));
  }
  else {
    return refD*(refT/(refT+(height-refH)*lapse))**(1+(9.80665*0.0289644)/(8.3144598*lapse));
  }
}

function drag(density, velocity, area, dragcoefficient) {
  return 1/2 * density * velocity * velocity * dragcoefficient * area;
}
