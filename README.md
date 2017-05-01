# Twitter HashTag Feed

Fetch tweets of a given “#HashTag” every few minutes and store only the newly found tweets 
in a database. User can see the tweets for a given “#HashTag”, which auto refreshes via socket.io
events.

## How to setup
1. Clone this repository
1. `cd` to repository root directory 
1. Execute `npm install` and `bower install`
1. Create a file `config/main.json` and specify below configuration
    ~~~~
    {
      "twitter": {
        "consumer_key"      : "",
        "consumer_secret"   : "",
        "access_token"      : "",
        "access_token_secret": ""
      },
      "debug" : false,
      "db" :{
        "base_url": "mongodb://localhost/"
      }
    }
    ~~~~
1. Execute `grunt` command
1. Execute `npm start` command
1. Access `http://127.0.0.1:3000/` 

## Demo

[Demo](http://34.205.135.253/ "Demo on AWS").

## References

1. https://dev.twitter.com/rest/public/search
1. https://dev.twitter.com/rest/public/timelines
1. https://dev.twitter.com/overview/api/cursoring
1. https://community.risingstack.com/node-js-twitter-bot-tutorial/
1. http://stackoverflow.com/questions/25685227/how-to-display-user-profile-image-in-circle
1. http://2ality.com/2012/07/large-integers.html
1. http://getbootstrap.com/components/#media-default
1. https://limonte.github.io/sweetalert2/
1. https://github.com/sroze/ngInfiniteScroll
