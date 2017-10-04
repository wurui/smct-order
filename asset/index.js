define(['require', 'zepto', 'mustache', 'oxjs'], function (require, undef, Mustache, OXJS) {

    var StatusCodes={
        NEW:0,
        UNPAID:11,
        PAID:1,
        RECEIVED:2,
        DELIVERED:3,
        COMPLETED:4,
        CLOSED:5,
        REFUNDED:8,
        REFUND:9,
        REFUNDING:91,
        REFUND_FAIL:94
    };
    var timeformat = function (d) {
        if (typeof d != 'object') {
            d = new Date(d);
        }
        var prefix0 = function (n) {
            return (n / 100).toFixed(2).substr(2)
        };
        return [d.getFullYear(), prefix0(d.getMonth() + 1), prefix0(d.getDate())].join('-') + ' ' + [d.getHours(), prefix0(d.getMinutes()), prefix0(d.getSeconds())].join(':')
    };
    var $list, tpl,
        buildurl,payurl;
    var apiHost = '//www.shaomachetie.com';
    if (document.documentElement.getAttribute('env') == 'local') {
        apiHost = 'http://localhost:8000'
    }
    var addrToString = function () {
        if (/北京|天津|上海|重庆/.test(this.province)) {
            this.city = '';
        }
        return [this.name, '(' + this.phone + ')', this.province, this.city, this.district, this.detail].join(' ')
    }
    var statusDesc = function (data) {
        var st = data.status;
        switch (st) {
            case StatusCodes.CLOSED:
                return '<font color="#999">订单已关闭</font>';
            case StatusCodes.NEW:
                return '<font color="#f60">待付款</font>';
            case StatusCodes.UNPAID:
                return '<font color="#f60">激活时付款</font>';
            case StatusCodes.PAID:
                return '<font color="#666">已付款</font>';
            case StatusCodes.RECEIVED:
                return '<font color="#666">生产中</font>';
            case StatusCodes.DELIVERED:
                return '<font color="#060">已发货</font>';
            case StatusCodes.COMPLETED:
                return '<font>订单完成</font>';
            case StatusCodes.REFUNDED:
                return '<font color="#999">已退款</font>'
            case StatusCodes.REFUND_FAIL:
                return '<font color="#f10">退款失败</font>'
            case StatusCodes.REFUNDING:
                return '<font color="#666">退款处理中</font>'
            case StatusCodes.REFUND:
                return '<font color="#666">退款中</font>'
            default :
                return ''
        }
    };
    var orderOP = function (data) {
        var st = data.status;
        switch (st) {
            case StatusCodes.NEW:
                return '<button data-role="close" type="button">关闭订单</button>&nbsp;&nbsp;&nbsp;&nbsp;<a href="' + payurl + '?oid=' + data._id + '">去付款 &raquo;</a>';
            case StatusCodes.PAID:
                return '<button data-role="refund" type="button">退款</button>';
            case StatusCodes.DELIVERED:
                return '<button data-role="wuliu" data-no="' + data.delivery_no + '">查看物流</button>';
            case StatusCodes.RECEIVED:
            case StatusCodes.COMPLETED:
            case StatusCodes.REFUNDED:
                return ''
            case StatusCodes.REFUND_FAIL:
                return '退款失败,请等待客服处理'
            case StatusCodes.REFUNDING:
                return ''//data.reason == 'h5_none' ? '' : '退款理由:' + data.reason
            case StatusCodes.REFUND:
                return  '&nbsp;&nbsp;&nbsp;&nbsp;<button data-role="cancelrefund" type="button">撤消退款</button>'
            default :
                return '<button data-role="del" type="button">删除订单</button>'
        }
    };
    var showWuliu = function ($tar) {
        var wldiv = $('.J_wuliu', $tar.parent());
        if ($tar.attr('data-wuliu') == 'open') {

            $tar.html('查看物流')
            wldiv.hide();
            $tar.attr('data-wuliu', 'close')
        } else {

            $tar.attr('data-wuliu', 'open')
            if (wldiv.length) {
                wldiv.show();
                $tar.html('收起物流');
            } else {
                var no = $tar.attr('data-no');
                require(['./wuliu'], function (wuliu) {
                    wuliu(no, function (html) {
                        $tar.parent().append(html);
                        $tar.html('收起物流');
                    });
                })
            }

        }

    };
    var uid,
        customizeRest,
        orderRest;

    var getAndRender = function () {

        orderRest.getmy(function (r) {
            // $.getJSON(apiHost + '/smct/getorders?callback=?', function (r) {
            if (r && r.length) {
                var list = r;
                var bids = [];
                //var totalfee = 0;
                for (var i = 0, n; n = list[i++];) {
                    //n.order_no= n._id.toUpperCase();
                    //n.order_time= (new Date(n.cts)).toLocaleString();
                    var pack = n.pack;
                    if (pack && pack.length) {
                        for (var j = 0; j < pack.length; j++) {
                            var packitem = pack[j];
                            bids.push(packitem.customize);
                        }
                    }
                }
                customizeRest.get({ids: bids.join(',')}, function (r) {

                    // $.getJSON(apiHost + '/smct/getbuilds?bids=' + bids.join(',') + '&callback=?', function (r) {
                    var buildObj = {}, builds = r;
                    for (var i = 0, build; build = builds[i++];) {
                        buildObj[build._id] = build;
                        //console.log(build._id)
                    }


                    for (var i = 0, n; n = list[i++];) {
                        n.order_no = n._id.toUpperCase();
                        n.order_time = n.cts?timeformat(n.cts): n.time;
                        n.address = addrToString.call(n.delivery)
                        //n.status='已付款';
                        n.op = orderOP(n);
                        n.statusDesc = statusDesc(n)
                        n.totalsum = (n.totalfee - 0).toFixed(2);
                        if (n.pack && n.pack.length) {
                            for (var j = 0, pack; pack = n.pack[j]; j++) {

                                pack.setting = buildObj[pack.customize] && param2settings(buildObj[pack.customize].props)

                                //console.log(pack.setting)
                            }
                        }
                    }

                    $list.html(Mustache.render(tpl, {
                        data: list,
                        fullcarlogo: function () {

                            var str = ''
                            if (/\d+/.test(this)) {
                                str = 'cars/' + this + '.png'
                            } else {
                                str = 'carlogo/' + this + '.jpg'
                            }
                            return 'http://v.oxm1.cc/' + str
                        }
                    }));

                });

            } else {
                $list.html('<i class="iconfont">&#xe631;</i>&nbsp;&nbsp;<br/>暂无订单,赶紧去定制一个你喜欢的车贴吧~<br/><a href="' + buildurl + '">开始定制 &raquo;</a><br/><br/>').addClass('empty-order');

            }
        });
    };

    var param2settings = function (param) {
        if (!param)return {};
        var obj = {};
        for (var i = 0, n; n = param[i++];) {
            obj[n.label] = n.value;
        }//console.log(obj)
        return obj;
    };


    return {
        init: function ($mod) {
            uid = $mod.attr('data-uid');
            payurl=$mod.attr('data-payurl');
            customizeRest = OXJS.useREST('customize').setDevHost('http://dev.openxsl.com/');//md5('saomachetie')
            orderRest = OXJS.useREST('order').setDevHost('http://dev.openxsl.com/');
            getAndRender();

            buildurl = $mod.attr('data-buildurl');
            tpl = $('.J_tpl', $mod).html();

            $list = $('.J_list', $mod).on('click', function (e) {
                var tar = e.target,
                    $tar = $(tar),
                    role = $tar.attr('data-role'),
                    _id = $tar.closest('table').attr('data-id');
                switch (role) {
                    case 'del':
                        if (confirm('确认删除此订单?\r\n订单列表中将无法看到此订单')) {
                            orderRest.del({
                                _id: _id
                            }, function (r) {
                                //$.getJSON(apiHost + '/smct/delorder?_id=' + _id + '&callback=?', function (r) {

                                if (r.code == 0) {
                                    getAndRender()
                                    /*
                                     $tar.closest('table').remove();
                                     if (!$list.children('table').length) {
                                     getAndRender()
                                     }
                                     */
                                } else {
                                    alert(r.error)
                                }
                            });
                        }
                        break
                    case 'close':
                        if (confirm('确认关闭此订单?\r\n如有需要请重新提交新订单')) {
                            orderRest.put({
                                _id: _id,
                                status: StatusCodes.CLOSED
                            }, function (r) {
                            //$.getJSON(apiHost + '/smct/delorder?_id=' + _id + '&callback=?', function (r) {

                                if (r.code == 0) {
                                    getAndRender()
                                    /*
                                    $tar.closest('table').remove();
                                    if (!$list.children('table').length) {
                                        getAndRender()
                                    }
                                    */
                                } else {
                                    alert(r.error)
                                }
                            });
                        }

                        break
                    case 'cancelrefund':

                        if (confirm('确认取消退款?\r\n订单将恢复到已付款状态,商家将继续跟进处理')) {
                            orderRest.put({
                                _id: _id,
                                status: StatusCodes.PAID
                            }, function (r) {
                            //$.getJSON(apiHost + '/smct/cancelrefund?_id=' + _id + '&callback=?', function (r) {

                                if (r.code == 0) {
                                    getAndRender();
                                } else {
                                    alert(r.error)
                                }
                            });
                        }


                        break
                    case 'refund':
                        if (confirm('确认退款?')) {

                            orderRest.put({
                                _id: _id,
                                status: StatusCodes.REFUND
                            }, function (r) {

                                //$.getJSON(apiHost + '/smct/refund?_id='+_id+'&reason=h5_none&callback=?', function (r) {

                                if (r.code == 0) {
                                    alert('退款申请已经提交,请等待后台处理。\n一般24小时内会处理完成,请注意查收退款')
                                    getAndRender();
                                } else {
                                    alert(r.error || r.message)
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
