var gameActive = false;
var joinedPlayers = 0;
var readyPlayers = 0;
var currentPlayer;
var currentWinner;
var selectionMade = 0; // [0: neither, 1: one ready, 2: both ready]
var player1Obj = {
    name: "Mario",
    picture: "",
    wins: 0,
    losses: 0,
    chosenAction: ""
}
var player2Obj = {
    name: "Luigi",
    picture: "",
    wins: 0,
    losses: 0,
    chosenAction: ""
}

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDlkzDuTXk_m3juumuO4ZXue3RbvGfMQss",
    authDomain: "rps-game-18c0f.firebaseapp.com",
    databaseURL: "https://rps-game-18c0f.firebaseio.com",
    storageBucket: "rps-game-18c0f.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

// Adding player objects and common variables to Firebase
database.ref("player1Obj").set(player1Obj);
database.ref("player2Obj").set(player2Obj);

database.ref("gameActive").set(gameActive);
// NOT joinedPlayers, b/c dependent on page loads
database.ref("readyPlayers").set(readyPlayers);
database.ref("currentWinner").set("");
database.ref("selectionMade").set(0);
    
// TODO Obtain game status from server. Set a variable that increments whenever the page is loaded. If joinedPlayers === 0 user is P1, if === 1 user is P2, if > 1 user cannot play.
$(window).one("load", function(){
    database.ref().once("value", function(snapshot) {
        console.log("executing");
        console.log(snapshot.val().joinedPlayers);
        joinedPlayers = snapshot.val().joinedPlayers; //Left off here, not pulling, may need to use parseInt
        if (snapshot.val().joinedPlayers === 0) {
            currentPlayer = "player1";
            joinedPlayers++;
            database.ref().child("joinedPlayers").set(joinedPlayers);
        } else if (snapshot.val().joinedPlayers === 1) {
            currentPlayer = "player2";
            joinedPlayers++;
            database.ref().child("joinedPlayers").set(joinedPlayers);
        } else {
            // Disable game if a third player attempts to join, display explanation message
            $(".regularMsg").html("<p>Sorry, two players are already engaged in RPS action.<br>Please refresh in a few minutes to check whether you can join the game.</p>").css("background-color", "#DF2935");
            $("#player1").css("display", "none");
            $("#player2").css("display", "none");
            $(".chatboxContainer").css("display", "none");
        }
        console.log("# joinedPlayers: " + joinedPlayers);
        console.log("You are player: " + currentPlayer);
    });
});

// Input player name
$("#submitName").on("click", function() {
    console.log("readyPlayers: " + readyPlayers);
    if (readyPlayers === 0) {
        player1Obj.name = $("#inputPlayerName").val();
        database.ref().child("player1Obj").child("name").set(player1Obj.name);
        readyPlayers++;
        return false;
    } else if (readyPlayers === 1) {
        // Input player name
        player2Obj.name = $("#inputPlayerName").val();
        database.ref().child("player2Obj").child("name").set(player2Obj.name);
        readyPlayers++;
        return false;
    } else {
        console.log("ERROR! > 1 ready players");
    }
});

// TODO Assign players

// TODO Select Picture

// Listener: Players ready

/*
================
GAME
================
*/ 
// Listener: Players choose option
// TODO Add playersReady to condition
$("#player1Options > li").on("click", function(){
    if ((gameActive === false) && (selectionMade == 0)){
        player1Obj.chosenAction = $(this).html()     
        console.log(player1Obj);
        selectionMade++;
        console.log("selectionMade: " + selectionMade);
    }
});
$("#player2Options > li").on("click", function(){
    if ((gameActive === false) && (selectionMade == 1)) {
        player2Obj.chosenAction = $(this).html()     
        console.log(player2Obj);
        selectionMade++;
        console.log("selectionMade: " + selectionMade);
        evaluatePlayerMoves();
    }
});

// Evaluate players' chosen options
function evaluatePlayerMoves() {
    console.log("evaluatePlayerMoves is executing");
    var player1Choice = player1Obj.chosenAction;
    var player2Choice = player2Obj.chosenAction;
    if ((player1Choice !== "") && (player2Choice !== "")) {
        if (player1Choice === player2Choice) {
            $("#statusMsg").html("It's a tie!");
            //reset
        } else if (
            ((player1Choice === "Rock") && (player2Choice === "Scissors")) || 
            ((player1Choice === "Paper") && (player2Choice === "Rock")) ||
            ((player1Choice === "Scissors") && (player2Choice === "Paper"))
            ) {
            currentWinner = "player1";
            returnGameResult();
        } else {
            currentWinner = "player2";
            returnGameResult();
        }
        resetGameRound();
    }
}

// Adjust recorded results and write to page
function returnGameResult() {
    if (currentWinner === "player1") {
        player1Obj.wins++;
        player2Obj.losses++;
        $("#statusMsg").html(player1Obj.name + " wins!");
        $("#p1Wins").html(player1Obj.wins);
        $("#p2Losses").html(player2Obj.losses);
    } else if (currentWinner === "player2") {
        player2Obj.wins++;
        player1Obj.losses++;
        $("#statusMsg").html(player2Obj.name + " wins!"); 
        $("#p2Wins").html(player2Obj.wins);
        $("#p1Losses").html(player1Obj.losses);
    }
}

// Reset Function
function resetGameRound() {
    selectionMade = 0;
    currentWinner = "";
}
