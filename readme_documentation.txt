RP TECH RADAR
Hand-Over Documentation
Ryan Way
2020-02-12

----------

All the files for the radar are located on the SARA-SABR GitHub in the rp-tech-radar repository.

The master folder is named tech-radar-master and all the project files are located inside 
the folder named "docs" inside the master directory.

Contents of /docs: 
/css - folder contains the css for the bootstrap theme, freelancer, and a custom css file. Modified to alter css.
/img - folder contains R&P logo images.
/js - folder contains js files for the bootstrap theme. Not modified.
/release - folder containes previous relases of radar.js from the open source Zalando Radar. Not modified.
/scss - folder contains scss files for the bootstrap theme. Not modified.
/vendor - folder contains js and css files that accompany the bootstrap theme. Not modified.
/data.csv - file contains the data used to populate the radar. Modified.
index.html - file contains the html for the bootstrap theme, draws the radar svg, fetches csv data to populate radar.
/radar.css - file containing some css for radar. Modified and is is almost empty, radar is mostly SVG.
/radar.js - file contains nearly all script to build the radar using js and d3.

NOTE:   Comments have been added throughout index.html and radar.js labelling actions and to aid in developing.
	Please refer to these comments for some more specific labelling and details.

----------

Details for /index.html :

This is the main file. It's comprised the html for the bootstrap theme that is used for the R&P branding
template, fetching the data from the CSV file, initializing and drawing the radar SVG. To modify the radar itself, 
changes must be made in /radar.js. Any other changes to the webpage must be made in /index.html or any of the 
bootstrap theme css/js files.


Drtails for /radar.js :

This is where all the js and mathematics are done do build the radar to be drawn as an SVG. It uses D3.
To modify anything with the radar itself, changes must be made in this file.


Details for data.csv :

This file is where all the data goes to populate the radar diagram. To add any new data points on the radar,
or to modify any of the titles or text, new rows must be added/removed from here, as well as any other 
modifications to the text. The column titles must match their given values in /index.html, and the values for the
columns "ring", "quadrant", "category" and "moved" must also be one of the value options denoted in /index.html.
The columns "name" and "link" can be any given value.





