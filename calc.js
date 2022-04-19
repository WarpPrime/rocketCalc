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
