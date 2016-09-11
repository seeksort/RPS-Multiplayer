var currentPlayer = "";
var currentWinner, otherPlayer, playerName, otherPlayerName, currentPlayerReady, chosenAction;
var chatboxArray = [""];
var playerChoicesEvaluated = false;
var player1Obj = {
    name: "",
    wins: 0,
    losses: 0
}
var player2Obj = {
    name: "",
    wins: 0,
    losses: 0
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

// When page is first opened, determine if players are already present
database.ref().once("value", function(snapshot) {
    if (snapshot.child("players").exists()) {
        // If 3rd player attempts to join, display message, remove controls
        if ((snapshot.val().readyPlayer1 === true) && (snapshot.val().readyPlayer2 === true)) {
            $(".regularMsg").html("<p>Sorry, 2 players are already engaged in RPS action.<br>Please refresh in a few minutes to check whether you can join the game.</p>").css("background-color", "#DF2935");
            $("#player1").remove();
            $("#player2").remove();
            $(".chatboxContainer").remove();
        }
        if (snapshot.val().readyPlayer1 === true) {
            var player2 = {
                name: "",
                wins: 0,
                losses: 0,
                chosenAction: ""
            }
            currentPlayer = "player2";
            currentPlayerReady = "readyPlayer2";
            otherPlayer = "player1";
            database.ref("players/player2").set(player2);
            database.ref("readyPlayer2").set(true);
            $("#player2Options").css("display", "block");
            $(".chatboxContainer").css("display", "block");
            
        } else if (snapshot.val().readyPlayer2 === true) {
            var player1 = {
                name: "",
                wins: 0,
                losses: 0,
                chosenAction: ""
            }
            currentPlayer = "player1";
            currentPlayerReady = "readyPlayer1";
            otherPlayer = "player2";
            database.ref("players/player1").set(player1);
            database.ref("readyPlayer1").set(true);
            $("#player1Options").css("display", "block");
            $(".chatboxContainer").css("display", "block");
        }
    } else {
        var player1 = {
            name: "",
            wins: 0,
            losses: 0,
            chosenAction: ""
        }
        currentPlayer = "player1";
        currentPlayerReady = "readyPlayer1";
        otherPlayer = "player2";
        database.ref("players/player1").set(player1);
        database.ref("readyPlayer1").set(true);
        $("#player1Options").css("display", "block");
        $(".chatboxContainer").css("display", "block");
    }
    // determine if chatbox is in database, if so pull the array
    if (snapshot.child("chatbox").exists()) {
        chatboxArray = snapshot.val().chatbox;
    } else {
        database.ref("chatbox").set([""]);
    }
});

// Input player name
$("#submitName").on("click", function() {
    playerName = $("#inputPlayerName").val().trim();
    database.ref("players").child(currentPlayer).child("name").set(playerName);
    $("#nameInputFormGroup").remove();
    $("#identifyingStatusMsg")
        .html("Hello, " + playerName + "! You are Player " + currentPlayer.slice(-1) + ".");

    $("#statusMsg").html("The battle begins! Choose a move!");
    $("#inputPlayerName").val(""); // clear input form
    return false;
});

// If chatbox changes, pull array value, append to chatbox in DOM
database.ref("chatbox").on("value", function(snapshot){
    chatboxArray = snapshot.val();
    console.log(chatboxArray);
    console.log(chatboxArray[chatboxArray.length-1]);
    $("#chatbox").empty();
    $("#chatbox").append("<option>--- Character Chat ---</option>");
    for (var j = 1; j < chatboxArray.length; j++) {
        $("#chatbox").append("<option>" + chatboxArray[j] + "</option>");
    }
});

// If players are added or change, grab the change & write to DOM
database.ref("players").on("value", function(snapshot){
    if (snapshot.child([currentPlayer] + "/name").exists()) {
        $("#displayP" + currentPlayer.slice(1) + "Name").html(snapshot.val()[currentPlayer].name);
    } 
    if (snapshot.child([otherPlayer] + "/name").exists()) {
        otherPlayerName = snapshot.val()[otherPlayer].name;
        $("#displayP" + otherPlayer.slice(1) + "Name").html(snapshot.val()[otherPlayer].name);
    }
    database.ref("players").child(currentPlayer).onDisconnect().remove();
    database.ref(currentPlayerReady).onDisconnect().set(false);

    // If players have entered choices, evaluate the choices made and write result to firebase and DOM
    if ((playerChoicesEvaluated === false) &&
        (snapshot.val()[currentPlayer].chosenAction !== "") &&
        (snapshot.val()[otherPlayer].chosenAction !== "") ){
        var player1Choice = snapshot.val().player1.chosenAction;
        var player2Choice = snapshot.val().player2.chosenAction;
        player1Obj.name = snapshot.val().player1.name.toString();
        player2Obj.name = snapshot.val().player2.name.toString();
        if (player1Choice === player2Choice) {
            $("#statusMsg").html("It's a tie!");
            playerChoicesEvaluated = true;
            resetGameRound();
        } else if (
            ((player1Choice === "Rock") && (player2Choice === "Scissors")) || 
            ((player1Choice === "Paper") && (player2Choice === "Rock")) ||
            ((player1Choice === "Scissors") && (player2Choice === "Paper"))
            ) {
            currentWinner = "player1";
            $("#statusMsg").html(player1Obj.name + " wins!");
            playerChoicesEvaluated = true;
            returnGameResult();
            resetGameRound();
        } else {
            currentWinner = "player2";
            $("#statusMsg").html(player2Obj.name + " wins!");
            playerChoicesEvaluated = true;
            returnGameResult();
            resetGameRound();
        }
        resetGameRound();
    }
});

// Listener: Players choose option
$("#player1Options").on("click", "li", function(){
    if ((currentPlayer === "player1")){
        chosenAction = $(this).html();
        console.log("P1 selection made: " + chosenAction);
        $("#statusMsg").html("You have selected " + chosenAction + ". Waiting on " + otherPlayerName);
        database.ref("players/").child(currentPlayer).child("chosenAction").set(chosenAction);
    }
});
$("#player2Options").on("click", "li", function(){
    if ((currentPlayer === "player2")) {
        chosenAction = $(this).html();
        console.log("P2 selection made: " + chosenAction);
        $("#statusMsg").html("You have selected " + chosenAction + ". Waiting on " + otherPlayerName + "...");
        database.ref("players/").child(currentPlayer).child("chosenAction").set(chosenAction);
    }
});

// Adjust recorded results and write to page
function returnGameResult() {
    if (currentWinner === "player1") {
        player1Obj.wins++;
        player2Obj.losses++;
        database.ref("players/player1").child("wins").set(player1Obj.wins);
        database.ref("players/player2").child("losses").set(player2Obj.losses);
        $("#p1Wins").html(player1Obj.wins);
        $("#p2Losses").html(player2Obj.losses);

    } else if (currentWinner === "player2") {
        player2Obj.wins++;
        player1Obj.losses++;
        database.ref("players/player2").child("wins").set(player2Obj.wins);
        database.ref("players/player1").child("losses").set(player1Obj.losses);
        $("#p2Wins").html(player2Obj.wins);
        $("#p1Losses").html(player1Obj.losses);

    }
}

// Reset Round
function resetGameRound() {
    console.log("reset executing...");
    currentWinner = "";
    database.ref("players/player1").child("chosenAction").set("");
    database.ref("players/player2").child("chosenAction").set("");
    chosenAction = "";
    playerChoicesEvaluated = false;
}

// Listener: Chatbox
$("#submitChat").on("click", function() {
    console.log("chatbox!");
    var newChatLine = playerName + ": " + $("#userChatMsg").val();
    console.log(newChatLine);
    console.log(chatboxArray);
    //newChatLine = newChatLine.split(",");
    chatboxArray.push(newChatLine);
    database.ref("chatbox").set(chatboxArray);
    $("#userChatMsg").val(""); // clear input form
    return false;
})


