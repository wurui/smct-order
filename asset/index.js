define(['require','zepto', 'mustache'], function (require,undef, Mustache) {

    var timeformat = function (d) {
        if (typeof d != 'object') {
            d = new Date(d);
        }
        var prefix0 = function (n) {
            return (n / 100).toFixed(2).substr(2)
        };
        return [d.getFullYear(), prefix0(d.getMonth() + 1), prefix0(d.getDate())].join('-') + ' ' + [d.getHours(), prefix0(d.getMinutes()), prefix0(d.getSeconds())].join(':')
    };
    var $list, tpl;
    var apiHost = '//www.shaomachetie.com';
    if(document.documentElement.getAttribute('env')=='local') {
        apiHost = 'http://localhost:8000'
    }
    var addrToString = function () {
        if (/北京|天津|上海|重庆|/.test(this.province)) {
            this.city = '';
        }
        return [this.name, '(' + this.phone + ')', this.province, this.city, this.district, this.detail].join(' ')
    }
    var statusDesc = function (data) {
        var st = data.status;
        switch (st) {
            case 0:
                return '<font color="#f60">待付款</font>';
            case 1:
                return '<font color="#666">已付款</font>';
            case 2:
                return '<font color="#666">生产中</font>';
            case 3:
                return '<font color="#060">已发货</font>';
            case 4:
                return '<font>订单完成</font>';
            case 8:
                return '<font color="#999">已退款</font>'
            case 9.4:
                return '<font color="#f10">退款失败</font>'
            case 9.1:
                return '<font color="#666">退款处理中</font>'
            case 9:
                return '<font color="#666">退款中</font>'
            default :
                return ''
        }
    };
    var orderOP = function (data) {
        var st = data.status;
        switch (st) {
            case 0:
                return '<button data-role="close" type="button">关闭订单</button>&nbsp;&nbsp;&nbsp;&nbsp;<a href="' + apiHost + '/alipay/pay?client=h5&from=smct&oid=' + data._id + '">去付款 &raquo;</a>';
            case 1:
                return '<button data-role="refund" type="button">退款</button>';
            case 2:
                return '';
            case 3:
                return '<button data-role="wuliu" data-no="' + data.delivery_no + '">查看物流</button>';
            case 4:
                return '';
            case 8:
                return ''
            case 9.4:
                return '退款失败,请等待客服处理'
            case 9.1:
                return data.reason=='h5_none'?'':'退款理由:' + data.reason
            case 9:
                return (data.reason=='h5_none'?'':'退款理由:' + data.reason) + '&nbsp;&nbsp;&nbsp;&nbsp;<button data-role="cancelrefund" type="button">撤消退款</button>'
            default :
                return '<button data-role="del" type="button">关闭订单</button>'
        }
    };
    var showWuliu=function($tar){
        var wldiv=$('.J_wuliu',$tar.parent());
        if($tar.attr('data-wuliu')=='open'){

            $tar.html('查看物流')
            wldiv.hide();
            $tar.attr('data-wuliu','close')
        }else{

            $tar.attr('data-wuliu','open')
            if(wldiv.length){
                wldiv.show();
                $tar.html('收起物流');
            }else{
                var no=$tar.attr('data-no');
                require(['./wuliu'],function(wuliu){
                    wuliu(no,function(html){
                        $tar.parent().append(html);
                        $tar.html('收起物流');
                    });
                })
            }

        }

    };

    var getAndRender = function () {
        $.getJSON(apiHost + '/smct/getorders?callback=?', function (r) {
            if (r && r.data && r.data.length) {
                var list = r.data;
                var bids = [];
                //var totalfee = 0;
                for (var i = 0, n; n = list[i++];) {
                    //n.order_no= n._id.toUpperCase();
                    //n.order_time= (new Date(n.cts)).toLocaleString();
                    for (var j = 0, pack; pack = n.pack[j++];) {
                        bids.push(pack.bid);
                    }


                }
                ;

                $.getJSON(apiHost + '/smct/getbuilds?bids=' + bids.join(',') + '&callback=?', function (r) {
                    var buildObj = {}, builds = r.data;
                    for (var i = 0, build; build = builds[i++];) {
                        buildObj[build._id] = build;
                        //console.log(build._id)
                    }


                    for (var i = 0, n; n = list[i++];) {
                        n.order_no = n._id.toUpperCase();
                        n.order_time = timeformat(n.cts);
                        n.address = addrToString.call(n.delivery)
                        //n.status='已付款';
                        n.op = orderOP(n);
                        n.statusDesc = statusDesc(n)
                        n.totalsum = (n.totalsum - 0).toFixed(2)
                        for (var j = 0, pack; pack = n.pack[j]; j++) {

                            pack.setting = buildObj[pack.bid] && buildObj[pack.bid].setting;
                            //console.log(pack,buildObj[pack.bid])
                        }
                    }
                    ;


                    $list.html(Mustache.render(tpl, {
                        data: list,
                        fullcarlogo:function(){

                            var str=''
                            if(/\d+/.test(this)){
                                str='cars/'+this+'.png'
                            }else{
                                str='carlogo/'+this+'.jpg'
                            }
                            return 'http://v.oxm1.cc/'+str
                        }
                    }));

                });

            } else {
                $list.html('<i class="iconfont">&#xe631;</i>&nbsp;&nbsp;<br/>暂无订单,赶紧去定制一个你喜欢的车贴吧~<br/><a href="smct-build">开始定制 &raquo;</a><br/><br/>').addClass('empty-order');

            }
        });
    };


    getAndRender();


    return {
        init: function ($mod) {
            tpl = $('.J_tpl', $mod).html();

            $list = $('.J_list', $mod).on('click', function (e) {
                var tar = e.target,
                    $tar = $(tar),
                    role = $tar.attr('data-role'),
                    _id = $tar.closest('table').attr('data-id');
                switch (role) {
                    case 'del':
                    case 'close':
                        if (confirm('确认关闭此订单?\r\n订单列表中将看不到此订单')) {
                            $.getJSON(apiHost + '/smct/delorder?_id='+_id+'&callback=?',  function (r) {

                                if (r.code == 0) {
                                    $tar.closest('table').remove();
                                } else {
                                    alert(r.error)
                                }
                            });
                        }

                        break
                    case 'cancelrefund':

                        if(confirm('确认取消退款?\r\n订单将恢复到已付款状态,商家将继续跟进处理')){
                            $.getJSON(apiHost + '/smct/cancelrefund?_id='+_id+'&callback=?', function (r) {

                                if (r.code == 0) {
                                    getAndRender();
                                } else {
                                    alert(r.error)
                                }
                            });
                        }


                        break
                    case 'refund':
                        if(confirm('确认退款?')){
                            $.getJSON(apiHost + '/smct/refund?_id='+_id+'&reason=h5_none&callback=?', function (r) {

                                if (r.code == 0) {
                                    alert('退款申请已经提交,请等待后台处理。\n一般24小时内会处理完成,请注意查收退款')
                                    getAndRender();
                                } else {
                                    alert(r.error)
                                }
                            });
                        }

                        break
                    case 'confirm':
                        break
                    case 'wuliu':
                        showWuliu($tar);
                        break
                }

            }).on('change', function (e) {

            })

        }
    }
})
