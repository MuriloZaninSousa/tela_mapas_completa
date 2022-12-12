(function (window) {
    "use strict";

    window.pluvia = window.pluvia || { _isNamespace: true };

    const d3 = window.d3;

    const criarPNGMapa = function (idGerarImg, idDownloadPng, idDataSvg, idDataPng) {
        
        d3.select(idGerarImg).on("click", function(){
            const html = d3.select("svg")
                  .attr("version", 1.1)
                  .attr("xmlns", "http://www.w3.org/2000/svg")
                  .node().parentNode.innerHTML;
          
            //console.log(html);
            const imgSrc = 'data:image/svg+xml;base64,'+ btoa(html);
            const img = '<img src="'+imgSrc+'">'; 
            d3.select(idDataSvg).html(img);
          
          
            const canvas = document.querySelector("canvas"),
              context = canvas.getContext("2d");
          
            const image = new Image;
            image.src = imgSrc;
            image.onload = function() {
              context.drawImage(image, 0, 0);
            
              const canvasData = canvas.toDataURL("image/png");
            
              const pngImg = '<img style="width: 450px" src="'+canvasData+'">'; 
              d3.select(idDataPng).html(pngImg);
              d3.select(idDownloadPng).on("click", function(){
                downloadMapa(canvasData)});
            };
          
          });
          //Download PNG -------------------------------------------------------------------------
          function downloadMapa(canvasData){
              const a = document.createElement("a");
              a.download = "mapa.png";
              a.href = canvasData;
              a.click();
            };
    }


    window.pluvia.imagemMapa = function () {

        if(!d3) { throw new Error("A biblioteca d3.js não foi carregada."); }

        return {
            criarPNGMapa
        }
    }();

})(window);
