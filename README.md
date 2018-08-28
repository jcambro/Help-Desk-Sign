# Updated Help Desk Sign for Circulation Desk
This repo is a modified version of the original HotSign. The original instructions can be found on the Hotline wiki [here](https://webservices.itcs.umich.edu/mediawiki/hotline/index.php/Hotsign_Raspberry_Pi).

## What I Did
* Changed the background image
* Moved all the divides in the html file to fit landscape layout
* In the signboard file I changed the gapi.client init function to use proper authentication instead of just apiKey
* Slightly changed the twitter RSS call to be updated

### Differences between the Help Desk and Downstairs Pi
During development, I tested by opening the html locally in FireFox and NOT using the launch script. This did not update the time table correctly.

On the downstairs Pi I opened the html using the launch script and changing the file path. launch.sh uses the epiphany-browser and updates times correctly when launched this way.

### Still Needs Work
On line 60 of signboard there is a variable for an event in the calendar. This variable needs to be changed to reflect which hours we want to display. 

Also we could just add a second table of times to display call hours vs walk up hours. If we decide this, the open image should be associated with walk up hours calendar.

Resizing. I saw the updated time table threw sizing of the text off so we need to test on the new large tv.
