const p = require("phin");

exports.handler = async (e, _) => {
  const ip = e.queryStringParameters.ip || e.headers["x-nf-client-connection-ip"]; 
  const lang = e.queryStringParameters.lang || "en";

  const latLngStr = await (async () => {
    if (e.queryStringParameters.coords) {
      return e.queryStringParameters.coords;
    } else {
      try {
        const res = await p({
          url: `https://ipinfo.io/${ip}/geo`,
          headers: {
            "Authorization": `Bearer ${process.env.IPINFO_APIKEY}`
          },
          parse: "json",
        });
        return res.body.loc;
      } catch (err) {
        console.error("Failed to get IP address from ipinfo.io:", err);
      }
    }
  })();
  if (latLngStr.trim() === "") {
    console.error(`Failed to get valid coordinates ('${latLngStr}')`);
    return {
      statusCode: 500,
    };
  }

  try {
    const res = await p({
      url: `https://api.darksky.net/forecast/${process.env.DARKSKY_APIKEY}/${latLngStr}?units=si&exclude=daily,hourly&lang=${lang}`,
      parse: "json",
    });
    const response = {
      weather: res.body,
      debug: {
        ip,
        coords: latLngStr.split(","),
      },
    };
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error("Failed to get weather from darksky.net:", err);
    return {
      statusCode: 500,
    };
  }
};
