define(['zepto','mustache'],function(undef,Mustache){

    var  timeformat= function (d) {
        if (typeof d != 'object') {
            d = new Date(d);
        }
        var prefix0 = function (n) {
            return (n / 100).toFixed(2).substr(2)
        };
        return [d.getFullYear() , prefix0(d.getMonth() + 1) , prefix0(d.getDate())].join('-') + ' ' + [d.getHours(), prefix0(d.getMinutes()), prefix0(d.getSeconds())].join(':')
    };
    var $list,tpl;
    var apiHost='http://www.shaomachetie.com';
    var addrToString=function(){
        if(/北京|天津|上海|重庆|/.test(this.province)){
            this.city='';
        }
        return [this.name,'('+this.phone+')',this.province,this.city,this.district,this.detail].join(' ')
    }
    function orderStatus(data){
        var st=data.status;
        switch (st){
            case 0:
                return '未付款 <a target="_blank" class="ui-button ui-corner-all ui-widget" href="/alipay/pay?from=smct&oid='+data._id+'"><span class="ui-icon ui-icon-suitcase"></span>去付款</a><button class="ui-button ui-corner-all ui-widget" data-role="close" type="button"><span class="ui-icon ui-icon-cancel"></span>关闭订单</button>';
            case 1:
                return '已付款<button data-role="refund" type="button" class="ui-button ui-corner-all ui-widget"><span class="ui-icon ui-icon-arrowreturn-1-w"></span>退款</button>';
            case 2:
                return '生产中';
            case 3:
                return '已发货<button data-role="wuliu" class="ui-button ui-corner-all ui-widget" data-no="'+data.delivery_no+'"><span class="ui-icon ui-icon-transfer-e-w"></span>查看物流</button>';
            case 4:
                return '订单完成';
            case 8:
                return '已退款订单关闭'
            case 9.4:
                return '退款失败请等待客服处理'
            case 9.1:
                return '退款处理中:'+data.reason
            case 9:
                return '退款中:' +data.reason+'<button class="ui-button ui-corner-all ui-widget" data-role="cancelrefund" type="button"><span class="ui-icon  ui-icon-arrowreturnthick-1-w"></span>取消退款</button>'
            default :
                return '--<button class="ui-button ui-corner-all ui-widget" data-role="del" type="button">删除订单</button>'
        }
    }

    var getAndRender=function(){
        $.getJSON(apiHost+'/smct/getorders?callback=?',function(r){
            if(r && r.data && r.data.length) {
                var list = r.data;
                var bids=[];
                //var totalfee = 0;
                for (var i = 0, n; n = list[i++];) {
                    //n.order_no= n._id.toUpperCase();
                    //n.order_time= (new Date(n.cts)).toLocaleString();
                    for(var j= 0,pack;pack= n.pack[j++];){
                        bids.push(pack.bid);
                    }


                };

                $.getJSON(apiHost+'/smct/getbuilds?bids='+bids.join(',')+'&callback=?',function(r){
                    var buildObj={},builds= r.data;
                    for(var i= 0,build;build=builds[i++];){
                        buildObj[build._id]=build;
                        //console.log(build._id)
                    }


                    for (var i = 0, n; n = list[i++];) {
                        n.order_no= n._id.toUpperCase();
                        n.order_time= timeformat(n.cts);
                        n.address=addrToString.call(n.delivery)
                        //n.status='已付款';
                        n.op=orderStatus(n);
                        n.totalsum=(n.totalsum-0).toFixed(2)
                        for(var j= 0,pack;pack= n.pack[j];j++){

                            pack.setting=buildObj[pack.bid] && buildObj[pack.bid].setting;
                            //console.log(pack,buildObj[pack.bid])
                        }
                    };


                    $list.html(Mustache.render(tpl, {
                            data:list
                        }));

                });

            }else{
                $list.html('<i class="iconfont">&#xe631;</i>&nbsp;&nbsp;<br/>暂无订单,赶紧去定制一个你喜欢的车贴吧~<br/><a href="builder.html">开始定制 &raquo;</a><br/><br/>').addClass('empty-order');

            }
        });
    };


        getAndRender();








    return {
    init:function($mod){
        tpl=$('.J_tpl',$mod).html();

        $list=$('.J_list',$mod).on('click',function(e){
            var tar= e.target,
                $tar=$(tar),
                role=$tar.attr('data-role'),
                _id=$tar.closest('table').attr('data-id');
            switch (role){
                case 'del':
                case 'close':
                    if(confirm('确认删除此订单?')){
                        $.post(apiHost+'/smct/delorder',{
                            _id:_id
                        },function(r){
                            console.log(r);
                            if(r.code==0){
                                $tar.closest('table').remove();
                            }else{
                                alert(r.error)
                            }
                        });
                    }

                    break
                case 'cancelrefund':

                    $('<div>' +
                        '订单将恢复到已付款状态,商家将继续跟进处理<br/>确认取消退款?' +
                        '</div>').dialog({
                        title:'取消退款',
                        width:400,
                        modal:true,
                        buttons: [
                            {
                                text: "确定",
                                icons: {
                                    primary: "ui-icon-check"
                                },
                                click: function() {
                                    $.post(apiHost+'/smct/cancelrefund',{
                                        _id:_id
                                    },function(r){

                                        if(r.code==0){
                                            getAndRender();
                                        }else{
                                            alert(r.error)
                                        }
                                    });
                                    $( this ).dialog( "close" );
                                }
                            },
                            {
                                text: "取消",
                                icons: {
                                    primary: "ui-icon-closethick"
                                },
                                click: function() {
                                    $( this ).dialog( "close" );
                                }
                            }
                        ]
                    });
                    break
                case 'refund':
                    $('<div>' +
                        '退款理由:&nbsp;&nbsp;' +
                        '<select>' +
                        '<option>不想要了</option>' +
                        '<option>订单有误,重新做</option>' +
                        '<option>突然觉得产品不靠谱</option>' +
                        '<option>其它</option>' +
                        '</select>' +
                        '</div>').dialog({
                        title:'申请退款',
                        width:400,
                        modal:true,
                        buttons: [
                            {
                                text: "确定",
                                icons: {
                                    primary: "ui-icon-check"
                                },
                                click: function() {
                                    $.post(apiHost+'/smct/refund',{
                                        _id:_id,
                                        reason:$('select',this).val()
                                    },function(r){

                                        if(r.code==0){
                                            getAndRender();
                                        }else{
                                            alert(r.error)
                                        }
                                    });
                                    $( this ).dialog( "close" );
                                }
                            },
                            {
                                text: "取消",
                                icons: {
                                    primary: "ui-icon-closethick"
                                },
                                click: function() {
                                    $( this ).dialog( "close" );
                                }
                            }
                        ]
                    });
                    break
                case 'confirm':
                    break
                case 'wuliu':
                    showWuliu($tar.attr('data-no'));
                    break
            }

        }).on('change',function(e){

        })

    }
  }
})
