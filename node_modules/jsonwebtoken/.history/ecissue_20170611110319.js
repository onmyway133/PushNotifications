var jwt = require('./');
var Service = function(options) {
  this.options = options;
}
Service.prototype.authenticate = function() {
    var self=this;
    return new Promise((resolve, reject) => {
      var cert = fs.readFileSync( self.options.cert );  // get public key
      // sign asynchronously
      var claims = { // token claims payload

          //The issued at (iat) registered claim key, whose value indicates the time at which the token was generated,
          //in terms of the number of seconds since Epoch, in UTC
          iat: Math.floor( Date.now() / 1000 ),

          //The expiration time (exp) registered claim key,
          //whose value must not be greater than 15777000 (6 months in seconds) from the Current Unix Time on the server
          exp: Math.floor(Date.now() / 1000) + ( 60 * 60 * 24 )

      };
      jwt.sign(claims,
        cert,
        {
          keyid: "ABC123DEFG",
          issuer: "DEF123GHIJ",
          algorithm: "ES256"
        },
        function(error, token) {
          console.log('after sign');
          if( error ) return reject(error);
          else { // token created
            var decoded = jwt.verify(token, cert);
            console.log(decoded) // bar
            self.token=token;
            return resolve(token);
          }
      });
    });
  }//authenticate

  module.exports = Service;