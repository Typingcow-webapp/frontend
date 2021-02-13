(function () {
  /***************DOM SELECTORS***************/

  // Navigation Related

  const logo = document.getElementById("logo");
  const timeChoice = document.getElementById("time");
  const navigationBtns = document.querySelector("nav ul");
  const leaderboardBtns = document.querySelectorAll(".leaderboardBtn");
  const supportBtn = document.getElementById("supportBtn");
  const settingsBtns = document.querySelectorAll(".settingsBtn");
  const profileBtns = document.querySelectorAll(".profileBtn");
  const usernameDisplay = document.querySelectorAll(".user-name");
  const signOut = document.getElementById("sign-out");

  // Mobile Navigation Related

  const hamburgerMenuCheckbox = document.getElementById("checkbox");
  const mobileNav = document.getElementById("mobile-navigation");
  const guestText = document.getElementById("guest-text");

  // Typing Test Area Related

  const playScreen = document.querySelector("main header");
  const capslock = document.getElementById("capslock");
  const textDisplay = document.getElementById("text");
  const loadingText = document.getElementById("loading-text");
  const userInput = document.getElementById("user-input");
  const keyboardKeys = document.querySelectorAll(".wrapper div");

  // User Results Related

  const time = document.getElementById("timer");
  const wpm = document.querySelectorAll(".wpm");
  const rawWpm = document.getElementById("raw-wpm");
  const cpm = document.querySelectorAll(".cpm");
  const footer = document.querySelector("footer");
  const results = document.getElementById("results");

  // Sections that aren't automatically visible

  const leaderboard = document.getElementById("leaderboard");
  const support = document.getElementById("support");
  const overlay = document.getElementById("overlay");
  const mobileOverlay = document.getElementById("mobile-overlay");

  // User Settings Related

  const settings = document.getElementById("settings");
  const themes = document.querySelectorAll("input[type='radio']");

  // Authentication Section Related

  const userAuthentication = document.getElementById("user-authentication");

  const signupForm = document.getElementById("register");
  const signupError = document.getElementById("signup-error");

  const loginForm = document.getElementById("login");
  const loginError = document.getElementById("login-error");

  // User Stats Related

  const userStats = document.getElementById("user-stats");
  const userPbsTable = document.querySelector("#user-pbs tbody");
  const userResultsTable = document.querySelector("#all-results tbody");

  /***************VARIABLES***************/

  let SERVER_URL;
  let RANDOM_QUOTE_API_URL;

  let selectedTime;
  let timerIntervalId;
  let keyPressed;
  let clickedLeaderboard;
  let clickedProfile;
  let numOfChars;
  let allCorrect;

  init();

  /***************FUNCTIONS***************/

  function init() {
    // Set variable values

    // SERVER_URL = "https://dry-thicket-18544.herokuapp.com";
    SERVER_URL = "http://localhost:3000";

    RANDOM_QUOTE_API_URL =
      "https://api.quotable.io/random?minLength=85&maxLength=185";

    keyPressed = false;
    selectedTime = 15;
    mistakes = 0;
    clickedLeaderboard = false;
    clickedProfile = false;
    numOfChars = 0;
    allCorrect = true;

    // Check if the user has a selected theme

    if (localStorage.getItem("theme")) {
      document.body.classList = localStorage.getItem("theme");
    } else {
      document.body.classList = localStorage.getItem("theme");
    }

    // Check if the username localstorage variable exists

    if (localStorage.getItem("username")) {
      usernameDisplay.forEach((el) => {
        el.textContent = localStorage.getItem("username");
      });
    }

    // Check if the user is authenticated

    if (localStorage.getItem("authenticated")) {
      guestText.textContent = "";
    }

    // Display a random quote for the user to type

    displayRandomQuote();

    // Automatically focus the input element

    userInput.focus();
  }

  function restart() {
    displayRandomQuote();

    keyPressed = false;

    // Hide everything from the user's screen except for the play screen, the navigation buttons and the footer

    // Shown Elements

    playScreen.style.display = "flex";
    footer.style.display = "flex";
    navigationBtns.style.display = "block";

    // Hidden Elements

    results.style.display = "none";
    leaderboard.style.display = "none";
    support.style.display = "none";
    settings.style.display = "none";
    userAuthentication.style.display = "none";
    overlay.style.display = "none";
    mobileOverlay.style.display = "none";
    userStats.style.display = "none";
    signOut.style.display = "none";

    // Check if the timer is currently running

    if (timerIntervalId) {
      // Stop the timer from running

      clearInterval(timerIntervalId);
    }

    // Reset the values of all changed DOM elements

    userInput.value = "";

    time.textContent = selectedTime;

    wpm.forEach((el) => (el.textContent = "0"));
    cpm.forEach((el) => (el.textContent = "0"));
    rawWpm.textContent = "0";
  }

  function postUserStats() {
    // Make a POST request to the result route with the required body parameters (the user's WPM, CPM and gamemode - the time) so that his recent result gets added to his list of results

    fetch(`${SERVER_URL}/api/user/result`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wpm: wpm[0].textContent,
        cpm: cpm[0].textContent,
        timer: `${selectedTime}s`,
      }),
    });
  }

  function postUserPb() {
    // Make a POST request to the pb route with the required body parameters (the user's gamemode - the time -, WPM and CPM) so that his pb gets added to his list of personal bests

    fetch(`${SERVER_URL}/api/user/pb`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timer: `${selectedTime}s`,
        wpm: wpm[0].textContent,
        cpm: cpm[0].textContent,
      }),
    });
  }

  function deleteUserPb(removedTimer, removedWpm, removedCpm) {
    // Make a DELETE request to the pb route which deletes a document inside the user's pb document which matches all the parameters (a specific gamemode, WPM and CPM)

    fetch(`${SERVER_URL}/api/user/pb`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timer: removedTimer,
        wpm: removedWpm,
        cpm: removedCpm,
      }),
    });
  }

  function checkToPostUserPb() {
    // Make a GET request to the pb route to get all the user's personal bests

    fetch(`${SERVER_URL}/api/user/pb`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Check if the user has no personal bests in any gamemode

        if (data.length === 0) {
          postUserPb();
        } else {
          let alreadyExists = false;
          let shouldBeAdded = false;

          let removedTimer;
          let removedWpm;
          let removedCpm;

          for (let i = 0; i < data.length; i++) {
            // Check if the user already has a personal best in the gamemode he is playing

            if (data[i].timer === `${selectedTime}s`) {
              alreadyExists = true;

              // Check if the user beat his previous personal best

              if (+data[i].wpm < +wpm[0].textContent) {
                shouldBeAdded = true;

                // Set the variables to be the user's previous personal best results so that we can later delete the old pb

                removedTimer = data[i].timer;
                removedWpm = data[i].wpm;
                removedCpm = data[i].cpm;
              }

              break;
            } else {
              continue;
            }
          }

          // Check if the user doesn't have a personal best in the gamemode he played
          if (!alreadyExists) {
            postUserPb();

            // Check if the user already has a personal best in the gamemode he played but got a new personal best
          } else if (alreadyExists && shouldBeAdded) {
            deleteUserPb(removedTimer, removedWpm, removedCpm);
            postUserPb();
          }
        }
      });
  }

  function getUserStats() {
    return new Promise((res, req) => {
      fetch(`${SERVER_URL}/api/user/result`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => res(data.user.results));
    });
  }

  function getUserPbs() {
    return new Promise((res, req) => {
      fetch(`${SERVER_URL}/api/user/pb`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => res(data));
    });
  }

  function startTimer() {
    timerIntervalId = setInterval(() => {
      // Check if the timer hasn't ended

      if (time.textContent != 0) {
        time.textContent = +time.textContent - 1;
      } else {
        // Show the user's end results

        showResults();

        // Check if the user is authenticated

        if (localStorage.getItem("authenticated")) {
          postUserStats();
          checkToPostUserPb();
        }

        // Stop the timer

        clearInterval(timerIntervalId);
      }
    }, 1000);
  }

  function showUserAuthenticationMethods() {
    userAuthentication.style.display = "flex";
    overlay.style.display = "block";
  }

  function register(username, password) {
    const url = `${SERVER_URL}/api/signup?username=${username}&password=${password}`;

    return new Promise((res, req) => {
      fetch(url, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          document.getElementById("login").children[1].focus();
        })
        .catch(() => {
          signupError.style.display = "block";
        });

      // Resolve the response so that the code doesn't block at the await statement

      res();
    });
  }

  function authenticate(username, password) {
    const url = `${SERVER_URL}/api/login?username=${username}&password=${password}`;

    return new Promise((res, req) => {
      fetch(url, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("token", data.token);

          res(localStorage.getItem("token"));
        });
    });
  }

  async function login(username, password) {
    // Get the JWT token to access the user's username

    const token = await authenticate(username, password);

    const url = `${SERVER_URL}/api/user/profile`;

    return new Promise((res, req) => {
      fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // Set localstorage variables such as the user's username

          localStorage.setItem("username", data.user.username);
          localStorage.setItem("authenticated", true);

          // Set the username displays to the username local storage variable

          usernameDisplay.forEach((el) => {
            el.textContent = localStorage.getItem("username");
          });

          // Clear the guest text shown on mobile (signifying that the user is playing as a guest)

          guestText.textContent = "";

          // Hide the currently shown elements (the panel which allows the user to authenticate himself, and the overlay)

          userAuthentication.style.display = "none";
          overlay.style.display = "none";
        })
        .catch(() => {
          // If there was an error logging in the user, show the login error element

          loginError.style.display = "block";
        });

      // Resolve the response so that the code doesn't block at the await statement

      res();
    });
  }

  function signout() {
    return new Promise((res, req) => {
      fetch(`${SERVER_URL}/api/logout`, {
        method: "GET",
      });

      // Resolve the response so that the code doesn't block at the await statement

      res();
    });
  }

  function getRandomQuote() {
    // While retrieing a random quote from the API, disable the user input field so that we can't type

    userInput.setAttribute("disabled", "true");

    // Display the loading animation

    loadingText.style.display = "block";

    // Hide the text

    textDisplay.style.display = "none";

    return new Promise((res, req) => {
      fetch(RANDOM_QUOTE_API_URL)
        .then((response) => response.json())
        .then((data) => {
          // After we have successfully retrieved the quote from the API, hide the loading animation, display the text and allow the user from typing in the input field

          loadingText.style.display = "none";
          textDisplay.style.display = "block";
          userInput.removeAttribute("disabled");

          // Focus the user input field

          userInput.focus();

          res(data.content);
        });
    });
  }

  async function displayRandomQuote() {
    // Retrieve the randomly generated quote

    const quote = await getRandomQuote();

    // Split each character of the quote and store it in the quoteChars variable

    const quoteChars = quote.split("");

    // Reset the user input field and the text

    userInput.value = "";
    textDisplay.textContent = "";

    // Loop over each individual character of the quote

    quoteChars.forEach((char) => {
      // Create a span element

      const span = document.createElement("span");

      // Set the inner text of the span to the char we are looping over

      span.innerText = char;

      // Append this span to the textDisplay element

      textDisplay.appendChild(span);
    });
  }

  function showResults() {
    // Hide the play screen and footer

    playScreen.style.display = "none";
    footer.style.display = "none";

    // Show the results

    results.style.display = "flex";
  }

  function sortLeaderboard() {
    return new Promise((res, req) => {
      fetch(`${SERVER_URL}/api/user/leaderboard`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // This variable will contain all the user personal bests

          let userPbs = [];

          // We are looping over all the users

          data.forEach((user) => {
            // This variable will store the index of the user's 15 second personal best

            let fifteenSecPbIndex;

            // Loop over all the personal bests of each user

            user.pb.forEach((el, index) => {
              // Check if the personal best we are looping over is a 15 second pb

              if (el.timer === "15s") {
                // Store the index of this personal best in the fifteenSecPbIndex variable

                fifteenSecPbIndex = index;
              }
            });

            // Check if the user has a 15 second personal best

            if (user.pb[fifteenSecPbIndex]) {
              // Push an object to the userPbs array which contains the username of the user, and his 15 second personal best

              userPbs.push({
                username: user.username,
                pb: +user.pb[fifteenSecPbIndex].wpm,
              });
            }
          });

          // After we got all the user personal bests, we sorted them in descending order

          userPbs = userPbs.sort((a, b) => b.pb - a.pb);

          res(userPbs);
        });
    });
  }

  async function displayLeaderboard() {
    // This variable will store the rank of the user

    let rank = 1;

    // We are getting all the sorted user personal bests

    const userPbs = await sortLeaderboard();

    // We are looping over each user's personal best

    userPbs.forEach((el) => {
      // This table row element will contain all of the user's personal best info (his rank, username and actual pb)

      const tableRow = document.createElement("tr");

      // We are creating a td element for each piece of data in the leaderboard

      const userRank = document.createElement("td");
      const username = document.createElement("td");
      const pb = document.createElement("td");

      // We are setting the text content of the td elements to their corresponding values

      username.textContent = el.username;
      pb.textContent = el.pb;
      userRank.textContent = rank;

      // We are then appending each individual piece of data to the table row

      tableRow.appendChild(userRank);
      tableRow.appendChild(username);
      tableRow.appendChild(pb);

      // We are then appending the table row to the leaderboard

      leaderboard.children[0].children[1].appendChild(tableRow);

      // Finally, we are incrementing the rank variable by 1 for the next person in the leaderboard

      rank++;
    });
  }

  /***************EVENT LISTENERS***************/

  logo.addEventListener("click", () => {
    restart();
  });

  timeChoice.addEventListener("change", (e) => {
    // Get the selected option out of the dropdown and assign it to the selectedTime variable

    selectedTime = +e.target.options[timeChoice.selectedIndex].value;

    // Set text content of the timer to the selected time variable
    time.textContent = selectedTime;
  });

  leaderboardBtns.forEach((el) => {
    el.addEventListener("click", async () => {
      // Hide the mobile navigation and mobile overlay

      mobileNav.classList.remove("onscreen");
      mobileOverlay.classList.remove("visible");

      // Check if the user is not authenticated

      if (!localStorage.getItem("authenticated")) {
        // Show the user authentication panel

        showUserAuthenticationMethods();

        // If the user is authenticated
      } else {
        // Show the leaderboard panel and overlay

        leaderboard.style.display = "flex";
        overlay.style.display = "block";

        // If the user has never clicked the leaderboard

        if (!clickedLeaderboard) {
          displayLeaderboard();

          clickedLeaderboard = true;
        }
      }
    });
  });

  supportBtn.addEventListener("click", () => {
    // Show the support us pannel and the overlay

    support.style.display = "flex";
    overlay.style.display = "block";
  });

  settingsBtns.forEach((el) => {
    el.addEventListener("click", (e) => {
      // Hide the mobile navigation and the mobile overlay

      mobileNav.classList.remove("onscreen");
      mobileOverlay.classList.remove("visible");

      // Check if the user isn't authenticated

      if (!localStorage.getItem("authenticated")) {
        showUserAuthenticationMethods();
      } else {
        settings.style.display = "flex";
        overlay.style.display = "block";
      }
    });
  });

  // Loop over all the themes

  themes.forEach((el) => {
    // Add an event to each theme which gets triggered whenever we click on it if it wasn't already selected

    el.addEventListener("change", (e) => {
      // Set the localstorage variable "theme" to the id of the theme we selected

      localStorage.setItem("theme", e.target.id);

      // Set the class of the body element to the new theme we selected

      document.body.classList = localStorage.getItem("theme");
    });
  });

  profileBtns.forEach((el) => {
    el.addEventListener("click", async (e) => {
      // Hide the mobile navigation and the mobile overlay

      mobileNav.classList.remove("onscreen");
      mobileOverlay.classList.remove("visible");

      // Check if the user isn't authenticated

      if (!localStorage.getItem("authenticated")) {
        showUserAuthenticationMethods();

        // If the user is authenticated
      } else {
        // Shown elements

        userStats.style.display = "flex";
        signOut.style.display = "block";

        // Hidden elements

        playScreen.style.display = "none";
        results.style.display = "none";
        footer.style.display = "none";
        navigationBtns.style.display = "none";

        // If we never clicked the profile button

        if (!clickedProfile) {
          // Get the user's personal bests

          const userPbs = await getUserPbs();

          // loop over all the user's personal bests

          userPbs.forEach((el) => {
            // Create a table row element

            const tableRow = document.createElement("tr");

            // Create table data elements

            const timer = document.createElement("td");
            const wpm = document.createElement("td");
            const cpm = document.createElement("td");

            // Set the text content of these table data elements to their corresponding values

            timer.textContent = el.timer;
            wpm.textContent = el.wpm;
            cpm.textContent = el.cpm;

            // Append these table data elements to the table row

            tableRow.appendChild(timer);
            tableRow.appendChild(wpm);
            tableRow.appendChild(cpm);

            // Append the table row to the user personal best table

            userPbsTable.appendChild(tableRow);
          });

          // Get all the user stats

          const userResults = await getUserStats();

          // Loop over all the user stats

          userResults.forEach((el) => {
            // Create a table row element

            const tableRow = document.createElement("tr");

            // Create table data elements

            const wpm = document.createElement("td");
            const cpm = document.createElement("td");
            const timer = document.createElement("td");

            // Set the text content of these table data elements

            wpm.textContent = el.wpm;
            cpm.textContent = el.cpm;
            timer.textContent = el.timer;

            // Append these table data elements to the table row

            tableRow.appendChild(wpm);
            tableRow.appendChild(cpm);
            tableRow.appendChild(timer);

            // Prepend the table row to the user results table

            userResultsTable.prepend(tableRow);
          });

          clickedProfile = true;
        }
      }
    });
  });

  // Prevent the user from pasting anything in the userInput field

  userInput.addEventListener("paste", (e) => e.preventDefault());

  userInput.addEventListener("input", (e) => {
    // Store each character in the quote in this array

    const quoteArr = text.querySelectorAll("span");

    // Get each character of what the user has inputted and store it in this variable

    const userInputArr = userInput.value.split("");

    // This finished variable will be true when we have finished writing the currently displayed quote

    let finished = false;

    // Check if we are deleting text

    if (e.inputType === "deleteContentBackward") {
      // Decrement the numOfChars variable by 1

      numOfChars--;

      // If we aren't deleting text
    } else {
      // Increment the numOfChars variable by 1

      numOfChars++;
    }

    // Loop over the quote array

    quoteArr.forEach((char, index, arr) => {
      // Check if the user still hasn't reached the current characted in the quote

      if (!userInputArr[index]) {
        // Remove both the correct and the incorrect classes from the current character in the quote

        char.classList.remove("correct");
        char.classList.remove("incorrect");

        // Check if the current character in the quote is equal to the character the user wrote
      } else if (userInputArr[index] === char.textContent) {
        // Add the correct class and remove the incorrect class from the current char in the quote

        char.classList.add("correct");
        char.classList.remove("incorrect");

        // If the user got the character wrong
      } else {
        // Add the incorrect class and remove the correct class from the current character in the quote

        char.classList.add("incorrect");
        char.classList.remove("correct");

        // Check if the mistake is in the last letter and not previous letters

        if (userInputArr[index] !== char && userInputArr[index + 1] == null) {
          allCorrect = false;
        }
      }

      // Check if the user has written the amount of characters in the quote

      if (userInputArr[arr.length - 1]) finished = true;
    });

    // Check if we have written 5 characters

    if (numOfChars === 5) {
      // Increment the raw wpm according to the gamemode

      rawWpm.textContent = +rawWpm.textContent + 1 * (60 / +selectedTime);

      // Check if we got all 5 characters correct

      if (allCorrect) {
        // Increment the wpm according to the gamemode
        wpm.forEach((el) => {
          el.textContent = +el.textContent + 1 * (60 / +selectedTime);
        });

        // Increment the cpm according to the gamemode

        cpm.forEach((el) => {
          el.textContent = +el.textContent + 5 * (60 / +selectedTime);
        });

        // If we didn't get all 5 characters correct
      } else {
        // Increment the mistakes variable by 1

        mistakes++;
      }

      // Reset the allCorrect variable

      allCorrect = true;

      // Reset the number of characters we have written

      numOfChars = 0;
    }

    // Check if it is the first time we have inputted something

    if (!keyPressed) {
      startTimer();

      keyPressed = true;
    }

    // If we finished writing a quote, display a new quote

    if (finished) displayRandomQuote();
  });

  // When the value of the checkbox changes

  hamburgerMenuCheckbox.addEventListener("change", () => {
    // Toggle the classes "onscreen" on the mobile navigation, and "visible" on the mobileOverlay

    mobileNav.classList.toggle("onscreen");
    mobileOverlay.classList.toggle("visible");
  });

  signupForm.addEventListener("submit", async (e) => {
    // Prevent the form from reloading the page on submit

    e.preventDefault();

    // Store the username and password fields in variables before clearing them

    const username = e.target[0].value;
    const password = e.target[1].value;

    await register(username, password);

    // Clear the form's inputs

    e.target[0].value = "";
    e.target[1].value = "";
  });

  loginForm.addEventListener("submit", async (e) => {
    // Prevent the form from reloading the page on submit

    e.preventDefault();

    const username = e.target[0].value;
    const password = e.target[1].value;

    await login(username, password);

    // Clear the form's inputs

    e.target[0].value = "";
    e.target[1].value = "";
  });

  signOut.addEventListener("click", async () => {
    await signout();

    // Remove all the user's localstorage variables

    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("authenticated");

    // Set the username displays to an empty string

    usernameDisplay.forEach((el) => (el.textContent = ""));

    // Set the guest text to have a text content of "Log in / register" (this signifies that the user is playing as a guest and can login or register)

    guestText.textContent = "Log in / register";

    restart();
  });

  overlay.addEventListener("click", () => {
    leaderboard.style.display = "none";
    settings.style.display = "none";
    userAuthentication.style.display = "none";
    support.style.display = "none";
    overlay.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    // Check if the user is holding down the CTRL key and the ENTER key at the same time
    if (e.key === "Enter" && e.ctrlKey === true) {
      // Restart the game

      restart();
    }

    // Loop over all the virtual keyboard keys

    keyboardKeys.forEach((key) => {
      // Check if the key we pressed (in lowercase) is equal to the id of the current virtual keyboard key we are looping over
      if (e.key.toLowerCase() === key.id) {
        // Add the "pressed" class to the virtual keyboard key that matches the key we pressed on our keyboard

        key.classList.add("pressed");
      }
    });
  });

  document.addEventListener("keyup", (e) => {
    // If we have pressed the CAPSLOCK button

    if (e.getModifierState("CapsLock")) {
      // Show the capslock identifier

      capslock.style.visibility = "visible";

      // If we haven't pressed the CAPSLOCK button
    } else {
      // Hide the capslock identifier

      capslock.style.visibility = "hidden";
    }

    // Loop over each virtual keyboard key

    keyboardKeys.forEach((key) => {
      // Check if the lowercase keyboard key we pressed matches the id of the current virtual keyboard key we are looping over
      if (e.key.toLowerCase() === key.id) {
        // Remove the pressed class from this key

        key.classList.remove("pressed");
      }
    });
  });
})();
