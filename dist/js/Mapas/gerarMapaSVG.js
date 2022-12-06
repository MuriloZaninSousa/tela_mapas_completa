// (function (window) {
//     "use strict";

//     window.pluvia = window.pluvia || { _isNamespace: true };

//     const $ = window.jQuery;


//     function gerarMapaSVG(item) {
        
//         console.log(item);

//     }

//     window.pluvia.mapaSVG = function () {

//         if(!$) { throw new Error("A biblioteca jquery.js não foi carregada."); }
        
//         return {
//             gerarMapaSVG,
//         }
//     }();

// })(window);

    // essa prova de conceito foi baseado no artigo abaixo:
    // https://observablehq.com/@efrymire/gridding-map-files

    (function (window) {
        "use strict";
    
        window.pluvia = window.pluvia || { _isNamespace: true };
        
        const d3 = window.d3;
    
        const width = 810, height = 1251;
        
        const brasilData = d3.json("./data/brasil_estados.json");
    
        const watershedsData = d3.json("./data/mapeamento_gifs.geojson");
    
        // o limite da projeção que será usada.
        // no momento, abranje toda a região do arquivo ./data/Dia00.csv
        const bounds = [[-75, -40], [-35, 10]];
    
        // as faixas de cores que serão usadas na legenda. 14 padrão
        const colorRange = [[0, '#E4FDFF'],[1, '#B5F0F8'],
                            [5, '#9BD3F8'],[10, '#2486EB'],
                            [15, '#1663CF'],[20, '#66FD89'],
                            [25, '#18D807'],[30, '#1EB51A'],
                            [40, '#FEEA71'],[50, '#FDC13C'],
                            [75, '#FF6002'],[100, '#E41301'],
                            [150, '#FF5B6F'],[200, '#DFDFDF']];
    
        // não sei se isso é exatamente a resolução do mapa.
        const resolution = 1_000_000;
    
        const csvMapa = "./data/Dia01.csv";
    
        const criarMapa = function (idSvg, idGerarImg, idDownloadPng, idDataSvg, idDataPng) {
    
          // formata a linha carregada do arquivo .csv para numérico.
          // exemplo: [-76, 10, 20.28]
          const formatRow = row => [row.lon, row.lat, row.volume]
            .map(value => +value.replace(',', '.'));
      
          // carrega o arquivo .csv e o converte para o array [lon, lat, volume].
          const rainfallData = d3.dsv(";", csvMapa, formatRow);
      
          // com base no limite, cria uma projeção mmm
          const projection = d3.geoMercator()
            .scale(width)
            .translate([width/2, height/2])
            .rotate([(bounds[0][0] + bounds[1][0]) / -2, 
                     (bounds[0][1] + bounds[1][1]) / -18]);
      
          // define a area onde o mapa será desenhado em tela
          const path = d3.geoPath().projection(projection);
      
          // obtem a cor que será usada a partir do volume.
          const getColor = volume => {
            for (let i = 0; i < colorRange.length; i++) {
              if (volume < colorRange[i][0]) {
                return colorRange[i][1];
              }
            }
            return colorRange[colorRange.length - 1][1];
          };
      
          // obtém em qual posição da legenda o volume está.
          const getColorIndex = volume => {
            for (let i = 0; i < colorRange.length; i++) {
              if (volume <= colorRange[i][0]) {
                return i;
              }
            }
            return colorRange.length - 1;
          };
          
          // carrega o array do arquivo Dia00.csv e o converte para o formato geojson.
          // esse formato é para ponto no mapa, e não está sendo usado.
          const formatGeojson = ([lon, lat, volume]) => {
            return {
              "type": "Feature",
              "properties": {
                "volume": volume
              },
              "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
              }
            };
          };
      
          // carrega o array do arquivo Dia00.csv e o converte para o formato geojson.
          const formatGrid = ([lon, lat, volume]) => { 
            return {
            "centroid": projection([lon, lat]),
            "volume": volume,
            "index": getColorIndex(volume)
          }
          };
      
          // obtem o array de dados no formato que será usado
          // para gerar os contornos do mapa.
          // para isso, os pontos são replicados de acordo com o índice de volume.
          // assim, tendo i como valor do índice pluviométrico, haverão i replicações.
          const getContourData = gridPoints => {
            let contourData = [];
            for (let i = 0; i < gridPoints.length; i++) {        
              for (let j = 0; j < gridPoints[i].index; j++) {
                contourData.push(gridPoints[i].centroid);
              }
            }
            return contourData;
          };
      
          //Contornos Mapa Brasil/Estados
          const brasilMap = (svg, brasil) => svg.append("g")
            .attr("class", "brasil")
            .selectAll("path")
            .data(brasil.features)
            .enter().append("path")
            .attr("stroke-width", 2.0)
            .style("stroke", "#878787")
            .style("fill", "none")
            // .style("stroke", "red")
            .attr("d", path);
      
          //Contornos bacias
          const watershedsMap = (svg, watersheds) => svg.append("g")
            .attr("class", "watersheds")
            .selectAll("path")
            .data(watersheds.features)
            .enter().append("path")
            .attr("stroke-width", 2.5)
            .style("stroke", "black")
            .style("fill", "none")
            .attr("d", path);
      
          // desenha os contornos do mapa no svg.
          const rainfallMap = (svg, contours, colors) =>
            svg.append("g")
              .selectAll(".contour")
              .data(contours)
              .join("g")
              .append("path")
              .attr("d", d3.geoPath())
              .attr("class", 'contour')
              .attr("data-pluvia-volume", d => d.value)
              .attr("stroke-width", 0.3)
              .style("stroke", "black")
              .style("background-color","white")
              .attr("fill", d => colors.filter(color => color.value === d.value)[0].color);
      
          // quando o documento estiver carregado e preparado para renderização.
          document.onreadystatechange = async event => {
            if (document.readyState === "complete") {
      
              // cria o elemento svg no documento.
              const svg = d3
                .select(idSvg)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("background-color","white");
      
              // aguarda o carregamento dos dados de índice pluviométrico.
              const rawPoints = await rainfallData;
              // const geojson = rawPoints.map(formatGeojson);
      
              // const rawPointsDistinct = rawPoints.filter((value, index, self) => {
              //   return self.findIndex(v => v[0] === value[0] && v[1] === value[1]) === index;
              // });
      
              // cria o array de pontos no formato que será usado para gerar os contornos.
              const gridPoints = rawPoints.map(formatGrid)
              
             const contourConfig = d3.contourDensity()
               .x(d => d[0])
               .y(d => d[1])
               .size([width, height])
               .cellSize(1.1)
               .bandwidth(2.6);
      
      
             // cria o array de dados para gerar os contornos. mmm
             const contourData = getContourData(gridPoints);
      
            
      
              const maxVolume = rawPoints.reduce((max, point) => {
                return point[2] > max ? point[2] : max;
              }, 0);
      
              const maxColorIndex = getColorIndex(maxVolume) + 1;
              console.log(maxColorIndex);
      
              // cria os contornos. Passando o limite máximo da escala
              const contours = contourConfig.thresholds(maxColorIndex)(contourData);
      
              // console.log(contours);
              // cria a escala de cores para os contornos.
              const colors = contours.map((c, i) => { 
                return { value: c.value, color: colorRange[i][1] };
              });
      
      
      
              // // cria a escala de cores para os contornos.
              // // ainda não compreendi bem como funciona e o que o número 100000 representa.
              const densityThresholds = contours.map(d => Math.floor(+d.value * resolution)/resolution);
              console.log(densityThresholds);
              // cria a escala de cores para os contornos.
              const linearColorScale = d3.scaleLinear()
                .domain(d3.range(0, 1, 1 / colors.length))
                .range(colors)
                .interpolate(d3.interpolateLab);
      
              // // cria a quantização da escala de cores para os contornos.
              // // ainda não compreendi bem como funciona.
              const quantz = d3.quantize(linearColorScale, densityThresholds.length * 2);
              
              // // cria a escala de cores para os contornos.
              // // ainda não compreendi bem como funciona.
              const thresholdIndexDomain = d3.range(0, densityThresholds.length, 1);
      
              // // cria a escala de cores para os contornos.
              // // ainda não compreendi bem como funciona.
              const thresholdColorScale = d3.scaleOrdinal()
                .domain(densityThresholds)
                .range(quantz.slice(-thresholdIndexDomain.length));
      
              brasilData.then(brasil => {
                brasilMap(svg, brasil);
              });
      
              watershedsData.then(watersheds => {
                watershedsMap(svg, watersheds);
              });
      
              const gRainfall = rainfallMap(svg, contours, colors);
      
              // cria o mapa de curvas de índice pluviométrico.
      
             //Gerar PNG ----------------------------------------------------------------------------
              d3.select(idGerarImg).on("click", function(){
                console.log("clicou");
                const html = d3.select("svg")
                      .attr("version", 1.1)
                      .attr("xmlns", "http://www.w3.org/2000/svg")
                      .node().parentNode.innerHTML;
              
                //console.log(html);
                const imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
                const img = '<img src="'+imgsrc+'">'; 
                d3.select(idDataSvg).html(img);
              
              
                const canvas = document.querySelector("canvas"),
                  context = canvas.getContext("2d");
              
                const image = new Image;
                image.src = imgsrc;
                image.onload = function() {
                  context.drawImage(image, 0, 0);
                
                  const canvasdata = canvas.toDataURL("image/png");
                
                  const pngimg = '<img style="width: 450px" src="'+canvasdata+'">'; 
                  d3.select(idDataPng).html(pngimg);
                  d3.select(idDownloadPng).on("click", function(){
                    downloadMapa(canvasdata)});
                };
              
              });
              //Download PNG -------------------------------------------------------------------------
              function downloadMapa(canvasdata){
                  console.log("clicou download");
                  const a = document.createElement("a");
                  a.download = "mapa.png";
                  a.href = canvasdata;
                  a.click();
              };
              
            };
          };
        };
      
    
        window.pluvia.mapa = function () {
    
          if(!d3) { throw new Error("A biblioteca d3.js não foi carregada.");}
    
            return{
              criarMapa,
            }
        }();
    
    })(window);
    
        
    
