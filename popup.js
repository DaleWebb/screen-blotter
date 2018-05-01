// Copyright (c) 2018 Dale Alexander Webb. All rights reserved.

(function setUpPopup() {
    //Define the checkbox
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.onchange = handleChange;

    // Define the label
    var label = document.createElement('label');
    label.appendChild(checkbox);
    var labelText = document.createElement('span');
    labelText.style.userSelect = 'none';
    labelText.innerText = 'Hide sensitive data on the page';
    label.appendChild(labelText);

    document.querySelector('#content').appendChild(label);
})();

//When the checkbox is checked or unchecked
function handleChange(event) {

    //Execute the addCSS or removeCSS functions in the CarePlanner tab.
    chrome.tabs.executeScript({
        code: '(' + (event.srcElement.checked ? addCSS.toString() : removeCSS.toString()) + ')()',
        allFrames: true
    });
}

function addCSS() {

    function fetchCss(cb) {
        //Get the latest CSS from a GitHub Gist
        fetch('https://api.github.com/gists/ec920fb7e4ff488cdbe3a3d073b531b2', {mode: 'cors'})
          .then(function(response) {
              response.json().then(function(data) {
                  var css = data.files['style.css'].content;
                  window.screenblotCss = css;
                  if(cb) cb(css);
              })
          });
    }

    var style = document.createElement('style');
    style.id = 'screenblot';

    if(document.getElementById('screenblot')) {
    } else if(window.screenblotCss) {
        style.innerHTML = window.screenblotCss;
        document.getElementsByTagName('head')[0].appendChild(style);
    } else {
        fetchCss(function(fetchedCss) {
            style.innerHTML = fetchedCss;
            document.getElementsByTagName('head')[0].appendChild(style);
        })
    }
}

function removeCSS() {
    var element = document.getElementById('screenblot');
    element.parentNode.removeChild(element);
}
