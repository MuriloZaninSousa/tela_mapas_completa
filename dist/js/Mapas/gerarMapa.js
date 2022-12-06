(function (window) {
    "use strict";

    window.pluvia = window.pluvia || { _isNamespace: true };

    const $ = window.jQuery;
    const axios = window.axios;

    // ok, falta chamar o arquivo csv e fazer a função de geração do svg
    function gerarMapa(dateArray, mapasArray) {
        // requisição com a lista de mapas csv
        const URL = `dados.json`;
        axios.request(URL)
        .then(resposta => filtrosMapas(resposta.data, dateArray, mapasArray))
        .catch(erro => console.error(erro));

        // imprime no html todos os mapas
        function filtrosMapas(data, dateArray, mapasArray) { 
            const mapasFiltrados = data
                .filter(function (item) {
                    // filtro por tipo de mapa
                    for (let c = 0; mapasArray.length > c; c++) {
                        if (item.codigo === mapasArray[c].toString()) {
                            return item.codigo;
                        }
                    }
                })
                .filter(function (item) {
                    // filtro por datas
                    $('#resultadoMapas').empty();
                    for (let d = 0; dateArray.length > d; d++) {
                        if (item.data === dateArray[d]) {
                            return item.data;
                        }
                    }
                });
            
            for (let i = 0; mapasFiltrados.length > i; i++) { 

                pluvia.mapaSVG.gerarMapaVG(mapasFiltrados[i]);
                
                htmlMapa(mapasFiltrados[i]);
            }
            
            // depois que gerar o svg e imagem
            let info = '';
            function htmlMapa(item) {
                info += '<div class="item-mapa col-lg-4 col-md-6 col-sm-12 p-3 norus-mapa"' +
                'data-norus-id-mapa="'+ item.id + '">' +
                '<div class="p-3 shadow rounded">' +
                    '<h3 class="fs-6 text-center"><strong>'+ item.titulo +'</strong></h3>' +
                    '<div class="mapa-svg text-center">' +
                    // chama as coordenadas e chama a função de gerar mapa'+ item.svg +
                    '<canvas></canvas>' +
                    '<svg></svg></div>' +
                    '<p class="fs-6 fst-italic text-center">'+ item.data +'</p>' +
                '</div></div>';
            }

            $('#resultadoMapas').append(info); 

        }
    }

    window.pluvia.mapas = function () {

        if(!axios) { throw new Error("A biblioteca axios.js não foi carregada."); }
        if(!$) { throw new Error("A biblioteca jquery.js não foi carregada."); }
        
        return {
            gerarMapa,
        }
    }();

})(window);
