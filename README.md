# R&P Technology Radar

[R&P Technology Radar](https://sara-sabr.github.io/rp-tech-radar/)

This radar has been adapted from the open sourced [Zalando Tech Radar](http://zalando.github.io/tech-radar/). 
It is based on the [pioneering work by ThoughtWorks](https://www.thoughtworks.com/radar).

This repository contains the code to generate the visualization:
[`radar.js`](/radar.js) (based on [d3.js v4](https://d3js.org)).
Feel free to use and adapt it for your own purposes.

As a working example, you can check out `/index.html` &mdash; the source 
of our [R&P Technology Radar](https://sara-sabr.github.io/rp-tech-radar/).

# Modifications

This radar has been modified to be populated by inputting new data points
into `/data.csv` rather than directly into the script within `/index.html`.
The radar SVG has been placed into a webpage using the [Bootstrap](https://getbootstrap.com/) theme [Freelancer](https://startbootstrap.com/themes/freelancer/).

# How to Update the Radar

To update the topics on the Technology Radar, modify the file `/data.csv`. When updating `/data.csv` each row must be entered with the following format:

**`name,ring,quadrant,category,moved,link`**
  * **`name`** - Enter the name of the topic.
  * **`ring`** - Choose between `WATCH`, `DISCOVER`, `EVALUATE`, or `PILOT`. 
  * **`quadrant`** - Choose between `Research`, `Emerging Technologies`, `Technology Prototyping`, or `Solution Prototyping`.
  * **`category`** - Choose between `Products`, `Platforms`, `Frameworks`, or `Tools and Practices`. 
  * **`moved`** - Choose between `none` (new topic), `up` (moved closer to center), or `down` (moved further from center).
  * **`link`** - Enter a hyperlink to the topic location.

### Add Topic:

To add a new topic to the radar, follow these steps:
  1. Open the file `/data.csv`. 
  2. Create a new line/row.
  3. Enter the values of each column, following the above format. 
  4. Save the file `/data.csv`.

### Remove Topic:

To remove an existing topic from the radar, follow these steps:
  1. Open the file `/data.csv`.
  2. Delete the desired row(s).
  3. Save the file `/data.csv`.

### Modify Topic:

To modify an existing topic in the radar, follow these steps:
  1. Open the file `/data.csv`. 
  3. Edit the value(s) of the desired column(s), following the above format. 
  4. Save the file `/data.csv`.
  
  
## License

```
The MIT License (MIT)

Copyright (c) 2017 Zalando SE

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
