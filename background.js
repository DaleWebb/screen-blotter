//When the extension is installed, add the settings
chrome.runtime.onInstalled.addListener(function() {
  var settings = { obscureData: true };
  chrome.storage.sync.set(settings);
});

//When the extension button is clicked from the Chrome omnibar, toggle the settings
chrome.browserAction.onClicked.addListener(function() {
  chrome.storage.sync.get('obscureData', function(data) {
    var newSettings = { obscureData: !data.obscureData };
    chrome.storage.sync.set(newSettings);
    toggleStyles(newSettings);
  });
});

//When a tab is focused, see if it is a CP instance and then activate styling if appropriate
chrome.tabs.onActivated.addListener(activateStyling);

//When a tab changes (i.e. URL), see if it is a CP instance and then activate styling if appropriate
chrome.tabs.onUpdated.addListener(function(tabId, info) {
  //wait until the page is finished loading, otherwise an already existing <style> won't be detected
  if(info.status === 'complete') {
    activateStyling();
  }
});


function activateStyling() {
  isCustomerCarePlanner(function(yes) {
    if(yes) {
      chrome.storage.sync.get('obscureData', toggleStyles);
    }
  });
}

function isCustomerCarePlanner(cb) {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
	   var url = new URL(tabs[0].url);

     //not an actual tab with a url
     if(!url.hostname || url.hostname.indexOf('care-planner.co.uk') === -1) {
       cb(false);
     } else {
       var domain = url.hostname.toLowerCase();
       if(domain.indexOf('www.care-planner.co.uk') > -1) {
         cb(false);
       } else if(domain.indexOf('control.care-planner.co.uk') > -1) {
         cb(false);
       } else if(domain.indexOf('support.care-planner.co.uk') > -1) {
         cb(false);
       } else if(domain.indexOf('dev.care-planner.co.uk') > -1) {
         cb(false);
       } else if(domain.indexOf('uatv2.care-planner.co.uk') > -1) {
         cb(false);
       } else {
         cb(true);
       }
     }
   });

}

function toggleStyles(settings) {
  //Execute the addCSS or removeCSS functions in the CarePlanner tab.
  chrome.tabs.executeScript({
      code: '(' + (settings.obscureData ? addCSS.toString() : removeCSS.toString()) + ')()',
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
