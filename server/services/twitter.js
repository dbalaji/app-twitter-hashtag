
const fs= require("fs");

var twit = require("twit");

var config= require("../config/main.json");


console.log(config.twitter);

var Twitter = new twit(config.twitter);

var params = {
    q: '#nodejs, #Nodejs',  // REQUIRED
    result_type: 'recent',
    lang: 'en'
};

Twitter.get('search/tweets', params, function(err, data) {
    if (err){
        console.log(err);
    }
    else {
        fs.writeFileSync("reponsoe.json", JSON.stringify(data), 'utf8');
        //console.log(data);
    }
});

//setInterval of 2 minutes