const p = require("phin");
console.log("p is", p);

exports.handler = (e, ctx, callback) => {
  console.log({ e });
  console.log("e.queryStringParameters:", e.queryStringParameters);
  console.log("e.headers:", e.headers);

  const ip = e.queryStringParameters.ip || e.headers["x-nf-client-connection-ip"]; 
  const lang = e.queryStringParameters.lang || "en";

  console.log({ ip, lang });

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
    }).catch(err => {
      console.error("Call to ipinfo.io API failed:", err);
      callback(null, { status: 500 });
    });
  }

  function gotLatLngStr() {
    console.log({ latLngStr });
    p({
      url: `https://api.darksky.net/forecast/${process.env.DARKSKY_APIKEY}/${latLngStr}?units=si&exclude=daily,hourly&lang=${lang}`,
      parse: "json"
    }).then(r => {
      const response = {
        weather: r.body,
        debug: {
          ip,
          coords: latLngStr.split(",")
        }
      };
      callback(null, {
        status: 200,
        body: JSON.stringify(response),
      });
    }).catch(err => {
      console.error("Call to darksky.net API failed:", err);
      callback(null, { status: 500 });
    });
  }
};
