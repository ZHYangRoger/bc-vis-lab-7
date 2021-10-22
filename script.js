// let data;
// let topoData;

// async function loadData(url){
//     let d = await d3.json(url, d3.autoType);
//     return d;
// }

// async function loadGeoData(url){
//     let d = await d3.json(url, d3.autoType);
//     return d;
// }

Promise.all([d3.json("airports.json"), d3.json("world-110m.json")]).then(
    ([data, topoData]) => {
        let visType = d3.select("input[name=type]:checked").node().value;
        //placeholder
    //let margin = {top: 20, right: 30, bottom: 30, left: 40};
    const width = 500;
    const height = 500;
    const svg = d3.select(".force-chart")
                    .append('svg')
                    // .attr('width', width + margin.left + margin.right)
                    // .attr('height', height + margin.top + margin.bottom)
                    // .append("g")
                    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("viewBox", [0,0,width,height]);

    //scale for size
    let pop = []
    data.nodes.forEach(a => pop.push(a.passengers));
    let popRange = d3.extent(pop);
    let popScale = d3.scaleLinear()
                    .domain([popRange[0], popRange[1]])
                    .range([5, 10])

    //console.log(data.nodes);

    //create force simulation
    const simulation = d3.forceSimulation(data.nodes)
                        .force("link", d3.forceLink(data.links))
                        .force("charge", d3.forceManyBody())
                        .force("x", d3.forceX(width/2))
                        .force("y", d3.forceY(height/2))
                        //.on("end", ticked);

    //nodes and links
    
    

    

    //drag
    

    simulation.on("end", () => { // update positions on tick
        node.attr("cx", d => {
          
          return d.x;
        });
    
        node.attr("cy", d => {
          return d.y;
        });
      });
    // function drag(simulation) {    
    //     function dragstarted(event) {
    //       if (!event.active) simulation.alphaTarget(0.3).restart();
    //       event.subject.fx = event.subject.x;
    //       event.subject.fy = event.subject.y;
    //     }
        
    //     function dragged(event) {
    //       event.subject.fx = event.x;
    //       event.subject.fy = event.y;
    //     }
        
    //     function dragended(event) {
    //       if (!event.active) simulation.alphaTarget(0);
    //       event.subject.fx = null;
    //       event.subject.fy = null;
    //     }
        
    //     return d3.drag()
    //       .on("start", dragstarted)
    //       .on("drag", dragged)
    //       .on("end", dragended);
    //   }



      //map
      //get geo data
    //   const geoUrl = "world-110m.json";
    //   topoData = await loadGeoData(geoUrl);
      console.log(topoData);

      const features = topojson.feature(topoData, topoData.objects.countries).features;

      const projection = d3.geoMercator()
                    .fitExtent([[0,0], [width,height]], topojson.feature(topoData, topoData.objects.countries));

    const path = d3.geoPath().projection(projection);

    const map = svg.selectAll("path")
        .data(features) 
        .join("path")
       

    //boundaries
    const boundary = svg.append("path")
                    .datum(topojson.mesh(topoData, topoData.objects.countries))
                    .attr("d", path)
                    .attr('fill', 'none')
                    .attr('stroke', 'white')
                    .attr("class", "subunit-boundary")
                    .attr("opacity", 0);


                    const link = svg.selectAll("line")
                    .data(data.links)
                    .join("line")
                    .style("stroke", "#aaa");

    const node = svg.selectAll("circle")
                    .data(data.nodes)
                    .join("circle")
                    .attr("r", function(d){
                        return popScale(d.passengers)
                    })
                    .attr("fill", "#69b3a2")
                    .attr('opacity', "0.9")
                    .on("mouseenter", (event, d) =>{
                        const pos = d3.pointer(event, window);
                        d3.select(event.target).attr("opacity", "1");
                        d3.select(".tooltip")
                            .attr("class", "tooltip")
                            .style("display", "block")
                            .style("left", pos[0] - 140 + 'px')
                            .style("top", pos[1] - 30 + 'px')
                            .html(
                                d.name
                            );
                    })
                    .on("mouseleave", (event, d) =>{
                        d3.select(event.target).attr("opacity", "0.9");
                        d3.select(".tooltip")
                            .style("display", "none")}
                    )
        simulation.on("tick", function(){
                link
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node   
                    .attr("cx", function (d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            })

    const drag = d3
            .drag()
            .filter(event => visType === "force")
            .on("start", event => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.x;
            event.subject.fy = event.y;
            })
            .on("drag", event => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
            })
            .on("end", event => {
                if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
});

node.call(drag);

    //switch
    d3.selectAll("input[name=type]").on("change", event=>{
        visType = event.target.value;// selected button
        switchLayout();
    });

    function switchLayout() {
        if (visType === "map") {
              // stop the simulation
              simulation.stop();
              map.attr("d", path);
              // set the positions of links and nodes based on geo-coordinates
              node.transition().duration(500)
                    .attr("cx", function(d){
                        d.x = projection([d.longitude, d.latitude])[0];
                        return d.x;
                    })  
                    .attr("cy", function(d){
                        d.y = projection([d.longitude, d.latitude])[1];
                        return d.y;});
                link.transition().duration(500).attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
              // set the map opacity to 1
              map.transition().duration(500).attr("opacity", 1);
              boundary.attr("opacity", 1);
          } else { // force layout
              // restart the simulation
              simulation.alpha(1.0).restart();
              // set the map opacity to 0
              map.transition().duration(500).attr("opacity", 0);
            boundary.attr("opacity", 0);
          }
      } 
    }
);

// async function main(){
//     //load data
//     const url = "airports.json";
//     data = await loadData(url);

    
// }

// main();