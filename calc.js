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

var engine = {
  ispAtm: 230, // both isp in seconds
  ispVac: 250, 
  thrust: 200000, // thrust in newtons
  engine: "solid", // liquid, solid, hybrid, etc.
  geo: "circular"
}
var fuel = 2000; // mass of fuel, in kg
var tankage = 100; // mass of tankage, in kg
var payload = 300; // mass of payload, in kg

function burntime(isp, thrust, fuels) {
  var massflow = thrust/isp; 
  return fuels/massflow;
}

function fly() {
  var velocity = [0,0,0]; // x,y,z
  var position = [0,0,0]; // y is up/down, x is e/w, z is n/s
  var orientation = [0,1,0]; // a vector on a unit sphere, following
  var thrust, TWR, accel;
  for (let i=0; i<1000; i++) { // say, 10 steps per second of simulation
    thrust = engine.ispAtm/engine.ispVac * thrust * SRB((i/10)/burnTime(engine.ispAtm, engine.ispAtm/engine.ispVac * thrust, fuel), "circular");
    TWR = thrust/(9.80665*(fuel+tankage+payload));
    accel = (TWR-1)*9.80665;
    
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

function P1(refP, refT, lapse, height, refH) { // reference pressure, temp, lapse rate, height, reference height
  if (lapse == 0) {
    return refP * ((refT + (height-refH)*lapse)/refT) ** ((-9.80665*0.0289644)/(8.3144598*lapse));
  }
  else {
    return refP * Math.exp((-9.80665*0.0289644*(height-refH))/(8.3144598*refT));
  }
}
