let data;

async function loadData(url){
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
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .on("end", ticked);

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
                        .force("Y", d3.forceY(d => d.latitude));

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
                    .style("fill", "#69b3a2");

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
}

main();