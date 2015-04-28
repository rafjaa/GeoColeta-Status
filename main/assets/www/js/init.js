var update_callback = null;

var grafico = null;
var renderizado = false;
var valores_grafico = {'papel': 0, 'plastico': 0, 'metal_vidro': 0, 'organico': 0, 'nao_reciclavel': 0};

(function($){
    $(function(){

        // Oculta a barra de atualização
        $('#loading').hide();

        grafico = function(){

            if(renderizado){
                return;
            }
            renderizado = true;

            $('#container').highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                colors: ['#2196f3', '#f44336', '#4caf50', '#795548', '#9e9e9e'],
                title: {
                    text: false
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Total de descartes',
                    data: [
                        ['Papel', valores_grafico['papel']],
                        ['Plástico', valores_grafico['plastico']],
                        ['Metal/Vidro', valores_grafico['metal_vidro']],
                        ['Orgânico', valores_grafico['organico']],
                        ['Não-reciclável', valores_grafico['nao_reciclavel']]
                    ]
                }],
                legend: {
                    backgroundColor: '#eee',
                    borderRadius: 4,
                    itemMarginTop: 5,
                    itemMarginBottom: 5,
                    itemStyle: {"fontSize": "12px", "fontWeight": "normal"}
                },
                credits: {
                    enabled: false
                }
            });
        }

        update = function(){
            // Exibe a barra de carregamento
            $('#loading').fadeIn();

            // Oculta o ícone de carregar
            $('#update').fadeOut();

            // Android.update();
        }

        load_data = function(){

            data = JSON.parse(localStorage['json_data']);

            var total_coletores = 0;
            var total_descartes = 0.0;

            for(var k in data){
                total_coletores += data[k]['coletores'];
                total_descartes += data[k]['descartes'];

                $('#var_' + k + '_coletores').text(data[k]['coletores']);
                $('#var_' + k + '_descartes').text(data[k]['descartes']);
            }

            $('#var_coletores').text(total_coletores);
            $('#var_descartes').text(total_descartes);

            for(var k in data){
                valores_grafico[k] = data[k]['descartes'] * 100 / total_descartes;
            }
            renderizado = false;
        }

        $("#update").click(function(){
            update();
        });


        // Se não houver dados, força atualização
        if(!localStorage['json_data']){
            update();
        } else{
            load_data();
        }


        update_callback = function(data){

            // Checa se foi possível obter os dados
            if(!data){
                return;
            }

            // Atualiza o BD
            localStorage['json_data'] = JSON.stringify(data);

            // Atualiza as informações
            load_data();

            // Retorna com o ícone de carregar
            $('#update').fadeIn();

            // Oculta a barra de carregamento
            $('#loading').fadeOut();
        }

    });
})(jQuery);

$(document).on('swiperight','html', function(){
    if($('ul.tabs li a[href="#aba2"]').hasClass('active')) {
        $('ul.tabs').tabs('select_tab', 'aba1');
        // $('#aba2').show().fadeOut(300);
        $('#aba1').hide().fadeIn(500);
    }; 
});

$(document).on('swipeleft','html', function(){
    if($('ul.tabs li a[href="#aba1"]').hasClass('active')) {
        $('ul.tabs').tabs('select_tab', 'aba2');
        // $('#aba1').show().fadeOut(300);
        $('#aba2').hide().fadeIn(500);
    }
});
