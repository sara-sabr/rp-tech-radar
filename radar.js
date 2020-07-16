// The MIT License (MIT)

// Copyright (c) 2017 Zalando SE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


function radar_visualization(config) {

  // custom random number generator, to make random sequence reproducible
  // source: https://stackoverflow.com/questions/521295
  var seed = 42;
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function random_between(min, max) {
    return min + random() * (max - min);
  }

  function normal_between(min, max) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  // radial_min / radial_max are multiples of PI
  const quadrants = [
    { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
    { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
    { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
    { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 }
  ];

  const rings = [
    { radius: 130 },
    { radius: 220 },
    { radius: 310 },
    { radius: 400 }
  ];

  const title_offset =
    { x: -675, y: -420 };

  const footer_offset =
    { x: -675, y: 420 };

  const colorLegend_offset =
    { x: 0, y: 420 };

  const legend_offset = [
    { x: 450, y: 90 },
    { x: -675, y: 90 },
    { x: -675, y: -310 },
    { x: 450, y: -310 }
  ];

  function polar(cartesian) {
    var x = cartesian.x;
    var y = cartesian.y;
    return {
      t: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y)
    }
  }

  function cartesian(polar) {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t)
    }
  }

  function bounded_interval(value, min, max) {
    var low = Math.min(min, max);
    var high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  }

  function bounded_ring(polar, r_min, r_max) {
    return {
      t: polar.t,
      r: bounded_interval(polar.r, r_min, r_max)
    }
  }

  function bounded_box(point, min, max) {
    return {
      x: bounded_interval(point.x, min.x, max.x),
      y: bounded_interval(point.y, min.y, max.y)
    }
  }

  function segment(quadrant, ring) {
    var polar_min = {
      t: quadrants[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : rings[ring - 1].radius
    };
    var polar_max = {
      t: quadrants[quadrant].radial_max * Math.PI,
      r: rings[ring].radius
    };
    var cartesian_min = {
      x: 15 * quadrants[quadrant].factor_x,
      y: 15 * quadrants[quadrant].factor_y
    };
    var cartesian_max = {
      x: rings[3].radius * quadrants[quadrant].factor_x,
      //y: rings[3].radius * quadrants[quadrant].factor_y
      y: rings[3].radius * quadrants[quadrant].factor_y + ((4-ring) * 90)
    };
    return {
      clipx: function(d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.x = cartesian(p).x; // adjust data too!
        return d.x;
      },
      clipy: function(d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.y = cartesian(p).y; // adjust data too!
        return d.y;
      },
      random: function() {
        return cartesian({
          t: random_between(polar_min.t, polar_max.t),
          r: normal_between(polar_min.r, polar_max.r)
        });
      }
    }
  }

  // position each entry randomly in its segment
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];

    //this "bypasses" quadrants, instead allows dots to scatter around whole radar
    entry.quadrant = i % 4;

    entry.segment = segment(entry.quadrant, entry.ring);
    var point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color = entry.active || config.print_layout ?
      // for blip colour to represent category in CSV, changed 'quadrants' and 'quadrant' to 'categories' and 'category' below
      // config.quadrants[entry.quadrant].color : config.colors.inactive;
      //config.categories[entry.category].color : config.colors.inactive;
      //changed to rings while categories/quadrants have been hidden for now
      config.rings[entry.ring].color : config.colors.inactive;
  }

  // partition entries according to segments
  var segmented = new Array(4);
  for (var quadrant = 0; quadrant < 4; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (var ring = 0; ring < 4; ring++) {
      segmented[quadrant][ring] = [];
    }
  }
  for (var i=0; i<config.entries.length; i++) {
    var entry = config.entries[i];
    //segmented[entry.quadrant][entry.ring].push(entry);
    segmented[2][entry.ring].push(entry);

  }

  // assign unique sequential id to each entry
  var id = 1;
  var quadArray = [2,3,1,0];
  for (var idx = 0; idx < quadArray.length; idx++) {
    quadrant = quadArray[idx];
    for (var ring = 0; ring < 4; ring++) {
      var entries = segmented[quadrant][ring];
      entries.sort(function(a,b) { return a.label.localeCompare(b.label); })
      for (var i=0; i<entries.length; i++) {
        entries[i].id = "" + id++;
      }
    }
  }

  function translate(x, y) {
    return "translate(" + x + "," + y + ")";
  }

  function viewbox(quadrant) {
    return [
      Math.max(0, quadrants[quadrant].factor_x * 400) - 420,
      Math.max(0, quadrants[quadrant].factor_y * 400) - 420,
      440,
      440
    ].join(" ");
  }

  var svg = d3.select("svg#" + config.svg_id)
    .style("background-color", config.colors.background)
    .attr("width", config.width)
    .attr("height", config.height);

  var radar = svg.append("g");
  if ("zoomed_quadrant" in config) {
    svg.attr("viewBox", viewbox(config.zoomed_quadrant));
  } else {
    radar.attr("transform", translate(config.width / 2, config.height / 2));
  }

  var grid = radar.append("g");

  // background color. Usage `.attr("filter", "url(#solid)")`
  // SOURCE: https://stackoverflow.com/a/31013492/2609980
  var defs = grid.append("defs");
  var filter = defs.append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  filter.append("feFlood")
    .attr("flood-color", "rgb(0, 0, 0, 0.8)");
  filter.append("feComposite")
    .attr("in", "SourceGraphic");

  // draw rings
  for (var i =  rings.length - 1; i >=0 ; i--) {

    // Large circle (White BG)
    grid.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "#fff")
      .style("opacity", ".2")
      // .style("stroke", config.colors.grid)
      // .style("stroke-width", 2);

    // Large circle
    grid.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      //.style("fill", "#0072c1")
      .style("fill", config.rings[i].color)
      .style("opacity", ".15")
      // .style("stroke", config.colors.grid)
      // .style("stroke-width", 2);

    // White Ring
    grid.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "rgba(255, 255, 255, 0)")
      .style("opacity", "1")
      .style("stroke", config.colors.grid)
      // white ring thickness
      .style("stroke-width", 2);

    //  draw grid lines
    /*grid.append("line")
      .attr("x1", 0).attr("y1", -400)
      .attr("x2", 0).attr("y2", 400)
      .style("stroke", config.colors.grid)
      // vertical axis thickness
      .style("stroke-width", 14);

    grid.append("line")
      .attr("x1", -400).attr("y1", 0)
      .attr("x2", 400).attr("y2", 0)
      .style("stroke", config.colors.grid)
      // hprizontal axis thickness
      .style("stroke-width", 14);
      */
  }

  // draw ring names
  for (var i = 0; i < rings.length; i++) {
    /*
    if (config.print_layout) {
      grid.append("text")
        .text(config.rings[i].name)
        .attr("x", rings[i].radius - 44)
        .attr("y", 4)
        .attr("text-anchor", "middle")
        .style("fill", "#000")
        .style("font-family", "Montserrat")
        .style("font-size", 12)
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }

    if (config.print_layout) {
      grid.append("text")
        .text(config.rings[i].name)
        .attr("x", -rings[i].radius + 44)
        .attr("y", 4)
        .attr("text-anchor", "middle")
        .style("fill", "#000")
        .style("font-family", "Montserrat")
        .style("font-size", 14)
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }*/
  }

//ring titles in center, not axis

  for (var i = 1; i < 4; i++) {
    if (config.print_layout) {
      grid.append("text")
        .text(config.rings[i].name)
        .attr("x", 0)
        .attr("y", -rings[i].radius + 60)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-family", "Montserrat")
        .style("font-size", 30)
        .style("font-weight", "bold")
        .style("text-shadow", "0px 0px 3px #000")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }
  for (var i = 0; i < 1; i++) {
    if (config.print_layout) {
      grid.append("text")
        .text(config.rings[i].name)
        .attr("x", 0)
        // commented out centers center ring title
        //.attr("y", -rings[i].radius + 136)
        .attr("y", -rings[i].radius + 70)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-family", "Montserrat")
        .style("font-size", 30)
        .style("font-weight", "bold")
        .style("text-shadow", "0px 0px 3px #000")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }



  // legend quad "boxes" placement on canvas
  function legend_transform(quadrant, ring, index) {
    if (index == undefined) {
      index = null;
    }
    var dx = ring < 2 ? 0 : 120;
    var dy = (index == null ? -16 : index * 12);
    if (ring % 2 === 1) {
      dy = dy + 36 + segmented[quadrant][ring-1].length * 12;
    }

    // Special case for quadrant 2 as that the top left one for legend print out
    if (quadrant == 2) {
      dx = 0;

      if (ring > 0) {
        var paddingLength = 0;
        for (var idx = 0; idx < ring; idx++) {
          paddingLength += segmented[quadrant][idx].length;
        }

        dy = (index == null ? -16 : index * 12);
        // changed "+ 36" to "- 16" (36 - 52) below for ring>0 (all but PROMOTE) to match ring=0 dy - 52 after hiding "Legend" title
        // dy = dy + 36 + paddingLength * 12 + (ring - 1) * 40;
        dy = dy - 16 + paddingLength * 12 + (ring - 1) * 40;
      }
      else {
        // moved dy for ring=0 (PROMOTE) up 54x after hiding "Legend" title
        dy = dy - 52;
      }
    
    }


    // legend item placement on canvas
    return translate(
      legend_offset[quadrant].x + dx,
      legend_offset[quadrant].y + dy*1.1 //added *1.1 to increase all vertical legend spacing
    );
  }

  // draw title and legend (only in print layout)
  if (config.print_layout) {

    // title
    /*
    radar.append("text")
      .attr("transform", translate(title_offset.x, title_offset.y))
      .text(config.title)
      .style("font-family", "Montserrat")
      .style("font-size", "50")
      .style("font-weight", "bold");
    */

    // footer
    radar.append("text")
      .attr("transform", translate(footer_offset.x, footer_offset.y))
      .text("● radar entry     ▲ moved up     ▼ moved down")
      .attr("xml:space", "preserve")
      .attr("text-anchor", "start")
      .style("font-family", "Montserrat")
      .style("font-size", "18");

    radar.append("text")
      .attr("transform", translate(-footer_offset.x-350, footer_offset.y))
      .text("* Zoom in as needed on mobile devices.")
      .attr("xml:space", "preserve")
      .attr("text-anchor", "start")
      .style("font-family", "Montserrat")
      .style("font-size", "18");

    // color legend
    /*
    radar.append("text")
      .attr("transform", translate(colorLegend_offset.x-400, title_offset.y-20))
      .attr("xml:space", "preserve")
      //.attr("text-anchor", "middle")
      .text("⬤  "+config.categories[0].name)
      .style("font-family", "Montserrat")
      .style("font-weight", "500")
      .style("font-size", "20")
      .style("fill", config.categories[0].color);
    radar.append("text")
      .attr("transform", translate(colorLegend_offset.x-180, title_offset.y-20))
      .attr("xml:space", "preserve")
      .text("⬤  "+config.categories[1].name)
      .style("font-family", "Montserrat")
      .style("font-weight", "500")
      .style("font-size", "20")
      .style("fill", config.categories[1].color);
    radar.append("text")
      .attr("transform", translate(colorLegend_offset.x+50, title_offset.y-20))
      .attr("xml:space", "preserve")
      .text("⬤  "+config.categories[2].name)
      .style("font-family", "Montserrat")
      .style("font-weight", "500")
      .style("font-size", "20")
      .style("fill", config.categories[2].color);
    radar.append("text")
      .attr("transform", translate(colorLegend_offset.x+270, title_offset.y-20))
      .attr("xml:space", "preserve")
      .text("⬤  "+config.categories[3].name)
      .style("font-family", "Montserrat")
      .style("font-weight", "500")
      .style("font-size", "20")
      .style("fill", config.categories[3].color);
    */

    // toggle tabs ///////////////////////////////////////////////////////////////////////////////////////////
    /*
    radar.append("text")
      .attr("transform", translate(legend_offset[quadrant].x, title_offset.y))
      .attr("text-anchor", "start")
      .text("Toggle labels ON/OFF")
      .style("font-family", "Montserrat")
      .style("font-size", "18")
      .style("fill", "#888")
      .on("click", function() { window.open("https://www.google.com"); });
      */


    // legend
    var legend = radar.append("g");

    //for (var quadrant = 0; quadrant < 4; quadrant++) {
    //this (below) hides the all quadrant legends except top left.
    for (var quadrant = 2; quadrant < 3; quadrant++) {
      legend.append("text")
        .attr("transform", translate(
          legend_offset[quadrant].x,
          legend_offset[quadrant].y - 45
        ))
        //.text(config.quadrants[quadrant].name)
        //changed to "Legend" to override quadrant name in part to use only one legend "box"
        // !! ACTUALLY I just hid below - no real need to label "Legend"
        // .text("Legend")
        // .style("font-family", "Montserrat")
        // .style("font-size", "20")
        // .style("font-weight", "600")
        // .style("fill", config.quadrants[quadrant].color);
      for (var ring = 0; ring < 4; ring++) {
        legend.append("text")
          .attr("transform", legend_transform(quadrant, ring))
          .text(config.rings[ring].name)
          .style("font-family", "Montserrat")
          .style("font-size", "18")
          .style("font-weight", "600")
          .style("fill", config.rings[ring].color);
        legend.selectAll(".legend" + quadrant + ring)
          .data(segmented[quadrant][ring])
          .enter()
            .append("text")
              .attr("transform", function(d, i) { return legend_transform(quadrant, ring, i*1.1); })  //added *1.1 to increase vertical legendItem spacing
              .attr("class", "legend" + quadrant + ring)
              .attr("id", function(d, i) { return "legendItem" + d.id; })
              .text(function(d, i) { return d.id + ". " + d.label; })
              .style("font-family", "Montserrat")
              .style("font-size", "12px")
              .style("pointer-events", "auto")
              .style("user-select", "none")
              .style("cursor", "pointer")
              .on("mouseover", function(d) { showBubble(d); highlightLegendItem(d); blipOver(d); })
              .on("mouseout", function(d) { hideBubble(d); unhighlightLegendItem(d); blipOut(d); })

              // open link on clicking legendItem
              .on("click", function(d) { window.open(d.link); });

              //on click, jump to # anchor in the portfolio section with the id associated to the item clicked
              //.on("click", function(d) { window.open("#" + "contact"); });
      }
    }
  }



  // layer for entries
  var rink = radar.append("g")
    .attr("id", "rink");

  // rollover bubble (on top of everything else)
  var bubble = radar.append("g")
    .attr("id", "bubble")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");
  bubble.append("rect")
    .attr("rx", 20)
    .attr("ry", 20)
    //.style("fill", "#333");
  bubble.append("text")
    .style("font-family", "sans-serif")
    .style("font-size", "16px")
    .style("font-weight", "800")
    .style("fill", "#fff");
  bubble.append("path")
    .attr("d", "M 0,0 10,0 5,8 z")
    //.style("fill", "#333");

  function showBubble(d) {
    if (d.active || config.print_layout) {
      var tooltip = d3.select("#bubble text")
        .text(d.label);
      var bbox = tooltip.node().getBBox();
      d3.select("#bubble")
        .attr("transform", translate(d.x - bbox.width / 2, d.y - 30))
        .style("opacity", 1);
      d3.select("#bubble rect")
        .attr("x", -15)
        .attr("y", -bbox.height-2)
        .style("fill", d.color)
        .attr("width", bbox.width + 30)
        .attr("height", bbox.height + 14);
      d3.select("#bubble path")
        .attr("transform", translate(bbox.width / 2 - 5, 10))
        .style("fill", d.color);
    }
  }


  function blipOver(d) {
    var blip = document.getElementById("blip" + d.id);
    //blip.setAttribute("filter", "url(#solid)");
    blip.setAttribute("style", "opacity:1;");

    var blips = rink.selectAll(".blip")
  }
  function blipOut(d) {
    var blip = document.getElementById("blip" + d.id);
    //blip.removeAttribute("filter");
    blip.setAttribute("style", "opacity:1;");
  }

  function hideBubble(d) {
    var bubble = d3.select("#bubble")
      .attr("transform", translate(0,0))
      .style("opacity", 0);
  }

  function highlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    //legendItem.setAttribute("filter", "url(#solid)");
    legendItem.setAttribute("style", "fill:" + d.color + "; font-weight:700; font-size:12px; cursor:pointer; user-select:none;");
  }

  function unhighlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    //legendItem.removeAttribute("filter");
    //legendItem.removeAttribute("fill");
    legendItem.setAttribute("style", "fill:black; font-weight:400; font-size:12px;");
  }


  // draw blips on radar
  var blips = rink.selectAll(".blip")
    .data(config.entries)
    .enter()
      .append("g")
        .attr("class", "blip")
        .attr("id", function(d, i) { return "blip" + d.id; })
        .style("opacity", 1)
        .attr("transform", function(d, i) { return legend_transform(d.quadrant, d.ring, i); })
        .on("mouseover", function(d) { showBubble(d); highlightLegendItem(d); blipOver(d); })
        .on("mouseout", function(d) { hideBubble(d); unhighlightLegendItem(d); blipOut(d); })
       ;


  // configure each blip
  blips.each(function(d) {
    var blip = d3.select(this)

    // blip link
    if (config.print_layout && d.active && d.hasOwnProperty("link")) {
      blip = blip.append("a")
        .attr("xlink:href", d.link);
    }

    // blip shape
    if (d.moved > 0) {
      blip.append("path")
        .attr("d", "M -13,8 13,8 0,-15 z") // triangle pointing up
        .style("fill", d.color);
    } else if (d.moved < 0) {
      blip.append("path")
        .attr("d", "M -13,-8 13,-8 0,15 z") // triangle pointing down
        .style("fill", d.color);
    } else {
      blip.append("circle")
        .attr("r", 10)
        .attr("fill", d.color);
    }

    // blip text
    if (d.active || config.print_layout) {
      var blip_text = config.print_layout ? d.id : d.label.match(/[a-z]/i);
      blip.append("text")
        .text(blip_text)
        .attr("y", 4)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-family", "Montserrat")
        .style("font-weight", "bold")
        .style("font-size", function(d) { return blip_text.length > 2 ? "8" : "10"; })
        .style("pointer-events", "auto")
        .style("user-select", "none");
    }
  });


  // make sure that blips stay inside their segment
  function ticked() {
    blips.attr("transform", function(d) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    })
  }

  // distribute blips, while avoiding collisions
  d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19) // magic number (found by experimentation)
    .force("collision", d3.forceCollide().radius(13).strength(0.85))
    .on("tick", ticked);
}
