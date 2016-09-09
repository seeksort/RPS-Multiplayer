var gameActive = false;
var joinedPlayers = 0; // Players who have opened the game page
var readyPlayers = 0; // Players who have entered their name
var currentPlayer = 0;
var currentWinner, otherPlayer, newPlayerKey;
var currentPlayerObj = "";
var otherPlayerObj = "";
var playerChoicesEvaluated = false;
var player1Obj = {
    name: "",
    picture: "",
    wins: 0,
    losses: 0,
    chosenAction: ""
}
var player2Obj = {
    name: "",
    picture: "",
    wins: 0,
    losses: 0,
    chosenAction: ""
}

var userUid;

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDlkzDuTXk_m3juumuO4ZXue3RbvGfMQss",
    authDomain: "rps-game-18c0f.firebaseapp.com",
    databaseURL: "https://rps-game-18c0f.firebaseio.com",
    storageBucket: "rps-game-18c0f.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

// connectionsRef references a secific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");


// When the client's connection state changes...
connectedRef.on("value", function(snap) {

    // If they are connected..
    if(snap.val()) {

        console.log("connected to DB");
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        currentPlayer++;
        database.ref("lastPlayer").set(currentPlayer);
        var newPlayer = database.ref("players").push();
        newPlayerKey = newPlayer.key;

        newPlayer.set({
            name: "Sonic",
            wins: 0,
            losses: 0,
            chosenAction: "",
        });   

        // Remove user from the connection list when they disconnect.
        
        con.onDisconnect().remove();
        database.ref("players").child(newPlayerKey).onDisconnect().remove();
    };
});


