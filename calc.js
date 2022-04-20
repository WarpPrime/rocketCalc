// currently only supports one stage
function SRB(t,geo) {
  var top,bottom,avg;
  if (geo == "circular") {
    avg = 1.00596096919;
    top = 7.15853832487*(t**3) - 14.2817979947*(t**2) + 7.12283717675*t + 0.000451083203767;
    bottom = 12.7998297531*(t**6) - 39.9195507656*(t**5) + 44.0987641152*(t**4) - 11.3149390159*(t**3) - 13.6170556358*(t**2) + 7.95567673071*t + 0.00451079034958;
    return top/bottom;
  }
}

engine = {
  ispAtm: 230, // both isp in seconds
  ispVac: 250, 
  thrust: 200000, // thrust in newtons
  engine: "solid", // liquid, solid, hybrid, etc.
  geo: "circular"
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
  // use equations in desmos
  else if (h>=83000 && h<250000) { // thermosphere
    pressure = 0.0005;
  }
  else { // exosphere, don't want to deal with infinitesimals that annoy calculation with IEEE 754
    pressure = 0;
  }
}

function P1(refP, refT, lapse, height, refH) {
  if (lapse == 0) {
    return refP * ((refT + (height-refH)*lapse)/refT) ** ((-9.80665*0.0289644)/(8.3144598*lapse));
  }
  else {
    return refP * Math.exp((-9.80665*0.0289644*(height-refH))/(8.3144598*refT));
  }
}
