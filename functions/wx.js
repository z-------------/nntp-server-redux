exports.handler = (e, ctx, callback) => {
  callback(null, {
    statusCode: 200,
    body: "Hello, Netlify Functions!"
  });
};
