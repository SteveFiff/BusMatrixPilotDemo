var margin = {top: 120, right: 0, bottom: 10, left: 250},
2	    width = 720,
3	    height = 720;
4	
5	var x = d3.scale.ordinal().rangeBands([0, width]),
6	    y = d3.scale.ordinal().rangeBands([height, 0]),
7	    z = d3.scale.linear().domain([0, 15]).clamp(true),
8	    c = d3.scale.category10().domain(d3.range(10));
9	
10	var svg = d3.select("body").append("svg")
11	    .attr("width", width + margin.left + margin.right)
12	    .attr("height", height + margin.top + margin.bottom)
13	    .append("g")
14	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
15	
b27c4e0@SteveFiffUpdate and rename Pilot_Busmatrix2.html to Busmatrix2.js
SteveFiff authored 19 minutes ago
16	d3.json("https://api.github.com/SteveFiff/BusMatrixPilotDemo/blob/master/data.json",function(miserables) {
f9068ec@SteveFiffAdd files via upload
SteveFiff authored an hour ago
17	  
b27c4e0@SteveFiffUpdate and rename Pilot_Busmatrix2.html to Busmatrix2.js
SteveFiff authored 19 minutes ago
18	    var matrix = [],
f9068ec@SteveFiffAdd files via upload
SteveFiff authored an hour ago
19	      nodes = miserables.nodes,
20	      group = nodes.group,
21	      n = nodes.length
22	
23	  // Compute index per node.
24	    nodes.forEach(function(node, i) {
25	    node.index = i;
26	    node.count = 0;
27	    matrix[i] = d3.range(17).map(function(j) { return nodes[i].Typ === "Measure" ? {x: j, y: i, z: 0, Typ: nodes[i].Typ } : 0 });
28	   } );
29	    
30	    console.log(matrix)
31	    console.log(nodes)
32	    console.log(n)
33	
34	// Convert links to matrix; count character occurrences.
35	  miserables.links.forEach(function(link) {
36	    matrix[link.source][link.target].z += link.value;
37	    matrix[link.target][link.source].z += link.value;
38	    matrix[link.source][link.source].z += link.value;
39	    matrix[link.target][link.target].z += link.value;
40	    nodes[link.source].count += link.value;
41	    nodes[link.target].count += link.value;
42	  });
43	
44	  // Precompute the orders.
45	  var orders = {
46	    name: d3.range(n).sort(function(a, b, i) { return d3.ascending(nodes[a].unit, nodes[b].unit) ; }),
47	    count: d3.range(n).sort(function(a, b, i) { return nodes[b].count - nodes[a].count ; }),
48	    group: d3.range(n).sort(function(a, b, i) { return nodes[b].group - nodes[a].group ; })
49	};
50	  
51	console.log(orders)
52	
53	  //-- The default sort order.
54	  x.domain(orders.group);
55	
56	  svg.append("rect")
57	      .attr("class", "background")
58	      .attr("width", width)
59	      .attr("height", height);
60	
61	  var row = svg.selectAll(".row")
62	      .data(matrix.filter( function (d, i) {return nodes[i].Typ === "Measure" ? matrix : null }))
63	    .enter().append("g")
64	      .attr("class", "row")
65	      .attr("transform", function(d, i) {return "translate(0," + x(i) + ")" ; })
66	      .each(row);
67	    
68	  row.append("line")
69	      .attr("x2", width);
70	
71	  row.append("text")
72	      .attr("x", -6)
73	      .attr("y", x.rangeBand() /2)
74	      .attr("dy", ".32em")
75	      .attr("text-anchor", "end")
76	      .text(function(d, i) { return nodes[i].unit; })
77	  
78	    row.append("text")
79	      .attr("x", margin.left-450)
80	      .attr("y", x.rangeBand() /2)
81	      .attr("dy", ".32em")
82	      .attr("text-anchor", "start")
83	      .text(function(d, i) { return nodes[i].measure; })
84	    
85	    row.nested
86	  
87	  console.log(row)
88	  console.log(x.length)
89	
90	  var column = svg.selectAll(".column")
91	      .data(matrix)
92	    .enter().append("g")
93	      .attr("class", "column")
94	      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; })
95	
96	  column.append("line")
97	      .attr("x1", -width);
98	
99	  column.append("text")
100	      .attr("x", 6)
101	      .attr("y", x.rangeBand() / 2)
102	      .attr("dy", ".32em")
103	      .attr("text-anchor", "start")
104	      .text(function(d, i) {return nodes[i].Typ === "Dimension" ? nodes[i].unit : null ; });
105	    
106	console.log(column)
107	
108	  function row(column) {
109	    var cell = d3.select(this).selectAll(".cell")
110	        .data(column.filter(function(d) { return d.z; }))
111	      .enter().append("rect")
112	        .attr("class", "cell")
113	        .attr("x", function(d) { return x(d.x); })
114	        .attr("width", x.rangeBand(matrix.filter( function (d, i) {return nodes[i].Typ !== "Measure" ? matrix : null })))
115	        .attr("height", x.rangeBand(matrix.filter( function (d, i) {return nodes[i].Typ == "Measure" ? matrix : null })))
116	        .style("fill-opacity", function(d) { return z(d.z) ; })
117	        .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? "#fff" : null; })
118	        .on("mouseover", mouseover)
119	        .on("mouseout", mouseout);
120	  }
121	   
122	console.log(row)
123	
124	  function mouseover(p) {
125	    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
126	    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
127	  }
128	
129	  function mouseout() {
130	    d3.selectAll("text").classed("active", false);
131	  }
132	
133	  d3.select("#order").on("change", function() {
134	    clearTimeout(timeout);
135	    order(this.value);
136	  });
137	
138	  function order(value) {
139	        x.domain(orders[value]);
140	    var t = svg.transition().duration(2500);
141	
142	   /* t.selectAll(".row")
143	        .delay(function(d, i) { return x(i) * 4; })
144	        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })*/
145	      t.selectAll(".cell")
146	        .delay(function(d) { return x(d.x) * 4; })
147	        .attr("x", function(d) { return x(d.x); });
148	
149	    t.selectAll(".column")
150	        .delay(function(d, i) { return x(i) * 4; })
151	        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
152	  }
153	
154	  var timeout = setTimeout(function() {
155	    order("group");
156	    d3.select("#order").property("selectedIndex", 2).node().focus();
157	  }, 5000);
158	;
159	console.log(order)
160	})