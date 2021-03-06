/* global ob, window, ActiveXObject */
'use strict';
(function () {
  ob.directive('orbitview', ['Images', 'storageService', function (Images, storageService) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'views/view.html',
      controller: ('OrbitViewController', ['$scope',
        function ($scope) {
          this.addTooltip = function (tooltip) {
            $scope.tooltips.push(tooltip);
          };

          this.addDescription = function (description) {
            $scope.description = description;
          };
        }
      ]),
      link ($scope) {
        storageService.loadXml().then(function (dataXML) {
          let xml = null;

          if (window.DOMParser) { // Standard
            let parser = new DOMParser();
            xml = parser.parseFromString(dataXML.data, 'text/xml');
          } else { // IE
            xml = new ActiveXObject('Microsoft.XMLDOM');
            xml.async = 'false';
            xml.loadXML(dataXML);
          }

          let imgData = xml.getElementsByTagName('img');
          let scaleData = xml.getElementsByTagName('scale');
          Images.level = []; //niveaux de résolution
          Images.ext = imgData[0].getAttribute('ext'); //extension des fichiers images
          //pour chaque level(niveau de resolution)
          for (let i = 0; i < scaleData.length; i++) {
            if (Number(scaleData[i].getAttribute('width')) > 200) {
              Images.level.push({
                value: Number(scaleData[i].getAttribute('value').replace('.', '')),
                width: Number(scaleData[i].getAttribute('width')),
                height: Number(scaleData[i].getAttribute('height')),
                cols: Number(scaleData[i].getAttribute('cols')),
                rows: Number(scaleData[i].getAttribute('rows')),
                tileHeight: Number(scaleData[i].getAttribute('tile_height')),
                tileWidth: Number(scaleData[i].getAttribute('tile_width')),
                resources: []
              });
              //pour chaque resources(angle de vue)
              for (let j = 0; j < imgData.length; j++) {
                Images.level[i].resources.push([]);

                //pour chaque position(images découpées de l'angle de vue)
                for (let k = 0; k < Images.level[i].cols * Images.level[i].rows; k++) {
                  let name = storageService.determineUrl() +
                    'images/' + imgData[j].getAttribute('name') +
                    '_' + Images.level[i].value +
                    '_' + Math.floor(k / Images.level[i].rows) +
                    '_' + k % Images.level[i].rows +
                    '.' + Images.ext;

                  Images.level[i].resources[j].push({
                    'loaded': false,
                    'img': name
                  });
                }
              }
            }
          }
          Images.nbAngle = Images.level[0].resources.length;

          $scope.init();
        }, (err) => {
          console.log(err);
        });
      }
    };
  }]);
}());
