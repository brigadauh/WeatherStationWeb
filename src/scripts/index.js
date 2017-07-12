(function (doc) {
    'use strict';
     var Model = (function () {

         function Impl() {
         }

         Impl.prototype.requestApi = (function(type,url,data) {
            return $
            .ajax({
                type: type, //'GET',
                url: url, //
                data: data //{ }
            })
            .then(function (result) {
                console.log(url,result,result.status);
                //var obj = JSON.parse(result);
                var obj=result;
                if (!obj || !obj.data || !obj.status=='ok') {
                    console
                        .log("\n\n----------> ERROR in referrals_dev.js, userService:\nobj || obj.commands || obj.commands.data is NULL or UNDEFINED!\n\n");
                    return null;
                }

                return obj;
            });
        });
    	Impl.prototype.getTempHumidity = (function() {
    	    return this
            .requestApi('GET', '/api/weather/temphumidity/current',{})
            //.then(function(result) {
    	    //})
            ;
        });
        Impl.prototype.initialize = function () {
           //var $this = this;
        }

        return Impl;

     })();
     var View = (function () {
         var $this;
         function Impl() {
             $this=this;
             $this.temp=$('#current_temp');
             $this.temp_f=$('#current_temp_2');
             $this.temp_unit=$('#current_temp_unit');
             $this.temp_unit_2=$('#current_temp_unit_2');
             $this.humidity=$('#current_humidity');
             $this.last_reported=$('#temp_humid_last_reported');
         }
         Impl.prototype.initialize = function () {
            //var $this = this;
         }
         return Impl;
     })();
     var Controller = (function() {
         var $this;
         function Impl(model,view) {
             $this=this;
             $this.model=model;
             $this.view=view;
         }
         Impl.prototype.initialize = function () {
    	    $this.view.initialize();
            $this.model.initialize();
         }
         Impl.prototype.requestData =function() {
            return $this.model
            .getTempHumidity()
            .then(function(result) {
                 var tempObj;
                 if (result.status=='ok'){
                     var data=result.data[0];
                	    tempObj ={
                	      time: data.recorded_time,
                	      temp: data.temp,
                	      humidity:data.humidity
                	    };
                	}
                	else {
                	    tempObj ={
                	      time: 'failed',
                	      temp: 'failed',
                	      humidity:'failed'
                	    }
                	}
                 return tempObj;
            })
            .then( function (d){
                 console.log('data',d); // not sure why result is the same as in upper then. Expected to see it's return  (3 element object)
                 if (d.time){
                     $this.view.temp.text(Number(d.temp).toFixed(0));
                     $this.view.temp_f.text((Number(d.temp)*9.0/5.0 +32).toFixed(0));
                     $this.view.temp_unit.text("C");
                     $this.view.temp_unit_2.text("F");
                     $this.view.humidity.text(Number(d.humidity).toFixed(0));
                     $this.view.last_reported.text(d.time);
             }

            });

         }
         return Impl;

     })();
    //--------------------------------------------
    //  Initialization
    //--------------------------------------------

    function onInitialized() {
        var result = new $.Deferred();

        $(doc).ready(function () {
            result.resolve();
        });

        return result.promise();
    }

     onInitialized() 
        .then(function () {
            var view = new View();
            var model = new Model();

            var controller = new Controller(model, view);

            controller.initialize();
            controller.requestData();
            setInterval(function(){
                    controller.requestData();
            },1000*60);
        });


})(document);
