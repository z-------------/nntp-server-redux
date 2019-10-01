const p = require("phin");

exports.handler = (e, ctx, callback) => {  
  let ip = e.queryStringParameters.ip || e.headers["client-ip"]; 
  let lang = e.queryStringParameters.lang || "en";

  let latLngStr;
  if (e.queryStringParameters.coords) {
    latLngStr = e.queryStringParameters.coords;
    gotLatLngStr();
  } else {
    p({
      url: `https://ipinfo.io/${ip}/geo`,
      headers: {
        "Authorization": `Bearer ${process.env.IPINFO_APIKEY}`
      },
      parse: "json"
    }).then(r => {
      latLngStr = r.body.loc;
      gotLatLngStr();
    });
  }

  function gotLatLngStr() {
    p({
      url: `https://api.darksky.net/forecast/${process.env.DARKSKY_APIKEY}/${latLngStr}?units=si&exclude=daily,hourly&lang=${lang}`,
      parse: "json"
    }).then(r => {
      let response = {
        weather: r.body,
        debug: {
          ip,
          coords: latLngStr.split(",")
        }
      };
      callback(null, { body: JSON.stringify(response) });
    });
  }
};
