//readline module
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//express framework
const express = require('express');
const app = express();

//querystirng module
const querystring = require('querystring');

//request module
const request = require('request');
const {json, raw} = require("express");

//open module for opening tabs
const open = require('opn');





//Spotify Credntials :
let client_id;
let client_secret;
let redirect_uri;
let access_token;
let playlist_transfer_object;
let chosen_playlists = [];



async function main(){
     let option;
     rl.question('What do you wanna do ?\n 1.spotify to spotify\n 2.May come later to the project\nEnter Option Number: ', (input) => {
        option = input;

        switch (option){
            case '1':
            {
                client_id = 'YOUR_CLIENT_ID';
                client_secret = 'YOUR_CLIENT_SECRET';
                redirect_uri = 'http://localhost:3000/callback';


                let app = express();
                let server = app.listen(3000, () => {
                    console.log("----------------------------------------------");
                    console.log('First go to the below URL and log out from any spotify account that might be logged in from before:\nhttps://accounts.spotify.com/en/status\nThen open below URL in your browser and sign into the old account:\nhttp://localhost:3000/login');
                    console.log("----------------------------------------------");
                });


                app.get('/login', function(req, res) {

                    let state = 'oldjooon';
                    let scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
                    res.redirect('https://accounts.spotify.com/authorize?' +
                        querystring.stringify({
                            response_type: 'code',
                            client_id: client_id,
                            scope: scope,
                            redirect_uri: redirect_uri,
                            state: state
                        }));
                });

                app.get('/login_new', function(req, res) {

                    let state = 'newjooon';
                    let scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
                    res.redirect('https://accounts.spotify.com/authorize?' +
                        querystring.stringify({
                            response_type: 'code',
                            client_id: client_id,
                            scope: scope,
                            redirect_uri: redirect_uri,
                            state: state,
                        }));
                });

                app.get('/callback', async function(req, res) {

                    let code = req.query.code || null;
                    let state = req.query.state || null;

                    if (state === null) {
                        res.redirect('/#' +
                            querystring.stringify({
                                error: 'state_mismatch'
                            }));
                    } else if (state === 'oldjooon') {
                        let authOptions = {
                            url: 'https://accounts.spotify.com/api/token',
                            form: {
                                code: code,
                                redirect_uri: redirect_uri,
                                grant_type: 'authorization_code'
                            },
                            headers: {
                                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
                            },
                            json: true
                        };

                        await postRequest(authOptions).then(async body => {
                            access_token = body.access_token;
                            console.log("access_token fetched succefully ;)");
                            console.log("----------------------------------------------");

                            //SHOWING USERS'S PLAYLISTS
                            let playlists_options = {
                                url: "https://api.spotify.com/v1/me/playlists?limit=50",      //limit playlist fetch kardan 50
                                headers: {
                                    Authorization: `Bearer ${access_token}`
                                }
                            };
                            //fetching playlist and each playlist tracks uri and displayg them
                            await getRequest(playlists_options).then(async body => {
                                    let playlists = JSON.parse(body);
                                    console.log("Your Playlists:");
                                    let i = 1;
                                    for (let playlist of playlists.items) {
                                        console.log(i + '.' + playlist.name); //displaying each playlist name
                                        chosen_playlists.push(`${i++}`); //populating the chosen_playlist as all for when the user chooses ALL
                                    }
                                    console.log("----------------------------------------------");


                                    await getInput(`Enter the index of the playlists you want to move seperated by comma and with out the ending comma or if you want to move all just type ALL: `)
                                        .then(input => {
                                            if (input !== 'ALL') {
                                                chosen_playlists = input.split(',');
                                            }
                                    });


                                    await fetchTracksForPlaylists2(playlists)
                                        .then(tracksArray => {

                                            playlist_transfer_object = {
                                                all_playlists : playlists.items,
                                                selected_playlists : chosen_playlists,
                                                uris : tracksArray
                                            };
                                            console.log("----------------------------------------------");
                                            console.log("Now first go to this URL in the same browser and log out of your previous account:\nhttps://accounts.spotify.com/en/status\nThen go to the below URL for logging into the new Account:\nhttp://localhost:3000/login_new");
                                            console.log("----------------------------------------------");
                                        });




                                }
                            );
                        });

                    } else if (state === 'newjooon') {

                        let authOptions = {
                            url: 'https://accounts.spotify.com/api/token',
                            form: {
                                code: code,
                                redirect_uri: redirect_uri,
                                grant_type: 'authorization_code'
                            },
                            headers: {
                                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
                            },
                            json: true
                        };

                        postRequest(authOptions).then(async body => {
                            access_token = body.access_token;
                            console.log("access_token fetched succefully 2 ;)");
                            console.log("----------------------------------------------");

                            //first fetching user's ID
                            const idOptions = {
                                url: 'https://api.spotify.com/v1/me',
                                headers: {
                                    'Authorization': 'Bearer ' + access_token
                                },
                                json: true
                            };
                            //MOVING PART
                            let i = 0;
                            for (let index of playlist_transfer_object.selected_playlists) {

                                let playlistData = {
                                    name: playlist_transfer_object.all_playlists[+index - 1].name,
                                    description: "MOVED PLAYLIST via SPOTI_TOOL",
                                    public: false,
                                }

                                let playlists_post_options = {
                                    url: `https://api.spotify.com/v1/me/playlists`,
                                    body: JSON.stringify(playlistData),  //pay attention that because we aere using request module this key must me body and not data like spotify docs
                                    headers: {
                                        'Authorization': `Bearer ${access_token}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                                //now sending req to creat playlist
                                await postRequest(playlists_post_options).then(async (body) => {
                                    console.log("Playlist " + index + " Created ;)");
                                    let created_playlist_id = JSON.parse(body).id;
                                    let tracks_uris = playlist_transfer_object.uris[i++];


                                    //the loop is because of the 100 tracks limit per request
                                    let pos = 0;
                                    while (tracks_uris.length > 0)
                                    {
                                        let track_uris_100 = []; // because our requests has limit 100 tracks
                                        for (let x = 0; x < 100; x++){
                                            if (x + 1 > tracks_uris.length) { break; } // fo the last request when it contains less than 100 tracks

                                            track_uris_100[x] = tracks_uris[x];
                                        }

                                        let tracksData = {
                                            uris: track_uris_100,
                                            position: pos
                                        }


                                        let tracks_options = {
                                            url: `https://api.spotify.com/v1/playlists/${created_playlist_id}/tracks`,
                                            body: JSON.stringify(tracksData),  //pay attention that because we are using request module this key must me body and not data like spotify docs
                                            headers: {
                                                'Authorization': `Bearer ${access_token}`,
                                                'Content-Type': 'application/json',
                                            },
                                        }


                                        await postRequest(tracks_options).catch(error => {
                                            console.error("An error occurred on Adding Items to Playlist :" + index, error);
                                        });

                                        pos += 100; // updating position for remaining tracks
                                        for (let x = 0; x < 100; x++){
                                            tracks_uris.shift(); //removing first 100 so that if the playlist contains more than 100, the remaining can move too
                                        }


                                    }
                                    console.log("Playlist " + index + " Moved Successfully :)");

                                    if (i === playlist_transfer_object.selected_playlists.length){
                                        console.log("----------------------------------------------");
                                        console.log("Now you can Terminate the App or the Terminal!\n\nThanks For Choosing Amirali Kazerooni's Program! BYE BYE ;)");
                                        console.log("----------------------------------------------");
                                        rl.close();
                                    }

                                })
                                    .catch(error => {
                                        console.error("An error occurred on Playlist :" + index, error);
                                    });


                            }

                        });


                        server.close();
                    }
                    else { console.log("Invalid State !"); server.close(); }
                });


                break;
            }
            default:
                console.log("Invalid Option !");
                rl.close();
        }


    });

}

function getInput(prompt) {
    return new Promise((resolve, reject) => {
        rl.question(prompt, (input) => {
            resolve(input);
        });
    });
}

function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function postRequest(options) {
    return new Promise((resolve, reject) => {
        request.post(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                console.log("POST status code: " + response.statusCode);
                resolve(body);
            }
        });
    });
}

function putRequest(options) {
    return new Promise((resolve, reject) => {
        request.put(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                console.log("PUT status code: " + response.statusCode);
                resolve(body);
            }
        });
    });
}


function getRequest(options) {
    return new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                console.log("GET status code: " + response.statusCode);
                resolve(body);
            }
        });
    });
}


/*
async function fetchTracksForPlaylists2(playlists) {
    const tracksPromises = chosen_playlists.map(async index => {
        let offset = 0;
        let total;
        let tracks = [];

        do {
            const selected_tracks_options = {
                url: `https://api.spotify.com/v1/playlists/${playlists.items[+index - 1].id}/tracks?offset=${offset}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            };

            try {
                const body = await getRequest(selected_tracks_options);
                const parsed = JSON.parse(body);
                const tracksarr = parsed.items;

                total = parsed.total;
                offset += 100;


                for (const obj of tracksarr) {

                    if (obj.track !== null){  /!* it seems that some tracks objects info are seperated into two parts for example for number 11 track
                                                obj.track is null but the next(or maybe 2 obj forward) obj has obj.track which is the actual obj for number 11
                                                 LONG STORY SHORT THIS CHECKING IS ESSENTIAL *!/
                        tracks.push(obj.track.uri);
                    }

                }

                console.log(`Tracks from Playlist ${index} fetched...`);

            } catch (error) {
                console.error(`An error occurred on Fetching Tracks ${index}:`, error);
            }
        } while (total > offset);

        return tracks;
    });

    return Promise.all(tracksPromises);
}
*/


async function fetchTracksForPlaylists2(playlists) {
    const tracksPromises = chosen_playlists.map(async index => {
        let offset = 0;
        let total;
        let tracks = [];

        do {
            const selected_tracks_options = {
                url: `https://api.spotify.com/v1/playlists/${playlists.items[+index - 1].id}/tracks?offset=${offset}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            };

            await getRequest(selected_tracks_options).then( async body => {
                const parsed = JSON.parse(body);
                const tracksarr = parsed.items;

                total = parsed.total;
                offset += 100;


                for (const obj of tracksarr) {

                    if (obj.track !== null){  /* it seems that some tracks objects info are seperated into two parts for example for number 11 track
                                                obj.track is null but the next(or maybe 2 obj forward) obj has obj.track which is the actual obj for number 11
                                                 LONG STORY SHORT THIS CHECKING IS ESSENTIAL */
                        tracks.push(obj.track.uri);
                    }

                }

                console.log(`Tracks from Playlist ${index} fetched...`);

            }).catch(error => {
                console.error(`An error occurred on Fetching Tracks ${index}:`, error);
            });


        } while (total > offset);


        return tracks;
    });


    return Promise.all(tracksPromises);
}




main();
