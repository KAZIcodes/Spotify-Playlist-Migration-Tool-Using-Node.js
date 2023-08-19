# Spotify-Playlist-Migration-Tool-Using-Node.js
> **Description :**
> 
> 
> You can move your playlist from an old Spotify account to a new one using this tool.
> This project uses Spotify Web API to acquire the selected playlists from the old or any account and move them to the new or any other account by creating the new playlists in the new account by the same name and same tracks.
> 

> **Usage :**
> 
> 1. First make an app in [developer.spotify.com](http://developer.spotify.com) and get client ID and client secret and place them in the code in place of values with the same name.
> 2. In the app you created at  [developer.spotify.com](http://developer.spotify.com)  you should copy and paste the redirect URI from the code which is http://localhost:3000/callback ; but you can change the port which is 3000 but note to change the port in the any part of the code that it’s mentioned.
> 3. Download the files from the repository and place them in a directory(folder) and then install the modules used in the code(mentioned below) using npm(make sure to have Node.js and it’s package manager npm installed) and the terminal in the directory.
> 4. Use `node app.js` command in the directory to run the program. 

> **Modules Used :**
> 
> - readline
> - express
> - querystring
> - request

> **BE AWARE :**
> 
> - This app is designed to get maximum number of 50 playlists and if you have more the the 50 of them at the top of the list will be shown.
> - Status code for each request in the project is shown on the terminal but you can make it not to show status codes by commenting the `console.log()` part that is printing the status codes in the `getRequest`  and `postRequest` functions. but if you wanna keep them to make sure the program is working fine just note that everything is working fine if the GET status codes are all 200 and the POST status codes are all 201.
> - If your country is banning Spotify or some how Spotify is not accessible for you make sure to use proper VPN for working with the program.
