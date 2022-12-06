(function (window) {
    "use strict";

    window.pluvia = window.pluvia || { _isNamespace: true };

    const d3 = window.d3;

    const criarPNGMapa = function () {
        
        // d3.select("#save").on("click", function(){
        const html = d3.select("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

        const imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
        const img = '<img src="'+imgsrc+'">'; 
        d3.select("#svgdataurl").html(img);

        const canvas = document.querySelector("canvas"),
            context = canvas.getContext("2d");

        const image = new Image;
        image.src = imgsrc;
        image.onload = function() {
            context.drawImage(image, 0, 0);
        
            const canvasdata = canvas.toDataURL("image/png");
        
            const pngimg = '<img src="'+canvasdata+'">'; 
            d3.select("#pngdataurl").html(pngimg);
        
            const a = document.createElement("a");
            a.download = "mapa.png";
            a.href = canvasdata;
            a.click();
        };

        // });

    }


    window.pluvia.imagemMapa = function () {

        if(!d3) { throw new Error("A biblioteca d3.js não foi carregada."); }

        return {
            criarPNGMapa
        }
    }();

})(window);
