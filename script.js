let data;
let geoData;

async function loadData(url){
    let d = await d3.json(url, d3.autoType);
    return d;
}

async function loadGeoData(url){
    let d = await d3.json(url, d3.autoType);
    return d;
}

async function main(){
    //load data
    const url = "airports.json";
    data = await loadData(url);

    //placeholder
    let margin = {top: 20, right: 10, bottom: 20, left: 45};
    const width = 650 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const svg = d3.select("force-chart")
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //scale for size
    let pop = []
    data.nodes.forEach(a => pop.push(a.passengers));
    let popRange = d3.extent(pop);
    let popScale = d3.scaleLinear()
                    .domain([popRange[0], popRange[1]])
                    .range([10, 18])

    //create force simulation
    let simulation = d3.forceSimulation(data.nodes)
                        .force("link", d3.forceLink()
                                        .id(d => d.id)
                                        .links(data.links)
                                )
                        .force("charge", d3.forceManyBody())
                        .force("X", d3.forceX(d => d.longitude))
                        .force("Y", d3.forceY(d => d.latitude))
                        .on("end", ticked);

    //nodes and links
    let link = svg.selectAll("line")
                    .data(data.links)
                    .enter()
                    .append("line")
                    .style("stroke", "#aaa");

    let node = svg.selectAll("circle")
                    .data(data.nodes)
                    .enter()
                    .append("circle")
                    .attr("r", function(d){
                        return popScale(d.passengers)
                    })
                    .attr("fill", "#69b3a2")
                    .attr('opacity', "0.8")
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
                        d3.select(event.target).attr("opacity", "0.8");
                        d3.select(".tooltip")
                            .style("display", "none")}
                    )
                    .call(drag(simulation));

    function ticked(){
        link
            .attr("x1", function(d) { return d.source.longitude; })
            .attr("y1", function(d) { return d.source.latitude; })
            .attr("x2", function(d) { return d.target.longitude; })
            .attr("y2", function(d) { return d.target.latitude; });

        node   
            .attr("cx", function (d) { return d.longitude; })
            .attr("cy", function(d) { return d.latitude; });
    }

    //drag
    function drag(simulation) {    
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
        
        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }
        
        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }


      //get geo data
      const geoUrl = "world-110m.json";
      geoData = await loadGeoData(geoUrl);
      console.log(geoData);

      
}

main();